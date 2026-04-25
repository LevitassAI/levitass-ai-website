'use strict';

/**
 * Levitass AI — Contact Form
 * Validation + Formspree submission
 */

(function() {
  var form = document.getElementById('contactForm');
  if (!form) return;

  var submitBtn = document.getElementById('submitBtn');
  var successMsg = document.getElementById('formSuccess');
  var errorMsg = document.getElementById('formError');

  // Validation rules
  var validations = {
    name: {
      required: true,
      validate: function(value) { return value.trim().length >= 1; },
      errorId: 'nameError',
      groupId: 'nameGroup'
    },
    email: {
      required: true,
      validate: function(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
      },
      errorId: 'emailError',
      groupId: 'emailGroup'
    },
    subject: {
      required: true,
      validate: function(value) { return value.trim().length >= 1; },
      errorId: 'subjectError',
      groupId: 'subjectGroup'
    },
    message: {
      required: true,
      validate: function(value) { return value.trim().length >= 1; },
      errorId: 'messageError',
      groupId: 'messageGroup'
    }
  };

  function sanitizeInput(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function showFieldError(groupId) {
    var group = document.getElementById(groupId);
    if (group) group.classList.add('form-group--error');
  }

  function clearFieldError(groupId) {
    var group = document.getElementById(groupId);
    if (group) group.classList.remove('form-group--error');
  }

  function clearAllErrors() {
    Object.keys(validations).forEach(function(key) {
      clearFieldError(validations[key].groupId);
    });
    // Also clear consent error
    var consentError = document.getElementById('consentError');
    if (consentError) consentError.style.display = 'none';
  }

  function validateForm() {
    var isValid = true;
    clearAllErrors();

    Object.keys(validations).forEach(function(key) {
      var config = validations[key];
      var input = document.getElementById(key);
      if (!input) return;

      if (config.required && !config.validate(input.value)) {
        showFieldError(config.groupId);
        isValid = false;
      }
    });

    // Consent check
    var consent = document.getElementById('consent');
    if (consent && !consent.checked) {
      var consentError = document.getElementById('consentError');
      if (consentError) consentError.style.display = 'block';
      isValid = false;
    }

    return isValid;
  }

  // Real-time validation
  Object.keys(validations).forEach(function(key) {
    var input = document.getElementById(key);
    if (!input) return;
    input.addEventListener('blur', function() {
      var config = validations[key];
      if (config.validate(input.value)) {
        clearFieldError(config.groupId);
      } else {
        showFieldError(config.groupId);
      }
    });
  });

  // Form submission
  form.addEventListener('submit', function(e) {
    e.preventDefault();

    // Hide previous messages
    if (successMsg) { successMsg.className = 'form-message'; successMsg.textContent = ''; }
    if (errorMsg) { errorMsg.className = 'form-message'; errorMsg.textContent = ''; }

    if (!validateForm()) return;

    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = '送信中...';

    var formData = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) {
        // Success
        if (successMsg) {
          successMsg.textContent = 'お問い合わせありがとうございます。1〜2営業日以内にご返信いたします。';
          successMsg.className = 'form-message form-message--success';
        }
        form.reset();
      } else {
        throw new Error('送信に失敗しました');
      }
    })
    .catch(function() {
      // Error
      if (errorMsg) {
        errorMsg.innerHTML = '送信に失敗しました。時間をおいて再度お試しいただくか、<a href="mailto:info@levitass.com">info@levitass.com</a>に直接ご連絡ください。';
        errorMsg.className = 'form-message form-message--error';
      }
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '送信する <svg class="btn__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';
    });
  });
})();
