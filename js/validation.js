/**
 * Cafe Mania - Client-Side Form Validation Module
 * Reusable validation rules for email, password complexity,
 * phone formatting, and required field inputs.
 */

(function (window) {
  'use strict';

  const CafeValidation = {
    // Regex for RFC 5322 compliant email format
    emailRegex: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/,

    // Flexible international/Kazakhstan phone format (+7/8 xxx xxx xx xx or digits with spaces/hyphens)
    phoneRegex: /^(\+?[0-9\s\-()]{10,20})$/,

    /**
     * Validates required field (non-empty after trimming)
     */
    validateRequired(value, fieldLabel = 'This field') {
      if (!value || typeof value !== 'string' || value.trim().length === 0) {
        return `${fieldLabel} is required.`;
      }
      return null;
    },

    /**
     * Validates email format
     */
    validateEmail(value) {
      const trimmed = (value || '').trim();
      if (!trimmed) {
        return 'Email address is required.';
      }
      if (!this.emailRegex.test(trimmed)) {
        return 'Please enter a valid email address (e.g. name@example.com).';
      }
      return null;
    },

    /**
     * Validates phone number pattern
     */
    validatePhone(value) {
      const trimmed = (value || '').trim();
      if (!trimmed) {
        return 'Phone number is required.';
      }
      const digitsOnly = trimmed.replace(/\D/g, '');
      if (digitsOnly.length < 10 || digitsOnly.length > 15 || !this.phoneRegex.test(trimmed)) {
        return 'Please enter a valid phone number with area code (e.g. +7 777 123 45 67).';
      }
      return null;
    },

    /**
     * Validates password length and complexity:
     * - Minimum 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     * - At least one special character
     */
    validatePassword(value) {
      if (!value) {
        return 'Password is required.';
      }
      if (value.length < 8) {
        return 'Password must be at least 8 characters long.';
      }
      if (!/[A-Z]/.test(value)) {
        return 'Password must contain at least one uppercase letter (A-Z).';
      }
      if (!/[a-z]/.test(value)) {
        return 'Password must contain at least one lowercase letter (a-z).';
      }
      if (!/[0-9]/.test(value)) {
        return 'Password must contain at least one number (0-9).';
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(value)) {
        return 'Password must contain at least one special character (e.g. !@#$%).';
      }
      return null;
    },

    /**
     * Shows error on the page under the input element
     */
    showError(inputElement, message) {
      if (!inputElement) return;
      inputElement.classList.add('is-invalid');
      inputElement.classList.remove('is-valid');
      inputElement.setAttribute('aria-invalid', 'true');

      // Look for dedicated error container by data-error-for or next sibling
      const form = inputElement.closest('form') || document;
      let errorElement = form.querySelector(`[data-error-for="${inputElement.id || inputElement.name}"]`);
      
      if (!errorElement) {
        errorElement = inputElement.parentElement.querySelector('.field-error, .invalid-feedback');
      }

      if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
      }
    },

    /**
     * Clears error and marks element as valid
     */
    clearError(inputElement) {
      if (!inputElement) return;
      inputElement.classList.remove('is-invalid');
      inputElement.classList.add('is-valid');
      inputElement.removeAttribute('aria-invalid');

      const form = inputElement.closest('form') || document;
      let errorElement = form.querySelector(`[data-error-for="${inputElement.id || inputElement.name}"]`);
      
      if (!errorElement) {
        errorElement = inputElement.parentElement.querySelector('.field-error, .invalid-feedback');
      }

      if (errorElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
      }
    },

    /**
     * Attaches live feedback listeners to an input
     */
    bindField(inputElement, validatorFn) {
      if (!inputElement) return;

      const runCheck = () => {
        const error = validatorFn(inputElement.value);
        if (error) {
          this.showError(inputElement, error);
          return false;
        } else {
          this.clearError(inputElement);
          return true;
        }
      };

      inputElement.addEventListener('blur', runCheck);
      inputElement.addEventListener('input', () => {
        if (inputElement.classList.contains('is-invalid')) {
          runCheck();
        }
      });

      return runCheck;
    }
  };

  window.CafeValidation = CafeValidation;
})(window);
