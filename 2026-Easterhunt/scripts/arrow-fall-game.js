function setupArrowFallGame() {
  const game = document.querySelector('[data-arrow-game]');
  if (!game) return;

  const area = game.querySelector('[data-arrow-area]');
  const arrow = game.querySelector('[data-falling-arrow]');
  const startButton = game.querySelector('[data-arrow-start]');
  const scoreEl = game.querySelector('[data-score]');
  const targetEl = game.querySelector('[data-target]');
  const pieceIndexEl = game.querySelector('[data-piece-index]');
  const totalEl = game.querySelector('[data-total]');
  const countdownEl = game.querySelector('[data-countdown]');
  const feedback = document.querySelector('[data-feedback]');
  const nextContainer = document.querySelector('[data-result]');

  const target = Number(game.getAttribute('data-target') || 10);
  const totalPieces = Number(game.getAttribute('data-total') || 15);
  const fallMs = Number(game.getAttribute('data-fall-ms') || 2000);
  const nextHref = game.getAttribute('data-next') || 'finale.html';
  const nextLabel = game.getAttribute('data-next-label') || 'Avslor skatten';

  const dirs = ['up', 'down', 'left', 'right'];
  const symbols = { up: '↑', down: '↓', left: '←', right: '→' };
  const opposite = { up: 'down', down: 'up', left: 'right', right: 'left' };

  let score = 0;
  let pieceIndex = 0;
  let running = false;
  let activePiece = null;
  let rafId = null;
  let lastSecond = null;
  let pieceResolved = false;
  let sequence = [];

  let touchStartX = 0;
  let touchStartY = 0;

  targetEl.textContent = String(target);
  totalEl.textContent = String(totalPieces);

  function ensureAreaVisible() {
    game.style.display = 'block';
    game.style.visibility = 'visible';
    area.style.setProperty('display', 'block', 'important');
    area.style.setProperty('visibility', 'visible', 'important');
    area.style.setProperty('opacity', '1', 'important');
    area.style.setProperty('height', '320px', 'important');
    area.style.setProperty('min-height', '260px', 'important');
    area.style.setProperty('overflow', 'hidden', 'important');
  }

  function updateHud() {
    scoreEl.textContent = String(score);
    pieceIndexEl.textContent = String(pieceIndex);
  }

  function buildSequence() {
    const arr = [];
    const redPieces = 8;
    const yellowPieces = 7;

    for (let i = 0; i < redPieces; i += 1) {
      arr.push({
        direction: dirs[Math.floor(Math.random() * dirs.length)],
        inverted: true,
      });
    }

    for (let i = 0; i < yellowPieces; i += 1) {
      arr.push({
        direction: dirs[Math.floor(Math.random() * dirs.length)],
        inverted: false,
      });
    }

    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }

    return arr.slice(0, totalPieces);
  }

  function hideArrow() {
    arrow.style.opacity = '0';
    arrow.style.transform = 'translate(-9999px, -9999px)';
  }

  function endGame() {
    running = false;
    activePiece = null;
    pieceResolved = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    if (score >= target) {
      feedback.textContent = 'Supert! Du klarte spillet. Du leste både retning og farge-regel riktig, noe som trener reaksjonstid og kognitiv fleksibilitet.';
      feedback.className = 'feedback ok';
      nextContainer.innerHTML = '<a class="next-link" href="' + nextHref + '">' + nextLabel + '</a>';
      countdownEl.textContent = 'Ferdig: bestatt';
    } else {
      feedback.textContent = 'Ikke nok riktige. Prov igjen!';
      feedback.className = 'feedback bad';
      countdownEl.textContent = 'Ferdig: ikke bestatt';
    }
  }

  function evaluateInput(inputDirection) {
    if (!running || !activePiece || pieceResolved) return;

    const expected = activePiece.inverted
      ? opposite[activePiece.direction]
      : activePiece.direction;

    pieceResolved = true;

    if (inputDirection === expected) {
      score += 1;
      feedback.textContent = 'Riktig!';
      feedback.className = 'feedback ok';
    } else {
      feedback.textContent = 'Feil retning.';
      feedback.className = 'feedback bad';
    }

    updateHud();
  }

  function animatePiece(piece) {
    const areaWidth = area.clientWidth || 600;
    const areaHeight = area.clientHeight || 320;
    const size = 64;
    const maxX = Math.max(0, areaWidth - size);
    const startX = Math.floor(Math.random() * (maxX + 1));
    const startY = -size;
    const endY = areaHeight + size;
    const startTime = performance.now();

    activePiece = piece;
    pieceResolved = false;
    lastSecond = Math.ceil(fallMs / 1000);

    arrow.textContent = symbols[piece.direction];
    arrow.className = 'falling-arrow ' + (piece.inverted ? 'arrow-inverted' : 'arrow-normal');
    arrow.style.opacity = '1';

    function frame(now) {
      if (!running) return;

      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / fallMs);
      const y = startY + (endY - startY) * progress;

      arrow.style.transform = 'translate(' + startX + 'px, ' + y + 'px)';

      const secondsLeft = Math.max(0, Math.ceil((fallMs - elapsed) / 1000));
      if (secondsLeft !== lastSecond) {
        lastSecond = secondsLeft;
        countdownEl.textContent = 'Brikke ' + pieceIndex + ': ' + secondsLeft + 's igjen';
      }

      if (progress >= 1 || pieceResolved) {
        if (!pieceResolved) {
          feedback.textContent = 'For sent!';
          feedback.className = 'feedback bad';
        }

        hideArrow();

        if (pieceIndex >= totalPieces) {
          endGame();
          return;
        }

        setTimeout(() => {
          if (running) {
            nextPiece();
          }
        }, 180);
        return;
      }

      rafId = requestAnimationFrame(frame);
    }

    rafId = requestAnimationFrame(frame);
  }

  function nextPiece() {
    if (!running) return;
    if (pieceIndex >= totalPieces) {
      endGame();
      return;
    }

    if (area.clientHeight < 120 || area.clientWidth < 120) {
      ensureAreaVisible();
      setTimeout(nextPiece, 80);
      return;
    }

    const piece = sequence[pieceIndex];
    pieceIndex += 1;
    updateHud();
    animatePiece(piece);
  }

  function startGame() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    sequence = buildSequence();
    score = 0;
    pieceIndex = 0;
    running = true;
    pieceResolved = false;
    ensureAreaVisible();
    nextContainer.innerHTML = '';
    feedback.textContent = 'Spillet er i gang!';
    feedback.className = 'feedback';
    updateHud();
    setTimeout(nextPiece, 60);
  }

  function directionFromSwipe(dx, dy) {
    if (Math.abs(dx) > Math.abs(dy)) {
      return dx > 0 ? 'right' : 'left';
    }
    return dy > 0 ? 'down' : 'up';
  }

  function onKeyDown(event) {
    if (!running) return;

    const keyMap = {
      ArrowUp: 'up',
      ArrowDown: 'down',
      ArrowLeft: 'left',
      ArrowRight: 'right',
    };

    const dir = keyMap[event.key];
    if (!dir) return;

    event.preventDefault();
    evaluateInput(dir);
  }

  area.addEventListener('touchstart', (event) => {
    const touch = event.changedTouches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
    event.preventDefault();
  }, { passive: false });

  area.addEventListener('touchmove', (event) => {
    event.preventDefault();
  }, { passive: false });

  area.addEventListener('touchend', (event) => {
    if (!running) return;

    const touch = event.changedTouches[0];
    const dx = touch.clientX - touchStartX;
    const dy = touch.clientY - touchStartY;
    const distance = Math.hypot(dx, dy);

    if (distance < 24) return;

    const dir = directionFromSwipe(dx, dy);
    evaluateInput(dir);
  }, { passive: true });

  document.addEventListener('keydown', onKeyDown);
  startButton.addEventListener('click', startGame);

  ensureAreaVisible();
  hideArrow();
  updateHud();
}

document.addEventListener('DOMContentLoaded', setupArrowFallGame);
