import { BOARD_SIZE } from './config.js';
import { gameState, boardCanvas, boardCtx, CELL_SIZE } from './state.js';
import {
    drawCell, drawShape, drawEmptyCell, drawBreakingCell,
    roundedRectPath, CELL_PAD_SIZE, TILE_RADIUS_RATIO
} from './draw.js';
import { canPlaceShape } from './board.js';
import { getShapePivot } from './shapeUtils.js';

export { drawShape };

// Placement feedback palette (display only).
const PREVIEW_OK = {
    fillTop: 'rgba(156, 250, 196, 0.32)',
    fillBottom: 'rgba(72, 220, 144, 0.22)',
    edge: 'rgba(126, 246, 178, 0.88)',
    pivotEdge: 'rgba(214, 255, 232, 0.98)',
    glow: 'rgba(84, 238, 158, 0.55)'
};
const PREVIEW_BLOCKED = {
    fillTop: 'rgba(255, 140, 134, 0.24)',
    fillBottom: 'rgba(224, 74, 72, 0.18)',
    edge: 'rgba(255, 124, 118, 0.82)',
    pivotEdge: 'rgba(255, 182, 176, 0.95)',
    glow: null
};

/**
 * Ghost of the piece under the pointer: green when the placement fits,
 * red when it does not. Purely visual — the validation is still canPlaceShape.
 */
export function drawPlacementPreview(shape, x, y) {
    if (!boardCtx) return;

    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;
    const pivot = getShapePivot(shape);

    // A placement is only valid from inside the grid: the drop itself requires
    // placeX/placeY >= 0. canPlaceShape only guards the far edge, so the negative
    // side is short-circuited here (purely for the preview path).
    const inside = x >= 0 && y >= 0 && x + cols <= BOARD_SIZE && y + rows <= BOARD_SIZE;
    const canPlace = inside ? canPlaceShape(shape, x, y) : false;
    const theme = canPlace ? PREVIEW_OK : PREVIEW_BLOCKED;

    const pad = CELL_PAD_SIZE;
    const size = CELL_SIZE - pad * 2;
    const radius = CELL_SIZE * TILE_RADIUS_RATIO;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] !== 1) continue;

            const boardCol = x + col;
            const boardRow = y + row;
            // Cells hanging off the grid cannot be painted, but the visible part of
            // the piece still turns red so the player sees the drop does not fit.
            if (boardCol < 0 || boardRow < 0 || boardCol >= BOARD_SIZE || boardRow >= BOARD_SIZE) continue;

            const cellX = boardCol * CELL_SIZE;
            const cellY = boardRow * CELL_SIZE;
            const isPivot = (row === pivot.row && col === pivot.col);

            if (theme.glow) {
                boardCtx.shadowColor = theme.glow;
                boardCtx.shadowBlur = 9;
            }
            const fill = boardCtx.createLinearGradient(cellX, cellY, cellX, cellY + CELL_SIZE);
            fill.addColorStop(0, theme.fillTop);
            fill.addColorStop(1, theme.fillBottom);
            boardCtx.fillStyle = fill;
            roundedRectPath(boardCtx, cellX + pad, cellY + pad, size, size, radius);
            boardCtx.fill();
            boardCtx.shadowBlur = 0;

            const gloss = boardCtx.createLinearGradient(cellX, cellY, cellX, cellY + CELL_SIZE * 0.55);
            gloss.addColorStop(0, 'rgba(255, 255, 255, 0.16)');
            gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
            boardCtx.fillStyle = gloss;
            roundedRectPath(boardCtx, cellX + pad, cellY + pad, size, size, radius);
            boardCtx.fill();

            boardCtx.strokeStyle = isPivot ? theme.pivotEdge : theme.edge;
            boardCtx.lineWidth = isPivot ? 2 : 1.5;
            roundedRectPath(boardCtx, cellX + pad, cellY + pad, size, size, radius);
            boardCtx.stroke();
        }
    }
}

function drawHintPosition() {
    if (!boardCtx || gameState.shapes.length === 0) return;
    const shape = gameState.shapes[0];
    const pivot = getShapePivot(shape);
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    for (let y = 0; y <= BOARD_SIZE - rows; y++) {
        for (let x = 0; x <= BOARD_SIZE - cols; x++) {
            if (canPlaceShape(shape, x, y)) {
                for (let row = 0; row < rows; row++) {
                    for (let col = 0; col < cols; col++) {
                        if (matrix[row][col] === 1) {
                            const cellX = (x + col) * CELL_SIZE;
                            const cellY = (y + row) * CELL_SIZE;
                            boardCtx.shadowColor = 'rgba(255, 201, 60, 0.55)';
                            boardCtx.shadowBlur = 8;
                            boardCtx.fillStyle = 'rgba(255, 196, 60, 0.22)';
                            boardCtx.fillRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                            boardCtx.shadowBlur = 0;
                            boardCtx.strokeStyle = (row === pivot.row && col === pivot.col) ? 'rgba(255, 231, 160, 0.95)' : 'rgba(255, 201, 60, 0.75)';
                            boardCtx.lineWidth = (row === pivot.row && col === pivot.col) ? 3 : 2;
                            boardCtx.strokeRect(cellX + 2, cellY + 2, CELL_SIZE - 4, CELL_SIZE - 4);
                        }
                    }
                }
                return;
            }
        }
    }
}

export function render() {
    if (!boardCtx || !boardCanvas) return;

    boardCtx.fillStyle = '#020916';
    boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

    // Dark glossy tiles for every cell (board background layer)
    const emptyTileGradient = boardCtx.createLinearGradient(0, 0, 0, CELL_SIZE - 4);
    emptyTileGradient.addColorStop(0, 'rgba(18, 72, 133, 0.98)');
    emptyTileGradient.addColorStop(0.48, 'rgba(9, 43, 88, 0.98)');
    emptyTileGradient.addColorStop(1, 'rgba(3, 18, 42, 0.99)');
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            boardCtx.save();
            boardCtx.translate(col * CELL_SIZE, row * CELL_SIZE);
            drawEmptyCell(boardCtx, 0, 0, emptyTileGradient);
            boardCtx.restore();
        }
    }

    const clearingLines = gameState.clearingLines;
    for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
            const cell = gameState.board[row][col];
            if (cell !== 0 && cell !== null) {
                const isInClearingRow = clearingLines.rows.includes(row);
                const isInClearingCol = clearingLines.cols.includes(col);
                const isClearing = isInClearingRow || isInClearingCol;
                if (isClearing && clearingLines.isAnimating) {
                    drawBreakingCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color, clearingLines.animationTime);
                } else {
                    drawCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color);
                }
            }
        }
    }

    if (gameState.hintActive) drawHintPosition();
}
