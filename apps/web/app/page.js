'use client';

import { useState, useEffect, useCallback } from 'react';
import HUD from '../components/HUD';
import Leaderboard from '../components/Leaderboard';
import BadgeGallery from '../components/BadgeGallery';
import TokenLegend from '../components/TokenLegend';
import GameOverModal from '../components/GameOverModal';
import { initializeGame, move, canMove, hasWon, spawnRandomTile } from '../lib/game2048';
import { getTileData, getTileAnimationClass } from '../lib/cosmosMap';
import { WalletProvider } from '../contexts/WalletContext';

function GameComponent() {
  const [board, setBoard] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [maxTileReached, setMaxTileReached] = useState(2);
  
  // Touch handling for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  
  // Animation states
  const [newTilePosition, setNewTilePosition] = useState(null);
  const [mergedPositions, setMergedPositions] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBest = localStorage.getItem('cosmos2048_best');
      if (savedBest) {
        setBest(parseInt(savedBest, 10));
      }
    }
    
    newGame();
  }, []);

  useEffect(() => {
    if (score > best) {
      setBest(score);
      if (typeof window !== 'undefined') {
        localStorage.setItem('cosmos2048_best', score.toString());
      }
    }
  }, [score, best]);

  const newGame = () => {
    const initialBoard = initializeGame();
    setBoard(initialBoard);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setShowGameOverModal(false);
    setMaxTileReached(2);
  };

  // Track max tile reached
  const updateMaxTile = (board) => {
    let maxTile = 0;
    board.forEach(row => {
      row.forEach(cell => {
        if (cell > maxTile) {
          maxTile = cell;
        }
      });
    });
    if (maxTile > maxTileReached) {
      setMaxTileReached(maxTile);
    }
    return maxTile;
  };

  const handleMove = useCallback((direction) => {
    if (!board || gameOver || won || showGameOverModal) return;

    const result = move(board, direction);
    
    if (result.moved) {
      let newBoard = spawnRandomTile(result.board);
      setBoard(newBoard);
      setScore(prevScore => prevScore + result.gained);
      
      // Update max tile reached
      updateMaxTile(newBoard);
      
      if (hasWon(newBoard) && !won) {
        setWon(true);
        setTimeout(() => setShowGameOverModal(true), 500);
      }
      
      if (!canMove(newBoard)) {
        setGameOver(true);
        setTimeout(() => setShowGameOverModal(true), 500);
      }
    }
  }, [board, gameOver, won, showGameOverModal, maxTileReached]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
          e.preventDefault();
          handleMove('right');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMove]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const deltaX = touchStart.x - touchEnd.x;
    const deltaY = touchStart.y - touchEnd.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          handleMove('left');
        } else {
          handleMove('right');
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          handleMove('up');
        } else {
          handleMove('down');
        }
      }
    }
  };

  const handleSubmitScore = async () => {
    if (score === 0 || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      // For now, just show success message
      // In production, you would submit to backend with wallet signature
      alert('Score submitted successfully! 🎉');
    } catch (error) {
      console.error('Submit score error:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTileStyle = (value, rowIndex, colIndex) => {
    const tileData = getTileData(value);
    const animationClass = getTileAnimationClass(value);
    const glowClass = tileData.glow || 'shadow-gray-500/50';
    const specialGlow = tileData.special ? 'shadow-2xl' : 'shadow-xl';
    
    // Check if this position just had a new tile spawned
    const isNewTile = newTilePosition && 
                      newTilePosition.row === rowIndex && 
                      newTilePosition.col === colIndex;
    
    // Check if this position just had a merge
    const isMerged = mergedPositions.some(pos => 
                     pos.row === rowIndex && pos.col === colIndex);
    
    const spawnAnimation = isNewTile ? 'animate-tile-spawn' : '';
    const mergeAnimation = isMerged ? 'animate-tile-merge' : '';
    
    const baseClasses = `game-tile aspect-square w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 xl:w-32 xl:h-32 rounded-xl flex items-center justify-center font-bold text-white ${specialGlow} ${glowClass} cursor-pointer transition-all duration-300 transform hover:scale-110 hover:rotate-1 border border-white/20 ${animationClass} ${spawnAnimation} ${mergeAnimation}`;
    
    if (value === 0) {
      return `${baseClasses} bg-gray-900/20 backdrop-blur-md border-gray-500/30`;
    }
    
    return `${baseClasses} text-sm sm:text-base lg:text-lg xl:text-xl text-shadow-lg`;
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-2 sm:p-4 font-cosmic relative">
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Mobile-first responsive layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 lg:gap-8">
          {/* Game Panel - Full width on mobile, spans 2 cols on desktop */}
          <div className="xl:col-span-2 glass rounded-2xl shadow-2xl p-3 sm:p-6 border border-white/20">
            <HUD
              score={score}
              best={best}
              gameOver={gameOver}
              won={won}
              onNewGame={newGame}
              onSubmitScore={handleSubmitScore}
              isSubmitting={isSubmitting}
            />

            {/* Responsive game board */}
            <div className="flex justify-center mt-6">
              <div 
                className="game-board bg-gradient-to-br from-gray-800/20 to-gray-900/30 backdrop-blur-sm p-3 sm:p-4 md:p-6 rounded-2xl shadow-2xl border border-white/10 touch-none max-w-fit"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="grid grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const tileData = getTileData(cell);
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getTileStyle(cell, rowIndex, colIndex)}
                        style={{
                          background: cell === 0 ? '#D1D5DB' : tileData.gradient || tileData.color,
                          color: cell === 0 ? '#6B7280' : 'white'
                        }}
                      >
                        {cell === 0 ? '' : (
                          <div className="text-center flex flex-col items-center justify-center h-full space-y-1">
                            <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl drop-shadow-lg">
                              {tileData.emoji}
                            </div>
                            <div className="text-xs sm:text-sm md:text-base font-extrabold tracking-wide drop-shadow-md">
                              {tileData.name}
                            </div>
                            <div className="text-xs opacity-80 font-medium">
                              {cell}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            </div>

            {/* Game instructions - responsive text */}
            <div className="mt-6 text-center text-gray-600 text-xs sm:text-sm space-y-1">
              <p>🎮 <span className="hidden sm:inline">Use arrow keys to move tiles</span><span className="sm:hidden">Swipe or use arrow keys</span></p>
              <p>🌌 Reach <strong>2048</strong> to win the Cosmos!</p>
              <p>🎰 Connect Keplr wallet for NFT rewards!</p>
            </div>

            {/* Token Legend - Mobile */}
            <div className="mt-6 xl:hidden">
              <TokenLegend />
            </div>
          </div>

          {/* Side panels - Stack on mobile, side by side on desktop */}
          <div className="space-y-4 lg:space-y-8">
            <Leaderboard />
            <BadgeGallery />
            {/* Token Legend - Desktop */}
            <div className="hidden xl:block">
              <TokenLegend />
            </div>
          </div>
        </div>
      </div>

      {/* Game Over Modal with Wheel of Fortune */}
      <GameOverModal
        isOpen={showGameOverModal}
        onClose={() => setShowGameOverModal(false)}
        score={score}
        maxTile={maxTileReached}
        won={won}
        onNewGame={() => {
          setShowGameOverModal(false);
          newGame();
        }}
        onSubmitScore={handleSubmitScore}
      />
    </div>
  );
}

export default function HomePage() {
  return (
    <WalletProvider>
      <GameComponent />
    </WalletProvider>
  );
}