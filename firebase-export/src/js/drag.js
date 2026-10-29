import { BOARD_SIZE } from './config.js';
import {
    gameState, boardCanvas, boardCtx, dragGhost, dragRafId, pendingPointerX, pendingPointerY,
    setDragGhost, setDragRafId, setPendingPointer
} from './state.js';
import { getShapePivot } from './shapeUtils.js';
import { drawShape } from './draw.js';
import { render, drawPlacementPreview } from './render.js';
import { placeShape } from './board.js';

function removeDragGhost() {
    if (dragRafId != null) {
        cancelAnimationFrame(dragRafId);
        setDragRafId(null);
    }
    if (dragGhost) {
        dragGhost.remove();
        setDragGhost(null);
    }
}

function createDragGhost(shape) {
    if (dragGhost) {
        dragGhost.remove();
        setDragGhost(null);
    }

    const rect = boardCanvas.getBoundingClientRect();
    const actualCellSize = rect.width / BOARD_SIZE;
    const ghost = document.createElement('div');
    ghost.className = 'drag-ghost';
    ghost.style.cssText = 'display:block;position:fixed;left:0;top:0;pointer-events:none;z-index:1000;opacity:0.8;cursor:grabbing;will-change:transform;';

    const canvas = document.createElement('canvas');
    const matrix = shape.matrix;
    const cols = matrix[0].length;
    const rows = matrix.length;
    const size = Math.max(cols, rows);
    const pivot = getShapePivot(shape);

    canvas.width = size * actualCellSize;
    canvas.height = size * actualCellSize;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawShape(ctx, matrix, shape.color, 0, 0, size * actualCellSize);

    const cellSize = size * actualCellSize / Math.max(rows, cols);
    const pivotX = pivot.col * cellSize + cellSize / 2;
    const pivotY = pivot.row * cellSize + cellSize / 2;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(pivotX, pivotY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();

    ghost.appendChild(canvas);
    document.body.appendChild(ghost);
    setDragGhost(ghost);
}

function updateDragGhost(clientX, clientY) {
    if (!dragGhost || !gameState.dragging) return;
    const shape = gameState.dragging.shape;
    const pivot = getShapePivot(shape);
    const rect = boardCanvas.getBoundingClientRect();
    const actualCellSize = rect.width / BOARD_SIZE;
    const pivotOffsetX = pivot.col * actualCellSize + actualCellSize / 2;
    const pivotOffsetY = pivot.row * actualCellSize + actualCellSize / 2;
    const ghostX = clientX - pivotOffsetX;
    const ghostY = clientY - pivotOffsetY;
    dragGhost.style.display = 'block';
    dragGhost.style.transform = `translate(${ghostX}px, ${ghostY}px)`;
}

export function onDragMove(clientX, clientY) {
    if (!gameState.dragging) return;
    setPendingPointer(clientX, clientY);

    if (dragRafId == null) {
        const rafId = requestAnimationFrame(() => {
            setDragRafId(null);
            if (!gameState.dragging || !boardCtx) return;
            updateDragGhost(pendingPointerX, pendingPointerY);

            const rect = boardCanvas.getBoundingClientRect();
            const actualCellSize = rect.width / BOARD_SIZE;
            const mouseX = pendingPointerX - rect.left;
            const mouseY = pendingPointerY - rect.top;
            const x = Math.floor(mouseX / actualCellSize);
            const y = Math.floor(mouseY / actualCellSize);
            const shape = gameState.dragging.shape;
            const pivot = getShapePivot(shape);
            const placeX = x - pivot.col;
            const placeY = y - pivot.row;

            render();
            // Display only: the preview is requested even when the piece hangs off
            // the edge, so the player sees green (fits) or red (does not fit).
            // The drop rules below are unchanged.
            drawPlacementPreview(shape, placeX, placeY);
        });
        setDragRafId(rafId);
    }
}

export function onDragEnd(clientX, clientY) {
    if (!gameState.dragging) return;
    if (dragRafId != null) {
        cancelAnimationFrame(dragRafId);
        setDragRafId(null);
    }

    const rect = boardCanvas.getBoundingClientRect();
    const actualCellSize = rect.width / BOARD_SIZE;
    const mouseX = clientX - rect.left;
    const mouseY = clientY - rect.top;
    const cellX = Math.floor(mouseX / actualCellSize);
    const cellY = Math.floor(mouseY / actualCellSize);
    const shape = gameState.dragging.shape;
    const pivot = getShapePivot(shape);
    const placeX = cellX - pivot.col;
    const placeY = cellY - pivot.row;

    if (placeX >= 0 && placeY >= 0 && placeX <= BOARD_SIZE - shape.matrix[0].length && placeY <= BOARD_SIZE - shape.matrix.length) {
        placeShape(gameState.dragging.shapeIndex, placeX, placeY);
    }

    if (gameState.dragging.shapeItem) gameState.dragging.shapeItem.classList.remove('dragging');
    removeDragGhost();
    gameState.dragging = null;
    render();
}

export function setupDragAndDrop(shapeItem, shape, shapeIndex) {
    function startDrag(clientX, clientY) {
        if (gameState.isPaused || gameState.isGameOver) return;
        gameState.dragging = { shape, shapeIndex, startX: clientX, startY: clientY, shapeItem };
        shapeItem.classList.add('dragging');
        createDragGhost(shape);
        updateDragGhost(clientX, clientY);
        const rect = boardCanvas.getBoundingClientRect();
        gameState.dragOffset = { x: clientX - rect.left, y: clientY - rect.top };
    }
    shapeItem.addEventListener('mousedown', (e) => { startDrag(e.clientX, e.clientY); e.preventDefault(); });
    shapeItem.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
    }, { passive: false });
}

export { removeDragGhost };