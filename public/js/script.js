// Example starter JavaScript for disabling form submissions if there are invalid fields
(() => {
  "use strict";

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll(".needs-validation");

  // Loop over them and prevent submission
  Array.from(forms).forEach((form) => {
    form.addEventListener(
      "submit",
      (event) => {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add("was-validated");
      },
      false
    );
  });
})();

// Contact Modal Functions - making these available in the global scope
window.openContactModal = function () {
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.style.display = "block";
    // Prevent scrolling of the body when modal is open
    document.body.style.overflow = "hidden";
  }
};

window.closeContactModal = function () {
  const modal = document.getElementById("contactModal");
  if (modal) {
    modal.style.display = "none";
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = "auto";
  }
};

// Close modal when clicking outside of it
window.onclick = function (event) {
  const modal = document.getElementById("contactModal");
  if (modal && event.target == modal) {
    closeContactModal();
  }
};

// Also close modal with escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeContactModal();
  }
});
