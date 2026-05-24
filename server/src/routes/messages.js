/**
 * Student ↔ teacher messaging with sheikh oversight.
 *
 * Threading model: one Conversation per student. Anyone with class-side
 * access to the student can read + write — that is:
 *   - the student themself
 *   - every active sheikh (role='admin')
 *   - every teacher with a TeacherStudent row pointing at this student
 *
 * Sheikh sees every conversation across the platform. Teachers see only
 * their assigned students. The participants set is recomputed at query
 * time from TeacherStudent + admin role, so reassigning a teacher
 * naturally flips visibility without any migration step.
 *
 * Conversations are lazy-created on first send: the student-side compose
 * box always points at "my conversation"; the teacher/sheikh-side picker
 * lists students with existing conversations + students they're
 * authorised to start one with.
 */

import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import { z } from 'zod';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../config/database.js';
import { t, getLang } from '../utils/i18n.js';
import { auditLog, logger } from '../utils/logger.js';
import { notifyNewMessage } from '../services/messageNotificationService.js';
import {
  broadcastNewMessage,
  broadcastConversationUpdated,
} from '../services/socketService.js';

const router = Router();

router.use(authenticate, verifyTokenVersion);

// Cap send volume per user. 30/min is generous for a real conversation
// (a fast typist sends ~10/min in a heated thread) and stops a runaway
// client loop from filling the table.
const sendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip,
  handler: (req, res) => {
    const lang = getLang(req);
    res.status(429).json({ error: t('error.tooManyRequests', lang) });
  },
});

// Image attachments are accepted as multipart/form-data. The bytes
// land in the message_attachments table; we never write them to disk.
// 5 MB caps a typical phone photo without re-encode, but stops a stray
// gigabyte upload from filling the DB.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_MIMETYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES },
});

// Multer middleware wrapper: turns multer's file-too-big / parse
// failures into translated 400s instead of leaking the raw error
// through the default error handler as a 500.
function uploadImage(req, res, next) {
  upload.single('image')(req, res, (err) => {
    if (!err) return next();
    const lang = getLang(req);
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: t('messages.imageTooLarge', lang) });
    }
    return res.status(400).json({ error: t('messages.uploadFailed', lang) });
  });
}

// Helpers ---------------------------------------------------------------

function isSheikh(user) {
  return user?.role === 'admin';
}

// Active sheikhs — used to derive "always-allowed" reader set without a
// participants table. Cached per-request via res.locals if we end up
// calling it twice in the same handler.
async function activeSheikhIds() {
  const admins = await prisma.user.findMany({
    where: { role: 'admin', deletedAt: null },
    select: { id: true },
  });
  return admins.map((a) => a.id);
}

// Set of userIds with read access to this student's conversation.
// Student + assigned teachers + all sheikhs. The student themselves is
// always in their own thread.
async function readerIdsForStudent(studentId) {
  const [assigned, sheikhs] = await Promise.all([
    prisma.teacherStudent.findMany({
      where: { studentId },
      select: { teacherId: true },
    }),
    activeSheikhIds(),
  ]);
  return new Set([
    studentId,
    ...assigned.map((a) => a.teacherId),
    ...sheikhs,
  ]);
}

// Read vs. write are deliberately separate checks now.
//
// READ: the student, every active sheikh (for oversight), and any
// teacher with a TeacherStudent row for this student. The sheikh's
// "watch everything" privilege is the whole point of the messaging
// surface — they must be able to see every back-and-forth between
// any student and any teacher.
//
// WRITE: the student themselves, OR anyone (teacher or sheikh) who
// has a TeacherStudent row for this student. The TeacherStudent
// table IS the source of truth for "I teach this student" — a
// sheikh-as-teacher row counts. A sheikh who is NOT assigned to a
// student can read their thread for oversight but cannot speak into
// it (those conversations belong to the assigned teacher, who is the
// student's direct point of contact). This stops the sheikh from
// accidentally inserting himself mid-conversation in a thread he
// isn't running.
async function canReadStudentConversation(user, studentId) {
  if (isSheikh(user)) return true;
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
  // No isTeacher/role gating: TeacherStudent is the only source of
  // truth for "you teach this student." A sheikh with a row qualifies;
  // a non-teacher with no row does not.
  const row = await prisma.teacherStudent.findUnique({
    where: { teacherId_studentId: { teacherId: user.id, studentId } },
    select: { id: true },
  });
  return !!row;
}

// Shape the assigned teachers + sheikhs for participant display. Used in
// both list and detail responses so the UI can render "you, Sheikh
// Islam, and 2 teachers" labels.
async function participantsForStudent(studentId) {
  const [assigned, sheikhs, student] = await Promise.all([
    prisma.teacherStudent.findMany({
      where: { studentId },
      include: {
        teacher: {
          select: { id: true, firstName: true, lastName: true, role: true, deletedAt: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { role: 'admin', deletedAt: null },
      select: { id: true, firstName: true, lastName: true, role: true },
    }),
    prisma.user.findFirst({
      where: { id: studentId, deletedAt: null },
      select: { id: true, firstName: true, lastName: true, role: true },
    }),
  ]);

  const teachers = assigned
    .map((a) => a.teacher)
    .filter((tch) => tch && !tch.deletedAt)
    // Sheikhs are reflected via the sheikhs array; suppress the dupe
    // even if a sheikh somehow shows up via TeacherStudent.
    .filter((tch) => tch.role !== 'admin');

  return {
    student: student
      ? { id: student.id, firstName: student.firstName, lastName: student.lastName, role: 'student' }
      : null,
    teachers: teachers.map((tch) => ({
      id: tch.id,
      firstName: tch.firstName,
      lastName: tch.lastName,
      role: 'teacher',
    })),
    sheikhs: sheikhs.map((s) => ({
      id: s.id,
      firstName: s.firstName,
      lastName: s.lastName,
      role: 'sheikh',
    })),
  };
}

// Compute the unread count for a (conversation, user) pair. Messages
// sent BY the viewer never count as unread for them.
async function unreadCountForUserInConversation(userId, conversation) {
  const read = await prisma.conversationRead.findUnique({
    where: { conversationId_userId: { conversationId: conversation.id, userId } },
    select: { lastReadAt: true },
  });
  const since = read?.lastReadAt || new Date(0);
  return prisma.message.count({
    where: {
      conversationId: conversation.id,
      createdAt: { gt: since },
      senderId: { not: userId },
    },
  });
}

// Fetch (or lazy-create) the Conversation row for a student. The
// creator's identity isn't recorded — anyone authorised to write can
// be the one to materialise the row.
async function ensureConversation(studentId) {
  const existing = await prisma.conversation.findUnique({
    where: { studentId },
  });
  if (existing) return existing;
  // Race tolerant: if two writers materialise at once, the unique
  // constraint on studentId will reject one and we re-fetch.
  try {
    return await prisma.conversation.create({ data: { studentId } });
  } catch {
    return prisma.conversation.findUnique({ where: { studentId } });
  }
}

// Routes ----------------------------------------------------------------

// List conversations visible to the caller.
//   - Sheikh: every conversation, ordered by lastMessageAt desc.
//   - Teacher: only conversations whose student is in their TeacherStudent
//     set, plus students they're assigned to who don't have a thread yet
//     (so they can start one).
//   - Student: their own conversation (which may not exist yet).
router.get('/conversations', async (req, res, next) => {
  try {
    const user = req.user;

    let studentIds = [];
    if (isSheikh(user)) {
      const allStudents = await prisma.user.findMany({
        where: {
          role: 'enrolled_student',
          isStudent: true,
          deletedAt: null,
        },
        select: { id: true },
      });
      studentIds = allStudents.map((s) => s.id);
    } else if (user.isTeacher) {
      const assigned = await prisma.teacherStudent.findMany({
        where: { teacherId: user.id },
        select: { studentId: true },
      });
      studentIds = assigned.map((a) => a.studentId);
    } else {
      // Regular student. Only their own conversation.
      studentIds = [user.id];
    }

    if (studentIds.length === 0) {
      return res.json({ conversations: [] });
    }

    const [students, conversations] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: studentIds }, deletedAt: null },
        select: { id: true, firstName: true, lastName: true },
      }),
      prisma.conversation.findMany({
        where: { studentId: { in: studentIds } },
        orderBy: { lastMessageAt: 'desc' },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: { id: true, body: true, senderId: true, createdAt: true },
          },
        },
      }),
    ]);

    const byStudent = new Map(students.map((s) => [s.id, s]));
    const convByStudent = new Map(conversations.map((c) => [c.studentId, c]));

    // Compute unread per conversation up front so the badge is accurate
    // without a second roundtrip.
    const unreadCounts = await Promise.all(
      conversations.map((c) => unreadCountForUserInConversation(user.id, c))
    );
    const unreadByConv = new Map(
      conversations.map((c, i) => [c.id, unreadCounts[i]])
    );

    // Bulk-fetch this caller's TeacherStudent assignments so we can mark
    // each row writable vs. read-only without a per-row roundtrip. A
    // sheikh seeing every student gets a mix: writable for ones they
    // teach, read-only for the rest. A teacher's list is necessarily
    // all-writable because the query above only included their assigned
    // students in the first place.
    const writableStudentIds = new Set();
    if (isSheikh(user)) {
      const assigned = await prisma.teacherStudent.findMany({
        where: { teacherId: user.id, studentId: { in: studentIds } },
        select: { studentId: true },
      });
      for (const a of assigned) writableStudentIds.add(a.studentId);
    } else {
      // Teacher / student: studentIds is already filtered to ones they
      // can write to (their own id or their TeacherStudent set).
      for (const sid of studentIds) writableStudentIds.add(sid);
    }

    // Build the response. Each row is per-student (so a sheikh seeing
    // every student gets every row; a teacher gets their assigned
    // students; a student gets exactly one). Threads without messages
    // yet show with `lastMessage: null` so the UI can prompt "Say
    // salaam to start the conversation."
    const rows = studentIds
      .map((sid) => {
        const student = byStudent.get(sid);
        if (!student) return null;
        const conv = convByStudent.get(sid) || null;
        const last = conv?.messages?.[0] || null;
        const canWriteRow = sid === user.id || writableStudentIds.has(sid);
        return {
          studentId: sid,
          studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          conversationId: conv?.id || null,
          canWrite: canWriteRow,
          lastMessage: last
            ? {
                id: last.id,
                body: last.body,
                senderId: last.senderId,
                createdAt: last.createdAt,
                fromSelf: last.senderId === user.id,
              }
            : null,
          lastMessageAt: conv?.lastMessageAt || null,
          unreadCount: conv ? unreadByConv.get(conv.id) || 0 : 0,
        };
      })
      .filter(Boolean);

    // Sort: conversations with messages first (recency desc), then empty
    // threads (alphabetical) so teachers see their active chats up top.
    rows.sort((a, b) => {
      if (a.lastMessageAt && !b.lastMessageAt) return -1;
      if (!a.lastMessageAt && b.lastMessageAt) return 1;
      if (a.lastMessageAt && b.lastMessageAt) {
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt);
      }
      return a.studentName.localeCompare(b.studentName);
    });

    res.json({ conversations: rows });
  } catch (error) {
    next(error);
  }
});

// Total unread for the badge on the navbar / dashboard tile. Cheap:
// one COUNT query joined to ConversationRead.
router.get('/unread-count', async (req, res, next) => {
  try {
    const user = req.user;

    let studentIds = [];
    if (isSheikh(user)) {
      const all = await prisma.user.findMany({
        where: { role: 'enrolled_student', isStudent: true, deletedAt: null },
        select: { id: true },
      });
      studentIds = all.map((s) => s.id);
    } else if (user.isTeacher) {
      const assigned = await prisma.teacherStudent.findMany({
        where: { teacherId: user.id },
        select: { studentId: true },
      });
      studentIds = assigned.map((a) => a.studentId);
    } else {
      studentIds = [user.id];
    }

    if (studentIds.length === 0) {
      return res.json({ unreadCount: 0 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { studentId: { in: studentIds } },
      select: { id: true },
    });
    if (conversations.length === 0) {
      return res.json({ unreadCount: 0 });
    }

    const totals = await Promise.all(
      conversations.map((c) => unreadCountForUserInConversation(user.id, c))
    );
    res.json({ unreadCount: totals.reduce((a, b) => a + b, 0) });
  } catch (error) {
    next(error);
  }
});

// Read a single conversation. studentId is the anchor; the conversation
// is created on demand so the student-side compose form always has an
// inbox to write into.
router.get('/conversations/:studentId', async (req, res, next) => {
  try {
    const lang = getLang(req);
    const { studentId } = req.params;

    if (!(await canReadStudentConversation(req.user, studentId))) {
      return res.status(403).json({ error: t('auth.forbidden', lang) });
    }

    // Compute write permission so the client can show / hide the
    // composer accordingly. Cheap (one indexed point-lookup).
    const canWrite = await canWriteStudentConversation(req.user, studentId);

    const conv = await ensureConversation(studentId);
    const [messagesRaw, participants] = await Promise.all([
      prisma.message.findMany({
        where: { conversationId: conv.id },
        orderBy: { createdAt: 'asc' },
        // 200 is more than enough for a teacher-student chat; if a
        // thread grows beyond that we can paginate later, but a fresh
        // thread loading 200 rows is still <50ms.
        take: 200,
        select: {
          id: true,
          body: true,
          senderId: true,
          createdAt: true,
          sender: {
            select: { id: true, firstName: true, lastName: true, role: true },
          },
          attachment: {
            select: { id: true, mimeType: true, sizeBytes: true },
          },
        },
      }),
      participantsForStudent(studentId),
    ]);

    // Update the viewer's lastReadAt so the badge clears.
    await prisma.conversationRead.upsert({
      where: { conversationId_userId: { conversationId: conv.id, userId: req.user.id } },
      update: { lastReadAt: new Date() },
      create: { conversationId: conv.id, userId: req.user.id },
    });

    // Pull every participant's lastReadAt so the client can render read
    // receipts on initial paint without waiting for a live socket event.
    // After this point the conversation:read socket events keep the map
    // current; the REST response is just the cold-start snapshot.
    const readRows = await prisma.conversationRead.findMany({
      where: { conversationId: conv.id },
      select: { userId: true, lastReadAt: true },
    });
    const reads = {};
    for (const r of readRows) reads[r.userId] = r.lastReadAt;

    res.json({
      conversation: {
        id: conv.id,
        studentId: conv.studentId,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      },
      canWrite,
      participants,
      reads,
      messages: messagesRaw.map((m) => ({
        id: m.id,
        body: m.body,
        senderId: m.senderId,
        senderName: m.sender
          ? `${m.sender.firstName || ''} ${m.sender.lastName || ''}`.trim()
          : '',
        senderRole:
          m.sender?.role === 'admin'
            ? 'sheikh'
            : m.sender?.id === studentId
            ? 'student'
            : 'teacher',
        createdAt: m.createdAt,
        fromSelf: m.senderId === req.user.id,
        attachment: m.attachment
          ? {
              id: m.attachment.id,
              mimeType: m.attachment.mimeType,
              sizeBytes: m.attachment.sizeBytes,
            }
          : null,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Image bytes for a message attachment. Auth-gated via the parent
// conversation's read permission so a leaked URL can't be opened by a
// logged-out viewer and a logged-in user only sees attachments from
// conversations they're allowed to read.
router.get('/attachments/:id', async (req, res, next) => {
  try {
    const att = await prisma.messageAttachment.findUnique({
      where: { id: req.params.id },
      select: {
        mimeType: true,
        sizeBytes: true,
        bytes: true,
        message: { select: { conversation: { select: { studentId: true } } } },
      },
    });
    if (!att) {
      return res.status(404).json({ error: t('messages.attachmentNotFound', getLang(req)) });
    }
    const studentId = att.message?.conversation?.studentId;
    if (!studentId || !(await canReadStudentConversation(req.user, studentId))) {
      return res.status(403).json({ error: t('auth.forbidden', getLang(req)) });
    }
    res.setHeader('Content-Type', att.mimeType);
    res.setHeader('Content-Length', att.sizeBytes);
    // `no-store` is deliberate: the URL is the same for everyone, so a
    // long-lived browser cache would let a different user pull the
    // image from disk without ever hitting our auth check. The per-
    // request DB read is cheap; the security guarantee is not.
    res.setHeader('Cache-Control', 'private, no-store');
    res.end(att.bytes);
  } catch (err) {
    next(err);
  }
});

// Send a message into a conversation. The conversation is lazy-created
// here too — a student sending their first "salaam" materialises the
// row alongside their first message.
router.post(
  '/conversations/:studentId/messages',
  sendLimiter,
  uploadImage,
  async (req, res, next) => {
    try {
      const lang = getLang(req);
      const { studentId } = req.params;

      // Multipart parses text fields into req.body the same way
      // express.json does for plain text-only sends; req.file is set
      // only when an image was attached. Either is allowed; both is
      // allowed; neither isn't.
      const body = typeof req.body?.body === 'string' ? req.body.body.trim() : '';
      const file = req.file;
      if (body.length === 0 && !file) {
        return res.status(400).json({ error: t('messages.emptyMessage', lang) });
      }
      if (body.length > 4000) {
        return res.status(400).json({ error: t('messages.bodyTooLong', lang) });
      }
      if (file && !ALLOWED_IMAGE_MIMETYPES.has(file.mimetype)) {
        return res.status(400).json({ error: t('messages.unsupportedImageType', lang) });
      }

      // Write requires an explicit TeacherStudent row (or being the
      // student themselves). A sheikh observing the thread for
      // oversight cannot reply unless they're also the assigned
      // teacher.
      if (!(await canWriteStudentConversation(req.user, studentId))) {
        return res.status(403).json({ error: t('auth.forbidden', lang) });
      }

      const conv = await ensureConversation(studentId);

      const [message] = await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: req.user.id,
            body,
            attachment: file
              ? {
                  create: {
                    mimeType: file.mimetype,
                    sizeBytes: file.size,
                    bytes: file.buffer,
                  },
                }
              : undefined,
          },
          select: {
            id: true,
            body: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: { id: true, firstName: true, lastName: true, role: true },
            },
            attachment: {
              select: { id: true, mimeType: true, sizeBytes: true },
            },
          },
        }),
        prisma.conversation.update({
          where: { id: conv.id },
          data: { lastMessageAt: new Date() },
        }),
        // The sender always sees their own message as read.
        prisma.conversationRead.upsert({
          where: { conversationId_userId: { conversationId: conv.id, userId: req.user.id } },
          update: { lastReadAt: new Date() },
          create: { conversationId: conv.id, userId: req.user.id },
        }),
      ]);

      auditLog('MESSAGE_SENT', {
        userId: req.user.id,
        conversationId: conv.id,
        studentId,
        bytes: body.length,
        hasAttachment: !!file,
      });

      // Build the serialized message shape once — both the HTTP response,
      // the socket broadcast, and the sidebar update all need the same
      // payload. Keeps the live view, the polled view, and the optimistic
      // local insert byte-for-byte identical.
      const senderRole =
        message.sender?.role === 'admin'
          ? 'sheikh'
          : message.sender?.id === studentId
          ? 'student'
          : 'teacher';
      const messagePayload = {
        id: message.id,
        body: message.body,
        senderId: message.senderId,
        senderName: message.sender
          ? `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim()
          : '',
        senderRole,
        createdAt: message.createdAt,
        attachment: message.attachment
          ? {
              id: message.attachment.id,
              mimeType: message.attachment.mimeType,
              sizeBytes: message.attachment.sizeBytes,
            }
          : null,
      };

      // Live broadcast: everyone currently in the conversation room
      // (the thread view) gets the message instantly. `fromSelf` is
      // recipient-specific so we can't bake it in; the client compares
      // senderId against its own user id to decide bubble alignment.
      try {
        broadcastNewMessage({
          conversation: { ...conv, lastMessageAt: new Date() },
          message: messagePayload,
        });
        // Sidebar/inbox hint for participants NOT currently inside the
        // thread (e.g. sheikh on the Home tab). Best-effort: errors
        // bubble up into the catch below and never block the response.
        const recipientIds = await readerIdsForStudent(studentId);
        recipientIds.delete(req.user.id);
        broadcastConversationUpdated({
          conversation: { ...conv, lastMessageAt: new Date() },
          message: messagePayload,
          recipientIds: Array.from(recipientIds),
        });
      } catch (err) {
        logger.error('messages: socket broadcast failed', {
          conversationId: conv.id,
          error: err.message,
        });
      }

      // Fire-and-forget: the API response goes out immediately and every
      // error is caught inside the service. A Resend outage must never
      // block the message POST.
      notifyNewMessage({
        conversation: conv,
        sender: {
          id: req.user.id,
          firstName: message.sender?.firstName || '',
          lastName: message.sender?.lastName || '',
        },
        body,
        hasAttachment: !!file,
      }).catch((err) =>
        logger.error('messages: notifyNewMessage dispatch failed', {
          conversationId: conv.id,
          senderId: req.user.id,
          error: err.message,
        })
      );

      res.status(201).json({
        message: { ...messagePayload, fromSelf: true },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
