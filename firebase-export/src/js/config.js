// Game configuration constants
export const BOARD_SIZE = 8;

// Piece preview sizing: the largest side of a piece preview renders at
// approx. PREVIEW_MAX_SIZE px, while PREVIEW_CELL_SIZE is the minimum cell size.
export const PREVIEW_CELL_SIZE = 20;
export const PREVIEW_MAX_SIZE = 76;

// Piece slots shown under the board
export const PIECE_SLOTS = 3;

// Stake values shown in the header cards (BRL)
export const BET_AMOUNT = 10;
export const MAX_WIN_AMOUNT = 50;

// Display-only score -> BRL conversion used by the prize meter
// (100 points = R$ 1,00). It never changes gameplay scoring.
export const SCORE_TO_BRL_DIVISOR = 100;

// Chance of 5-block shapes per difficulty (0–1)
export const FIVE_BLOCK_RATE = {
    easy: 0,
    normal: 0.05,
    hard: 0.1
};

// Shape definitions with complexity tier (0=simplest, 4=most complex)
// Complexity based on block count: 1→0, 2→1, 3→2, 4→3, 5+→4
export const SHAPE_DEFINITIONS = [
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
    { matrix: [[1, 1, 1], [0, 0, 1]], complexity: 3 },
    // Additional 5-block shapes
    { matrix: [[0, 1, 0], [1, 1, 1], [0, 1, 0]], complexity: 4 },
    { matrix: [[1, 0, 1], [1, 1, 1]], complexity: 4 },
    { matrix: [[1, 1, 1], [1, 0, 1]], complexity: 4 },
    { matrix: [[1, 1, 0], [0, 1, 1], [0, 1, 0]], complexity: 4 },
    { matrix: [[0, 1, 1], [1, 1, 0], [0, 1, 0]], complexity: 4 },
    { matrix: [[1, 1], [1, 1], [1, 0]], complexity: 4 },
    { matrix: [[1, 1], [1, 1], [0, 1]], complexity: 4 },
    { matrix: [[1, 0, 0], [1, 1, 0], [0, 1, 1]], complexity: 4 },
    { matrix: [[0, 0, 1], [0, 1, 1], [1, 1, 0]], complexity: 4 },
    { matrix: [[1, 1, 1, 1], [0, 0, 1, 0]], complexity: 4 },
    { matrix: [[0, 0, 1, 0], [1, 1, 1, 1]], complexity: 4 },
    { matrix: [[0, 1, 1], [1, 1, 0], [1, 0, 0]], complexity: 4 },
    { matrix: [[1, 1, 0], [0, 1, 1], [0, 0, 1]], complexity: 4 },
    { matrix: [[1, 1, 1], [1, 0, 0], [1, 1, 1]], complexity: 4 },
    { matrix: [[1, 1, 1], [0, 0, 1], [1, 1, 1]], complexity: 4 },
    { matrix: [[1, 1, 1, 1], [0, 0, 0, 1]], complexity: 4 },
    { matrix: [[1, 1, 1, 1], [1, 0, 0, 0]], complexity: 4 },
    { matrix: [[1, 0, 0, 0], [1, 1, 1, 1]], complexity: 4 },
    { matrix: [[0, 0, 0, 1], [1, 1, 1, 1]], complexity: 4 }
];
