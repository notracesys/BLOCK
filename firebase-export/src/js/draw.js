// Pure drawing functions (no game logic)
import { gameState, boardCanvas, boardCtx, CELL_SIZE } from './state.js';
import { BOARD_SIZE } from './config.js';
import { hslToRgba } from './utils.js';

const CELL_PAD = 2;
export const CELL_PAD_SIZE = CELL_PAD;
export const TILE_RADIUS_RATIO = 0.24;

export function roundedRectPath(ctx, x, y, w, h, radius) {
    const r = Math.max(0, Math.min(radius, w / 2, h / 2));
    ctx.beginPath();
    if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
        return;
    }
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
}

/** Glossy tile shared by board cells and piece previews */
function paintTile(ctx, x, y, size, radius, color, glow) {
    ctx.shadowColor = color.primary;
    ctx.shadowBlur = glow;
    ctx.globalAlpha = 1;

    const body = ctx.createLinearGradient(x, y, x, y + size);
    body.addColorStop(0, color.primary);
    body.addColorStop(0.45, color.secondary);
    body.addColorStop(1, color.tertiary);
    roundedRectPath(ctx, x, y, size, size, radius);
    ctx.fillStyle = body;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Top gloss highlight — the "cash gel" sheen of the BlockCash logo tiles
    const gloss = ctx.createLinearGradient(x, y, x, y + size * 0.55);
    gloss.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
    gloss.addColorStop(0.55, 'rgba(255, 255, 255, 0.07)');
    gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
    roundedRectPath(ctx, x, y, size, size, radius);
    ctx.fillStyle = gloss;
    ctx.fill();

    // Bottom inner shade adds depth so the tile reads as a 3D gem
    const shade = ctx.createLinearGradient(x, y + size * 0.6, x, y + size);
    shade.addColorStop(0, 'rgba(0, 0, 0, 0)');
    shade.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    roundedRectPath(ctx, x, y, size, size, radius);
    ctx.fillStyle = shade;
    ctx.fill();

    ctx.strokeStyle = color.primary;
    ctx.lineWidth = Math.max(1, size * 0.05);
    roundedRectPath(ctx, x, y, size, size, radius);
    ctx.stroke();
}

/** Dark empty cell – drawn under the whole 8x8 grid */
export function drawEmptyCell(ctx, x, y, gradient) {
    const size = CELL_SIZE - CELL_PAD * 2;
    const radius = CELL_SIZE * TILE_RADIUS_RATIO;

    roundedRectPath(ctx, x + CELL_PAD, y + CELL_PAD, size, size, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = 'rgba(41, 210, 255, 0.24)';
    ctx.lineWidth = 1;
    roundedRectPath(ctx, x + CELL_PAD, y + CELL_PAD, size, size, radius);
    ctx.stroke();
}

export function drawCell(ctx, x, y, color) {
    const size = CELL_SIZE - CELL_PAD * 2;
    paintTile(ctx, x + CELL_PAD, y + CELL_PAD, size, CELL_SIZE * TILE_RADIUS_RATIO, color, 8);
}

export function drawShape(ctx, matrix, color, offsetX, offsetY, size) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const cellSize = size / Math.max(rows, cols);
    const pad = Math.min(CELL_PAD, cellSize * 0.1);
    const boxSize = cellSize - pad * 2;
    const radius = cellSize * TILE_RADIUS_RATIO;

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (matrix[row][col] === 1) {
                const x = offsetX + col * cellSize + pad;
                const y = offsetY + row * cellSize + pad;
                paintTile(ctx, x, y, boxSize, radius, color, 6);
            }
        }
    }
}

export function drawBreakingCell(ctx, x, y, color, progress) {
    const shakeIntensity = Math.sin(progress * Math.PI * 8) * (1 - progress) * 8;
    const offsetX = (Math.random() - 0.5) * shakeIntensity * 2;
    const offsetY = (Math.random() - 0.5) * shakeIntensity * 2;
    const scale = 1 - progress * 0.3;
    const opacity = 1 - progress;

    ctx.save();
    ctx.translate(x + CELL_SIZE / 2 + offsetX, y + CELL_SIZE / 2 + offsetY);
    ctx.scale(scale, scale);
    ctx.globalAlpha = opacity;

    const cellX = -CELL_SIZE / 2 + CELL_PAD;
    const cellY = -CELL_SIZE / 2 + CELL_PAD;
    const cellSize = CELL_SIZE - CELL_PAD * 2;
    const radius = CELL_SIZE * TILE_RADIUS_RATIO;
    const gradient = ctx.createLinearGradient(cellX, cellY, cellX, cellY + cellSize);
    gradient.addColorStop(0, color.primary);
    gradient.addColorStop(0.5, color.secondary);
    gradient.addColorStop(1, color.tertiary);
    roundedRectPath(ctx, cellX, cellY, cellSize, cellSize, radius);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = color.primary;
    ctx.lineWidth = 2 + progress * 3;
    roundedRectPath(ctx, cellX, cellY, cellSize, cellSize, radius);
    ctx.stroke();

    if (progress > 0.3) {
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + (progress * 0.8) + ')';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
            const startX = cellX + Math.random() * cellSize;
            const startY = cellY + Math.random() * cellSize;
            const endX = cellX + Math.random() * cellSize;
            const endY = cellY + Math.random() * cellSize;
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
        }
        ctx.stroke();
    }
    ctx.restore();
}
