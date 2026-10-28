document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const app = window.CafeMania;
  const { cart, element, money } = app;
  const checkoutForm = document.getElementById('contact-form');
  if (!checkoutForm) return;
  checkoutForm.noValidate = true;
  const fields = [...checkoutForm.querySelectorAll('input[required], textarea')];
  const steps = [...checkoutForm.querySelectorAll('[data-checkout-step]')];
  const nextButton = document.getElementById('checkout-next');
  const backButton = document.getElementById('checkout-back');
  const submitButton = document.getElementById('checkout-submit');
  const address = document.getElementById('address');
  let currentStep = 0;
  let submitting = false;

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
    if (field.disabled) return '';
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

  const validate = (inputs) => {
    inputs.forEach((field) => {
      if (field.type !== 'password') field.value = field.value.trim();
    });
    return inputs.map(validateField).every(Boolean);
  };

  function updateReview() {
    const review = document.getElementById('checkout-review');
    review.replaceChildren(element('h3', '', 'Review your details'));
    const lines = [
      document.getElementById('name').value,
      document.getElementById('email').value,
      document.getElementById('phone').value,
      cart.method === 'delivery' ? `Delivery: ${address.value}` : 'Pick up at Cafe Mania',
      `Breakfast drink preference: ${document.getElementById('drink').value}`
    ];
    const note = document.getElementById('message').value.trim();
    if (note) lines.push(`Order note: ${note}`);
    if (document.getElementById('callme').checked) lines.push('Please call when the order is ready.');
    for (const text of lines) review.append(element('p', 'mb-1', text));
    const colorLine = element('p', 'mb-0 d-flex align-items-center gap-2', 'Package color');
    const swatch = element('span', 'package-swatch');
    swatch.style.backgroundColor = document.getElementById('color').value;
    swatch.setAttribute('aria-label', document.getElementById('color').value);
    colorLine.append(swatch);
    review.append(colorLine);
  }

  function renderStep(index, moveFocus = true) {
    steps.forEach((step, stepIndex) => { step.hidden = stepIndex !== index; });
    document.querySelectorAll('[data-step-indicator]').forEach((indicator, stepIndex) => {
      if (stepIndex === index) indicator.setAttribute('aria-current', 'step');
      else indicator.removeAttribute('aria-current');
      indicator.classList.toggle('is-complete', stepIndex < index);
    });
    document.getElementById('step-status').textContent = `Step ${index + 1} of ${steps.length}`;
    backButton.hidden = index === 0;
    nextButton.hidden = index === steps.length - 1;
    submitButton.hidden = index !== steps.length - 1;
    if (index === steps.length - 1) updateReview();
    if (moveFocus) steps[index].querySelector('legend').focus();
  }

  // A higher-order function accepts a callback that renders the selected step.
  function changeStep(index, onStepChange) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    onStepChange(currentStep);
  }
  function goNext() {
    const stepFields = fields.filter((field) => steps[currentStep].contains(field) && !field.disabled);
    if (!validate(stepFields)) {
      stepFields.find((field) => messageFor(field))?.focus();
      return;
    }
    changeStep(currentStep + 1, renderStep);
  }
  nextButton.addEventListener('click', goNext);
  backButton.addEventListener('click', () => changeStep(currentStep - 1, renderStep));

  fields.forEach((field) => {
    field.addEventListener('input', () => {
      validateField(field);
      if (field.id === 'password' && document.getElementById('confirm-password').value) validateField(document.getElementById('confirm-password'));
    });
    field.addEventListener('blur', () => {
      if (field.type !== 'password') field.value = field.value.trim();
      validateField(field);
    });
  });

  function renderSummary() {
    const empty = cart.items.length === 0;
    checkoutForm.hidden = empty;
    document.getElementById('checkout-summary').hidden = empty;
    document.getElementById('checkout-empty').hidden = !empty;
    document.querySelectorAll('[name="delivery"]').forEach((radio) => { radio.checked = radio.value === cart.method; });
    address.required = cart.method === 'delivery';
    address.disabled = cart.method !== 'delivery';
    document.getElementById('address-group').hidden = address.disabled;
    if (address.disabled) validateField(address);
    const list = document.getElementById('checkout-items');
    list.replaceChildren();
    for (const item of cart.items) {
      const product = app.productById(item.id);
      const row = element('div', 'summary-line');
      row.append(element('span', '', `${product.name} × ${item.quantity}`), element('strong', '', money(product.price * item.quantity)));
      list.append(row);
    }
    document.getElementById('checkout-subtotal').textContent = money(cart.subtotal());
    document.getElementById('checkout-method-label').textContent = cart.method === 'delivery' ? 'Delivery' : 'Pick up';
    document.getElementById('checkout-delivery').textContent = cart.delivery() ? money(cart.delivery()) : 'Free';
    document.getElementById('checkout-total').textContent = money(cart.total());
    if (currentStep === 2) updateReview();
  }
  document.querySelectorAll('[name="delivery"]').forEach((radio) => radio.addEventListener('change', () => cart.setMethod(radio.value)));
  document.addEventListener('cafe:cart-change', renderSummary);

  checkoutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (submitting) return;
    if (currentStep < steps.length - 1) { goNext(); return; }
    const activeFields = fields.filter((field) => !field.disabled);
    if (!validate(activeFields)) {
      const invalid = activeFields.find((field) => messageFor(field));
      changeStep(steps.findIndex((step) => step.contains(invalid)), renderStep);
      invalid.focus();
      return;
    }
    if (!cart.items.length) { renderSummary(); return; }
    submitting = true;
    submitButton.disabled = true;
    const order = cart.placeOrder();
    if (!order) {
      document.getElementById('checkout-error').textContent = 'Your order could not be saved. Enable browser storage or free some space, then try again.';
      submitting = false;
      submitButton.disabled = false;
      return;
    }
    checkoutForm.reset();
    window.location.assign('confirmation.html');
  });
  // Back/forward cache must not restore stale passwords or an already-submitted order.
  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    document.getElementById('password').value = '';
    document.getElementById('confirm-password').value = '';
    submitting = false;
    submitButton.disabled = false;
    cart.load();
    renderSummary();
  });
  renderSummary();
  renderStep(0, false);
});
