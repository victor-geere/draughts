import React, { useState, useCallback } from 'react';
import { GameBoard } from './components/GameBoard';
import { GameStatus } from './components/GameStatus';
import { GameState, Position, Move } from './types/game';
import { 
  createInitialBoard, 
  getValidMoves, 
  makeMove, 
  checkWinCondition,
  mustCaptureExists
} from './utils/gameLogic';

const initialGameState: GameState = {
  board: createInitialBoard(),
  currentPlayer: 'red',
  selectedPiece: null,
  validMoves: [],
  gameStatus: 'playing',
  moveHistory: [],
  captureInProgress: false,
  mustCaptureFrom: null
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  const resetGame = useCallback(() => {
    setGameState(initialGameState);
  }, []);

  const undoMove = useCallback(() => {
    if (gameState.moveHistory.length === 0) return;
    
    const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1];
    const newBoard = gameState.board.map(row => [...row]);
    
    // Move piece back
    const piece = newBoard[lastMove.to.row][lastMove.to.col];
    if (piece) {
      newBoard[lastMove.from.row][lastMove.from.col] = piece;
      newBoard[lastMove.to.row][lastMove.to.col] = null;
      
      // Restore captured pieces (simplified - in a full implementation, you'd need to store piece types)
      lastMove.capturedPieces.forEach(pos => {
        const opponentColor = gameState.currentPlayer === 'red' ? 'black' : 'red';
        newBoard[pos.row][pos.col] = { color: opponentColor, type: 'regular' };
      });
    }
    
    setGameState(prevState => ({
      ...prevState,
      board: newBoard,
      currentPlayer: prevState.currentPlayer === 'red' ? 'black' : 'red',
      selectedPiece: null,
      validMoves: [],
      moveHistory: prevState.moveHistory.slice(0, -1),
      captureInProgress: false,
      mustCaptureFrom: null,
      gameStatus: 'playing'
    }));
  }, [gameState.moveHistory, gameState.board, gameState.currentPlayer]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (gameState.gameStatus !== 'playing') return;

    const clickedPiece = gameState.board[row][col];
    const position: Position = { row, col };

    // If there's a forced capture in progress
    if (gameState.captureInProgress && gameState.mustCaptureFrom) {
      if (gameState.selectedPiece && 
          gameState.selectedPiece.row === gameState.mustCaptureFrom.row && 
          gameState.selectedPiece.col === gameState.mustCaptureFrom.col) {
        // Try to make the capture move
        const isValidMove = gameState.validMoves.some(move => move.row === row && move.col === col);
        if (isValidMove) {
          const { newBoard, capturedPieces, hasMoreCaptures } = makeMove(
            gameState.board, 
            gameState.selectedPiece, 
            position
          );

          const move: Move = {
            from: gameState.selectedPiece,
            to: position,
            capturedPieces
          };

          if (hasMoreCaptures) {
            // Continue capturing with the same piece
            setGameState(prevState => ({
              ...prevState,
              board: newBoard,
              selectedPiece: position,
              validMoves: getValidMoves(newBoard, position, true),
              moveHistory: [...prevState.moveHistory, move],
              mustCaptureFrom: position
            }));
          } else {
            // End turn
            const nextPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
            const newGameStatus = checkWinCondition(newBoard);
            
            setGameState(prevState => ({
              ...prevState,
              board: newBoard,
              currentPlayer: nextPlayer,
              selectedPiece: null,
              validMoves: [],
              gameStatus: newGameStatus,
              moveHistory: [...prevState.moveHistory, move],
              captureInProgress: false,
              mustCaptureFrom: null
            }));
          }
        }
      }
      return;
    }

    // Check if there are any forced captures for the current player
    const forcedCapture = mustCaptureExists(gameState.board, gameState.currentPlayer);
    
    if (clickedPiece && clickedPiece.color === gameState.currentPlayer) {
      // If there's a forced capture and this isn't the piece that must capture
      if (forcedCapture && (forcedCapture.row !== row || forcedCapture.col !== col)) {
        return; // Can only select the piece that must capture
      }
      
      // Select the piece
      const validMoves = getValidMoves(gameState.board, position, !!forcedCapture);
      setGameState(prevState => ({
        ...prevState,
        selectedPiece: position,
        validMoves: validMoves
      }));
    } else if (gameState.selectedPiece) {
      // Try to move to the clicked square
      const isValidMove = gameState.validMoves.some(move => move.row === row && move.col === col);
      
      if (isValidMove) {
        const { newBoard, capturedPieces, hasMoreCaptures } = makeMove(
          gameState.board, 
          gameState.selectedPiece, 
          position
        );

        const move: Move = {
          from: gameState.selectedPiece,
          to: position,
          capturedPieces
        };

        if (hasMoreCaptures && capturedPieces.length > 0) {
          // Continue capturing with the same piece
          setGameState(prevState => ({
            ...prevState,
            board: newBoard,
            selectedPiece: position,
            validMoves: getValidMoves(newBoard, position, true),
            moveHistory: [...prevState.moveHistory, move],
            captureInProgress: true,
            mustCaptureFrom: position
          }));
        } else {
          // End turn
          const nextPlayer = gameState.currentPlayer === 'red' ? 'black' : 'red';
          const newGameStatus = checkWinCondition(newBoard);
          
          setGameState(prevState => ({
            ...prevState,
            board: newBoard,
            currentPlayer: nextPlayer,
            selectedPiece: null,
            validMoves: [],
            gameStatus: newGameStatus,
            moveHistory: [...prevState.moveHistory, move],
            captureInProgress: false,
            mustCaptureFrom: null
          }));
        }
      } else {
        // Deselect if clicking on empty square or invalid move
        setGameState(prevState => ({
          ...prevState,
          selectedPiece: null,
          validMoves: []
        }));
      }
    }
  }, [gameState]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Draughts</h1>
          <p className="text-blue-100">Classic strategy game for two players</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
          <GameBoard
            board={gameState.board}
            selectedPiece={gameState.selectedPiece}
            validMoves={gameState.validMoves}
            onSquareClick={handleSquareClick}
          />
          
          <div className="w-full lg:w-80">
            <GameStatus
              currentPlayer={gameState.currentPlayer}
              gameStatus={gameState.gameStatus}
              onReset={resetGame}
              onUndo={undoMove}
              canUndo={gameState.moveHistory.length > 0}
            />
            
            <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/20 p-6">
              <h3 className="font-bold text-white mb-3 text-lg">How to Play</h3>
              <ul className="text-sm text-blue-100 space-y-2">
                <li>• Move diagonally on dark squares only</li>
                <li>• Jump over opponent pieces to capture them</li>
                <li>• Must capture when possible</li>
                <li>• Reach the opposite end to become a King</li>
                <li>• Kings can move in all diagonal directions</li>
                <li>• Win by capturing all opponent pieces</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;