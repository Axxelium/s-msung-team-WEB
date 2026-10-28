document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.querySelector('#contact-form');

  if (checkoutForm) {
    checkoutForm.noValidate = true;

    const fields = Array.from(
      checkoutForm.querySelectorAll('input[required], textarea[required], select[required]')
    );

    const errorFor = (field) => {
      let error = checkoutForm.querySelector(`[data-error-for="${field.id}"]`);
      if (!error) {
        error = document.createElement('small');
        error.className = 'field-error';
        error.dataset.errorFor = field.id;
        error.setAttribute('aria-live', 'polite');
        field.insertAdjacentElement('afterend', error);
      }
      return error;
    };

    const messageFor = (field) => {
      if (!field.value.trim()) return 'This field is required.';
      if (field.type === 'email' && !field.validity.valid) return 'Enter a valid email address.';
      if (field.id === 'password' && field.value.length < 6) {
        return 'Password must contain at least 6 characters.';
      }
      if (field.id === 'confirm-password') {
        const password = checkoutForm.querySelector('#password');
        if (password && field.value !== password.value) return 'Passwords do not match.';
      }
      return '';
    };

    const validateField = (field) => {
      const error = errorFor(field);
      const message = messageFor(field);
      error.textContent = message;
      field.classList.toggle('is-invalid', Boolean(message));
      field.setAttribute('aria-invalid', String(Boolean(message)));
      if (message) field.setAttribute('aria-describedby', error.id || (error.id = `${field.id}-error`));
      else field.removeAttribute('aria-describedby');
      return !message;
    };

    fields.forEach((field) => {
      field.addEventListener('input', () => {
        validateField(field);
        if (field.id === 'password') {
          const confirmation = checkoutForm.querySelector('#confirm-password');
          if (confirmation?.value) validateField(confirmation);
        }
      });
      field.addEventListener('blur', () => validateField(field));
    });

    checkoutForm.addEventListener('submit', (event) => {
      const valid = fields.map(validateField).every(Boolean);
      if (!valid) {
        event.preventDefault();
        fields.find((field) => messageFor(field))?.focus();
        return;
      }

      event.preventDefault();
      window.location.assign(checkoutForm.getAttribute('action') || 'confirmation.html');
    });
  }

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

  const toast = document.getElementById('siteToast');
  let toastTimer;
  const showToast = (message) => {
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    requestAnimationFrame(() => toast.classList.add('is-visible'));
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove('is-visible');
      window.setTimeout(() => { toast.hidden = true; }, 250);
    }, 3200);
  };

  const contactForm = modal?.querySelector('form');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    contactForm.reset();
    closeModal();
    showToast('Thanks for contacting Cafe Mania!');
  });

  const themeButton = document.getElementById('themeToggle');
  if (themeButton) {
    try {
      document.body.classList.toggle('dark-theme', localStorage.getItem('cafe-mania-theme') === 'dark');
    } catch (_) {
    }

    const updateThemeButton = () => {
      const dark = document.body.classList.contains('dark-theme');
      themeButton.textContent = dark ? '☀️ Light Mode' : '🌙 Dark Mode';
      themeButton.setAttribute('aria-pressed', String(dark));
    };
    updateThemeButton();

    themeButton.addEventListener('click', () => {
      const dark = document.body.classList.toggle('dark-theme');
      try {
        localStorage.setItem('cafe-mania-theme', dark ? 'dark' : 'light');
      } catch (_) {
      }
      updateThemeButton();
    });
  }

  const clockElement = document.getElementById('live-clock');
  if (clockElement) {
    const updateClock = () => {
      const now = new Date();
      clockElement.textContent = `📅 ${now.toLocaleDateString()} ⏰ ${now.toLocaleTimeString()}`;
    };
    updateClock();
    window.setInterval(updateClock, 1000);
  }
});
