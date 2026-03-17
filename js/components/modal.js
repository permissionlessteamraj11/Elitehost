/**
 * Modal Manager — Stack-based, focus-trapped, accessible
 * @module modal
 */

const FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

class ModalManager {
  #stack = [];

  open(opts = {}) {
    const {
      title = '', content = '', size = 'md',
      onClose, closeOnBackdrop = true,
      showClose = true, footer = null,
    } = opts;
    const sizes = { sm: '400px', md: '520px', lg: '680px', xl: '860px', full: '95vw' };

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.setAttribute('role', 'dialog');
    backdrop.setAttribute('aria-modal', 'true');
    if (title) backdrop.setAttribute('aria-labelledby', 'modal-title-' + Date.now());

    const box = document.createElement('div');
    box.className = 'modal-box';
    box.style.maxWidth = sizes[size] || sizes.md;

    box.innerHTML = `
      ${(title || showClose) ? `
        <div class="modal-header">
          ${title ? `<h2 class="modal-title">${title}</h2>` : '<div></div>'}
          ${showClose ? `<button class="modal-close" aria-label="Close">✕</button>` : ''}
        </div>` : ''}
      <div class="modal-body">${content}</div>
      ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
    `;

    if (closeOnBackdrop) {
      backdrop.onclick = (e) => { if (e.target === backdrop) this.close(); };
    }
    box.querySelector('.modal-close')?.addEventListener('click', () => this.close());

    backdrop.appendChild(box);
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(() => box.querySelector(FOCUSABLE)?.focus());

    const handleKey = (e) => {
      if (e.key === 'Escape') { this.close(); return; }
      if (e.key !== 'Tab') return;
      const focusable = [...box.querySelectorAll(FOCUSABLE)];
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (!first) return;
      if (e.shiftKey ? document.activeElement === first : document.activeElement === last) {
        e.preventDefault();
        (e.shiftKey ? last : first)?.focus();
      }
    };
    document.addEventListener('keydown', handleKey);

    const instance = { backdrop, box, onClose, handleKey };
    this.#stack.push(instance);
    return instance;
  }

  close(data) {
    const inst = this.#stack.pop();
    if (!inst) return;
    document.removeEventListener('keydown', inst.handleKey);
    inst.backdrop.style.animation = 'fadeOut 0.2s ease forwards';
    setTimeout(() => {
      inst.backdrop.remove();
      if (!this.#stack.length) document.body.style.overflow = '';
    }, 200);
    inst.onClose?.(data);
  }

  closeAll() { while (this.#stack.length) this.close(); }

  update(content) {
    const inst = this.#stack[this.#stack.length - 1];
    if (inst) inst.box.querySelector('.modal-body').innerHTML = content;
  }

  alert(message, title = 'Notice') {
    return new Promise(resolve => {
      this.open({
        title, content: `<p style="color:var(--text-secondary);line-height:1.6">${message}</p>`,
        footer: `<button class="btn btn-electric btn-md" id="modal-ok">OK</button>`,
        onClose: resolve,
      });
      document.getElementById('modal-ok')?.addEventListener('click', () => { this.close(); resolve(true); });
    });
  }

  confirm(message, opts = {}) {
    return new Promise(resolve => {
      const { title = 'Confirm', danger = false, okText = 'Confirm', cancelText = 'Cancel' } = opts;
      this.open({
        title,
        content: `<p style="color:var(--text-secondary);line-height:1.6">${message}</p>`,
        footer: `
          <button class="btn btn-ghost btn-md" id="modal-cancel">${cancelText}</button>
          <button class="btn ${danger ? 'btn-danger' : 'btn-electric'} btn-md" id="modal-confirm">${okText}</button>
        `,
        onClose: () => resolve(false),
      });
      document.getElementById('modal-cancel')?.addEventListener('click', () => { this.close(); resolve(false); });
      document.getElementById('modal-confirm')?.addEventListener('click', () => { this.close(); resolve(true); });
    });
  }

  prompt(message, opts = {}) {
    return new Promise(resolve => {
      const { title = 'Enter', placeholder = '', value = '' } = opts;
      this.open({
        title,
        content: `
          <p style="color:var(--text-secondary);margin-bottom:12px">${message}</p>
          <input class="input" id="modal-input" placeholder="${placeholder}" value="${value}" style="width:100%">
        `,
        footer: `
          <button class="btn btn-ghost btn-md" id="modal-cancel">Cancel</button>
          <button class="btn btn-electric btn-md" id="modal-ok">OK</button>
        `,
        onClose: () => resolve(null),
      });
      const input = document.getElementById('modal-input');
      input?.focus(); input?.select();
      document.getElementById('modal-cancel')?.addEventListener('click', () => { this.close(); resolve(null); });
      document.getElementById('modal-ok')?.addEventListener('click', () => {
        const val = document.getElementById('modal-input')?.value;
        this.close(); resolve(val);
      });
      input?.addEventListener('keydown', e => {
        if (e.key === 'Enter') { const val = input.value; this.close(); resolve(val); }
      });
    });
  }
}

export const modal = new ModalManager();
export default modal;
