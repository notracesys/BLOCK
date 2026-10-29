import { BOARD_SIZE, PIECE_SLOTS, MAX_WIN_AMOUNT, SCORE_TO_BRL_DIVISOR } from './config.js';
import { gameState, boardCanvas, boardCtx, setCellSize, resetGameState, setBoardCanvas, setBoardCtx, isGameInProgress } from './state.js';
import { canPlaceShape } from './board.js';
import { generateShapes } from './shapes.js';
import { render } from './render.js';
import { removeDragGhost } from './drag.js';
import { formatBRL } from './utils.js';

function updateGameButtonsState() {
    const enabled = isGameInProgress();
    const hintBtn = document.getElementById('hintBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    if (hintBtn) hintBtn.disabled = !enabled;
    if (pauseBtn) pauseBtn.disabled = !enabled;
}

export function updateUI() {
    const scoreEl = document.getElementById('score');
    const linesEl = document.getElementById('lines');
    const levelEl = document.getElementById('level');
    if (scoreEl) scoreEl.textContent = gameState.score;
    if (linesEl) linesEl.textContent = gameState.lines;
    if (levelEl) levelEl.textContent = gameState.level;
    updatePrizeDisplay();
    updateGameButtonsState();
}

// Prize meter: display-only. It converts the current score into BRL and shows
// how close the player is to MAX_WIN_AMOUNT. Gameplay scoring is untouched.
function updatePrizeDisplay() {
    const prizeEl = document.getElementById('prizeValue');
    const barEl = document.getElementById('winProgressBar');
    const trackEl = document.getElementById('winProgress');
    const prize = gameState.score / SCORE_TO_BRL_DIVISOR;

    if (prizeEl) prizeEl.textContent = formatBRL(prize);

    const progress = Math.min(100, (prize / MAX_WIN_AMOUNT) * 100);
    if (barEl) barEl.style.width = progress.toFixed(2) + '%';
    if (trackEl) trackEl.setAttribute('aria-valuenow', progress.toFixed(0));
}

export function checkGameOver() {
    if (gameState.isGameOver) return;
    if (gameState.shapes.length === 0) return;

    for (let i = 0; i < gameState.shapes.length; i++) {
        const shape = gameState.shapes[i];
        for (let y = 0; y <= BOARD_SIZE - shape.matrix.length; y++) {
            for (let x = 0; x <= BOARD_SIZE - shape.matrix[0].length; x++) {
                if (canPlaceShape(shape, x, y)) return;
            }
        }
    }
    gameState.isGameOver = true;
    showGameOverModal();
}

export function showGameOverModal() {
    const finalScore = document.getElementById('finalScore');
    const finalLines = document.getElementById('finalLines');
    if (finalScore) finalScore.textContent = gameState.score;
    if (finalLines) finalLines.textContent = gameState.lines;
    document.getElementById('gameOverModal')?.classList.add('show');
    updateGameButtonsState();
}

export function restartGame() {
    removeDragGhost();
    document.querySelector('.boardWrap')?.classList.remove('shake');
    document.querySelector('.boardGrid')?.classList.remove('paused');

    const pauseBtn = document.getElementById('pauseBtn');
    const pauseBtnText = document.getElementById('pauseBtnText');
    const pauseIcon = pauseBtn?.querySelector('.pauseIcon');
    const playIcon = pauseBtn?.querySelector('.playIcon');
    if (pauseBtnText) pauseBtnText.textContent = 'Pause';
    if (pauseIcon) pauseIcon.style.display = 'block';
    if (playIcon) playIcon.style.display = 'none';

    resetGameState();
    generateShapes(PIECE_SLOTS);
    updateUI();
    document.getElementById('gameOverModal')?.classList.remove('show');
    render();
}

export function showHint() {
    gameState.hintActive = true;
    render();
}

export function hideHint() {
    gameState.hintActive = false;
    render();
}

export function togglePause() {
    if (gameState.isGameOver) return;
    gameState.isPaused = !gameState.isPaused;
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseBtnText = document.getElementById('pauseBtnText');
    const pauseIcon = pauseBtn?.querySelector('.pauseIcon');
    const playIcon = pauseBtn?.querySelector('.playIcon');
    const boardGrid = document.querySelector('.boardGrid');

    if (gameState.isPaused) {
        if (pauseBtnText) pauseBtnText.textContent = 'Resume';
        if (pauseIcon) pauseIcon.style.display = 'none';
        if (playIcon) playIcon.style.display = 'block';
        boardGrid?.classList.add('paused');
        updatePauseStatus();
    } else {
        if (pauseBtnText) pauseBtnText.textContent = 'Pause';
        if (pauseIcon) pauseIcon.style.display = 'block';
        if (playIcon) playIcon.style.display = 'none';
        boardGrid?.classList.remove('paused');
    }
}

function updatePauseStatus() {
    const s = document.getElementById('pauseScore');
    const l = document.getElementById('pauseLines');
    const v = document.getElementById('pauseLevel');
    if (s) s.textContent = gameState.score;
    if (l) l.textContent = gameState.lines;
    if (v) v.textContent = gameState.level;
}

export function resizeCanvas() {
    if (!boardCanvas) return;
    const container = boardCanvas.parentElement;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    if (containerRect.width === 0 || containerRect.height === 0) {
        requestAnimationFrame(resizeCanvas);
        return;
    }

    const style = window.getComputedStyle(container);
    const paddingX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
    const paddingY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
    const availableWidth = containerRect.width - paddingX;
    const availableHeight = containerRect.height - paddingY;
    const availableSize = Math.min(availableWidth, availableHeight);
    let cellSize = Math.floor(availableSize / BOARD_SIZE);
    if (cellSize < 20) cellSize = 20;
    setCellSize(cellSize);

    const canvasSize = cellSize * BOARD_SIZE;
    boardCanvas.width = canvasSize;
    boardCanvas.height = canvasSize;
    boardCanvas.style.width = canvasSize + 'px';
    boardCanvas.style.height = canvasSize + 'px';
    render();
}



export function initGame(setupEventListeners, skipShapes = false) {
    resetGameState();

    const canvas = document.getElementById('gameBoard');
    if (!canvas) return;
    setBoardCanvas(canvas);
    setBoardCtx(canvas.getContext('2d'));

    resizeCanvas();
    if (!window._resizeBound) {
        window.addEventListener('resize', resizeCanvas);
        window._resizeBound = true;
    }
    if (!skipShapes) generateShapes(PIECE_SLOTS);
    if (typeof setupEventListeners === 'function') setupEventListeners();
    updateUI();
    render();
}
