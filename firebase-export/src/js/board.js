import { BOARD_SIZE, PIECE_SLOTS } from './config.js';
import { gameState, callbacks } from './state.js';

export function canPlaceShape(shape, x, y) {
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    if (x + cols > BOARD_SIZE || y + rows > BOARD_SIZE) return false;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                if (gameState.board[y + row][x + col] !== 0) return false;
            }
        }
    }
    return true;
}

export function findLinesToClear() {
    const rowsToClear = [];
    const colsToClear = [];

    for (let row = 0; row < BOARD_SIZE; row++) {
        let isFull = true;
        for (let col = 0; col < BOARD_SIZE; col++) {
            if (gameState.board[row][col] === 0 || !gameState.board[row][col]?.permanent) {
                isFull = false;
                break;
            }
        }
        if (isFull) rowsToClear.push(row);
    }

    for (let col = 0; col < BOARD_SIZE; col++) {
        let isFull = true;
        for (let row = 0; row < BOARD_SIZE; row++) {
            if (gameState.board[row][col] === 0 || !gameState.board[row][col]?.permanent) {
                isFull = false;
                break;
            }
        }
        if (isFull) colsToClear.push(col);
    }
    return { rowsToClear, colsToClear };
}

export function animateClearing(callback) {
    const duration = 600;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        gameState.clearingLines.animationTime = progress;
        callbacks.render?.();
        if (progress < 1) requestAnimationFrame(animate);
        else callback();
    }
    requestAnimationFrame(animate);
}

export function clearLines() {
    const { rowsToClear, colsToClear } = findLinesToClear();
    const clearedCount = rowsToClear.length + colsToClear.length;

    if (clearedCount === 0) return 0;

    gameState.clearingLines.rows = rowsToClear;
    gameState.clearingLines.cols = colsToClear;
    gameState.clearingLines.isAnimating = true;
    gameState.clearingLines.animationTime = 0;

    const boardContainer = document.querySelector('.boardWrap');
    boardContainer?.classList.add('shake');

    animateClearing(() => {
        rowsToClear.forEach(row => {
            for (let col = 0; col < BOARD_SIZE; col++) gameState.board[row][col] = 0;
        });
        colsToClear.forEach(col => {
            for (let row = 0; row < BOARD_SIZE; row++) gameState.board[row][col] = 0;
        });
        boardContainer?.classList.remove('shake');
        gameState.lines += clearedCount;
        gameState.level = Math.floor(gameState.lines / 10) + 1;
        callbacks.updateUI?.();
        gameState.clearingLines.isAnimating = false;
        callbacks.render?.();
        if (!gameState.isGameOver && gameState.shapes.length > 0) callbacks.checkGameOver?.();
    });
    return clearedCount;
}

export function placeShape(shapeIndex, x, y) {
    if (gameState.isPaused || gameState.isGameOver) return;

    const shape = gameState.shapes[shapeIndex];
    if (!shape) return;
    if (!canPlaceShape(shape, x, y)) return;

    const blocksPlaced = shape.matrix.flat().filter(cell => cell === 1).length;
    const matrix = shape.matrix;
    const rows = matrix.length;
    const cols = matrix[0].length;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                gameState.board[y + row][x + col] = { color: shape.color, permanent: true };
            }
        }
    }

    gameState.shapes.splice(shapeIndex, 1);
    const linesCleared = clearLines();
    gameState.score += blocksPlaced * gameState.level * 10;
    if (linesCleared > 0) gameState.score += linesCleared * gameState.level * 100;

    if (gameState.shapes.length === 0) {
        callbacks.generateShapes?.(PIECE_SLOTS);
    } else {
        callbacks.renderShapes?.();
        if (linesCleared === 0 && !gameState.isGameOver) callbacks.checkGameOver?.();
    }
    gameState.hintActive = false;
    callbacks.updateUI?.();
    callbacks.render?.();
}
