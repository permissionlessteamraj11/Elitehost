/**
 * Toast Notification Manager
 * @module toast
 */

class ToastManager {
  #container;
  #maxToasts = 5;

  constructor() {
    this.#container = this.#createContainer();
  }

  #createContainer() {
    const el = document.createElement('div');
    el.className = 'toast-container';
    el.setAttribute('role', 'region');
    el.setAttribute('aria-label', 'Notifications');
    el.setAttribute('aria-live', 'polite');
    document.body.appendChild(el);
    return el;
  }

  #createToast(message, type, opts = {}) {
    const icons = { success: '✓', error: '✕', warning: '⚠', info: 'i' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.style.position = 'relative'; toast.style.overflow = 'hidden';
    toast.style.borderRadius = '12px';
    toast.style.fontFamily = 'var(--font-body)';

    toast.innerHTML = `
      <div class="toast-icon-wrap" style="width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,0.1);font-weight:800;font-size:12px">
        ${icons[type]}
      </div>
      <div class="toast-content" style="flex:1;margin-left:8px">
        ${opts.title ? `<div class="toast-title" style="font-weight:700;font-size:13px">${opts.title}</div>` : ''}
        <div class="toast-msg" style="font-size:12px;opacity:0.9">${message}</div>
      </div>
      <button class="toast-dismiss" aria-label="Dismiss" style="background:none;border:none;color:currentColor;cursor:pointer;opacity:0.5;font-size:14px">✕</button>
    `;

    toast.querySelector('.toast-dismiss').onclick = () => this.#dismiss(toast);
    toast.onclick = (e) => { if (e.target !== toast.querySelector('.toast-dismiss')) this.#dismiss(toast); };

    const duration = opts.duration || (type === 'error' ? 6000 : 4000);
    if (!opts.persist) {
      const timer = setTimeout(() => this.#dismiss(toast), duration);
      toast.dataset.timer = timer;

      const bar = document.createElement('div');
      bar.className = 'toast-progress';
      bar.style.cssText = `position:absolute;bottom:0;left:0;height:2px;background:currentColor;opacity:0.4;width:100%;animation:toast-shrink ${duration}ms linear forwards;`;
      toast.appendChild(bar);
    }

    return toast;
  }

  #dismiss(toast) {
    if (!toast.isConnected) return;
    clearTimeout(toast.dataset.timer);
    toast.classList.add('dismissing');
    setTimeout(() => toast.remove(), 260);
  }

  show(message, type = 'info', opts = {}) {
    const existing = this.#container.children;
    if (existing.length >= this.#maxToasts) {
      this.#dismiss(existing[0]);
    }
    const toast = this.#createToast(message, type, opts);
    this.#container.appendChild(toast);
    return toast;
  }

  success(msg, opts = {}) { return this.show(msg, 'success', opts); }
  error(msg, opts = {})   { return this.show(msg, 'error', opts); }
  warn(msg, opts = {})    { return this.show(msg, 'warning', opts); }
  info(msg, opts = {})    { return this.show(msg, 'info', opts); }

  promise(promise, msgs) {
    const t = this.info(msgs.loading || 'Loading...', { persist: true });
    promise
      .then(() => { this.#dismiss(t); this.success(msgs.success || 'Done!'); })
      .catch((err) => { this.#dismiss(t); this.error(msgs.error || err?.data?.error || 'Failed.'); });
    return promise;
  }

  clearAll() {
    Array.from(this.#container.children).forEach(t => this.#dismiss(t));
  }
}

export const toast = new ToastManager();
export default toast;
