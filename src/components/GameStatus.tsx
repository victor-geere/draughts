import React from 'react';
import { RotateCcw, Trophy, Users } from 'lucide-react';
import { PlayerColor } from '../types/game';

interface GameStatusProps {
  currentPlayer: PlayerColor;
  gameStatus: 'playing' | 'red-wins' | 'black-wins' | 'draw';
  onReset: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  currentPlayer,
  gameStatus,
  onReset,
  onUndo,
  canUndo
}) => {
  const getStatusMessage = () => {
    switch (gameStatus) {
      case 'red-wins':
        return { message: 'Blue Player Wins!', color: 'text-blue-300' };
      case 'black-wins':
        return { message: 'White Player Wins!', color: 'text-white' };
      case 'draw':
        return { message: 'Game is a Draw!', color: 'text-yellow-300' };
      default:
        return { 
          message: `${currentPlayer === 'red' ? 'Blue' : 'White'} Player's Turn`, 
          color: currentPlayer === 'red' ? 'text-blue-300' : 'text-white'
        };
    }
  };

  const { message, color } = getStatusMessage();
  const isGameOver = gameStatus !== 'playing';

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/20 p-6 text-center space-y-4">
      <div className="flex items-center justify-center space-x-2">
        {isGameOver ? <Trophy className="text-yellow-300 drop-shadow-lg" size={24} /> : <Users className="text-blue-200 drop-shadow-lg" size={24} />}
        <h2 className={`text-2xl font-bold ${color}`}>
          {message}
        </h2>
      </div>
      
      <div className="flex justify-center space-x-4">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)] border border-white/30 hover:shadow-[0_4px_20px_rgba(255,255,255,0.1)] hover:scale-105"
        >
          <RotateCcw size={16} />
          <span>New Game</span>
        </button>
        
        {canUndo && !isGameOver && (
          <button
            onClick={onUndo}
            className="flex items-center space-x-2 px-6 py-3 bg-black/20 backdrop-blur-sm text-white rounded-xl hover:bg-black/30 transition-all duration-300 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/20 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] hover:scale-105"
          >
            <RotateCcw size={16} />
            <span>Undo Move</span>
          </button>
        )}
      </div>
      
      {!isGameOver && (
        <div className="text-sm text-blue-100">
          Click a piece to select it, then click a highlighted square to move.
        </div>
      )}
    </div>
  );
};