import { io } from 'socket.io-client';

/**
 * Singleton Socket.IO client.
 *
 * Auth piggybacks on the existing httpOnly accessToken cookie — Socket.IO
 * upgrades from an HTTP handshake so the cookie travels automatically.
 * No token is ever read by JS.
 *
 * We connect lazily on first use and leave the connection open until the
 * page unloads or the auth layer calls `disconnectSocket()` (which it
 * does on logout, since the cookie will be invalidated and the next
 * reconnect attempt would fail).
 */

let socket = null;

export function getSocket() {
  if (socket && socket.connected) return socket;
  if (socket) return socket;

  socket = io({
    path: '/socket.io',
    withCredentials: true,
    // Default transports try WebSocket first and fall back to polling
    // for misbehaving proxies. Keep both so the live experience is
    // resilient on flaky networks.
    transports: ['websocket', 'polling'],
    // Built-in exponential backoff: 1s, 2s, 4s, ..., capped at 30s.
    // Tries indefinitely so a transient outage doesn't permanently
    // drop the connection.
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 30000,
  });

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
