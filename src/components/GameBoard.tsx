import React from 'react';
import { GamePiece } from './GamePiece';
import { Board, Position } from '../types/game';
import { isDarkSquare } from '../utils/gameLogic';

interface GameBoardProps {
  board: Board;
  selectedPiece: Position | null;
  validMoves: Position[];
  onSquareClick: (row: number, col: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedPiece,
  validMoves,
  onSquareClick
}) => {
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some(move => move.row === row && move.col === col);
  };

  const isSelected = (row: number, col: number): boolean => {
    return selectedPiece?.row === row && selectedPiece?.col === col;
  };

  return (
    <div className="grid grid-cols-8 gap-1 p-4 bg-white/10 backdrop-blur-md rounded-3xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] border border-white/20">
      {board.map((row, rowIndex) =>
        row.map((piece, colIndex) => {
          const isValidMoveSquare = isValidMove(rowIndex, colIndex);
          const isSelectedSquare = isSelected(rowIndex, colIndex);
          const isDark = isDarkSquare(rowIndex, colIndex);
          
          const squareClasses = `
            w-16 h-16 flex items-center justify-center relative cursor-pointer rounded-lg
            transition-all duration-300 hover:scale-105
            ${isDark 
              ? 'bg-black/20 backdrop-blur-sm border border-white/10 shadow-inner' 
              : 'bg-white/30 backdrop-blur-sm border border-white/30 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3)]'
            }
            ${isValidMoveSquare ? 'ring-2 ring-emerald-300 ring-opacity-80 shadow-[0_0_20px_rgba(16,185,129,0.5)]' : ''}
            ${isSelectedSquare ? 'ring-2 ring-yellow-300 ring-opacity-90 shadow-[0_0_20px_rgba(251,191,36,0.6)]' : ''}
          `;

          return (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={squareClasses}
              onClick={() => onSquareClick(rowIndex, colIndex)}
            >
              {piece && (
                <GamePiece
                  piece={piece}
                  isSelected={isSelectedSquare}
                  isValidMove={isValidMoveSquare}
                  onClick={() => onSquareClick(rowIndex, colIndex)}
                />
              )}
              {isValidMoveSquare && !piece && (
                <div className="w-6 h-6 bg-emerald-300/60 backdrop-blur-sm rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.4)] border border-emerald-200/30" />
              )}
            </div>
          );
        })
      )}
    </div>
  );
};