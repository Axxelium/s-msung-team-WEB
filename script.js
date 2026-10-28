document.addEventListener('DOMContentLoaded', () => {
  const checkoutForm = document.querySelector('#contact-form');

  if (checkoutForm) {
    checkoutForm.noValidate = true;

    const fields = Array.from(
      checkoutForm.querySelectorAll('input[required], textarea, select[required]')
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
      const value = field.type === 'password' ? field.value : field.value.trim();
      if (!value.trim()) return field.required ? 'This field is required.' : '';
      if (field.maxLength > 0 && value.length > field.maxLength) {
        return `Use no more than ${field.maxLength} characters.`;
      }
      if (field.id === 'name' && (value.length < 2 || !/^[\p{L}\p{M} .’'\-]+$/u.test(value) || !/\p{L}/u.test(value))) {
        return 'Enter your name using at least 2 characters, without numbers or special symbols.';
      }
      if (field.type === 'email' && (field.validity.typeMismatch || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(value))) {
        return 'Enter a valid email address, for example you@example.com.';
      }
      if (field.id === 'phone') {
        const digits = value.replace(/\D/g, '');
        if (!/^\+?[\d\s()\-]+$/.test(value) || digits.length < 10 || digits.length > 15 || /^0+$/.test(digits)) {
          return 'Enter a phone number with 10–15 digits; spaces, brackets and a leading + are allowed.';
        }
      }
      if (field.id === 'address' && (value.length < 5 || !/[\p{L}\p{N}]/u.test(value))) {
        return 'Enter a delivery address with at least 5 characters.';
      }
      if (field.id === 'password') {
        if (value.length < 8) return 'Password is too weak. Use at least 8 characters.';
        const substitutions = { '@': 'a', '4': 'a', '0': 'o', '3': 'e', '$': 's', '5': 's', '1': 'i', '!': 'i', '7': 't' };
        const normalized = value.toLowerCase().replace(/[@403$51!7]/g, (character) => substitutions[character]);
        const commonPasswords = ['password', 'qwerty', 'letmein', 'welcome', 'admin', 'iloveyou', 'abc123', '123456', 'пароль'];
        if (commonPasswords.some((word) => value.toLowerCase().includes(word) || normalized.includes(word)) || /(.{1,4})\1{2,}/u.test(value)) {
          return 'Password is too easy to guess. Avoid common words, sequences and repeated characters.';
        }
        if (!/\p{Lu}/u.test(value) || !/\p{Ll}/u.test(value) || !/\d/.test(value) || !/[^\p{L}\p{N}\s]/u.test(value)) {
          return 'Password is too weak. Include uppercase and lowercase letters, a number and a special character.';
        }
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
      error.id ||= `${field.id}-error`;
      const descriptions = new Set((field.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean));
      descriptions.delete(error.id);
      if (message) descriptions.add(error.id);
      if (descriptions.size) field.setAttribute('aria-describedby', [...descriptions].join(' '));
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
      field.addEventListener('blur', () => {
        if (field.type !== 'password') field.value = field.value.trim();
        validateField(field);
      });
    });

    checkoutForm.addEventListener('submit', (event) => {
      fields.forEach((field) => {
        if (field.type !== 'password') field.value = field.value.trim();
      });
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
  const themes = ['light', 'dark', 'green', 'blue', 'red'];
  let currentTheme = 'light';
  try {
    const savedTheme = localStorage.getItem('cafe-mania-theme');
    if (themes.includes(savedTheme)) currentTheme = savedTheme;
  } catch (_) {
    // Theme switching still works when browser storage is unavailable.
  }

  const applyTheme = () => {
    themes.forEach((theme) => document.body.classList.toggle(`${theme}-theme`, theme === currentTheme));
    document.body.dataset.theme = currentTheme;
    document.documentElement.setAttribute('data-bs-theme', currentTheme === 'dark' ? 'dark' : 'light');
    if (themeButton) {
      themeButton.textContent = 'Change theme';
      const nextTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
      themeButton.setAttribute('aria-label', `Change theme. Current: ${currentTheme}. Next: ${nextTheme}.`);
      themeButton.title = `Current: ${currentTheme}. Next: ${nextTheme}.`;
    }
  };
  applyTheme();

  themeButton?.addEventListener('click', () => {
    currentTheme = themes[(themes.indexOf(currentTheme) + 1) % themes.length];
    applyTheme();
    try {
      localStorage.setItem('cafe-mania-theme', currentTheme);
    } catch (_) {
      // Storage is optional; the selected theme is already applied.
    }
  });

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
