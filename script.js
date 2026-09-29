"use strict";

// Google Apps Script Web App endpoint for Google Sheets
const SUBMISSION_ENDPOINT = "https://script.google.com/macros/s/AKfycbxLQcj00KWV7fCp9EnsyR4mU_mLF4V7E3lV2L8MHWfIRrakRUgfciuuOPjDScWmtv_nkA/exec";

const form = document.querySelector("#onboarding-form");
const submitButton = document.querySelector("#submit-button");
const formMessage = document.querySelector("#form-message");
const pageCheckboxes = [...document.querySelectorAll('input[name="essentialPages"]')];
const groupErrorIds = {
  storeStatus: "store-status-error",
  customDomain: "custom-domain-error",
  essentialPages: "essential-pages-error",
  productSetup: "product-setup-error"
};
let validationAttempted = false;
let pageSelectionTouched = false;

document.querySelector("#current-year").textContent = String(new Date().getFullYear());
Object.entries(groupErrorIds).forEach(([name, errorId]) => {
  form.querySelectorAll(`input[name="${name}"]`).forEach((input) => {
    input.setAttribute("aria-describedby", errorId);
  });
});

const revealTargets = document.querySelectorAll(
  ".intro, .journey .section-heading, .journey-card, .ready, .form-intro"
);

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-revealed");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -36px 0px" });

  revealTargets.forEach((target) => {
    target.classList.add("reveal-pending");
    revealObserver.observe(target);
  });
}

function setConditionalField(containerId, input, shouldShow) {
  const container = document.getElementById(containerId);
  if (!container || !input) return;
  container.hidden = !shouldShow;
  input.disabled = !shouldShow;
  input.required = shouldShow;
  if (!shouldShow) {
    input.value = "";
    input.removeAttribute("aria-invalid");
    const errorId = input.id ? `${input.id}-error` : null;
    const errorEl = errorId ? document.getElementById(errorId) : null;
    if (errorEl) errorEl.textContent = "";
  }
}

function updateExistingStoreField() {
  const selected = form.querySelector('input[name="storeStatus"]:checked')?.value;
  setConditionalField(
    "existing-store-field",
    document.querySelector("#existing-store-url"),
    selected === "I already have a Shopify store"
  );
}

function updateCurrencyField() {
  setConditionalField(
    "other-currency-field",
    document.querySelector("#other-currency"),
    document.querySelector("#currency").value === "Other"
  );
}

function updateDomainField() {
  const selected = form.querySelector('input[name="customDomain"]:checked')?.value;
  setConditionalField("domain-name-field", document.querySelector("#domain-name"), selected === "Yes");
}

function updateProductQuantityField() {
  const selected = form.querySelector('input[name="productSetup"]:checked')?.value;
  setConditionalField(
    "product-quantity-field",
    document.querySelector("#product-quantity"),
    selected === "Yes — I'll provide the product information"
  );
}

const themeCustomSelect = document.querySelector("#theme-custom-select");
const themeTrigger = document.querySelector("#theme-select-trigger");
const themeDropdown = document.querySelector("#theme-select-dropdown");
const themeInput = document.querySelector("#theme-selection");
const themeValueDisplay = themeTrigger?.querySelector(".custom-select-value");
const themeOptions = themeDropdown ? [...themeDropdown.querySelectorAll(".custom-select-option")] : [];

function updateThemeSelectionValidity() {
  if (!themeInput) return true;
  const hasValue = Boolean(themeInput.value.trim());
  const errorEl = document.querySelector("#theme-selection-error");
  if (!hasValue && validationAttempted) {
    themeTrigger?.setAttribute("aria-invalid", "true");
    if (errorEl) errorEl.textContent = "Please select a theme from the list.";
  } else {
    themeTrigger?.removeAttribute("aria-invalid");
    if (errorEl) errorEl.textContent = "";
  }
  return hasValue;
}

function selectThemeOption(value, text) {
  if (!themeInput) return;
  themeInput.value = value;
  if (themeValueDisplay) {
    themeValueDisplay.textContent = text;
    themeValueDisplay.classList.remove("placeholder");
  }
  themeOptions.forEach((opt) => {
    const isSelected = opt.dataset.value === value;
    opt.classList.toggle("is-selected", isSelected);
    opt.setAttribute("aria-selected", String(isSelected));
  });
  closeThemeDropdown();
  updateThemeSelectionValidity();
  updateOtherThemeField();
  if (value === "Other") {
    document.querySelector("#other-theme")?.focus();
  }
  themeInput.dispatchEvent(new Event("change", { bubbles: true }));
}

function openThemeDropdown() {
  if (!themeCustomSelect) return;
  themeCustomSelect.classList.add("is-open");
  themeTrigger?.setAttribute("aria-expanded", "true");
  const selected = themeOptions.find((opt) => opt.classList.contains("is-selected"));
  if (selected) {
    selected.scrollIntoView({ block: "nearest" });
  }
}

function closeThemeDropdown() {
  if (!themeCustomSelect) return;
  themeCustomSelect.classList.remove("is-open");
  themeTrigger?.setAttribute("aria-expanded", "false");
}

function resetThemeSelection() {
  if (!themeInput) return;
  themeInput.value = "";
  if (themeValueDisplay) {
    themeValueDisplay.textContent = "Select a theme";
    themeValueDisplay.classList.add("placeholder");
  }
  themeOptions.forEach((opt) => {
    opt.classList.remove("is-selected");
    opt.removeAttribute("aria-selected");
  });
  themeTrigger?.removeAttribute("aria-invalid");
  const errorEl = document.querySelector("#theme-selection-error");
  if (errorEl) errorEl.textContent = "";
  updateOtherThemeField();
}

function updateOtherThemeField() {
  const isOther = themeInput?.value === "Other";
  setConditionalField(
    "other-theme-field",
    document.querySelector("#other-theme"),
    isOther
  );
}

if (themeTrigger && themeDropdown) {
  themeTrigger.addEventListener("click", (e) => {
    e.stopPropagation();
    if (themeCustomSelect.classList.contains("is-open")) {
      closeThemeDropdown();
    } else {
      openThemeDropdown();
    }
  });

  themeOptions.forEach((option) => {
    option.addEventListener("click", (e) => {
      e.stopPropagation();
      selectThemeOption(option.dataset.value, option.textContent.trim());
      themeTrigger.focus();
    });
  });

  document.addEventListener("click", (e) => {
    if (!themeCustomSelect.contains(e.target)) {
      closeThemeDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (!themeCustomSelect.classList.contains("is-open")) {
      if (document.activeElement === themeTrigger && (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        openThemeDropdown();
      }
      return;
    }
    if (e.key === "Escape") {
      closeThemeDropdown();
      themeTrigger.focus();
    } else if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const currentIndex = themeOptions.findIndex((opt) => opt === document.activeElement || opt.classList.contains("is-selected"));
      let nextIndex = e.key === "ArrowDown" ? currentIndex + 1 : currentIndex - 1;
      if (nextIndex < 0) nextIndex = themeOptions.length - 1;
      if (nextIndex >= themeOptions.length) nextIndex = 0;
      themeOptions[nextIndex].focus();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const char = e.key.toLowerCase();
      const match = themeOptions.find((opt) => opt.textContent.trim().toLowerCase().startsWith(char));
      if (match) {
        match.scrollIntoView({ block: "nearest" });
        match.focus();
      }
    }
  });

  themeDropdown.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      const focused = themeOptions.find((opt) => opt === document.activeElement);
      if (focused) {
        e.preventDefault();
        selectThemeOption(focused.dataset.value, focused.textContent.trim());
        themeTrigger.focus();
      }
    }
  });
}

function updatePageSelectionValidity() {
  const firstCheckbox = pageCheckboxes[0];
  const hasSelection = pageCheckboxes.some((checkbox) => checkbox.checked);
  firstCheckbox.setCustomValidity(hasSelection ? "" : "Select at least one essential page.");
  pageCheckboxes.forEach((checkbox) => checkbox.setAttribute("aria-describedby", "essential-pages-error"));
  document.querySelector("#essential-pages-error").textContent = hasSelection
    ? ""
    : validationAttempted || pageSelectionTouched
      ? firstCheckbox.validationMessage
      : "";
  pageCheckboxes.forEach((checkbox) => {
    if (hasSelection || (!validationAttempted && !pageSelectionTouched)) {
      checkbox.removeAttribute("aria-invalid");
    } else {
      checkbox.setAttribute("aria-invalid", "true");
    }
  });
}

function clearValidation() {
  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });
  form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function showFormMessage(title, message, isSuccess = false) {
  formMessage.replaceChildren();
  const heading = document.createElement("strong");
  heading.textContent = title;
  const detail = document.createElement("span");
  detail.textContent = message;
  formMessage.append(heading, detail);
  formMessage.classList.toggle("success", isSuccess);
  formMessage.hidden = false;
  formMessage.focus();
}

function collectFormData() {
  const data = {};
  for (const [name, value] of new FormData(form).entries()) {
    if (name === "essentialPages") {
      (data.essentialPages ??= []).push(value);
    } else {
      data[name] = value;
    }
  }
  if (data.themeSelection === "Other" && data.otherTheme) {
    data.themeSelection = `Other: ${data.otherTheme.trim()}`;
  }
  return data;
}

function setSubmitting(isSubmitting) {
  submitButton.disabled = isSubmitting;
  submitButton.classList.toggle("is-loading", isSubmitting);
  submitButton.setAttribute("aria-busy", String(isSubmitting));
}

form.addEventListener("change", (event) => {
  if (event.target.name === "storeStatus") updateExistingStoreField();
  if (event.target.id === "theme-selection") updateOtherThemeField();
  if (event.target.id === "currency") updateCurrencyField();
  if (event.target.name === "customDomain") updateDomainField();
  if (event.target.name === "productSetup") updateProductQuantityField();
  if (event.target.name === "essentialPages") {
    pageSelectionTouched = true;
    updatePageSelectionValidity();
  }
  if (event.target.matches("input, textarea, select")) {
    event.target.removeAttribute("aria-invalid");
    const errorId = event.target.id
      ? `${event.target.id}-error`
      : groupErrorIds[event.target.name];
    const error = errorId ? document.getElementById(errorId) : null;
    if (error) error.textContent = "";
    if (event.target.type === "radio") {
      form.querySelectorAll(`input[name="${event.target.name}"]`).forEach((radio) => {
        radio.removeAttribute("aria-invalid");
      });
    }
  }
});

form.addEventListener("input", (event) => {
  if (event.target.matches("input, textarea, select") && event.target.type !== "checkbox" && event.target.type !== "radio") {
    event.target.removeAttribute("aria-invalid");
    const errorId = event.target.id
      ? `${event.target.id}-error`
      : groupErrorIds[event.target.name];
    const error = errorId ? document.getElementById(errorId) : null;
    if (error) error.textContent = "";
  }
});

form.addEventListener("invalid", (event) => {
  const field = event.target;
  field.setAttribute("aria-invalid", "true");
  const errorId = field.id ? `${field.id}-error` : groupErrorIds[field.name];
  const error = errorId ? document.getElementById(errorId) : null;
  if (error && field.name !== "essentialPages") {
    error.textContent = field.validationMessage;
  }
}, true);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  clearValidation();
  validationAttempted = true;
  updatePageSelectionValidity();

  const isThemeValid = updateThemeSelectionValidity();

  if (!form.reportValidity() || !isThemeValid) {
    if (!form.checkValidity()) {
      const firstInvalid = form.querySelector(":invalid");
      if (firstInvalid) {
        firstInvalid.setAttribute("aria-invalid", "true");
        const errorId = firstInvalid.id
          ? `${firstInvalid.id}-error`
          : groupErrorIds[firstInvalid.name];
        const error = errorId ? document.getElementById(errorId) : null;
        if (error) error.textContent = firstInvalid.validationMessage;
        if (firstInvalid.name === "essentialPages") {
          document.querySelector("#essential-pages-error").textContent = firstInvalid.validationMessage;
        }
      }
    } else if (!isThemeValid) {
      themeTrigger?.focus();
    }
    return;
  }

  if (!SUBMISSION_ENDPOINT) {
    showFormMessage(
      "Form submission isn't connected yet.",
      "Your answers have not been sent. The site owner needs to set SUBMISSION_ENDPOINT in script.js to a backend or WordPress handler before submissions can be received."
    );
    return;
  }

  setSubmitting(true);
  formMessage.hidden = true;

  try {
    const payload = collectFormData();
    const isGoogleScript = SUBMISSION_ENDPOINT.includes("script.google.com");

    if (isGoogleScript) {
      await fetch(SUBMISSION_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload)
      });
    } else {
      const response = await fetch(SUBMISSION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`The server returned ${response.status}.`);
      }
    }

    form.reset();
    resetThemeSelection();
    validationAttempted = false;
    pageSelectionTouched = false;
    clearValidation();
    updateExistingStoreField();
    updateOtherThemeField();
    updateCurrencyField();
    updateDomainField();
    updateProductQuantityField();
    updatePageSelectionValidity();
    showFormMessage(
      "Thank You! Your Details Have Been Received.",
      "Your Shopify store setup information has been submitted successfully. Our team will review your requirements and contact you using the email address provided. You can expect to hear from us by email about the next steps.",
      true
    );
  } catch {
    showFormMessage(
      "We couldn't submit your details.",
      "Your information has not been confirmed as received. Please check your connection and try again, or contact Dezhyne Labs for help."
    );
  } finally {
    setSubmitting(false);
  }
});

updateExistingStoreField();
updateOtherThemeField();
updateCurrencyField();
updateDomainField();
updateProductQuantityField();
updatePageSelectionValidity();
