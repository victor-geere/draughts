import { Board, Piece, Position, PlayerColor, PieceType, Move } from '../types/game';

export const createInitialBoard = (): Board => {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // Place black pieces (top 3 rows)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', type: 'regular' };
      }
    }
  }
  
  // Place red pieces (bottom 3 rows)
  for (let row = 5; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', type: 'regular' };
      }
    }
  }
  
  return board;
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < 8 && col >= 0 && col < 8;
};

export const isDarkSquare = (row: number, col: number): boolean => {
  return (row + col) % 2 === 1;
};

export const getValidMoves = (
  board: Board, 
  position: Position, 
  mustCapture: boolean = false
): Position[] => {
  const piece = board[position.row][position.col];
  if (!piece) return [];
  
  const captures = getCaptureMovesFromPosition(board, position);
  
  if (mustCapture || captures.length > 0) {
    return captures;
  }
  
  return getRegularMovesFromPosition(board, position);
};

const getRegularMovesFromPosition = (board: Board, position: Position): Position[] => {
  const piece = board[position.row][position.col];
  if (!piece) return [];
  
  const moves: Position[] = [];
  const directions = getMovementDirections(piece);
  
  for (const [dRow, dCol] of directions) {
    const newRow = position.row + dRow;
    const newCol = position.col + dCol;
    
    if (isValidPosition(newRow, newCol) && 
        isDarkSquare(newRow, newCol) && 
        !board[newRow][newCol]) {
      moves.push({ row: newRow, col: newCol });
    }
  }
  
  return moves;
};

const getCaptureMovesFromPosition = (board: Board, position: Position): Position[] => {
  const piece = board[position.row][position.col];
  if (!piece) return [];
  
  const captures: Position[] = [];
  const directions = getMovementDirections(piece);
  
  for (const [dRow, dCol] of directions) {
    const jumpRow = position.row + dRow * 2;
    const jumpCol = position.col + dCol * 2;
    const captureRow = position.row + dRow;
    const captureCol = position.col + dCol;
    
    if (isValidPosition(jumpRow, jumpCol) && 
        isDarkSquare(jumpRow, jumpCol) &&
        !board[jumpRow][jumpCol] &&
        board[captureRow][captureCol] &&
        board[captureRow][captureCol]!.color !== piece.color) {
      captures.push({ row: jumpRow, col: jumpCol });
    }
  }
  
  return captures;
};

const getMovementDirections = (piece: Piece): number[][] => {
  if (piece.type === 'king') {
    return [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  } else {
    return piece.color === 'red' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
  }
};

export const makeMove = (
  board: Board, 
  from: Position, 
  to: Position
): { newBoard: Board; capturedPieces: Position[]; hasMoreCaptures: boolean } => {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (!piece) {
    return { newBoard: board, capturedPieces: [], hasMoreCaptures: false };
  }
  
  // Move piece
  newBoard[to.row][to.col] = piece;
  newBoard[from.row][from.col] = null;
  
  const capturedPieces: Position[] = [];
  
  // Check if this is a capture move
  const rowDiff = Math.abs(to.row - from.row);
  if (rowDiff === 2) {
    const captureRow = (from.row + to.row) / 2;
    const captureCol = (from.col + to.col) / 2;
    capturedPieces.push({ row: captureRow, col: captureCol });
    newBoard[captureRow][captureCol] = null;
  }
  
  // Promote to king if reached opposite end
  if ((piece.color === 'red' && to.row === 0) || 
      (piece.color === 'black' && to.row === 7)) {
    newBoard[to.row][to.col] = { ...piece, type: 'king' };
  }
  
  // Check for additional captures
  const hasMoreCaptures = getCaptureMovesFromPosition(newBoard, to).length > 0;
  
  return { newBoard, capturedPieces, hasMoreCaptures };
};

export const hasAnyValidMoves = (board: Board, player: PlayerColor): boolean => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === player) {
        const moves = getValidMoves(board, { row, col });
        if (moves.length > 0) {
          return true;
        }
      }
    }
  }
  return false;
};

export const checkWinCondition = (board: Board): 'red-wins' | 'black-wins' | 'draw' | 'playing' => {
  const redPieces = countPieces(board, 'red');
  const blackPieces = countPieces(board, 'black');
  
  if (redPieces === 0) return 'black-wins';
  if (blackPieces === 0) return 'red-wins';
  
  const redHasMoves = hasAnyValidMoves(board, 'red');
  const blackHasMoves = hasAnyValidMoves(board, 'black');
  
  if (!redHasMoves && !blackHasMoves) return 'draw';
  if (!redHasMoves) return 'black-wins';
  if (!blackHasMoves) return 'red-wins';
  
  return 'playing';
};

const countPieces = (board: Board, color: PlayerColor): number => {
  let count = 0;
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (board[row][col]?.color === color) {
        count++;
      }
    }
  }
  return count;
};

export const mustCaptureExists = (board: Board, player: PlayerColor): Position | null => {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece && piece.color === player) {
        const captures = getCaptureMovesFromPosition(board, { row, col });
        if (captures.length > 0) {
          return { row, col };
        }
      }
    }
  }
  return null;
};