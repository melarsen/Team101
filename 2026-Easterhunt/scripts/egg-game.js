function setupEggGame() {
  const game = document.querySelector('[data-egg-game]');
  if (!game) return;

  const area = game.querySelector('[data-game-area]');
  const eggButton = game.querySelector('[data-egg-button]');
  const startButton = game.querySelector('[data-start-game]');
  const scoreEl = game.querySelector('[data-score]');
  const targetEl = game.querySelector('[data-target]');
  const timeEl = game.querySelector('[data-time-left]');
  const countdownEl = game.querySelector('[data-countdown]');
  const feedback = document.querySelector('[data-feedback]');
  const nextContainer = document.querySelector('[data-result]');

  const target = Number(game.getAttribute('data-target') || 8);
  const totalTime = Number(game.getAttribute('data-time') || 20);
  const nextHref = game.getAttribute('data-next') || 'step4.html';
  const nextLabel = game.getAttribute('data-next-label') || 'Neste oppgave';

  let score = 0;
  let timeLeft = totalTime;
  let timerId = null;
  let moveId = null;
  let running = false;

  targetEl.textContent = String(target);
  timeEl.textContent = String(totalTime);
  if (countdownEl) {
    countdownEl.textContent = 'Nedtelling: ' + String(totalTime);
  }

  function moveEgg() {
    const areaWidth = area.clientWidth;
    const areaHeight = area.clientHeight;
    const eggWidth = eggButton.offsetWidth || 56;
    const eggHeight = eggButton.offsetHeight || 56;

    if (areaWidth < 40 || areaHeight < 40) {
      requestAnimationFrame(moveEgg);
      return;
    }

    const maxX = Math.max(0, areaWidth - eggWidth);
    const maxY = Math.max(0, areaHeight - eggHeight);

    const x = Math.floor(Math.random() * (maxX + 1));
    const y = Math.floor(Math.random() * (maxY + 1));

    eggButton.style.left = x + 'px';
    eggButton.style.top = y + 'px';
  }

  function ensureGameAreaVisible() {
    area.style.display = 'block';
    area.style.visibility = 'visible';
    area.style.opacity = '1';
    area.style.height = area.style.height || '240px';
    area.style.minHeight = '200px';
  }

  function stopGame() {
    if (timerId) clearInterval(timerId);
    if (moveId) clearInterval(moveId);
    timerId = null;
    moveId = null;
    running = false;
  }

  function winGame() {
    stopGame();
    if (countdownEl) {
      countdownEl.textContent = 'Nedtelling: Fullfort';
    }
    feedback.textContent = 'Rått! Du nådde nivået og låste opp neste steg. Slike reaksjonsspill trener timing, fokus og hand-øye-koordinasjon.';
    feedback.className = 'feedback ok';
    nextContainer.innerHTML = '<a class="next-link" href="' + nextHref + '">' + nextLabel + '</a>';
  }

  function loseGame() {
    stopGame();
    if (countdownEl) {
      countdownEl.textContent = 'Nedtelling: 0';
    }
    feedback.textContent = 'Tiden gikk ut. Start på nytt og prøv igjen!';
    feedback.className = 'feedback bad';
  }

  function startGame() {
    stopGame();
    ensureGameAreaVisible();

    score = 0;
    timeLeft = totalTime;
    scoreEl.textContent = String(score);
    timeEl.textContent = String(timeLeft);
    if (countdownEl) {
      countdownEl.textContent = 'Nedtelling: ' + String(timeLeft);
    }
    nextContainer.innerHTML = '';
    feedback.textContent = 'Spillet er i gang. Fang egget!';
    feedback.className = 'feedback';
    running = true;

    moveEgg();
    moveId = setInterval(moveEgg, 900);

    timerId = setInterval(() => {
      timeLeft -= 1;
      timeEl.textContent = String(timeLeft);
      if (countdownEl) {
        countdownEl.textContent = 'Nedtelling: ' + String(timeLeft);
      }

      if (timeLeft <= 0 && score < target) {
        loseGame();
      }
    }, 1000);
  }

  eggButton.addEventListener('click', () => {
    if (!running) return;

    score += 1;
    scoreEl.textContent = String(score);
    moveEgg();

    if (score >= target) {
      winGame();
    }
  });

  startButton.addEventListener('click', startGame);
  window.addEventListener('resize', moveEgg);

  ensureGameAreaVisible();
  moveEgg();
}

document.addEventListener('DOMContentLoaded', setupEggGame);
