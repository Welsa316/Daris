import { reactive } from 'vue';

/**
 * useUndoToast. pattern for destructive actions where a short grace window
 * beats a confirm dialog. Instead of asking "are you sure?", the action is
 * delayed; the UI updates immediately and a toast with an "Undo" button
 * appears. If undone within the window the action is cancelled; otherwise it
 * runs.
 *
 *   queueUndoable({
 *     label: 'Class cancelled',
 *     undoLabel: 'Undo',
 *     action: () => api.post(...),  // runs after the delay
 *     onUndo: () => restoreUI(),    // optional: called on undo
 *   });
 *
 * The action is deferred, so anything that ends the window early — chaining
 * a second undoable, or leaving the page — must RUN the pending action, not
 * drop it, or the destructive change never reaches the server. A refresh
 * mid-window flushes via the `pagehide` listener below; for that flushed
 * request to outlive the page the action's fetch must set `keepalive`.
 *
 * All state is reactive so a single <UndoToast /> mounted anywhere can render it.
 */

const DEFAULT_DELAY_MS = 6000;

export const undoToastState = reactive({
  visible: false,
  label: '',
  undoLabel: '',
  timerId: null,
  undone: false,
  onUndo: null,
  // The deferred action itself, held so it can be run early on flush.
  pendingAction: null,
});

export function queueUndoable({
  label,
  undoLabel = 'Undo',
  action,
  onUndo = null,
  delayMs = DEFAULT_DELAY_MS,
}) {
  // A previous toast still pending? Run its action now — chaining a second
  // undoable must not silently drop the first.
  flushPendingUndo();

  undoToastState.visible = true;
  undoToastState.label = label;
  undoToastState.undoLabel = undoLabel;
  undoToastState.undone = false;
  undoToastState.onUndo = onUndo;
  undoToastState.pendingAction = action;

  undoToastState.timerId = setTimeout(runPendingAction, delayMs);
}

// Run the queued action and clear the toast. Shared by the timer, by
// flushPendingUndo, and by the page-unload handler. The action is detached
// before it runs, so a re-entrant call is a harmless no-op.
async function runPendingAction() {
  const action = undoToastState.pendingAction;
  if (undoToastState.timerId) {
    clearTimeout(undoToastState.timerId);
    undoToastState.timerId = null;
  }
  undoToastState.pendingAction = null;
  undoToastState.onUndo = null;
  undoToastState.visible = false;
  if (typeof action !== 'function') return;
  try {
    await action();
  } catch (err) {
    // Surface the failure. reuse the same toast slot with an error label.
    undoToastState.visible = true;
    undoToastState.label = err?.data?.error || err?.message || 'Action failed';
    undoToastState.undoLabel = '';
    setTimeout(() => { undoToastState.visible = false; }, 4000);
  }
}

export function undoPending() {
  if (undoToastState.timerId) {
    clearTimeout(undoToastState.timerId);
    undoToastState.timerId = null;
  }
  undoToastState.undone = true;
  undoToastState.visible = false;
  undoToastState.pendingAction = null;
  if (typeof undoToastState.onUndo === 'function') {
    undoToastState.onUndo();
  }
  undoToastState.onUndo = null;
}

/**
 * Run any queued action immediately instead of waiting out the window.
 * Called when the user chains another destructive action or leaves the
 * page — the pending action must fire, never be discarded.
 */
export function flushPendingUndo() {
  if (!undoToastState.pendingAction) return;
  runPendingAction();
}

// A refresh / navigation / tab close during the undo window would otherwise
// drop the deferred action and the server would never hear about it. Flush
// it on the way out. `pagehide` is more reliable than `beforeunload` and
// does not fire on a mere tab switch, so the window isn't cut short.
if (typeof window !== 'undefined') {
  window.addEventListener('pagehide', flushPendingUndo);
}
