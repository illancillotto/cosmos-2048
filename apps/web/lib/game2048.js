const BOARD_SIZE = 4;

export const createBoard = () => {
  return Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
};

export const spawnRandomTile = (board) => {
  const emptyCells = [];
  
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) {
        emptyCells.push({ row, col });
      }
    }
  }
  
  if (emptyCells.length === 0) {
    return board;
  }
  
  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
  const newValue = Math.random() < 0.9 ? 2 : 4;
  
  const newBoard = board.map(row => [...row]);
  newBoard[randomCell.row][randomCell.col] = newValue;
  
  return newBoard;
};

const moveLeft = (row, rowIndex) => {
  const filtered = row.filter(val => val !== 0);
  const merged = [];
  const mergePositions = [];
  let gained = 0;
  let i = 0;
  let targetIndex = 0;
  
  while (i < filtered.length) {
    if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
      const mergedValue = filtered[i] * 2;
      merged.push(mergedValue);
      mergePositions.push({ 
        row: rowIndex, 
        col: targetIndex, 
        value: mergedValue, 
        oldValue: filtered[i] 
      });
      gained += mergedValue;
      i += 2;
    } else {
      merged.push(filtered[i]);
      i += 1;
    }
    targetIndex++;
  }
  
  while (merged.length < BOARD_SIZE) {
    merged.push(0);
  }
  
  return { row: merged, gained, mergePositions };
};

const moveRight = (row, rowIndex) => {
  const reversed = [...row].reverse();
  const { row: moved, gained, mergePositions } = moveLeft(reversed, rowIndex);
  // Adjust column positions for right movement
  const adjustedMergePositions = mergePositions.map(pos => ({
    ...pos,
    col: BOARD_SIZE - 1 - pos.col
  }));
  return { row: moved.reverse(), gained, mergePositions: adjustedMergePositions };
};

const transposeBoard = (board) => {
  return board[0].map((_, colIndex) => board.map(row => row[colIndex]));
};

export const move = (board, direction) => {
  let newBoard;
  let totalGained = 0;
  let moved = false;
  let allMergePositions = [];
  
  switch (direction) {
    case 'left':
      newBoard = board.map((row, rowIndex) => {
        const { row: newRow, gained, mergePositions } = moveLeft(row, rowIndex);
        totalGained += gained;
        allMergePositions.push(...mergePositions);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) {
          moved = true;
        }
        return newRow;
      });
      break;
      
    case 'right':
      newBoard = board.map((row, rowIndex) => {
        const { row: newRow, gained, mergePositions } = moveRight(row, rowIndex);
        totalGained += gained;
        allMergePositions.push(...mergePositions);
        if (JSON.stringify(row) !== JSON.stringify(newRow)) {
          moved = true;
        }
        return newRow;
      });
      break;
      
    case 'up':
      const transposed = transposeBoard(board);
      const upResult = transposed.map((row, rowIndex) => {
        const { row: newRow, gained, mergePositions } = moveLeft(row, rowIndex);
        totalGained += gained;
        // Transform positions back from transposed coordinates
        const transformedPositions = mergePositions.map(pos => ({
          ...pos,
          row: pos.col,
          col: pos.row
        }));
        allMergePositions.push(...transformedPositions);
        return newRow;
      });
      newBoard = transposeBoard(upResult);
      moved = JSON.stringify(board) !== JSON.stringify(newBoard);
      break;
      
    case 'down':
      const transposedDown = transposeBoard(board);
      const downResult = transposedDown.map((row, rowIndex) => {
        const { row: newRow, gained, mergePositions } = moveRight(row, rowIndex);
        totalGained += gained;
        // Transform positions back from transposed coordinates
        const transformedPositions = mergePositions.map(pos => ({
          ...pos,
          row: pos.col,
          col: pos.row
        }));
        allMergePositions.push(...transformedPositions);
        return newRow;
      });
      newBoard = transposeBoard(downResult);
      moved = JSON.stringify(board) !== JSON.stringify(newBoard);
      break;
      
    default:
      return { board, moved: false, gained: 0, mergePositions: [] };
  }
  
  return { board: newBoard, moved, gained: totalGained, mergePositions: allMergePositions };
};

export const canMove = (board) => {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 0) {
        return true;
      }
      
      const current = board[row][col];
      
      if ((row > 0 && board[row - 1][col] === current) ||
          (row < BOARD_SIZE - 1 && board[row + 1][col] === current) ||
          (col > 0 && board[row][col - 1] === current) ||
          (col < BOARD_SIZE - 1 && board[row][col + 1] === current)) {
        return true;
      }
    }
  }
  
  return false;
};

export const hasWon = (board) => {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === 2048) {
        return true;
      }
    }
  }
  return false;
};

export const initializeGame = () => {
  let board = createBoard();
  board = spawnRandomTile(board);
  board = spawnRandomTile(board);
  return board;
};