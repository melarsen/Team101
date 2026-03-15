function normalizeAnswer(value) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

function normalizeExact(value) {
  return value.trim().replace(/\s+/g, ' ');
}

function setupChallenge() {
  const form = document.querySelector('[data-challenge-form]');
  if (!form) return;

  const input = form.querySelector('input[name="answer"]');
  const feedback = document.querySelector('[data-feedback]');
  const nextContainer = document.querySelector('[data-next]');
  const caseSensitive = form.hasAttribute('data-case-sensitive');

  const acceptedRaw = form.getAttribute('data-accepted') || '';
  const acceptedAnswers = acceptedRaw
    .split('|')
    .map((item) => caseSensitive ? normalizeExact(item) : normalizeAnswer(item))
    .filter(Boolean);

  const nextHref = form.getAttribute('data-next') || '#';
  const nextLabel = form.getAttribute('data-next-label') || 'Neste oppgave';
  const successMessage = form.getAttribute('data-success-message') || 'Riktig! Klar for neste URL.';
  const hintMessage = form.getAttribute('data-hint-message') || 'Ikke helt riktig enda. Prøv igjen!';

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const value = caseSensitive ? normalizeExact(input.value) : normalizeAnswer(input.value);

    if (acceptedAnswers.includes(value)) {
      feedback.textContent = successMessage;
      feedback.className = 'feedback ok';
      nextContainer.innerHTML = '<a class="next-link" href="' + nextHref + '">' + nextLabel + '</a>';
      return;
    }

    feedback.textContent = hintMessage;
    feedback.className = 'feedback bad';
    input.classList.remove('shake');
    void input.offsetWidth;
    input.classList.add('shake');
  });
}

document.addEventListener('DOMContentLoaded', setupChallenge);
