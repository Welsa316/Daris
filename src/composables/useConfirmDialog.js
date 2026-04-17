// Global bus so any component can call confirmDialog({...}) and have it
// routed to the single <ConfirmDialog /> instance mounted at the app root.
// The .open method is set by that instance when it mounts.
export const confirmDialogBus = {
  open: null,
};

/**
 * Show a translated confirm dialog.
 *
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} opts.message
 * @param {string} [opts.confirmLabel]
 * @param {string} [opts.cancelLabel]
 * @param {boolean} [opts.danger]          Styles the confirm button red.
 * @returns {Promise<boolean>}             Resolves to true/false.
 */
export function confirmDialog(opts) {
  if (typeof confirmDialogBus.open !== 'function') {
    // Component isn't mounted yet (first-paint race) — fall back to native
    // confirm so we don't silently lose the decision.
    // eslint-disable-next-line no-alert
    return Promise.resolve(window.confirm(opts.message));
  }
  return confirmDialogBus.open({ ...opts, mode: 'confirm' });
}

/**
 * Show a translated prompt dialog with a textarea.
 *
 * @param {Object} opts
 * @param {string} opts.title
 * @param {string} [opts.message]
 * @param {string} [opts.placeholder]
 * @param {string} [opts.defaultValue]
 * @param {string} [opts.confirmLabel]
 * @param {string} [opts.cancelLabel]
 * @returns {Promise<string|null>}         Resolves to entered text, or null if cancelled.
 */
export function promptDialog(opts) {
  if (typeof confirmDialogBus.open !== 'function') {
    // eslint-disable-next-line no-alert
    return Promise.resolve(window.prompt(opts.message || opts.title));
  }
  return confirmDialogBus.open({ ...opts, mode: 'prompt' });
}
