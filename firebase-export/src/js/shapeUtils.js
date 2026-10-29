// Pure shape helpers (no game state)
export function getShapePivot(shape) {
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
