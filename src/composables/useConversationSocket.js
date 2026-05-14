import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { getSocket } from '@/lib/socket.js';

/**
 * Per-thread live socket binding. Components pass in the `studentId` of
 * the conversation they're viewing; the composable joins the matching
 * server room and exposes reactive state for the four live behaviors:
 *
 *   - `incomingMessages`      array of messages received over the socket
 *                             while this thread is mounted. Caller is
 *                             responsible for splicing into its render
 *                             list and clearing as it processes them.
 *   - `typingUsers`           Map<userId, { name, role, until }> of
 *                             participants currently typing.
 *   - `readByUser`            Map<userId, lastReadAt ISO string> updated
 *                             whenever another participant opens the
 *                             thread.
 *   - `onlineUserIds`         Set<userId> of participants currently
 *                             connected anywhere on the platform.
 *
 * The composable also exposes helpers the caller wires to its composer:
 *
 *   - `signalTyping()`   throttled to one "start" event every 3s; auto
 *                         stops 5s after the last keystroke.
 *   - `signalRead()`     called right after a successful REST load so
 *                         peers can update their read receipts in real
 *                         time (the REST GET already bumps lastReadAt
 *                         server-side; this just broadcasts).
 */
export function useConversationSocket(studentIdRef) {
  const incomingMessages = ref([]);
  const typingUsers = ref(new Map());
  const readByUser = ref(new Map());
  const onlineUserIds = ref(new Set());
  const connected = ref(false);

  const socket = getSocket();
  let currentStudentId = null;

  function onConnect() {
    connected.value = true;
    rejoin();
  }
  function onDisconnect() {
    connected.value = false;
  }

  function onMessageNew(payload) {
    if (!currentStudentId) return;
    if (payload.studentId !== currentStudentId) return;
    incomingMessages.value.push(payload.message);
  }

  function onTypingStart({ userId, name, role }) {
    // Auto-expire after 7s in case the typing:stop event is dropped.
    const until = Date.now() + 7000;
    typingUsers.value.set(userId, { name, role, until });
    // Trigger reactivity on the Map reassignment.
    typingUsers.value = new Map(typingUsers.value);
  }

  function onTypingStop({ userId }) {
    if (typingUsers.value.has(userId)) {
      typingUsers.value.delete(userId);
      typingUsers.value = new Map(typingUsers.value);
    }
  }

  function onConversationRead({ userId, lastReadAt }) {
    readByUser.value.set(userId, lastReadAt);
    readByUser.value = new Map(readByUser.value);
  }

  function onPresence({ userId, online }) {
    const next = new Set(onlineUserIds.value);
    if (online) next.add(userId);
    else next.delete(userId);
    onlineUserIds.value = next;
  }

  function rejoin() {
    if (!currentStudentId) return;
    socket.emit(
      'conversation:join',
      { studentId: currentStudentId },
      (ack) => {
        if (ack?.ok) {
          onlineUserIds.value = new Set(ack.onlineUserIds || []);
        }
      }
    );
  }

  function bind(studentId) {
    if (currentStudentId === studentId) return;
    if (currentStudentId) {
      socket.emit('conversation:leave', { studentId: currentStudentId });
    }
    currentStudentId = studentId || null;
    incomingMessages.value = [];
    typingUsers.value = new Map();
    readByUser.value = new Map();
    if (currentStudentId && socket.connected) rejoin();
  }

  // Typing emit: throttle "start" to once per 3s, and schedule a "stop"
  // 5s after the last call. The composer calls `signalTyping()` on each
  // input event; this keeps server traffic light without losing the
  // "still typing" status during a long message.
  let lastStartAt = 0;
  let stopTimer = null;
  function signalTyping() {
    if (!currentStudentId) return;
    const now = Date.now();
    if (now - lastStartAt > 3000) {
      socket.emit('typing:start', { studentId: currentStudentId });
      lastStartAt = now;
    }
    if (stopTimer) clearTimeout(stopTimer);
    stopTimer = setTimeout(() => {
      if (currentStudentId) {
        socket.emit('typing:stop', { studentId: currentStudentId });
      }
      lastStartAt = 0;
    }, 5000);
  }

  function signalRead() {
    if (!currentStudentId) return;
    socket.emit('conversation:read', { studentId: currentStudentId });
  }

  // Sweep expired typing entries every 2s in case typing:stop never
  // arrived. Cheap and keeps the "typing…" indicator from getting stuck.
  let sweepTimer = null;
  function startSweep() {
    if (sweepTimer) return;
    sweepTimer = setInterval(() => {
      if (typingUsers.value.size === 0) return;
      const now = Date.now();
      let changed = false;
      for (const [uid, info] of typingUsers.value) {
        if (info.until < now) {
          typingUsers.value.delete(uid);
          changed = true;
        }
      }
      if (changed) typingUsers.value = new Map(typingUsers.value);
    }, 2000);
  }
  function stopSweep() {
    if (sweepTimer) {
      clearInterval(sweepTimer);
      sweepTimer = null;
    }
  }

  onMounted(() => {
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('message:new', onMessageNew);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('conversation:read', onConversationRead);
    socket.on('presence:update', onPresence);
    connected.value = socket.connected;
    bind(studentIdRef.value);
    startSweep();
  });

  onBeforeUnmount(() => {
    socket.off('connect', onConnect);
    socket.off('disconnect', onDisconnect);
    socket.off('message:new', onMessageNew);
    socket.off('typing:start', onTypingStart);
    socket.off('typing:stop', onTypingStop);
    socket.off('conversation:read', onConversationRead);
    socket.off('presence:update', onPresence);
    if (currentStudentId) {
      socket.emit('conversation:leave', { studentId: currentStudentId });
    }
    stopSweep();
    if (stopTimer) clearTimeout(stopTimer);
  });

  watch(
    () => studentIdRef.value,
    (val) => bind(val)
  );

  return {
    connected,
    incomingMessages,
    typingUsers,
    readByUser,
    onlineUserIds,
    signalTyping,
    signalRead,
  };
}

/**
 * Lightweight binding for components that ONLY need the sidebar refresh
 * signal (conversation:updated). Doesn't join any room — fires whenever
 * the server pushes a list-update event for the current user.
 */
export function useConversationListSocket() {
  const updates = ref([]);
  const socket = getSocket();

  function onUpdated(payload) {
    updates.value.push(payload);
  }

  onMounted(() => {
    socket.on('conversation:updated', onUpdated);
  });
  onBeforeUnmount(() => {
    socket.off('conversation:updated', onUpdated);
  });

  return { updates };
}
