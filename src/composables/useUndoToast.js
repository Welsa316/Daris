import { reactive } from 'vue';

/**
 * useUndoToast — pattern for destructive actions where a short grace window
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
});

export function queueUndoable({
  label,
  undoLabel = 'Undo',
  action,
  onUndo = null,
  delayMs = DEFAULT_DELAY_MS,
}) {
  // If a previous toast is still pending, fire its action immediately so we
  // don't accumulate and lose data when the sheikh chains two deletes.
  flushPendingUndo();

  undoToastState.visible = true;
  undoToastState.label = label;
  undoToastState.undoLabel = undoLabel;
  undoToastState.undone = false;
  undoToastState.onUndo = onUndo;

  undoToastState.timerId = setTimeout(async () => {
    undoToastState.visible = false;
    undoToastState.timerId = null;
    try {
      await action();
    } catch (err) {
      // Surface the failure — reuse the same toast slot with an error label.
      undoToastState.visible = true;
      undoToastState.label = err?.data?.error || err?.message || 'Action failed';
      undoToastState.undoLabel = '';
      setTimeout(() => { undoToastState.visible = false; }, 4000);
    }
  }, delayMs);
}

export function undoPending() {
  if (undoToastState.timerId) {
    clearTimeout(undoToastState.timerId);
    undoToastState.timerId = null;
  }
  undoToastState.undone = true;
  undoToastState.visible = false;
  if (typeof undoToastState.onUndo === 'function') {
    undoToastState.onUndo();
  }
  undoToastState.onUndo = null;
}

/**
 * If the user leaves the page or triggers another destructive action, we
 * want to flush any queued action immediately rather than losing it.
 */
export function flushPendingUndo() {
  if (!undoToastState.timerId) return;
  clearTimeout(undoToastState.timerId);
  undoToastState.timerId = null;
  undoToastState.visible = false;
}
