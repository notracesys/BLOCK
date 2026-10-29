'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, VolumeX, Info, Award, CheckCircle2, Wallet } from 'lucide-react';
import { GameAudio } from '../game/audios';

export default function DemoGamePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [isMutedState, setIsMutedState] = useState(false);
  const [showGameOver, setShowGameOver] = useState(false);
  const [showDemoWithdraw, setShowDemoWithdraw] = useState(false);
  
  const [linesCompleted, setLinesCompleted] = useState(0);

  const TARGET_LINES = 4;
  const VALUE_PER_LINE = 5;
  const FINAL_PRIZE = 20;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    GameAudio.preload();
    GameAudio.playMusic();
    setIsMutedState(GameAudio.isMuted());

    const BOARD_SIZE = 8;
    const PREVIEW_CELL_SIZE = 20;
    const PREVIEW_MAX_SIZE = 76;
    const PIECE_SLOTS = 3;

    const SHAPE_DEFINITIONS = [
      { matrix: [[1]], complexity: 0 },
      { matrix: [[1, 1]], complexity: 1 },
      { matrix: [[1], [1]], complexity: 1 },
      { matrix: [[1, 0], [1, 1]], complexity: 2 },
      { matrix: [[0, 1], [1, 1]], complexity: 2 },
      { matrix: [[1, 1], [1, 0]], complexity: 2 },
      { matrix: [[1, 1], [0, 1]], complexity: 2 },
      { matrix: [[1, 1, 1]], complexity: 2 },
      { matrix: [[1], [1], [1]], complexity: 2 },
      { matrix: [[1, 1, 1], [0, 1, 0]], complexity: 3 },
      { matrix: [[0, 1, 0], [1, 1, 1]], complexity: 3 },
      { matrix: [[1, 0], [1, 1], [1, 0]], complexity: 3 },
      { matrix: [[0, 1], [1, 1], [0, 1]], complexity: 3 },
      { matrix: [[1, 1], [1, 1]], complexity: 3 },
      { matrix: [[1, 1, 1, 1]], complexity: 3 },
      { matrix: [[1], [1], [1], [1]], complexity: 3 },
      { matrix: [[1, 1, 0], [0, 1, 1]], complexity: 3 },
      { matrix: [[0, 1, 1], [1, 1, 0]], complexity: 3 },
      { matrix: [[1, 0, 0], [1, 1, 1]], complexity: 3 },
      { matrix: [[0, 0, 1], [1, 1, 1]], complexity: 3 },
      { matrix: [[1, 1, 1], [1, 0, 0]], complexity: 3 },
      { matrix: [[1, 1, 1], [0, 0, 1]], complexity: 3 }
    ];

    const COLOR_PALETTES = [
      { h: 208, s: 95, l: 56 }, { h: 128, s: 68, l: 48 }, { h: 276, s: 88, l: 60 },
      { h: 45, s: 100, l: 55 }, { h: 190, s: 92, l: 50 }, { h: 24, s: 96, l: 55 }
    ];

    let CELL_SIZE = 36;
    const gameState = {
      board: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)),
      shapes: [] as any[],
      score: 0,
      lines: 0,
      isPaused: false,
      isGameOver: false,
      dragging: null as any,
      clearingLines: {
        rows: [] as number[],
        cols: [] as number[],
        animationTime: 0,
        isAnimating: false
      }
    };

    let boardCanvas = document.getElementById('gameBoard') as HTMLCanvasElement | null;
    let boardCtx = boardCanvas ? boardCanvas.getContext('2d') : null;
    let dragGhost: HTMLDivElement | null = null;
    let dragRafId: number | null = null;
    let pendingPointerX = 0;
    let pendingPointerY = 0;

    function generateColor() {
      const c = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
      return {
        primary: `hsl(${c.h}, ${c.s}%, ${c.l}%)`,
        secondary: `hsl(${c.h}, ${c.s}%, ${c.l - 8}%)`,
        tertiary: `hsl(${c.h}, ${c.s}%, ${c.l - 15}%)`
      };
    }

    function getShapePivot(shape: any) {
      const matrix = shape.matrix;
      const rows = matrix.length;
      const cols = matrix[0].length;
      const centerRow = Math.ceil((rows - 1) / 2);
      const centerCol = Math.ceil((cols - 1) / 2);
      let closestRow = centerRow, closestCol = centerCol, minDistance = Infinity;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (matrix[row][col] === 1) {
            const d = Math.sqrt(Math.pow(row - centerRow, 2) + Math.pow(col - centerCol, 2));
            if (d < minDistance) {
              minDistance = d;
              closestRow = row;
              closestCol = col;
            }
          }
        }
      }
      return { row: closestRow, col: closestCol };
    }

    function roundedRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, radius: number) {
      const r = Math.max(0, Math.min(radius, w / 2, h / 2));
      ctx.beginPath();
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(x, y, w, h, r);
        return;
      }
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y + h, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }

    function paintTile(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, radius: number, color: any, glow: number) {
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

      const gloss = ctx.createLinearGradient(x, y, x, y + size * 0.4);
      gloss.addColorStop(0, 'rgba(255, 255, 255, 0.25)');
      gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
      roundedRectPath(ctx, x, y, size, size, radius);
      ctx.fillStyle = gloss;
      ctx.fill();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      roundedRectPath(ctx, x, y, size, size, radius);
      ctx.stroke();
    }

    function drawEmptyCell(ctx: CanvasRenderingContext2D, x: number, y: number, gradient: CanvasGradient) {
      const size = CELL_SIZE - 4;
      const radius = CELL_SIZE * 0.15;
      roundedRectPath(ctx, x + 2, y + 2, size, size, radius);
      ctx.fillStyle = gradient;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.lineWidth = 1;
      roundedRectPath(ctx, x + 2, y + 2, size, size, radius);
      ctx.stroke();
    }

    function drawCell(ctx: CanvasRenderingContext2D, x: number, y: number, color: any) {
      const size = CELL_SIZE - 4;
      paintTile(ctx, x + 2, y + 2, size, CELL_SIZE * 0.15, color, 1);
    }

    function drawBreakingCell(ctx: CanvasRenderingContext2D, x: number, y: number, color: any, progress: number) {
      const shakeIntensity = Math.sin(progress * Math.PI * 14) * (1 - progress) * 22;
      const offsetX = (Math.random() - 0.5) * shakeIntensity;
      const offsetY = (Math.random() - 0.5) * shakeIntensity;

      ctx.save();
      ctx.translate(x + CELL_SIZE / 2 + offsetX, y + CELL_SIZE / 2 + offsetY);

      ctx.beginPath();
      ctx.arc(0, 0, Math.max(0, CELL_SIZE * progress * 2.6), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(38, 217, 255, ${Math.max(0, 1 - progress)})`;
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffe778';
      ctx.shadowBlur = 40;
      for (let i = 0; i < 16; i++) {
        const angle = (i * Math.PI) / 8 + progress * 7;
        const dist = CELL_SIZE * progress * 4.2;
        const px = Math.cos(angle) * dist;
        const py = Math.sin(angle) * dist;
        const pSize = Math.max(0, 12 * (1 - progress));
        ctx.beginPath();
        ctx.arc(px, py, pSize, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      ctx.globalAlpha = Math.max(0, 1 - progress);
      const cellX = -CELL_SIZE / 2 + 2;
      const cellY = -CELL_SIZE / 2 + 2;
      const size = CELL_SIZE - 4;
      const radius = CELL_SIZE * 0.15;

      const explosiveColor = { primary: '#ffffff', secondary: '#ffe477', tertiary: color.primary };
      paintTile(ctx, cellX, cellY, size, radius, explosiveColor, Math.max(0, 70 * (1 - progress)));

      ctx.restore();
    }

    function drawShape(ctx: CanvasRenderingContext2D, matrix: number[][], color: any, offsetX: number, offsetY: number, size: number) {
      const rows = matrix.length;
      const cols = matrix[0].length;
      const cellSize = size / Math.max(rows, cols);
      const pad = Math.min(2, cellSize * 0.1);
      const boxSize = cellSize - pad * 2;
      const radius = cellSize * 0.15;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (matrix[row][col] === 1) {
            const x = offsetX + col * cellSize + pad;
            const y = offsetY + row * cellSize + pad;
            paintTile(ctx, x, y, boxSize, radius, color, 1);
          }
        }
      }
    }

    function canPlaceShape(shape: any, x: number, y: number) {
      const matrix = shape.matrix;
      const rows = matrix.length;
      const cols = matrix[0].length;

      if (x + cols > BOARD_SIZE || y + rows > BOARD_SIZE || x < 0 || y < 0) return false;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (matrix[row][col] === 1) {
            if (gameState.board[y + row][x + col] !== 0) return false;
          }
        }
      }
      return true;
    }

    function findLinesToClear() {
      const rowsToClear = [];
      const colsToClear = [];

      for (let row = 0; row < BOARD_SIZE; row++) {
        let isFull = true;
        for (let col = 0; col < BOARD_SIZE; col++) {
          if (gameState.board[row][col] === 0) {
            isFull = false;
            break;
          }
        }
        if (isFull) rowsToClear.push(row);
      }

      for (let col = 0; col < BOARD_SIZE; col++) {
        let isFull = true;
        for (let row = 0; row < BOARD_SIZE; row++) {
          if (gameState.board[row][col] === 0) {
            isFull = false;
            break;
          }
        }
        if (isFull) colsToClear.push(col);
      }
      return { rowsToClear, colsToClear };
    }

    function clearLines() {
      const { rowsToClear, colsToClear } = findLinesToClear();
      const clearedCount = rowsToClear.length + colsToClear.length;

      if (clearedCount === 0) return 0;

      GameAudio.play('clear');

      gameState.clearingLines.rows = rowsToClear;
      gameState.clearingLines.cols = colsToClear;
      gameState.clearingLines.isAnimating = true;
      gameState.clearingLines.animationTime = 0;

      const duration = 600;
      const startTime = performance.now();

      function animate(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        gameState.clearingLines.animationTime = progress;
        render();
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          rowsToClear.forEach(row => {
            for (let col = 0; col < BOARD_SIZE; col++) gameState.board[row][col] = 0;
          });
          colsToClear.forEach(col => {
            for (let row = 0; row < BOARD_SIZE; row++) gameState.board[row][col] = 0;
          });
          gameState.lines += clearedCount;
          gameState.clearingLines.isAnimating = false;
          
          setLinesCompleted(gameState.lines);
          render();
          checkGameOver();
        }
      }
      animate(performance.now());
      return clearedCount;
    }

    function placeShape(shapeIndex: number, x: number, y: number) {
      const shape = gameState.shapes[shapeIndex] as any;
      if (!shape || !canPlaceShape(shape, x, y)) return;

      const blocksPlaced = shape.matrix.flat().filter((cell: number) => cell === 1).length;
      for (let row = 0; row < shape.matrix.length; row++) {
        for (let col = 0; col < shape.matrix[0].length; col++) {
          if (shape.matrix[row][col] === 1) {
            gameState.board[y + row][x + col] = { color: shape.color };
          }
        }
      }

      gameState.shapes.splice(shapeIndex, 1);
      
      GameAudio.play('encaixe');

      const linesCleared = clearLines();
      gameState.score += blocksPlaced * 10;
      if (linesCleared > 0) gameState.score += linesCleared * 100;

      if (gameState.shapes.length === 0) {
        generateShapes(PIECE_SLOTS);
      } else {
        renderShapes();
        if (linesCleared === 0) checkGameOver();
      }
      render();
    }

    function checkGameOver() {
      if (gameState.shapes.length === 0) return;

      let validMoveFound = false;
      for (let i = 0; i < gameState.shapes.length; i++) {
        const shape = gameState.shapes[i] as any;
        if (!shape) continue;
        for (let y = 0; y <= BOARD_SIZE - shape.matrix.length; y++) {
          for (let x = 0; x <= BOARD_SIZE - shape.matrix[0].length; x++) {
            if (canPlaceShape(shape, x, y)) {
              validMoveFound = true;
              break;
            }
          }
          if (validMoveFound) break;
        }
        if (validMoveFound) break;
      }

      if (!validMoveFound) {
        gameState.isGameOver = true;
        GameAudio.play('derrota');
        setShowGameOver(true);
      }
    }

    function generateShapes(count: number) {
      gameState.shapes = [] as any[];
      for (let i = 0; i < count; i++) {
        const def = SHAPE_DEFINITIONS[Math.floor(Math.random() * SHAPE_DEFINITIONS.length)];
        gameState.shapes.push({ id: i, matrix: def.matrix, color: generateColor() } as any);
      }
      renderShapes();
      checkGameOver();
    }

    function drawPlacementPreview(shape: any, x: number, y: number) {
      if (!boardCtx) return;
      const matrix = shape.matrix;
      const rows = matrix.length;
      const cols = matrix[0].length;
      const inside = x >= 0 && y >= 0 && x + cols <= BOARD_SIZE && y + rows <= BOARD_SIZE;
      const canFit = inside ? canPlaceShape(shape, x, y) : false;

      const theme = canFit ? {
        fillTop: 'rgba(38, 217, 255, 0.12)',
        fillBottom: 'rgba(53, 245, 154, 0.08)',
        edge: '#26d9ff'
      } : {
        fillTop: 'rgba(231, 59, 41, 0.15)',
        fillBottom: 'rgba(169, 22, 25, 0.08)',
        edge: '#e73b29'
      };

      const pad = 2;
      const size = CELL_SIZE - pad * 2;
      const radius = CELL_SIZE * 0.15;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (matrix[row][col] !== 1) continue;
          const boardCol = x + col;
          const boardRow = y + row;
          if (boardCol < 0 || boardRow < 0 || boardCol >= BOARD_SIZE || boardRow >= BOARD_SIZE) continue;

          const cellX = boardCol * CELL_SIZE;
          const cellY = boardRow * CELL_SIZE;

          boardCtx.fillStyle = theme.fillTop;
          roundedRectPath(boardCtx, cellX + pad, cellY + pad, size, size, radius);
          boardCtx.fill();

          boardCtx.strokeStyle = theme.edge;
          boardCtx.lineWidth = 1.5;
          roundedRectPath(boardCtx, cellX + pad, cellY + pad, size, size, radius);
          boardCtx.stroke();
        }
      }
    }

    function render() {
      if (!boardCtx || !boardCanvas) return;

      boardCtx.fillStyle = '#060a17';
      boardCtx.fillRect(0, 0, boardCanvas.width, boardCanvas.height);

      const emptyTileGradient = boardCtx.createLinearGradient(0, 0, 0, CELL_SIZE);
      emptyTileGradient.addColorStop(0, '#0e1324');
      emptyTileGradient.addColorStop(1, '#080b14');

      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          boardCtx.save();
          boardCtx.translate(col * CELL_SIZE, row * CELL_SIZE);
          drawEmptyCell(boardCtx, 0, 0, emptyTileGradient);
          boardCtx.restore();
        }
      }

      const cl = gameState.clearingLines;
      for (let row = 0; row < BOARD_SIZE; row++) {
        for (let col = 0; col < BOARD_SIZE; col++) {
          const cell = gameState.board[row][col];
          if (cell !== 0 && cell !== null) {
            const isClearing = cl.isAnimating && (cl.rows.includes(row) || cl.cols.includes(col));
            if (isClearing) {
              drawBreakingCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color, cl.animationTime);
            } else {
              drawCell(boardCtx, col * CELL_SIZE, row * CELL_SIZE, cell.color);
            }
          }
        }
      }
    }

    function renderShapes() {
      const shapesList = document.getElementById('shapesList');
      if (!shapesList) return;
      shapesList.innerHTML = '';

      for (let index = 0; index < PIECE_SLOTS; index++) {
        const shape = gameState.shapes[index] as any;
        const shapeItem = document.createElement('div');
        shapeItem.className = 'shape-item bg-slate-900/60 border border-white/5 rounded-xl aspect-square flex items-center justify-center cursor-grab select-none relative overflow-hidden transition-transform duration-150 active:scale-95';
        shapeItem.dataset.shapeIndex = String(index);

        if (!shape) {
          shapeItem.classList.add('opacity-10');
          shapesList.appendChild(shapeItem);
          continue;
        }

        const canvas = document.createElement('canvas');
        canvas.className = 'shape-canvas pointer-events-none max-w-[80%] max-h-[80%]';
        const matrix = shape.matrix;
        const cols = matrix[0].length;
        const rows = matrix.length;
        const cellSize = Math.max(PREVIEW_CELL_SIZE, Math.floor(PREVIEW_MAX_SIZE / Math.max(rows, cols)));
        canvas.width = cols * cellSize;
        canvas.height = rows * cellSize;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawShape(ctx, matrix, shape.color, 0, 0, Math.max(cols, rows) * cellSize);
        }

        shapeItem.appendChild(canvas);
        shapesList.appendChild(shapeItem);
        setupDragAndDrop(shapeItem, shape, index);
      }
    }

    function setupDragAndDrop(shapeItem: HTMLDivElement, shape: any, shapeIndex: number) {
      function startDrag(clientX: number, clientY: number) {
        if (gameState.isPaused || gameState.isGameOver) return;
        
        GameAudio.unlock();
        GameAudio.play('selection');
        
        gameState.dragging = { shape, shapeIndex, shapeItem };
        shapeItem.classList.add('opacity-30');
        createDragGhost(shape);
        updateDragGhost(clientX, clientY);
      }

      shapeItem.addEventListener('mousedown', (e) => {
        startDrag(e.clientX, e.clientY);
        e.preventDefault();
      });

      shapeItem.addEventListener('touchstart', (e) => {
        if (e.touches.length !== 1) return;
        startDrag(e.touches[0].clientX, e.touches[0].clientY);
        e.preventDefault();
      });
    }

    function createDragGhost(shape: any) {
      if (dragGhost) dragGhost.remove();
      if (!boardCanvas) return;

      const rect = boardCanvas.getBoundingClientRect();
      const actualCellSize = rect.width / BOARD_SIZE;
      
      dragGhost = document.createElement('div');
      dragGhost.className = 'drag-ghost';
      dragGhost.style.cssText = 'display:block;position:fixed;left:0;top:0;pointer-events:none;z-index:2000;opacity:0.85;will-change:transform;';

      const canvas = document.createElement('canvas');
      const matrix = shape.matrix;
      const cols = matrix[0].length;
      const rows = matrix.length;
      const size = Math.max(cols, rows);

      canvas.width = size * actualCellSize;
      canvas.height = size * actualCellSize;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShape(ctx, matrix, shape.color, 0, 0, size * actualCellSize);
      }

      dragGhost.appendChild(canvas);
      document.body.appendChild(dragGhost);
    }

    function updateDragGhost(clientX: number, clientY: number) {
      if (!dragGhost || !gameState.dragging) return;
      const shape = gameState.dragging.shape;
      const pivot = getShapePivot(shape);
      if (!boardCanvas) return;
      const rect = boardCanvas.getBoundingClientRect();
      const actualCellSize = rect.width / BOARD_SIZE;
      const pivotOffsetX = pivot.col * actualCellSize + actualCellSize / 2;
      const pivotOffsetY = pivot.row * actualCellSize + actualCellSize / 2;
      
      dragGhost.style.display = 'block';
      dragGhost.style.transform = `translate(${clientX - pivotOffsetX}px, ${clientY - pivotOffsetY}px)`;
    }

    function onDragMove(clientX: number, clientY: number) {
      if (!gameState.dragging || !boardCanvas) return;
      pendingPointerX = clientX;
      pendingPointerY = clientY;

      if (dragRafId == null) {
        dragRafId = requestAnimationFrame(() => {
          dragRafId = null;
          if (!gameState.dragging || !boardCanvas) return;
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
          drawPlacementPreview(shape, placeX, placeY);
        });
      }
    }

    function onDragEnd(clientX: number, clientY: number) {
      if (!gameState.dragging || !boardCanvas) return;
      if (dragRafId != null) {
        cancelAnimationFrame(dragRafId);
        dragRafId = null;
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

      if (placeX >= 0 && placeY >= 0 && placeX <= BOARD_SIZE - shape.matrix[0].length && placeY <= BOARD_SIZE - shape.matrix.length && canPlaceShape(shape, placeX, placeY)) {
        placeShape(gameState.dragging.shapeIndex, placeX, placeY);
      } else {
        GameAudio.play('broken');
      }

      if (gameState.dragging.shapeItem) gameState.dragging.shapeItem.classList.remove('opacity-30');
      if (dragGhost) {
        dragGhost.remove();
        dragGhost = null;
      }
      gameState.dragging = null;
      render();
    }

    function resizeCanvas() {
      if (!boardCanvas) return;
      const container = boardCanvas.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const availableSize = Math.min(containerRect.width || 300, containerRect.height || 300);
      let cellSize = Math.floor(availableSize / BOARD_SIZE);
      if (cellSize < 18) cellSize = 18;
      CELL_SIZE = cellSize;

      const canvasSize = cellSize * BOARD_SIZE;
      boardCanvas.width = canvasSize;
      boardCanvas.height = canvasSize;
      boardCanvas.style.width = canvasSize + 'px';
      boardCanvas.style.height = canvasSize + 'px';
      render();
    }

    boardCanvas = document.getElementById('gameBoard') as HTMLCanvasElement | null;
    boardCtx = boardCanvas ? boardCanvas.getContext('2d') : null;
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    generateShapes(PIECE_SLOTS);
    
    const handleMove = (e: MouseEvent) => { if (gameState.dragging) onDragMove(e.clientX, e.clientY); };
    const handleUp = (e: MouseEvent) => { if (gameState.dragging) { onDragEnd(e.clientX, e.clientY); e.preventDefault(); } };
    const handleTouchMove = (e: TouchEvent) => { if (gameState.dragging && e.touches.length === 1) { onDragMove(e.touches[0].clientX, e.touches[0].clientY); e.preventDefault(); } };
    const handleTouchEnd = (e: TouchEvent) => { if (gameState.dragging && e.changedTouches?.length > 0) { onDragEnd(e.changedTouches[0].clientX, e.changedTouches[0].clientY); e.preventDefault(); } };

    document.addEventListener('mousemove', handleMove, { passive: true });
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (dragGhost) dragGhost.remove();
      GameAudio.stopMusic();
    };
  }, []);

  const toggleSound = () => {
    GameAudio.unlock();
    const currentMute = GameAudio.isMuted();
    GameAudio.setMuted(!currentMute);
    setIsMutedState(!currentMute);
    GameAudio.play('swtch');
  };

  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    GameAudio.play('swtch');
    router.push('/');
  };

  const isTargetAchieved = linesCompleted >= TARGET_LINES;
  const currentPotentialPrize = linesCompleted * VALUE_PER_LINE;
  const progressPercentage = Math.min(100, (linesCompleted / TARGET_LINES) * 100);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-screen text-white select-none flex flex-col justify-between p-3 relative overflow-hidden" 
      style={{ backgroundImage: "url('/fundo1.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
      onClick={() => GameAudio.unlock()} 
      onTouchStart={() => GameAudio.unlock()}
    >
      <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-[7px] pointer-events-none z-0"></div>
      
      <div className="w-full flex flex-col justify-between h-full flex-1 max-w-[430px] mx-auto z-10 relative overflow-hidden">
        <header className="w-full grid grid-cols-3 items-center h-10 relative z-20 shrink-0 px-1">
          <button 
            onClick={handleBackClick}
            className="w-8 h-8 rounded-lg border border-white/5 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center text-white justify-self-start"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="flex items-center justify-center justify-self-center">
            <Image 
              src="/blockcash.png" 
              alt="Block Cash Logo" 
              width={90} 
              height={30} 
              className="object-contain filter drop-shadow-[0_2px_6px_rgba(38,217,255,0.4)]"
              priority
            />
          </div>

          <div className="justify-self-end flex items-center">
            <span className="px-1.5 py-0.5 rounded border border-cyan-500/35 bg-cyan-950/60 text-cyan-400 text-[9px] font-black tracking-wider uppercase shadow-[0_0_8px_rgba(38,217,255,0.2)]">
              TESTE DEMO
            </span>
          </div>
        </header>

        <section className="text-center flex flex-col items-center shrink-0 mt-7 mb-1">
          <small className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-0.5">
            {isTargetAchieved ? 'PRÊMIO LIBERADO!' : 'PRÊMIO EM FORMAÇÃO'}
          </small>
          
          <strong className="text-4xl font-[1000] text-emerald-400 tracking-tight drop-shadow-[0_2px_15px_rgba(52,245,154,0.4)]">
            R$ {currentPotentialPrize},00
          </strong>

          <div className="text-[10px] font-bold text-white/70 mt-1 space-y-0.5">
            <div>Progresso: <span className="text-cyan-400 font-black">{linesCompleted}</span> de <span className="text-white font-black">{TARGET_LINES}</span> linhas completas</div>
            {!isTargetAchieved && (
              <div className="text-[9px] text-amber-400/90 font-medium">
                Custo de Entrada Simulado • Complete 4 linhas para liberar <span className="font-bold text-white">R$ {FINAL_PRIZE},00</span>
              </div>
            )}
            {isTargetAchieved && (
              <div className="text-[9px] text-emerald-400 font-black uppercase tracking-wider flex items-center gap-1.5 justify-center animate-bounce">
                <Award className="w-3 h-3 text-emerald-400" /> Modo Demonstração Concluído!
              </div>
            )}
          </div>

          <div className="h-3 w-full bg-slate-950/90 rounded-full overflow-hidden border border-white/10 p-[1.5px] mt-2 relative shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full shadow-[0_0_12px_rgba(52,245,154,0.7)] transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          {isTargetAchieved && (
            <button 
              onClick={() => {
                GameAudio.play('swtch');
                setShowDemoWithdraw(true);
              }}
              className="w-full mt-2 h-11 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-slate-950 font-black text-xs tracking-wide uppercase shadow-[0_0_25px_rgba(234,179,8,0.6)] border border-amber-200/40 flex items-center justify-center gap-1.5 relative overflow-hidden animate-pulse"
              style={{
                textShadow: '0 1px 2px rgba(255,255,255,0.3)',
                boxShadow: '0 0 30px rgba(234,179,8,0.7), inset 0 2px 4px rgba(255,255,255,0.6)'
              }}
            >
              Simular Resgate de R$ {FINAL_PRIZE},00
            </button>
          )}
        </section>

        <div className="flex flex-col items-center justify-center flex-1 gap-2 my-auto">
          <section className="w-full aspect-square p-1 bg-slate-900/20 backdrop-blur-sm border border-white/5 rounded-xl flex items-center justify-center shadow-xl overflow-hidden max-w-[340px] mx-auto">
            <div className="w-full h-full rounded-lg overflow-hidden flex items-center justify-center bg-slate-950/95 border border-white/5">
              <canvas id="gameBoard" className="w-full h-full touch-none block" aria-label="Tabuleiro 8 por 8"></canvas>
            </div>
          </section>

          <section className="grid grid-cols-3 gap-2 shrink-0 max-w-[340px] mx-auto w-full" id="shapesList" aria-label="Peças disponíveis"></section>
        </div>
        
        <div className="flex items-center justify-center gap-1.5 text-center mb-4 shrink-0">
          <Info className="w-3 h-3 text-white/30 shrink-0" />
          <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Modo de testes: arraste as peças para simular linhas.</p>
        </div>
      </div>

      <button 
        onClick={toggleSound} 
        className="absolute bottom-4 right-4 w-9 h-9 rounded-full flex items-center justify-center border border-white/10 bg-slate-900/90 backdrop-blur-md text-white shadow-xl z-[5000] active:scale-95 transition-transform"
        aria-label="Alternar som"
      >
        {isMutedState ? <VolumeX className="w-4 h-4 opacity-50" /> : <Volume2 className="w-4 h-4" />}
      </button>

      <div className={`modal-overlay fixed inset-0 ${showDemoWithdraw ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/95 backdrop-blur-md z-[4000]`}>
        <div className="modal-content w-full max-w-xs p-5 text-center border border-emerald-500/30 rounded-2xl bg-slate-900 shadow-2xl">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-lg font-black text-white uppercase tracking-wide mb-1">Você conquistou R$ {FINAL_PRIZE},00!</h2>
          <p className="text-white/70 text-xs mb-3">
            No jogo real você já teria colocado esse dinheiro no bolso!
          </p>
          <div className="p-2.5 bg-slate-950/60 rounded-xl border border-white/5 text-[10px] text-white/50 text-left mb-4">
            ⚠️ <span className="text-white font-semibold">Saldo Demonstrativo:</span> Como você está na versão de testes gratuita, este prêmio é apenas simulação. Deposite de verdade para resgatar PIX reais na sua conta bancária agora mesmo!
          </div>

          <Link href="/register" className="w-full h-10 rounded-lg font-bold text-xs bg-gradient-to-r from-[#35f59a] to-[#26d9ff] text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(38,217,255,0.3)] mb-2 uppercase tracking-wider">
            CRIAR CONTA REAL & FATURAR
          </Link>
          <button 
            onClick={() => setShowDemoWithdraw(false)} 
            className="w-full h-9 rounded-lg text-[11px] font-semibold border border-white/10 text-white/60 hover:text-white"
          >
            Continuar Testando
          </button>
        </div>
      </div>

      <div className={`modal-overlay fixed inset-0 ${showGameOver ? 'flex' : 'hidden'} items-center justify-center p-4 bg-black/90 backdrop-blur-md z-[3000]`} id="gameOverModal">
        <div className="modal-content w-full max-w-xs p-5 text-center border border-white/10 rounded-2xl bg-slate-900 shadow-2xl">
          <h2 className="text-lg font-black text-white uppercase tracking-wide mb-1">Fim de jogo</h2>
          <p className="text-white/60 text-xs mb-3">Não há mais espaço para encaixar as peças atuais.</p>
          
          <div className="my-3 p-2.5 rounded-xl bg-slate-950/60 border border-white/5 text-left text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-white/50">Linhas feitas:</span>
              <span className="font-bold text-white">{linesCompleted} / 4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Status da meta:</span>
              <span className={`font-bold ${isTargetAchieved ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isTargetAchieved ? 'Concluída' : 'Não atingida'}
              </span>
            </div>
          </div>

          <Link href="/register" className="w-full h-10 rounded-lg font-bold text-xs bg-gradient-to-r from-[#35f59a] to-[#26d9ff] text-slate-950 flex items-center justify-center shadow-[0_0_12px_rgba(52,245,154,0.4)] mb-2 uppercase tracking-wider">
            CRIAR CONTA REAL & JOGAR VALENDO
          </Link>

          <button 
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.location.reload();
              }
            }} 
            className="w-full h-10 rounded-lg font-bold text-xs bg-slate-800 text-white mb-2"
          >
            Tentar de Novo
          </button>
        </div>
      </div>
    </div>
  );
}
