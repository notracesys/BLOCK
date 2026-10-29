import { BOARD_SIZE } from './config.js';

// Mutable game state and shared refs
export let CELL_SIZE = 36;

export const gameState = {
    board: [],
    shapes: [],
    currentShape: null,
    score: 0,
    lines: 0,
    level: 1,
    isPaused: false,
    isGameOver: false,
    hintActive: false,
    dragging: null,
    dragOffset: { x: 0, y: 0 },
    clearingLines: {
        rows: [],
        cols: [],
        animationTime: 0,
        isAnimating: false
    }
};

export let boardCanvas = null;
export let boardCtx = null;
export let shapeCanvases = [];
export let dragGhost = null;
export let dragRafId = null;
export let pendingPointerX = 0;
export let pendingPointerY = 0;

// Callbacks to break circular deps (set by main.js)
export const callbacks = {
    generateShapes: null,
    renderShapes: null,
    checkGameOver: null,
    updateUI: null,
    render: null
};

export function setCellSize(val) {
    CELL_SIZE = val;
}

export function setBoardCanvas(canvas) {
    boardCanvas = canvas;
}

export function setBoardCtx(ctx) {
    boardCtx = ctx;
}

export function setShapeCanvases(arr) {
    shapeCanvases = arr;
}

export function setDragGhost(ghost) {
    dragGhost = ghost;
}

export function setDragRafId(id) {
    dragRafId = id;
}

export function setPendingPointer(x, y) {
    pendingPointerX = x;
    pendingPointerY = y;
}

export function isGameInProgress() {
    return !gameState.isGameOver && gameState.score > 0;
}

export function resetGameState() {
    gameState.board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    gameState.shapes = [];
    gameState.currentShape = null;
    gameState.score = 0;
    gameState.lines = 0;
    gameState.level = 1;
    gameState.isPaused = false;
    gameState.isGameOver = false;
    gameState.hintActive = false;
    gameState.dragging = null;
    gameState.dragOffset = { x: 0, y: 0 };
    gameState.clearingLines = { rows: [], cols: [], animationTime: 0, isAnimating: false };
}
