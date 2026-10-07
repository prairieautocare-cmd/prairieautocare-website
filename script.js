console.log("Prairie Auto Care website loaded.");

const serviceSelect = document.getElementById("serviceSelect");
const photosInput = document.getElementById("photos");
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

  if (photosInput && photosInput.files && photosInput.files.length > 0) {
    if (interiorCondition) interiorCondition.required = false;
    if (exteriorCondition) exteriorCondition.required = false;
  }
}

if (serviceSelect) {
  serviceSelect.addEventListener("change", updateForm);
}

if (photosInput) {
  photosInput.addEventListener("change", updateForm);
}

async function readFileAsDataUrl(file) {
  if (!file) return "";

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result || "");
    reader.onerror = () => reject(new Error("Unable to read uploaded image."));
    reader.readAsDataURL(file);
  });
}

if (bookingForm) {
  bookingForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(bookingForm);
    const payload = Object.fromEntries(formData.entries());
    const phone = (payload.phone || "").trim();
    const email = (payload.email || "").trim();
    const file = formData.get("vehicle_photo");

    if (!phone && !email) {
      alert("Please provide either a phone number or email address.");
      return;
    }

    try {
      payload.phone = phone;
      payload.email = email;
      payload.vehicle_photo_name = file && file.name ? file.name : "";
      payload.vehicle_photo_data = file ? await readFileAsDataUrl(file) : "";

      const response = await fetch("/api/quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

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