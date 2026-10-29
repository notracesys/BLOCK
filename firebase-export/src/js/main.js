import { gameState } from './state.js';
import { callbacks } from './state.js';
import { generateShapes } from './shapes.js';
import { render } from './render.js';
import { checkGameOver, updateUI } from './game.js';
import { onDragMove, onDragEnd, removeDragGhost } from './drag.js';
import { initGame } from './game.js';
import { togglePause, showHint, hideHint, restartGame } from './game.js';
import { renderShapes } from './shapes.js';
import { BET_AMOUNT, MAX_WIN_AMOUNT } from './config.js';
import { formatBRL } from './utils.js';
import { getStoredData, setStoredData } from './storage.js';

const SOUND_STORAGE_KEY = 'soundEnabled';

// Wire callbacks
callbacks.generateShapes = generateShapes;
callbacks.renderShapes = renderShapes;
callbacks.checkGameOver = checkGameOver;
callbacks.updateUI = updateUI;
callbacks.render = render;

function closeApp() {
    if (window.electronAPI?.closeApp) window.electronAPI.closeApp();
    else if (typeof window.close === 'function') window.close();
}

// Header cards: stake + max win
function renderStakeInfo() {
    const betEl = document.getElementById('betValue');
    const maxWinEl = document.getElementById('maxWinValue');
    if (betEl) betEl.textContent = formatBRL(BET_AMOUNT);
    if (maxWinEl) maxWinEl.textContent = formatBRL(MAX_WIN_AMOUNT);
}

// Sound toggle: interface-only control (the game has no audio engine yet).
// The choice is persisted so it can drive audio as soon as it exists.
function applySoundState(btn, enabled) {
    btn.classList.toggle('is-muted', !enabled);
    btn.setAttribute('aria-pressed', String(enabled));
    btn.setAttribute('aria-label', enabled ? 'Desativar som' : 'Ativar som');
}

function setupSoundButton() {
    const btn = document.getElementById('soundBtn');
    if (!btn) return;
    let soundEnabled = getStoredData(SOUND_STORAGE_KEY, true) !== false;
    applySoundState(btn, soundEnabled);
    btn.addEventListener('click', () => {
        soundEnabled = !soundEnabled;
        setStoredData(SOUND_STORAGE_KEY, soundEnabled);
        applySoundState(btn, soundEnabled);
    });
}

function setupEventListeners() {
    document.getElementById('hintBtn')?.addEventListener('click', () => {
        if (gameState.isPaused || gameState.isGameOver) return;
        gameState.hintActive = !gameState.hintActive;
        gameState.hintActive ? showHint() : hideHint();
    });

    document.getElementById('pauseBtn')?.addEventListener('click', () => {
        if (gameState.isGameOver) return;
        togglePause();
    });

    document.getElementById('resumeBtn')?.addEventListener('click', togglePause);
    document.getElementById('restartBtn')?.addEventListener('click', restartGame);

    document.addEventListener('mousemove', (e) => {
        if (gameState.dragging) onDragMove(e.clientX, e.clientY);
    }, { passive: true });

    document.addEventListener('mouseup', (e) => {
        if (gameState.dragging) {
            onDragEnd(e.clientX, e.clientY);
            e.preventDefault();
        }
    });

    document.addEventListener('touchmove', (e) => {
        if (gameState.dragging && e.touches.length === 1) {
            onDragMove(e.touches[0].clientX, e.touches[0].clientY);
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
        if (gameState.dragging && e.changedTouches?.length > 0) {
            const t = e.changedTouches[0];
            onDragEnd(t.clientX, t.clientY);
            e.preventDefault();
        }
    }, { passive: false });

    document.addEventListener('touchcancel', () => {
        if (gameState.dragging) {
            gameState.dragging.shapeItem?.classList.remove('dragging');
            removeDragGhost();
            gameState.dragging = null;
            render();
        }
    });

    document.addEventListener('mouseleave', () => {
        if (gameState.dragging) {
            gameState.dragging.shapeItem?.classList.remove('dragging');
            removeDragGhost();
            gameState.dragging = null;
            render();
        }
    });

    document.addEventListener('dragover', e => e.preventDefault());
    document.addEventListener('drop', e => e.preventDefault());
}

// Expose globals for onclick handlers
window.closeApp = closeApp;

// Init
document.addEventListener('DOMContentLoaded', () => {
    try {
        renderStakeInfo();
        setupSoundButton();
        initGame(setupEventListeners, false);
    } catch (err) {
        console.error('Game init error:', err);
    }
});
