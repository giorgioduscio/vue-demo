import * as bootstrap from 'bootstrap';

// Funzione di utilità per mantenere la sintassi originale e garantire compatibilità
export const Toast = {
  primary(messaggio: string) {
    ToastManager.getInstance().show(messaggio, 'primary');
  },
  danger(messaggio: string) {
    ToastManager.getInstance().show(messaggio, 'danger');
  },
  secondary(messaggio: string) {
    ToastManager.getInstance().show(messaggio, 'secondary');
  },
  success(messaggio: string) {
    ToastManager.getInstance().show(messaggio, 'success');
  },
  warning(messaggio: string) {
    ToastManager.getInstance().show(messaggio, 'warning');
  },
  info(messaggio: string) {
    ToastManager.getInstance().show(messaggio, 'info');
  },
} as const;

const COLORS = {
  primary: '#007bff',
  secondary: '#6c757d',
  danger: '#dc3545',
  success: '#198754',
  warning: '#ffc107',
  info: '#0dcaf0'
} as const;

type ToastColor = keyof typeof COLORS;

class ToastManager {
  private static instance: ToastManager;
  private toastPool: HTMLElement[] = [];
  private readonly MAX_POOL_SIZE = 5;
  private styleInjected = false;
  // Cache per i messaggi recenti
  private messageCache = new Set<string>();
  // private readonly MAX_CACHE_SIZE = 10;
  private readonly CACHE_CLEANUP_DELAY = 5000; // 5 secondi

  private constructor() {}

  // Metodo per ottenere l'istanza singleton
  public static getInstance(): ToastManager {
    if (!ToastManager.instance) {
      ToastManager.instance = new ToastManager();
    }
    return ToastManager.instance;
  }

  // Recupera un elemento dal pool o ne crea uno nuovo
  private getToastElement(): HTMLElement {
    return this.toastPool.pop() || document.createElement('div');
  }

  // Rilascia un elemento nel pool
  private releaseToastElement(el: HTMLElement): void {
    if (this.toastPool.length < this.MAX_POOL_SIZE) {
      el.className = 'toast-notification';
      this.toastPool.push(el);
    }
  }

  // Inietta lo stile CSS se non già fatto
  private injectStyle(): void {
    if (!this.styleInjected) {
      const style = document.createElement('style');
      style.textContent = `
        .toast-notification {
          padding: 15px 20px;
          margin: 0 auto;
          position: fixed;
          top: 20px;
          left: 50%;
          transform: translateX(-50%);
          max-width: 500px;
          z-index: 10001;
          transition: opacity 0.3s ease;
          opacity: 1;
          white-space: nowrap;
          background-color: ${COLORS.secondary};
          color: #fff;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0,0,0,0.3);
          font-size: 14px;
        }
        .toast-notification.fade-out {
          opacity: 0;
        }
      `;
      document.head.appendChild(style);
      this.styleInjected = true;
    }
  }

  // Aggiunge un messaggio alla cache e ne programma la rimozione
  private addToCache(message: string): void {
    this.messageCache.add(message);
    setTimeout(() => {
      this.messageCache.delete(message);
    }, this.CACHE_CLEANUP_DELAY);
  }

  // Verifica se il messaggio è già stato mostrato di recente
  private isMessageDuplicate(message: string): boolean {
    return this.messageCache.has(message);
  }

  public show(message: string, color: ToastColor = "secondary"): void {
    // Controllo duplicati: se il messaggio è già nella cache, non mostrare il toast
    if (this.isMessageDuplicate(message)) {
      return;
    }

    // Aggiungi il messaggio alla cache
    this.addToCache(message);

    const bootstrapGlobal = bootstrap as any;
    const isBootstrap5 = typeof bootstrapGlobal !== 'undefined' && bootstrapGlobal.Toast;
    
    if (isBootstrap5) {
      let container = document.getElementById('bs-toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'bs-toast-container';
        container.className = 'toast-container position-fixed top-0 start-50 translate-middle-x p-3';
        container.style.zIndex = '10001';
        document.body.appendChild(container);
      }

      const isLightColor = color === 'warning' || color === 'info';
      const textColor = isLightColor ? 'text-dark' : 'text-white';
      const closeBtnColor = isLightColor ? '' : 'btn-close-white';

      const toastEl = document.createElement('div');
      toastEl.className = `toast align-items-center ${textColor} bg-${color} border-0 mb-2`;
      toastEl.setAttribute('role', 'alert');
      toastEl.setAttribute('aria-live', 'assertive');
      toastEl.setAttribute('aria-atomic', 'true');

      toastEl.innerHTML = `
        <div class="d-flex">
          <div class="toast-body fs-6"></div>
          <button type="button" class="btn-close ${closeBtnColor} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      `;
      
      // Sanificazione
      toastEl.querySelector('.toast-body')!.textContent = message;

      container.appendChild(toastEl);
      const bsToast = new bootstrapGlobal.Toast(toastEl, { delay: 3000 });

      toastEl.addEventListener('hidden.bs.toast', () => {
        toastEl.remove();
        if (container && container.childNodes.length === 0) {
          container.remove();
        }
      }, { once: true });

      bsToast.show();
      return;
    }

    // FALLBACK: Logica custom
    this.injectStyle();

    const notificaEl = this.getToastElement();
    notificaEl.className = 'toast-notification';
    notificaEl.style.backgroundColor = COLORS[color];
    notificaEl.textContent = message;

    document.body.appendChild(notificaEl);

    requestAnimationFrame(() => {
      setTimeout(() => {
        notificaEl.classList.add('fade-out');
        setTimeout(() => {
          if (notificaEl.parentNode) {
            document.body.removeChild(notificaEl);
          }
          this.releaseToastElement(notificaEl);
        }, 300);
      }, 3000);
    });
  }
}


//  funzione che imita confirm()
export const agree = {
  primary(message: string, btnText?: string) {
    return executeAgree(message, btnText, 'primary');
  },
  success(message: string, btnText?: string) {
    return executeAgree(message, btnText, 'success');
  },
  danger(message: string, btnText?: string) {
    return executeAgree(message, btnText, 'danger');
  },
  warning(message: string, btnText?: string) {
    return executeAgree(message, btnText, 'warning');
  },
  info(message: string, btnText?: string) {
    return executeAgree(message, btnText, 'info');
  },
};

/**
 * Verifica se una stringa contiene esclusivamente testo semplice,
 * bloccando tentativi di inserimento HTML o script JavaScript.
 */
function isSafeText(str: string): boolean {
  // Rileva tag HTML (<...>), entità (&...;) o tentativi di script (javascript:)
  const htmlPattern = /<[^>]*>|&[a-z0-9#]+;/i;
  const jsPattern = /javascript:|on\w+\s*=/i;
  
  return !htmlPattern.test(str) && !jsPattern.test(str);
}

function executeAgree(message: string,
  messaggioPulsante = 'Invio',
  colorePulsante: ToastColor = "primary"): Promise<boolean> {
  return new Promise((resolve) => {

    // BLOCCO PREVENTIVO: Se i parametri contengono HTML o JS, interrompe l'esecuzione
    if (!isSafeText(message) || !isSafeText(messaggioPulsante)) {
      console.warn('[Security Block] Tentativo di inserimento codice rilevato in agree(). La funzione accetta solo testo semplice.');
      return resolve(false);
    }

    const bootstrapGlobal = bootstrap as any;
    const isBootstrap5 = typeof bootstrapGlobal !== 'undefined' && bootstrapGlobal.Modal;

    if (isBootstrap5) {
      const modalId = `bs-agree-${Math.random().toString(36).slice(2, 9)}`;
      const titleId = `${modalId}-title`;
      const previousActiveElement = document.activeElement as HTMLElement;

      const html = `
        <div class="modal fade" id="${modalId}" tabindex="-1" role="dialog" aria-labelledby="${titleId}" aria-modal="true">
          <div class="modal-dialog modal-sm" role="document">
            <div class="modal-content text-bg-dark border-0 shadow-lg">
              <div class="modal-header border-0 pb-0">
                <button type="button" class="btn btn-dark ms-auto" data-bs-dismiss="modal" aria-label="Close">
                  <i class="bi bi-x-lg"></i>
                </button>
              </div>
              <div class="modal-body text-center py-4">
                <p class="mb-0 fs-5 fw-medium" id="${titleId}"></p>
              </div>
              <div class="modal-footer border-0 justify-content-between pb-4 pt-0">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Annulla</button>
                <button type="button" class="btn btn-${colorePulsante}" id="${modalId}-ok"></button>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', html);
      const modalEl = document.getElementById(modalId)!;
      const okBtn = document.getElementById(`${modalId}-ok`)!;
      const titleEl = document.getElementById(titleId)!;
      
      // Sanificazione degli input
      titleEl.textContent = message;
      okBtn.textContent = messaggioPulsante;

      const bsModal = new bootstrapGlobal.Modal(modalEl);

      let isConfirmed = false;

      okBtn.onclick = () => {
        isConfirmed = true;
        bsModal.hide();
      };

      modalEl.addEventListener('hide.bs.modal', () => {
        modalEl.setAttribute('inert', 'true');
      }, { once: true });

      modalEl.addEventListener('hidden.bs.modal', () => {
        modalEl.remove();
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
          previousActiveElement.focus();
        }
        resolve(isConfirmed);
      }, { once: true });

      bsModal.show();
      return;
    }

    /* FALLBACK: Logica custom originale disattivata per favorire Bootstrap 5
    const colori = COLORS;
    if (!document.getElementById("agree-modal-style")) {
      const style = document.createElement("style");
      style.id = "agree-modal-style";
      style.textContent = `
        .agree-modal {
          display: flex;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          justify-content: center;
          padding-top: 50px;
          z-index: 10000;
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.3s ease, visibility 0s 0.3s;
        }
        .agree-modal.visible {
          opacity: 1;
          visibility: visible;
          transition-delay: 0s;
        }
        .agree-modal-content {
          background-color: #2c2c2c;
          color: #f1f1f1;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          max-width: 400px;
          height: max-content;
          text-align: center;
        }
        .agree-modal-message {
          margin: 0 0 20px 0;
        }
        .agree-modal-buttons {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .agree-modal-ok {
          background-color: ${colori[colorePulsante as keyof typeof colori] || colori.primary};
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        .agree-modal-cancel {
          background-color: #6c757d;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
        }
        .agree-modal-buttons button:active {
          filter: brightness(85%);
        }
      `;
      document.head.appendChild(style);
    }

    document.body.insertAdjacentHTML("beforeend", `
      <div class="agree-modal" id="agree-modal">
        <div class="agree-modal-content">
          <p class="agree-modal-message">${message}</p>
          <div class="agree-modal-buttons">
            <button class="agree-modal-ok" id="agree-ok">${messaggioPulsante}</button>
            <button class="agree-modal-cancel" id="agree-cancel">Annulla</button>
          </div>
        </div>
      </div>
    `);

    const modal = document.getElementById("agree-modal");
    const okButton = document.getElementById("agree-ok");
    const cancelButton = document.getElementById("agree-cancel");
    if(!modal || !okButton || !cancelButton) 
      return console.error('elementi non trovati', modal, okButton, cancelButton);

    setTimeout(() => {
      modal.classList.add("visible");
    }, 10);

    const cleanup = () => {
      modal.classList.remove("visible");
      setTimeout(() => {
        if (modal.parentNode) document.body.removeChild(modal);
      }, 300);
    };

    okButton.onclick = () => {
      cleanup();
      resolve(true);
    };

    cancelButton.onclick = () => {
      cleanup();
      resolve(false);
    };
    */
    resolve(false);
  });
}

/**
# MODULO POPOVER
*/
export function popovers_init() {
  Popover.injectStyle();
  Popover.init();
  Popover.initCleanup();
}

const Popover = {
  injectStyle(): void {
    if (document.getElementById('popover-styles')) return;
    const style = document.createElement('style');
    style.id = 'popover-styles';
    style.textContent = `
      [data-popover] :not(input) :not(textarea) {
        position: relative;
        cursor: pointer;
      }
      .popover {
        max-height: 200px;
        overflow-y: auto;
        padding: 4px 8px;
        z-index: 100;
        display: none;
        opacity: 0;
        word-wrap: break-word;
        min-width: 100px;
        background: linear-gradient(0deg, #333, #555);
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        position: absolute;
        transform: translateY(-5px);
        transition: opacity 0.2s ease, transform 0.2s ease;
      }
      .popover.popover-top { transform: translateY(5px); }
      .popover.visible { opacity: 1; transform: translateY(0); }
      .popover-header {
        padding: 0;
        margin-bottom: 5px;
        color: #fff !important;
        font-weight: bold;
        font-size: 14px;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }
      .popover-body { color: #fff !important; font-size: 12px; }
      .popover ol { margin: 0; padding-left: 15px; }
    `;
    document.head.appendChild(style);
  },

  createPopover(title: string | null, message: string): HTMLElement {
    const popover = document.createElement('div');
    const headerId = `popover-header-${Math.random().toString(36).substr(2, 5)}`;
    const bodyId = `popover-body-${Math.random().toString(36).substr(2, 5)}`;
    const formattedMessage = message.split('* ').filter(item => item.trim());
    
    popover.innerHTML = `
      <div class="popover" role="dialog" aria-live="polite" aria-labelledby="${headerId}" aria-describedby="${bodyId}">
        <div id="${headerId}" class="popover-header">${title || ''}</div>
        <div id="${bodyId}" class="popover-body">
          ${formattedMessage.length > 1 ? `<ol>${formattedMessage.map(m => `<li>${m}</li>`).join('')}</ol>` : formattedMessage[0]}
        </div>
      </div>
    `;
    return popover.firstElementChild as HTMLElement;
  },

  positionPopover(popover: HTMLElement, target: HTMLElement): void {
    const rect = target.getBoundingClientRect();
    const spacing = 5;
    popover.style.width = `${Math.max(100, Math.min(rect.width, 400))}px`;
    popover.style.display = 'block';
    popover.style.visibility = 'hidden';

    const popoverHeight = popover.offsetHeight;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    let top = isInput ? rect.top - popoverHeight - spacing : rect.bottom + spacing;
    if (top < 0) top = rect.bottom + spacing;
    
    popover.style.top = `${top + window.scrollY}px`;
    popover.style.left = `${rect.left + window.scrollX}px`;
    popover.style.visibility = 'visible';
    setTimeout(() => popover.classList.add('visible'), 10);
  },

  hidePopover(popover: HTMLElement): void {
    if (!popover) return;
    popover.classList.remove('visible');
    setTimeout(() => popover.style.display = 'none', 200);
  },

  init(): void {
    document.addEventListener('focusin', (e) => {
      const target = e.target as HTMLElement;
      const data = target.getAttribute('data-popover');
      if ((target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && data) {
        const parts = data.split('>');
        const title = parts.length > 1 ? parts[0] : null;
        const message = parts.length > 1 ? parts.slice(1).join('>') : parts[0];
        
        const popover = Popover.createPopover(title||'', message || '');
        document.body.appendChild(popover);
        Popover.positionPopover(popover, target);
        target.addEventListener('focusout', () => {
          Popover.hidePopover(popover);
          setTimeout(() => popover.remove(), 250);
        }, { once: true });
      }
    });

    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const data = target.getAttribute('data-popover');
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && data) {
        const parts = data.split('>');
        const title = parts.length > 1 ? parts[0] : null;
        const message = parts.length > 1 ? parts.slice(1).join('>') : parts[0];

        const popover = Popover.createPopover(title || '', message || '');
        document.body.appendChild(popover);
        Popover.positionPopover(popover, target);
        setTimeout(() => {
          Popover.hidePopover(popover);
          setTimeout(() => popover.remove(), 250);
        }, 3000);
      }
    });
  },

  initCleanup(): void {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => m.removedNodes.forEach((n) => {
        if (n instanceof HTMLElement && n.dataset['popoverId']) {
          document.getElementById(n.dataset['popoverId']!)?.remove();
        }
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }
};
