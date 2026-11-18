/**
 * Cafe Mania - Checkout Form Logic
 * Fulfills Requirement 5.2:
 * - NO HTML validation attributes used (no required, pattern, minlength, maxlength, min, max, type="email")
 * - Validates: Email format, Password length & complexity, Required fields, Phone number pattern
 * - Displays user-friendly error messages on the page under each field
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const app = window.CafeMania;
  const { cart, element, money } = app;
  const checkoutForm = document.getElementById('contact-form');
  if (!checkoutForm) return;

  checkoutForm.setAttribute('novalidate', 'true');

  // Input fields to validate in pure JS without HTML attributes
  const requiredFieldIds = new Set(['name', 'email', 'phone', 'password', 'confirm-password']);
  const fields = [
    document.getElementById('name'),
    document.getElementById('email'),
    document.getElementById('phone'),
    document.getElementById('address'),
    document.getElementById('password'),
    document.getElementById('confirm-password')
  ].filter(Boolean);

  const steps = [...checkoutForm.querySelectorAll('[data-checkout-step]')];
  const nextButton = document.getElementById('checkout-next');
  const backButton = document.getElementById('checkout-back');
  const submitButton = document.getElementById('checkout-submit');
  const address = document.getElementById('address');
  let currentStep = 0;
  let submitting = false;

  // Auto-fill logged in user info if available
  if (window.CafeAuth && typeof window.CafeAuth.getCurrentUser === 'function') {
    const user = window.CafeAuth.getCurrentUser();
    if (user) {
      if (document.getElementById('name') && !document.getElementById('name').value) {
        document.getElementById('name').value = user.name;
      }
      if (document.getElementById('email') && !document.getElementById('email').value) {
        document.getElementById('email').value = user.email;
      }
      if (document.getElementById('phone') && !document.getElementById('phone').value && user.phone) {
        document.getElementById('phone').value = user.phone;
      }
    }
  }

  const errorFor = (field) => {
    let error = checkoutForm.querySelector(`[data-error-for="${field.id}"]`);
    if (!error) {
      error = document.createElement('small');
      error.className = 'field-error text-danger d-block mt-1';
      error.dataset.errorFor = field.id;
      error.setAttribute('aria-live', 'polite');
      field.insertAdjacentElement('afterend', error);
    }
    return error;
  };

  /**
   * Pure JavaScript validation message generator (strictly fulfilling Requirement 5.2)
   */
  const messageFor = (field) => {
    if (field.disabled) return '';
    const value = field.type === 'password' ? field.value : field.value.trim();

    // 1. Required fields validation
    const isRequired = requiredFieldIds.has(field.id) || (field.id === 'address' && cart.method === 'delivery');
    if (isRequired && !value) {
      return 'This field is required.';
    }

    // 2. Name validation
    if (field.id === 'name') {
      if (value.length < 2 || !/^[\p{L}\p{M} .’'\-]+$/u.test(value) || !/\p{L}/u.test(value)) {
        return 'Enter your name using at least 2 characters, without numbers or special symbols.';
      }
    }

    // 3. Email format validation (Pure JS Regex)
    if (field.id === 'email') {
      if (window.CafeValidation) {
        const err = window.CafeValidation.validateEmail(value);
        if (err) return err;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return 'Please enter a valid email address (e.g. you@example.com).';
      }
    }

    // 4. Phone number pattern validation (Pure JS Regex)
    if (field.id === 'phone') {
      if (window.CafeValidation) {
        const err = window.CafeValidation.validatePhone(value);
        if (err) return err;
      } else {
        const digits = value.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) {
          return 'Enter a phone number with 10–15 digits (e.g. +7 777 123 45 67).';
        }
      }
    }

    // 5. Address validation (for delivery)
    if (field.id === 'address' && cart.method === 'delivery') {
      if (value.length < 5) {
        return 'Enter a delivery address with at least 5 characters (street, building, apartment).';
      }
    }

    // 6. Password length and complexity validation
    if (field.id === 'password') {
      if (window.CafeValidation) {
        const err = window.CafeValidation.validatePassword(value);
        if (err) return err;
      } else {
        if (value.length < 8) return 'Password must be at least 8 characters long.';
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)) {
          return 'Include uppercase and lowercase letters, a number and a special symbol.';
        }
      }
    }

    // 7. Confirm password validation
    if (field.id === 'confirm-password') {
      const password = checkoutForm.querySelector('#password');
      if (password && field.value !== password.value) {
        return 'Passwords do not match.';
      }
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
      if (field.id === 'password' && document.getElementById('confirm-password').value) {
        validateField(document.getElementById('confirm-password'));
      }
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
    submitButton.setAttribute('aria-busy', 'true');
    submitButton.dataset.originalLabel = submitButton.textContent.trim();
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Please wait...';
    const order = cart.placeOrder();
    if (!order) {
      document.getElementById('checkout-error').textContent = 'Your order could not be saved. Enable browser storage or free some space, then try again.';
      submitting = false;
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.textContent = submitButton.dataset.originalLabel;
      return;
    }

    // If order placed, also register bonus beans for the user in localStorage
    if (window.CafeAuth && typeof window.CafeAuth.getCurrentUser === 'function') {
      const user = window.CafeAuth.getCurrentUser();
      if (user) {
        user.beansBalance = (user.beansBalance || 0) + Math.round(cart.total() * 0.05); // 5% bonus beans!
        user.ordersCount = (user.ordersCount || 0) + 1;
        window.CafeAuth.setCurrentUser(user);
      }
    }

    checkoutForm.reset();
    window.setTimeout(() => window.location.assign('confirmation.html'), 700);
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    document.getElementById('password').value = '';
    document.getElementById('confirm-password').value = '';
    submitting = false;
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
    submitButton.textContent = submitButton.dataset.originalLabel || 'Confirm order →';
    cart.load();
    renderSummary();
  });
  renderSummary();
  renderStep(0, false);
});
