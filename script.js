document.addEventListener('DOMContentLoaded', () => {
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

  let toast = document.getElementById('siteToast');
  if (!toast) {
    toast = CafeMania.element('div', 'site-toast');
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
