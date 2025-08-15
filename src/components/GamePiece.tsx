import React from 'react';
import { Crown } from 'lucide-react';
import { Piece } from '../types/game';

interface GamePieceProps {
  piece: Piece;
  isSelected: boolean;
  isValidMove: boolean;
  onClick: () => void;
  className?: string;
}

export const GamePiece: React.FC<GamePieceProps> = ({
  piece,
  isSelected,
  isValidMove,
  onClick,
  className = ''
}) => {
  const baseClasses = `
    w-12 h-12 rounded-full cursor-pointer transition-all duration-300
    flex items-center justify-center relative
    hover:scale-110 active:scale-95 transform-gpu
    backdrop-blur-lg border-2
    shadow-[0_8px_32px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.2)]
    hover:shadow-[0_12px_40px_rgba(0,0,0,0.15),inset_0_2px_8px_rgba(255,255,255,0.3)]
  `;
  
  const colorClasses = piece.color === 'red' 
    ? `bg-gradient-to-br from-blue-400/60 via-blue-500/70 to-blue-600/80 
       border-blue-300/40 text-white
       hover:from-blue-300/70 hover:via-blue-400/80 hover:to-blue-500/90
       hover:border-blue-200/50`
    : `bg-gradient-to-br from-white/50 via-white/60 to-gray-100/70 
       border-white/60 text-gray-700
       hover:from-white/60 hover:via-white/70 hover:to-gray-50/80
       hover:border-white/70`;
  
  const selectedClasses = isSelected 
    ? `ring-2 ring-yellow-300/80 ring-offset-2 ring-offset-transparent 
       shadow-[0_0_25px_rgba(251,191,36,0.6)] scale-110
       border-yellow-300/60` 
    : '';
  
  const validMoveClasses = isValidMove 
    ? `ring-1 ring-emerald-300/60 ring-offset-1 ring-offset-transparent
       shadow-[0_0_15px_rgba(16,185,129,0.4)]` 
    : '';
  
  return (
    <div 
      className={`${baseClasses} ${colorClasses} ${selectedClasses} ${validMoveClasses} ${className}`}
      onClick={onClick}
    >
      {/* Inner glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent pointer-events-none" />
      
      {/* Aqua button highlight */}
      <div className="absolute top-1 left-1 right-1 h-2 rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
      
      {piece.type === 'king' && (
        <Crown 
          size={18} 
          className="text-yellow-300 drop-shadow-lg filter drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)] z-10 relative" 
        />
      )}
    </div>
  );
};