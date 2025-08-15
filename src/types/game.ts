export type PieceType = 'regular' | 'king';
export type PlayerColor = 'red' | 'black';

export interface Piece {
  color: PlayerColor;
  type: PieceType;
}

export interface Position {
  row: number;
  col: number;
}

export interface Move {
  from: Position;
  to: Position;
  capturedPieces: Position[];
}

export type Board = (Piece | null)[][];

export interface GameState {
  board: Board;
  currentPlayer: PlayerColor;
  selectedPiece: Position | null;
  validMoves: Position[];
  gameStatus: 'playing' | 'red-wins' | 'black-wins' | 'draw';
  moveHistory: Move[];
  captureInProgress: boolean;
  mustCaptureFrom: Position | null;
}