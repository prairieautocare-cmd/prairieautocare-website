console.log("Prairie Auto Care website loaded.");

const serviceSelect = document.getElementById("serviceSelect");
const interiorContainer = document.getElementById("interiorConditionContainer");
const exteriorContainer = document.getElementById("exteriorConditionContainer");
const interiorCondition = document.getElementById("interiorCondition");
const exteriorCondition = document.getElementById("exteriorCondition");
const bookingForm = document.getElementById("bookingForm");

function updateForm() {
  if (!serviceSelect) return;

  const service = serviceSelect.value;

  if (interiorContainer) interiorContainer.style.display = "none";
  if (exteriorContainer) exteriorContainer.style.display = "none";

  if (service === "interior" && interiorContainer) {
    interiorContainer.style.display = "block";
  }

  if (service === "exterior" && exteriorContainer) {
    exteriorContainer.style.display = "block";
  }

  if ((service === "full" || service === "basic") && interiorContainer && exteriorContainer) {
    interiorContainer.style.display = "block";
    exteriorContainer.style.display = "block";
  }
}

if (serviceSelect) {
  serviceSelect.addEventListener("change", updateForm);
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async function (e) {
    if (bookingForm.action.startsWith("https://formspree.io/")) {
      const phone = bookingForm.elements.phone.value.trim();
      const email = bookingForm.elements.email.value.trim();

      if (!phone && !email) {
        e.preventDefault();
        alert("Please provide either a phone number or email address.");
      }
      return;
    }

    e.preventDefault();

    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());
    const phone = (payload.phone || "").trim();
    const email = (payload.email || "").trim();

    if (!phone && !email) {
      alert("Please provide either a phone number or email address.");
      return;
    }

    try {
      payload.phone = phone;
      payload.email = email;

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      let result;
      try {
        result = await response.json();
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

      if (!response.ok) {
        throw new Error(result.message || "Unable to submit your request.");
      }

      alert("Your quote request has been sent successfully.");
      bookingForm.reset();
      window.location.href = "thank-you.html";
    } catch (error) {
      alert(error.message || "There was a problem submitting your request.");
    }
  });
}

updateForm();

document.addEventListener('click', e => { if (!e.target.closest('.contact-dropdown')) document.querySelectorAll('.contact-dropdown').forEach(d => d.classList.remove('open')); });