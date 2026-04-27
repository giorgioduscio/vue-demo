import * as bootstrap from 'bootstrap';

// CONFIGURAZIONE COLORI BOOTSTRAP
const COLORS = {
  primary: 'primary',
  danger: 'danger',
  secondary: 'secondary',
  success: 'success',
  warning: 'warning',
  info: 'info',
};

/**
 * TOAST NOTIFICATION SYSTEM
 * Gestisce la visualizzazione di messaggi temporanei utilizzando Bootstrap 5.
 */
export const Toast = {
  primary(messaggio) { ToastManager.getInstance().show(messaggio, COLORS.primary); },
  danger(messaggio) { ToastManager.getInstance().show(messaggio, COLORS.danger); },
  secondary(messaggio) { ToastManager.getInstance().show(messaggio, COLORS.secondary); },
  success(messaggio) { ToastManager.getInstance().show(messaggio, COLORS.success); },
  warning(messaggio) { ToastManager.getInstance().show(messaggio, COLORS.warning); },
  info(messaggio) { ToastManager.getInstance().show(messaggio, COLORS.info); },
};

class ToastManager {
  static instance;
  toastPool = [];
  messageCache = new Set();
  CACHE_TIMEOUT = 2000;

  constructor() {
    this.injectStyle();
  }

  static getInstance() {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  getToastElement() {
    return this.toastPool.pop() || document.createElement('div');
  }

  releaseToastElement(el) {
    if (this.toastPool.length < 5) {
      this.toastPool.push(el);
    } else {
      el.remove();
    }
  }

  injectStyle() {
    if (document.getElementById('toast-manager-style')) return;
    const style = document.createElement('style');
    style.id = 'toast-manager-style';
    style.textContent = `
      .toast-container-custom {
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          pointer-events: none;
      }
      .toast-custom {
          pointer-events: auto;
          min-width: 200px;
          text-align: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);
  }

  addToCache(message) {
    this.messageCache.add(message);
    setTimeout(() => {
      this.messageCache.delete(message);
    }, this.CACHE_TIMEOUT);
  }

  isMessageDuplicate(message) {
    return this.messageCache.has(message);
  }

  show(message, color = "secondary") {
    if (this.isMessageDuplicate(message)) return;
    this.addToCache(message);

    let container = document.querySelector('.toast-container-custom');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }

    const toastEl = this.getToastElement();
    toastEl.className = `toast toast-custom align-items-center text-white bg-${color} border-0 show`;
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    
    toastEl.innerHTML = `
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Chiudi"></button>
      </div>
    `;

    container.appendChild(toastEl);

    const bootstrapGlobal = bootstrap;
    if (bootstrapGlobal.Toast) {
      const t = new bootstrapGlobal.Toast(toastEl, { autohide: true, delay: 3000 });
      t.show();
      toastEl.addEventListener('hidden.bs.toast', () => {
        this.releaseToastElement(toastEl);
      }, { once: true });
    } else {
      setTimeout(() => {
        toastEl.classList.remove('show');
        setTimeout(() => this.releaseToastElement(toastEl), 300);
      }, 3000);
    }
  }
}

/**
 * MODAL AGREE SYSTEM
 * Gestisce finestre di dialogo per conferme (Yes/No).
 */
export const agree = {
  primary(message, btnText) { return executeAgree(message, btnText, "primary"); },
  success(message, btnText) { return executeAgree(message, btnText, "success"); },
  danger(message, btnText) { return executeAgree(message, btnText, "danger"); },
  warning(message, btnText) { return executeAgree(message, btnText, "warning"); },
  info(message, btnText) { return executeAgree(message, btnText, "info"); },
};

function isSafeText(str) {
  const pattern = /<[^>]*>?/gm;
  return !pattern.test(str);
}

function executeAgree(message, btnText = "Conferma", colorePulsante = "primary") {
  if (!isSafeText(message) || !isSafeText(btnText)) {
    console.error("Sicurezza: rilevato potenziale HTML/JS nel messaggio di dialogo.");
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    let modalEl = document.getElementById('agree-modal-custom');
    if (!modalEl) {
      modalEl = document.createElement('div');
      modalEl.id = 'agree-modal-custom';
      modalEl.className = 'modal fade';
      modalEl.setAttribute('tabindex', '-1');
      modalEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(modalEl);
    }

    modalEl.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white border-secondary">
          <div class="modal-body text-center py-4">
            <p class="mb-4 fs-5">${message}</p>
            <div class="d-flex justify-content-center gap-3">
              <button type="button" class="btn btn-outline-secondary px-4" data-bs-dismiss="modal">Annulla</button>
              <button type="button" class="btn btn-${colorePulsante} px-4" id="agree-confirm-btn">${btnText}</button>
            </div>
          </div>
        </div>
      </div>
    `;

    const bootstrapGlobal = bootstrap;
    const modal = new bootstrapGlobal.Modal(modalEl);
    const confirmBtn = modalEl.querySelector('#agree-confirm-btn');

    const handleConfirm = () => {
      modal.hide();
      resolve(true);
    };

    confirmBtn.addEventListener('click', handleConfirm, { once: true });
    modalEl.addEventListener('hidden.bs.modal', () => {
      resolve(false);
    }, { once: true });

    modal.show();
  });
}

/**
 * POPOVER SYSTEM
 * Gestisce popover informativi al passaggio del mouse o al click.
 */
export const Popover = {
  injectStyle() {
    if (document.getElementById('popover-style')) return;
    const style = document.createElement('style');
    style.id = 'popover-style';
    style.textContent = `
      [data-popover] { position: relative; cursor: pointer; }
      .popover-custom {
        display: none;
        position: absolute;
        z-index: 1060;
        max-width: 276px;
        padding: 0.5rem 1rem;
        background-color: #fff;
        border: 1px solid rgba(0,0,0,0.2);
        border-radius: 0.3rem;
        box-shadow: 0 0.5rem 1rem rgba(0,0,0,0.15);
      }
    `;
    document.head.appendChild(style);
  },

  createPopover(title, message) {
    const el = document.createElement('div');
    el.className = 'popover-custom';
    const titleHtml = title ? `<h3 class="popover-header">${title}</h3>` : '';
    el.innerHTML = `${titleHtml}<div class="popover-body">${message}</div>`;
    return el;
  }
};
