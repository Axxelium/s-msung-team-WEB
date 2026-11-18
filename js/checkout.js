/**
 * Cafe Mania - Checkout Form Logic
 * - Pure JavaScript form validation
 * - Account password verification
 * - Loyalty bonus beans toggle & live discount calculation
 * - Multi-step checkout workflow
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';
  const app = window.CafeMania;
  const { cart, element, money } = app;
  const checkoutForm = document.getElementById('contact-form');
  if (!checkoutForm) return;

  checkoutForm.setAttribute('novalidate', 'true');

  // Input fields to validate in pure JS without HTML attributes
  const requiredFieldIds = new Set(['name', 'email', 'phone', 'account-password']);
  const fields = [
    document.getElementById('name'),
    document.getElementById('email'),
    document.getElementById('phone'),
    document.getElementById('address'),
    document.getElementById('account-password')
  ].filter(Boolean);

  const steps = [...checkoutForm.querySelectorAll('[data-checkout-step]')];
  const nextButton = document.getElementById('checkout-next');
  const backButton = document.getElementById('checkout-back');
  const submitButton = document.getElementById('checkout-submit');
  const address = document.getElementById('address');
  
  // Loyalty Beans Elements
  const useBeansToggle = document.getElementById('useBeansToggle');
  const beansAvailableText = document.getElementById('beans-available-text');
  const beansDiscountNotice = document.getElementById('beans-discount-notice');
  const beansSummaryLine = document.getElementById('checkout-beans-line');
  const beansDiscountAmount = document.getElementById('checkout-beans-discount');
  const beansEarnAmount = document.getElementById('checkout-earn-amount');

  let currentStep = 0;
  let submitting = false;

  // Auto-fill logged in user info & initialize loyalty beans
  const currentUser = window.CafeAuth && typeof window.CafeAuth.getCurrentUser === 'function' 
    ? window.CafeAuth.getCurrentUser() 
    : null;

  let availableBeans = 0;
  if (currentUser) {
    if (document.getElementById('name') && !document.getElementById('name').value) {
      document.getElementById('name').value = currentUser.name;
    }
    if (document.getElementById('email') && !document.getElementById('email').value) {
      document.getElementById('email').value = currentUser.email;
    }
    if (document.getElementById('phone') && !document.getElementById('phone').value && currentUser.phone) {
      document.getElementById('phone').value = currentUser.phone;
    }
    availableBeans = Number(currentUser.beansBalance) || 0;
  }

  if (beansAvailableText) {
    beansAvailableText.textContent = `Available: ${availableBeans} beans (1 bean = 1 ₸ discount)`;
  }
  if (availableBeans === 0 && useBeansToggle) {
    useBeansToggle.disabled = true;
  }

  function getBeansDiscount() {
    if (!useBeansToggle || !useBeansToggle.checked || availableBeans <= 0) return 0;
    const maxApplicable = cart.subtotal();
    return Math.min(availableBeans, maxApplicable);
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
   * Field validation message generator
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

    // 6. Account Password validation: verifies against user's account password
    if (field.id === 'account-password') {
      if (!value) {
        return 'Please enter your account password to confirm the order.';
      }
      const enteredEmail = (document.getElementById('email')?.value || '').trim().toLowerCase();
      const users = (window.CafeAuth && typeof window.CafeAuth.getUsers === 'function') ? window.CafeAuth.getUsers() : [];
      const matchedUser = currentUser || users.find(u => u.email.toLowerCase() === enteredEmail);

      if (matchedUser) {
        if (value !== matchedUser.password) {
          return `Incorrect password for ${matchedUser.email}.`;
        }
      } else {
        if (value.length < 6) {
          return 'Password must be at least 6 characters.';
        }
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
    if (useBeansToggle && useBeansToggle.checked) {
      lines.push(`Loyalty beans discount applied: -${money(getBeansDiscount())}`);
    }
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

    const subtotal = cart.subtotal();
    const delivery = cart.delivery();
    const beansDiscount = getBeansDiscount();
    const finalTotal = Math.max(0, subtotal + delivery - beansDiscount);

    document.getElementById('checkout-subtotal').textContent = money(subtotal);
    document.getElementById('checkout-method-label').textContent = cart.method === 'delivery' ? 'Delivery' : 'Pick up';
    document.getElementById('checkout-delivery').textContent = delivery ? money(delivery) : 'Free';
    
    if (beansDiscount > 0) {
      beansSummaryLine?.classList.remove('d-none');
      if (beansDiscountAmount) beansDiscountAmount.textContent = `-${money(beansDiscount)}`;
      beansDiscountNotice?.classList.remove('d-none');
      if (beansDiscountNotice) beansDiscountNotice.textContent = `✓ Applied ${money(beansDiscount)} discount using your bonus beans!`;
    } else {
      beansSummaryLine?.classList.add('d-none');
      beansDiscountNotice?.classList.add('d-none');
    }

    document.getElementById('checkout-total').textContent = money(finalTotal);
    if (beansEarnAmount) {
      beansEarnAmount.textContent = `+${Math.round(finalTotal * 0.05)} beans`;
    }

    if (currentStep === 2) updateReview();
  }

  useBeansToggle?.addEventListener('change', renderSummary);
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
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>Placing order...';

    const beansDiscount = getBeansDiscount();
    const order = cart.placeOrder({
      beansDiscount: beansDiscount,
      customerName: document.getElementById('name').value.trim(),
      customerEmail: document.getElementById('email').value.trim(),
      customerPhone: document.getElementById('phone').value.trim()
    });

    if (!order) {
      document.getElementById('checkout-error').textContent = 'Your order could not be saved. Enable browser storage or free some space, then try again.';
      submitting = false;
      submitButton.disabled = false;
      submitButton.removeAttribute('aria-busy');
      submitButton.textContent = submitButton.dataset.originalLabel;
      return;
    }

    // Deduct used beans & award new beans on order
    if (currentUser) {
      currentUser.beansBalance = Math.max(0, (currentUser.beansBalance || 0) - beansDiscount) + (order.beansEarned || Math.round(order.total * 0.05));
      currentUser.ordersCount = (currentUser.ordersCount || 0) + 1;
      window.CafeAuth.setCurrentUser(currentUser);

      const users = window.CafeAuth.getUsers();
      const uIdx = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (uIdx >= 0) {
        users[uIdx].beansBalance = currentUser.beansBalance;
        users[uIdx].ordersCount = currentUser.ordersCount;
        try { localStorage.setItem('cafe-mania-users', JSON.stringify(users)); } catch (_) {}
      }
    }

    checkoutForm.reset();
    window.setTimeout(() => window.location.assign('confirmation.html'), 700);
  });

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) return;
    if (document.getElementById('account-password')) {
      document.getElementById('account-password').value = '';
    }
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
