/**
 * Fills gaps in jsdom that real browsers don't have. Loaded before every test (angular.json
 * `test.options.setupFiles`).
 *
 * Tests run with `isolate: true` (angular.json): each spec file gets its own modules. Without it, a
 * spec that loads a service for real (e.g. ThemeService via the fakes) can leave it bound to the
 * real `firebase/firestore`, and another spec's `vi.mock` of it then silently doesn't apply. That
 * depends on how files share workers, so it failed in CI but not locally.
 */

// jsdom has <dialog> but not showModal()/close(). Model the parts the app relies on: `open`,
// and a `close` event, queued after close() returns as browsers do.
const dialog = globalThis.HTMLDialogElement?.prototype;
if (dialog && typeof dialog.showModal !== 'function') {
  dialog.showModal = function (this: HTMLDialogElement): void {
    this.setAttribute('open', '');
  };
  dialog.close = function (this: HTMLDialogElement): void {
    if (!this.hasAttribute('open')) return;
    this.removeAttribute('open');
    queueMicrotask(() => this.dispatchEvent(new Event('close')));
  };
}
