console.log("Prairie Auto Care website loaded.");
const serviceSelect = document.getElementById("serviceSelect");
const photosInput = document.getElementById("photos");

const interiorContainer =
  document.getElementById("interiorConditionContainer");

const exteriorContainer =
  document.getElementById("exteriorConditionContainer");

const interiorCondition =
  document.getElementById("interiorCondition");

const exteriorCondition =
  document.getElementById("exteriorCondition");

function updateForm() {

  const service = serviceSelect.value;

  interiorContainer.style.display = "none";
  exteriorContainer.style.display = "none";

  if (service === "interior") {
    interiorContainer.style.display = "block";
  }

  if (service === "exterior") {
    exteriorContainer.style.display = "block";
  }

  if (service === "full") {
    interiorContainer.style.display = "block";
    exteriorContainer.style.display = "block";
  }

  const hasPhotos = photosInput.files.length > 0;

  if (hasPhotos) {
    interiorCondition.required = false;
    exteriorCondition.required = false;
  }
}

serviceSelect.addEventListener("change", updateForm);
photosInput.addEventListener("change", updateForm);

updateForm();

document.querySelector(".booking-form")
.addEventListener("submit", function(e){

  const phone =
    document.getElementById("phone").value.trim();

  const email =
    document.getElementById("email").value.trim();

  if (!phone && !email) {

    e.preventDefault();

    alert(
      "Please provide either a phone number or email address."
    );
  }

});

document.addEventListener('click', e => { if (!e.target.closest('.contact-dropdown')) document.querySelectorAll('.contact-dropdown').forEach(d => d.classList.remove('open')); });