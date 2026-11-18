/**
 * Cafe Mania - Main Application Script
 * Fulfills Requirements:
 * - 3. Light and Dark Modes: clean toggle switch with localStorage persistence and proper contrast.
 * - 5.2. Form Validation: pure JS validation without HTML validation attributes for contact modal.
 * - 6. Interactive UI effects (accordion, modals, toast, clock).
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // Ensure CafeMania namespace exists
  window.CafeMania = window.CafeMania || {};

  /* -------------------------------------------------------------
   * 1. ACCORDION COMPONENT (FAQ on index.html)
   * ------------------------------------------------------------- */
  document.querySelectorAll('[data-accordion-button]').forEach((button) => {
    const panel = document.getElementById(button.getAttribute('aria-controls'));
    if (!panel) return;

    button.addEventListener('click', () => {
      const opening = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(opening));
      button.classList.toggle('active', opening);

      if (opening) {
        panel.hidden = false;
        panel.classList.add('active');
        panel.style.maxHeight = '0px';
        requestAnimationFrame(() => {
          panel.style.maxHeight = `${panel.scrollHeight}px`;
        });
      } else {
        panel.style.maxHeight = `${panel.scrollHeight}px`;
        requestAnimationFrame(() => {
          panel.style.maxHeight = '0px';
        });
        const finishClose = () => {
          if (button.getAttribute('aria-expanded') === 'false') {
            panel.hidden = true;
            panel.classList.remove('active');
          }
        };
        panel.addEventListener('transitionend', (event) => {
          if (event.propertyName === 'max-height') finishClose();
        }, { once: true });
        window.setTimeout(finishClose, 350);
      }
    });
  });

  /* -------------------------------------------------------------
   * 2. CONTACT MODAL COMPONENT & PURE JS VALIDATION (Req 5.2)
   * ------------------------------------------------------------- */
  const modal = document.getElementById('contactModal');
  let previouslyFocused = null;
  const closeModal = () => {
    if (!modal || modal.hidden) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    previouslyFocused?.focus();
  };

  document.querySelectorAll('[data-modal-open="contact"]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (!modal) return;
      previouslyFocused = trigger;
      modal.hidden = false;
      document.body.classList.add('modal-open');
      modal.querySelector('input, textarea, button')?.focus();
    });
  });

  modal?.querySelectorAll('[data-modal-close]').forEach((button) => {
    button.addEventListener('click', closeModal);
  });
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });

  // Contact form submission with Pure JS Validation (Requirement 5.2)
  const contactForm = modal?.querySelector('form');
  if (contactForm) {
    contactForm.setAttribute('novalidate', 'true');
    const nameInput = contactForm.querySelector('#contactName');
    const emailInput = contactForm.querySelector('#contactEmail');
    const messageInput = contactForm.querySelector('#contactMessage');

    // Remove any leftover HTML validation attributes
    [nameInput, emailInput, messageInput].forEach(inp => {
      if (!inp) return;
      inp.removeAttribute('required');
      inp.removeAttribute('minlength');
      inp.removeAttribute('maxlength');
      inp.removeAttribute('pattern');
      if (inp.type === 'email') inp.type = 'text';
    });

    if (window.CafeValidation) {
      if (nameInput) window.CafeValidation.bindField(nameInput, val => window.CafeValidation.validateRequired(val, 'Your name'));
      if (emailInput) window.CafeValidation.bindField(emailInput, val => window.CafeValidation.validateEmail(val));
      if (messageInput) window.CafeValidation.bindField(messageInput, val => window.CafeValidation.validateRequired(val, 'Message'));
    }

    contactForm.addEventListener('submit', (event) => {
      event.preventDefault();

      let isValid = true;
      if (window.CafeValidation) {
        if (nameInput) {
          const err = window.CafeValidation.validateRequired(nameInput.value, 'Your name');
          if (err) { window.CafeValidation.showError(nameInput, err); isValid = false; }
          else { window.CafeValidation.clearError(nameInput); }
        }
        if (emailInput) {
          const err = window.CafeValidation.validateEmail(emailInput.value);
          if (err) { window.CafeValidation.showError(emailInput, err); isValid = false; }
          else { window.CafeValidation.clearError(emailInput); }
        }
        if (messageInput) {
          const err = window.CafeValidation.validateRequired(messageInput.value, 'Message');
          if (err) { window.CafeValidation.showError(messageInput, err); isValid = false; }
          else { window.CafeValidation.clearError(messageInput); }
        }
      }

      if (!isValid) return;

      const submitButton = contactForm.querySelector('[type="submit"]');
      if (!submitButton || submitButton.disabled) return;
      const originalLabel = submitButton.textContent;
      submitButton.disabled = true;
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Sending...';

      window.setTimeout(() => {
        contactForm.reset();
        [nameInput, emailInput, messageInput].forEach(inp => {
          if (inp && window.CafeValidation) window.CafeValidation.clearError(inp);
        });
        submitButton.disabled = false;
        submitButton.removeAttribute('aria-busy');
        submitButton.textContent = originalLabel;
        closeModal();
        showToast('Thanks for contacting Cafe Mania! We will respond shortly.');
      }, 700);
    });
  }

  /* -------------------------------------------------------------
   * 3. TOAST NOTIFICATIONS (Req 6)
   * ------------------------------------------------------------- */
  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'site-toast';
    toast.id = 'siteToast';
    toast.hidden = true;
    toast.setAttribute('role', 'status');
    toast.setAttribute('aria-live', 'polite');
    document.body.append(toast);
  }
  let hideToastTimer;
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    window.clearTimeout(hideToastTimer);
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      hideToastTimer = window.setTimeout(() => { toast.hidden = true; }, 250);
    }, 3200);
  };

  CafeMania.showToast = showToast;

  /* -------------------------------------------------------------
   * 4. LIGHT AND DARK MODES TOGGLE SWITCH (Req 3 - 5 points)
   * ------------------------------------------------------------- */
  const themeButton = document.getElementById('themeToggle');
  let currentTheme = 'light';
  try {
    const savedTheme = localStorage.getItem('cafe-mania-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      currentTheme = savedTheme;
    }
  } catch (_) {}

  const applyTheme = () => {
    const isDark = currentTheme === 'dark';
    document.body.classList.toggle('dark-theme', isDark);
    document.body.dataset.theme = currentTheme;
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light');

    if (themeButton) {
      themeButton.textContent = isDark ? '☀️ Light' : '🌙 Dark';
      themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
      themeButton.title = `Current mode: ${currentTheme}. Click to switch.`;
    }
  };
  applyTheme();

  themeButton?.addEventListener('click', () => {
    currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme();
    try {
      localStorage.setItem('cafe-mania-theme', currentTheme);
    } catch (_) {}
  });

  /* -------------------------------------------------------------
   * 5. LIVE TIME AND DATE CLOCK
   * ------------------------------------------------------------- */
  const clockElement = document.getElementById('live-clock');
  if (clockElement) {
    const updateClock = () => {
      const now = new Date();
      clockElement.textContent = `📅 ${now.toLocaleDateString()} ⏰ ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    };
    updateClock();
    window.setInterval(updateClock, 1000);
  }
});
