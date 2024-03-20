//sjekk rebussvar javascript
const submit = document.getElementById("submit");

submit.addEventListener('click', validate);

function validate(e) {
  e.preventDefault();

  const svar = document.getElementById("svar");
  let valid = true;

  if (svar.value.toLowerCase() != 'bålpanne') {
    const resultat = document.getElementById("resultat");
    resultat.classList.add("visible");
    svar.classList.add("invalid");
    resultat.setAttribute('aria-invalid', true);
    resultat.textContent = "Forsøk igjen!";
    resultat.style.fontWeight = 400;
    document.getElementById("fireflame").style.visibility = "hidden";
  } else {
    const resultat = document.getElementById("resultat");
    resultat.classList.add("visible");
    svar.classList.add("valid");
    resultat.setAttribute('aria-invalid', false);
    resultat.textContent = "RIKTIG!";
    resultat.style.fontWeight = 800;
    document.getElementById("fireflame").style.visibility = "visible";
  }

  return valid;
}
