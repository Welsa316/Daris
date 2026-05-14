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
import { z } from 'zod';
import { authenticate, verifyTokenVersion } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { prisma } from '../config/database.js';
import { t, getLang } from '../utils/i18n.js';
import { auditLog } from '../utils/logger.js';

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

const sendSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(4000).trim(),
});

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

// Can `user` (the request actor) read+write the conversation anchored on
// `studentId`? Sheikh always yes. The student themselves yes. A teacher
// yes iff they have a TeacherStudent row for this student. Anyone else
// no.
async function canAccessStudentConversation(user, studentId) {
  if (isSheikh(user)) return true;
  if (user.id === studentId) return true;
  if (!user.isTeacher) return false;
  const row = await prisma.teacherStudent.findUnique({
    where: {
      teacherId_studentId: { teacherId: user.id, studentId },
    },
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
        return {
          studentId: sid,
          studentName: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
          conversationId: conv?.id || null,
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

    if (!(await canAccessStudentConversation(req.user, studentId))) {
      return res.status(403).json({ error: t('auth.forbidden', lang) });
    }

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

    res.json({
      conversation: {
        id: conv.id,
        studentId: conv.studentId,
        lastMessageAt: conv.lastMessageAt,
        createdAt: conv.createdAt,
      },
      participants,
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
      })),
    });
  } catch (error) {
    next(error);
  }
});

// Send a message into a conversation. The conversation is lazy-created
// here too — a student sending their first "salaam" materialises the
// row alongside their first message.
router.post(
  '/conversations/:studentId/messages',
  sendLimiter,
  validate(sendSchema),
  async (req, res, next) => {
    try {
      const lang = getLang(req);
      const { studentId } = req.params;

      if (!(await canAccessStudentConversation(req.user, studentId))) {
        return res.status(403).json({ error: t('auth.forbidden', lang) });
      }

      const conv = await ensureConversation(studentId);

      const [message] = await prisma.$transaction([
        prisma.message.create({
          data: {
            conversationId: conv.id,
            senderId: req.user.id,
            body: req.body.body,
          },
          select: {
            id: true,
            body: true,
            senderId: true,
            createdAt: true,
            sender: {
              select: { id: true, firstName: true, lastName: true, role: true },
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
        bytes: req.body.body.length,
      });

      res.status(201).json({
        message: {
          id: message.id,
          body: message.body,
          senderId: message.senderId,
          senderName: message.sender
            ? `${message.sender.firstName || ''} ${message.sender.lastName || ''}`.trim()
            : '',
          senderRole:
            message.sender?.role === 'admin'
              ? 'sheikh'
              : message.sender?.id === studentId
              ? 'student'
              : 'teacher',
          createdAt: message.createdAt,
          fromSelf: true,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
