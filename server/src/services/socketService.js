import { Server as SocketIOServer } from 'socket.io';
import cookie from 'cookie';
import { env } from '../config/env.js';
import { prisma } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken } from './tokenService.js';

/**
 * Real-time chat over Socket.IO.
 *
 * The REST messaging API stays the source of truth — sockets only
 * BROADCAST what just happened. Every persisted message goes through
 * POST /api/messages so we keep authoritative validation, rate limits,
 * audit logs, and email notifications in one place. After the write
 * succeeds the route calls `broadcastNewMessage` here, which fans out
 * a `message:new` event to every connected participant.
 *
 * The room model is "conversation:<conversationId>". Anyone authorised
 * to read+write a conversation can join. A client joins by emitting
 * `conversation:join` { studentId }; we re-run the same access check
 * as the REST routes so the room membership inherits the same policy.
 *
 * Auth: Socket.IO upgrades from HTTP, so the httpOnly accessToken
 * cookie is available on the handshake. We parse it, verify the JWT,
 * and confirm token-version + not-deleted just like Express's
 * verifyTokenVersion middleware. No token is ever exposed to JS.
 *
 * Presence is global: a user is "online" if they have any active
 * socket. Online deltas are broadcast platform-wide and clients filter
 * for the userIds they care about. At Daris's scale (small number of
 * concurrent users) this is simpler than per-room subscriptions and
 * still cheap.
 */

let io = null;

// userId → Set<socketId>. Empty set means offline. Tracked here so a
// user with two tabs only sends one `presence:offline` when they close
// the last tab.
const onlineSockets = new Map();

export function initSocketServer(httpServer) {
  io = new SocketIOServer(httpServer, {
    cors: env.FRONTEND_URL
      ? { origin: env.FRONTEND_URL, credentials: true }
      : undefined,
    // 60s default ping timeout is fine. The client will auto-reconnect
    // with exponential backoff if it drops, so we don't need to be
    // generous here.
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers?.cookie || '';
      const parsed = cookie.parse(cookieHeader);
      const token = parsed.accessToken;
      if (!token) return next(new Error('UNAUTHORIZED'));

      const decoded = verifyAccessToken(token);
      // Re-check token version + not-deleted to match the REST policy.
      // A stale socket connection from a force-logout user must not
      // keep receiving messages.
      const user = await prisma.user.findFirst({
        where: { id: decoded.sub },
        select: {
          id: true,
          tokenVersion: true,
          deletedAt: true,
          role: true,
          isTeacher: true,
          isStudent: true,
        },
      });
      if (!user || user.deletedAt) return next(new Error('UNAUTHORIZED'));
      if (user.tokenVersion !== decoded.tokenVersion) {
        return next(new Error('TOKEN_EXPIRED'));
      }

      socket.data.user = {
        id: user.id,
        role: user.role,
        isTeacher: user.isTeacher,
        isStudent: user.isStudent,
      };
      next();
    } catch (err) {
      logger.debug('socket auth failed', { error: err.message });
      next(new Error('UNAUTHORIZED'));
    }
  });

  io.on('connection', (socket) => {
    const user = socket.data.user;
    markOnline(user.id, socket.id);

    socket.on('conversation:join', async (payload, ack) => {
      try {
        const studentId = String(payload?.studentId || '');
        if (!studentId) return ack?.({ ok: false, error: 'BAD_REQUEST' });
        if (!(await canReadStudentConversation(user, studentId))) {
          return ack?.({ ok: false, error: 'FORBIDDEN' });
        }
        const conv = await ensureConversation(studentId);
        socket.join(roomName(conv.id));
        // Tell the joining client which IDs are currently online so it
        // can render presence dots without a separate roundtrip.
        const participantIds = await readerIdsForStudent(studentId);
        const onlineIds = Array.from(participantIds).filter((id) =>
          onlineSockets.has(id)
        );
        const canWrite = await canWriteStudentConversation(user, studentId);
        ack?.({ ok: true, conversationId: conv.id, canWrite, onlineUserIds: onlineIds });
      } catch (err) {
        logger.error('socket conversation:join failed', {
          userId: user.id,
          error: err.message,
        });
        ack?.({ ok: false, error: 'SERVER_ERROR' });
      }
    });

    socket.on('conversation:leave', (payload) => {
      const studentId = String(payload?.studentId || '');
      if (!studentId) return;
      prisma.conversation
        .findUnique({ where: { studentId }, select: { id: true } })
        .then((conv) => {
          if (conv) socket.leave(roomName(conv.id));
        })
        .catch(() => {});
    });

    // Typing indicators are ephemeral — they never hit the DB. Broadcast
    // to everyone else in the room and let them render "X is typing…".
    // The sender's own client never receives its own typing event.
    // Only WRITERS get to signal typing: a sheikh silently observing
    // shouldn't appear as "typing…" to the student.
    socket.on('typing:start', async (payload) => {
      const studentId = String(payload?.studentId || '');
      if (!studentId) return;
      if (!(await canWriteStudentConversation(user, studentId))) return;
      const conv = await prisma.conversation.findUnique({
        where: { studentId },
        select: { id: true },
      });
      if (!conv) return;
      const senderName = await displayNameFor(user.id);
      socket.to(roomName(conv.id)).emit('typing:start', {
        userId: user.id,
        name: senderName,
        role: roleFor(user),
      });
    });

    socket.on('typing:stop', async (payload) => {
      const studentId = String(payload?.studentId || '');
      if (!studentId) return;
      if (!(await canWriteStudentConversation(user, studentId))) return;
      const conv = await prisma.conversation.findUnique({
        where: { studentId },
        select: { id: true },
      });
      if (!conv) return;
      socket.to(roomName(conv.id)).emit('typing:stop', { userId: user.id });
    });

    // Read-receipt broadcast: the client emits this right after the
    // REST GET conversation succeeds (which already bumped lastReadAt
    // on the server). We just fan out the new lastReadAt so other
    // participants can update "Read" indicators in real time.
    socket.on('conversation:read', async (payload) => {
      const studentId = String(payload?.studentId || '');
      if (!studentId) return;
      if (!(await canReadStudentConversation(user, studentId))) return;
      const conv = await prisma.conversation.findUnique({
        where: { studentId },
        select: { id: true },
      });
      if (!conv) return;
      socket.to(roomName(conv.id)).emit('conversation:read', {
        conversationId: conv.id,
        userId: user.id,
        lastReadAt: new Date().toISOString(),
      });
    });

    socket.on('disconnect', () => {
      markOffline(user.id, socket.id);
    });
  });

  logger.info('Socket.IO initialised');
  return io;
}

export function getIO() {
  return io;
}

/**
 * Broadcast a freshly-persisted message to every connected participant
 * of its conversation. Called from the REST POST after the message row
 * has been written.
 *
 * Side-payload includes the conversation snapshot so list-view clients
 * (the admin sidebar, the student's inbox card) can update their
 * "last message" preview without a separate fetch.
 */
export function broadcastNewMessage({ conversation, message }) {
  if (!io) return;
  io.to(roomName(conversation.id)).emit('message:new', {
    conversationId: conversation.id,
    studentId: conversation.studentId,
    message,
    lastMessageAt: conversation.lastMessageAt,
  });
}

/**
 * Broadcast a conversation-list update so sidebar / inbox UIs that are
 * NOT currently inside the thread can still bump their unread badge
 * and last-message preview. Different event from message:new because
 * the recipient might not be in the room (e.g. a sheikh on the home
 * tab) and Socket.IO scopes room broadcasts strictly.
 */
export function broadcastConversationUpdated({ conversation, message, recipientIds }) {
  if (!io) return;
  const payload = {
    conversationId: conversation.id,
    studentId: conversation.studentId,
    lastMessage: {
      id: message.id,
      body: message.body,
      senderId: message.senderId,
      createdAt: message.createdAt,
    },
    lastMessageAt: conversation.lastMessageAt,
  };
  for (const userId of recipientIds) {
    io.to(userRoom(userId)).emit('conversation:updated', payload);
  }
}

// Helpers ---------------------------------------------------------------

function roomName(conversationId) {
  return `conversation:${conversationId}`;
}

function userRoom(userId) {
  // Per-user channel for events that aren't tied to a room (e.g. a
  // conversation-list update for someone not currently viewing the
  // thread). Every user is auto-joined to this room on connection.
  return `user:${userId}`;
}

function roleFor(user) {
  return user.role === 'admin'
    ? 'sheikh'
    : user.isTeacher
    ? 'teacher'
    : 'student';
}

function markOnline(userId, socketId) {
  let set = onlineSockets.get(userId);
  const wasOffline = !set || set.size === 0;
  if (!set) {
    set = new Set();
    onlineSockets.set(userId, set);
  }
  set.add(socketId);
  // Always auto-join the per-user channel for off-room events.
  io?.sockets?.sockets?.get(socketId)?.join(userRoom(userId));
  if (wasOffline) {
    io?.emit('presence:update', { userId, online: true });
  }
}

function markOffline(userId, socketId) {
  const set = onlineSockets.get(userId);
  if (!set) return;
  set.delete(socketId);
  if (set.size === 0) {
    onlineSockets.delete(userId);
    io?.emit('presence:update', { userId, online: false });
  }
}

// Access policy — duplicated from routes/messages.js so the socket
// layer doesn't have to import an Express route. Kept in lockstep with
// it; any change to who can read a conversation must update both.
//
// READ: sheikh sees everything; student sees their own; teachers see
// students they're assigned to via TeacherStudent.
//
// WRITE: student themselves OR anyone (teacher or sheikh) with a
// TeacherStudent row pointing at this student. The sheikh's "watch
// everything" privilege does not grant write — a sheikh observing a
// thread but not assigned to that student can only read.
async function canReadStudentConversation(user, studentId) {
  if (user.role === 'admin') return true;
  if (user.id === studentId) return true;
  if (!user.isTeacher) return false;
  const row = await prisma.teacherStudent.findUnique({
    where: { teacherId_studentId: { teacherId: user.id, studentId } },
    select: { id: true },
  });
  return !!row;
}

async function canWriteStudentConversation(user, studentId) {
  if (user.id === studentId) return true;
  const row = await prisma.teacherStudent.findUnique({
    where: { teacherId_studentId: { teacherId: user.id, studentId } },
    select: { id: true },
  });
  return !!row;
}

async function ensureConversation(studentId) {
  const existing = await prisma.conversation.findUnique({ where: { studentId } });
  if (existing) return existing;
  try {
    return await prisma.conversation.create({ data: { studentId } });
  } catch {
    return prisma.conversation.findUnique({ where: { studentId } });
  }
}

async function readerIdsForStudent(studentId) {
  const [assigned, sheikhs] = await Promise.all([
    prisma.teacherStudent.findMany({
      where: { studentId },
      select: { teacherId: true },
    }),
    prisma.user.findMany({
      where: { role: 'admin', deletedAt: null },
      select: { id: true },
    }),
  ]);
  return new Set([studentId, ...assigned.map((a) => a.teacherId), ...sheikhs.map((s) => s.id)]);
}

async function displayNameFor(userId) {
  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  if (!u) return '';
  return `${u.firstName || ''} ${u.lastName || ''}`.trim();
}
