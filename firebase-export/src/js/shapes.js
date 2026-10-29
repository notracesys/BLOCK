import { PREVIEW_CELL_SIZE, PREVIEW_MAX_SIZE, PIECE_SLOTS, SHAPE_DEFINITIONS, FIVE_BLOCK_RATE } from './config.js';
import { gameState, shapeCanvases, setShapeCanvases } from './state.js';
import { drawShape } from './draw.js';
import { setupDragAndDrop } from './drag.js';
import { callbacks } from './state.js';

// Vivid jewel tiles taken from the BlockCash logo: azure, money green, purple,
// gold, red, cyan, magenta, orange, emerald, indigo, lime and rose.
// Display only — the shape logic (matrix/complexity) is untouched.
const COLOR_PALETTES = [
    { h: 208, s: 95, l: 56 }, { h: 128, s: 68, l: 48 }, { h: 276, s: 88, l: 60 },
    { h: 45, s: 100, l: 55 }, { h: 2, s: 88, l: 56 }, { h: 190, s: 92, l: 50 },
    { h: 330, s: 88, l: 60 }, { h: 24, s: 96, l: 55 }, { h: 158, s: 78, l: 44 },
    { h: 250, s: 82, l: 62 }, { h: 98, s: 72, l: 48 }, { h: 348, s: 84, l: 62 }
];

export function generateColor() {
    const c = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
    return {
        primary: `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
        secondary: `hsl(${c.h}, ${c.s}%, ${c.l - 8}%)`,
        tertiary: `hsl(${c.h}, ${c.s}%, ${c.l - 15}%)`
    };
}

export { getShapePivot } from './shapeUtils.js';

const FIVE_BLOCK_SHAPES = SHAPE_DEFINITIONS.filter(s => s.complexity === 4);
const NON_FIVE_BLOCK_SHAPES = SHAPE_DEFINITIONS.filter(s => s.complexity < 4);

/** Pick a shape: random from all shapes with normal difficulty rate */
function pickShapeForLevel() {
    const fiveBlockRate = FIVE_BLOCK_RATE.normal;

    if (Math.random() < fiveBlockRate && FIVE_BLOCK_SHAPES.length > 0) {
        return FIVE_BLOCK_SHAPES[Math.floor(Math.random() * FIVE_BLOCK_SHAPES.length)];
    }
    return NON_FIVE_BLOCK_SHAPES[Math.floor(Math.random() * NON_FIVE_BLOCK_SHAPES.length)];
}

export function generateShapes(count) {
    gameState.shapes = [];
    for (let i = 0; i < count; i++) {
        const def = pickShapeForLevel();
        gameState.shapes.push({ id: i, matrix: def.matrix, color: generateColor() });
    }
    renderShapes();
    if (!gameState.isGameOver) callbacks.checkGameOver?.();
}

export function renderShapes() {
    const shapesList = document.getElementById('shapesList');
    if (!shapesList) return;
    shapesList.innerHTML = '';
    const canvases = [];

    // Always render the same number of slots so the layout never shifts
    for (let index = 0; index < PIECE_SLOTS; index++) {
        const shape = gameState.shapes[index];
        const shapeItem = document.createElement('div');
        shapeItem.className = 'shape-item';
        shapeItem.dataset.shapeIndex = index;

        if (!shape) {
            shapeItem.classList.add('shape-item--empty');
            shapesList.appendChild(shapeItem);
            continue;
        }

        const canvas = document.createElement('canvas');
        canvas.className = 'shape-canvas';
        const matrix = shape.matrix;
        const cols = matrix[0].length;
        const rows = matrix.length;
        // Every piece keeps the same visual footprint (largest side ≈ PREVIEW_MAX_SIZE)
        const cellSize = Math.max(PREVIEW_CELL_SIZE, Math.floor(PREVIEW_MAX_SIZE / Math.max(rows, cols)));
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape(ctx, matrix, shape.color, 0, 0, Math.max(cols, rows) * cellSize);

        shapeItem.appendChild(canvas);
        shapesList.appendChild(shapeItem);
        canvases.push(canvas);
        setupDragAndDrop(shapeItem, shape, index);
    }
    setShapeCanvases(canvases);
}
