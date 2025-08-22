// ====== Interactive Card Form (tailored to current HTML/CSS) ======
// Works with: index.html (ids: name, number, exp-month, exp-year, cvc; error spans; #card-form)

// Elements
const form = document.getElementById("card-form");
const nameInput = document.getElementById("name");
const numberInput = document.getElementById("number");
const monthInput = document.getElementById("exp-month");
const yearInput = document.getElementById("exp-year");
const cvcInput = document.getElementById("cvc");

const errName = document.getElementById("error-name");
const errNumber = document.getElementById("error-number");
const errExp = document.getElementById("error-exp");
const errCvc = document.getElementById("error-cvc");

// ===== i18n (EN) =====
const MSG = {
  blank: "Field cannot be empty.",
  nameInvalid: "Use letters, spaces, hyphens or apostrophes (max 30).",
  numberLen: "Card number must be 16 digits.",
  numberLuhn: "Card number failed validation.",
  mmBlank: "Enter month in MM format.",
  yyBlank: "Enter year in YY format.",
  mmLen: "Enter two digits for month (MM).",
  yyLen: "Enter two digits for year (YY).",
  mmRange: "Month must be between 01 and 12.",
  expired: "Card is expired.",
  cvcLen: "CVC must be 3 digits.",
};

// ===== Utils =====
function showError(input, errEl, message) {
  input.classList.add("invalid");
  if (message) {
    input.setCustomValidity(message);
    errEl.textContent = message;
  } else {
    input.setCustomValidity("");
  }
  errEl.classList.add("visible");
}
function clearError(input, errEl) {
  input.classList.remove("invalid");
  input.setCustomValidity("");
  errEl.textContent = "";
  errEl.classList.remove("visible");
}
function digitsOnly(value) {
  return (value || "").replace(/\D+/g, "");
}
function formatCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}
function luhnCheck(num) {
  let sum = 0,
    dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = +num[i];
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

// ===== Live formatting =====
numberInput.addEventListener("input", () => {
  const pos = numberInput.selectionStart;
  const before = numberInput.value;
  numberInput.value = formatCardNumber(before);
  const rawLeft = digitsOnly(before.slice(0, pos)).length;
  const recomputedLeft = Math.min(
    numberInput.value.length,
    rawLeft + Math.floor(rawLeft / 4)
  );
  numberInput.setSelectionRange(recomputedLeft, recomputedLeft);
  validateNumber(false);
});

// Restrict to digits + autotab + live validation messages
function restrictToDigitsAndAutotab(input, maxLen, nextEl, onValidate) {
  input.addEventListener("input", () => {
    const raw = digitsOnly(input.value).slice(0, maxLen);
    input.value = raw;
    if (typeof onValidate === "function") onValidate("input");
    if (raw.length === maxLen && nextEl) nextEl.focus();
  });
  input.addEventListener("blur", () => {
    if (typeof onValidate === "function") onValidate("blur");
  });
  input.addEventListener("keydown", (e) => {
    if (
      e.key === "Backspace" &&
      input.selectionStart === 0 &&
      input.selectionEnd === 0
    ) {
      const prev =
        input === yearInput
          ? monthInput
          : input === cvcInput
          ? yearInput
          : null;
      if (prev) prev.focus();
    }
  });
}

// Pass the source field to prioritize messages correctly
restrictToDigitsAndAutotab(monthInput, 2, yearInput, (phase) =>
  validateExpiry(true, "month")
);
restrictToDigitsAndAutotab(yearInput, 2, cvcInput, (phase) =>
  validateExpiry(true, "year")
);
restrictToDigitsAndAutotab(cvcInput, 3, null, () => validateCvc(true));

// ===== Validators =====
function validateName(showMsg = true) {
  const v = nameInput.value.trim();
  const ok = /^[A-Za-z\s'-]{2,30}$/.test(v);
  if (!v) {
    if (showMsg) showError(nameInput, errName, MSG.blank);
    return false;
  }
  if (!ok) {
    if (showMsg) showError(nameInput, errName, MSG.nameInvalid);
    return false;
  }
  clearError(nameInput, errName);
  return true;
}
function validateNumber(showMsg = true) {
  const digits = digitsOnly(numberInput.value);
  if (!digits) {
    if (showMsg) showError(numberInput, errNumber, MSG.blank);
    return false;
  }
  if (digits.length !== 16) {
    if (showMsg) showError(numberInput, errNumber, MSG.numberLen);
    return false;
  }
  if (!luhnCheck(digits)) {
    if (showMsg) showError(numberInput, errNumber, MSG.numberLuhn);
    return false;
  }
  clearError(numberInput, errNumber);
  return true;
}

/**
 * Validate expiry with field-priority awareness.
 * @param {boolean} showMsg - whether to show messages
 * @param {'month'|'year'|'both'|undefined} source - which field triggered validation
 */
function validateExpiry(showMsg = true, source) {
  const mm = digitsOnly(monthInput.value);
  const yy = digitsOnly(yearInput.value);

  // Helper to show a month or year-specific message first, depending on source
  const wantYearFirst = source === "year";
  const wantMonthFirst = source === "month";

  // Choose the order of checks
  const checks = [];
  if (wantYearFirst) {
    checks.push("yyBlank", "yyLen", "mmBlank", "mmLen", "mmRange", "expired");
  } else if (wantMonthFirst) {
    checks.push("mmBlank", "mmLen", "yyBlank", "yyLen", "mmRange", "expired");
  } else {
    // default: month-first on submit
    checks.push("mmBlank", "mmLen", "yyBlank", "yyLen", "mmRange", "expired");
  }

  // Execute checks in chosen order
  for (const rule of checks) {
    if (rule === "mmBlank" && !mm) {
      if (showMsg) showError(monthInput, errExp, MSG.mmBlank);
      return false;
    }
    if (rule === "yyBlank" && !yy) {
      if (showMsg) showError(yearInput, errExp, MSG.yyBlank);
      return false;
    }
    if (rule === "mmLen" && mm && mm.length < 2) {
      if (showMsg) showError(monthInput, errExp, MSG.mmLen);
      return false;
    }
    if (rule === "yyLen" && yy && yy.length < 2) {
      if (showMsg) showError(yearInput, errExp, MSG.yyLen);
      return false;
    }
    if (rule === "mmRange" && mm && (+mm < 1 || +mm > 12)) {
      if (showMsg) showError(monthInput, errExp, MSG.mmRange);
      return false;
    }
    if (rule === "expired" && mm && yy) {
      const now = new Date();
      const fullYear = 2000 + +yy;
      const currentYear = now.getFullYear();
      const currentMM = now.getMonth() + 1;
      if (
        fullYear < currentYear ||
        (fullYear === currentYear && +mm < currentMM)
      ) {
        if (showMsg) showError(yearInput, errExp, MSG.expired);
        return false;
      }
    }
  }

  // Passed all checks
  clearError(monthInput, errExp);
  clearError(yearInput, errExp);
  return true;
}

function validateCvc(showMsg = true) {
  const raw = digitsOnly(cvcInput.value);
  if (!raw) {
    if (showMsg) showError(cvcInput, errCvc, MSG.blank);
    return false;
  }
  if (raw.length !== 3) {
    if (showMsg) showError(cvcInput, errCvc, MSG.cvcLen);
    return false;
  }
  clearError(cvcInput, errCvc);
  return true;
}

// Validate on blur (use field-aware priority)
[nameInput, numberInput, monthInput, yearInput, cvcInput].forEach((el) => {
  el.addEventListener("blur", () => {
    if (el === nameInput) return validateName(true);
    if (el === numberInput) return validateNumber(true);
    if (el === monthInput) return validateExpiry(true, "month");
    if (el === yearInput) return validateExpiry(true, "year");
    if (el === cvcInput) return validateCvc(true);
  });
});

// Submit (month-first default)
form.addEventListener("submit", (e) => {
  const ok =
    validateName(true) &
    validateNumber(true) &
    validateExpiry(true, "both") &
    validateCvc(true);
  if (!ok) {
    e.preventDefault();
    return;
  }

  e.preventDefault();
  const btn = form.querySelector(".btn-submit");
  btn.disabled = true;
  btn.textContent = "✓ Confirmed";
  btn.style.opacity = "0.85";
});
