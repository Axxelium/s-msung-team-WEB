document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const app = window.CafeMania;

  const updateBadges = () => {
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      const count = app.cart.count();
      badge.textContent = count;
      badge.setAttribute('aria-label', `${count} ${count === 1 ? 'item' : 'items'} in cart`);
    });
  };
  app.animateBadge = () => {
    document.querySelectorAll('[data-cart-count]').forEach((badge) => {
      badge.classList.remove('badge-pop');
      void badge.offsetWidth;
      badge.classList.add('badge-pop');
    });
  };
  document.addEventListener('cafe:cart-change', (event) => {
    updateBadges();
    let warning = document.getElementById('storage-warning');
    if (!event.detail.persisted && !warning) {
      warning = app.element('p', 'storage-warning', 'Your cart could not be saved. Enable browser storage or free some space before changing pages.');
      warning.id = 'storage-warning';
      warning.setAttribute('role', 'alert');
      document.querySelector('main .container')?.prepend(warning);
    }
    if (warning) warning.hidden = event.detail.persisted;
  });
  updateBadges();

  // Native links keep Tab/Enter behavior; arrows only act while focus is in this menu.
  document.querySelectorAll('nav[aria-label="Main navigation"]').forEach((nav) => {
    nav.addEventListener('keydown', (event) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const links = [...nav.querySelectorAll('.navbar-nav a')].filter((link) => link.getClientRects().length);
      const index = links.indexOf(document.activeElement);
      if (index < 0) return;
      let next;
      switch (event.key) {
        case 'ArrowRight': case 'ArrowDown': next = (index + 1) % links.length; break;
        case 'ArrowLeft': case 'ArrowUp': next = (index - 1 + links.length) % links.length; break;
        case 'Home': next = 0; break;
        case 'End': next = links.length - 1; break;
        default: return;
      }
      event.preventDefault();
      links[next].focus();
    });
  });

  let soundEnabled = app.storage.read('cafe-mania-sound') !== false;
  let audioContext;
  let soundBusy = false;
  app.playAddSound = async () => {
    if (!soundEnabled || soundBusy) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    soundBusy = true;
    try {
      audioContext ||= new AudioContext();
      if (audioContext.state === 'suspended') await audioContext.resume();
      if (!soundEnabled || audioContext.state !== 'running') return;
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(740, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(980, audioContext.currentTime + 0.1);
      gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.055, audioContext.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.16);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.17);
      await new Promise((resolve) => {
        oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); resolve(); };
      });
    } catch (_) { /* An unavailable audio device must never prevent adding an item. */ }
    finally { soundBusy = false; }
  };
  const updateSoundButtons = () => document.querySelectorAll('[data-sound-toggle]').forEach((button) => {
    button.textContent = soundEnabled ? 'Sound on' : 'Sound off';
    button.setAttribute('aria-pressed', String(soundEnabled));
    button.setAttribute('aria-label', soundEnabled ? 'Sound on. Turn off sound effects' : 'Sound off. Turn on sound effects');
  });
  document.querySelectorAll('[data-sound-toggle]').forEach((button) => button.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    app.storage.write('cafe-mania-sound', soundEnabled);
    updateSoundButtons();
  }));
  updateSoundButtons();

  const modal = document.getElementById('contactModal');
  modal?.addEventListener('keydown', (event) => {
    if (event.key !== 'Tab') return;
    const controls = [...modal.querySelectorAll('button, input, textarea')].filter((control) => !control.disabled);
    const first = controls[0];
    const last = controls.at(-1);
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  });
});
