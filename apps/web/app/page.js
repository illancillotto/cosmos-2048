'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    setNewTilePosition(null);
    setMergedPositions([]);
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

    // Prevent body scroll when touching game board area
    const preventBodyScroll = (e) => {
      const gameBoard = e.target.closest('.game-board');
      if (gameBoard) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    // Add passive: false to ensure preventDefault works
    document.addEventListener('touchstart', preventBodyScroll, { passive: false });
    document.addEventListener('touchmove', preventBodyScroll, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      document.removeEventListener('touchstart', preventBodyScroll);
      document.removeEventListener('touchmove', preventBodyScroll);
    };
  }, [handleMove]);

  // Touch handling for mobile - Fixed scroll interference
  const handleTouchStart = (e) => {
    // Prevent page scrolling when touching the game board
    e.preventDefault();
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    // Prevent page scrolling during game moves
    e.preventDefault();
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = (e) => {
    // Prevent default touch behavior
    e.preventDefault();
    
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    // Increased threshold for more reliable swipe detection
    const minSwipeDistance = 30;
    
    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) > minSwipeDistance) {
        if (distanceX > 0) {
          handleMove('left');
        } else {
          handleMove('right');
        }
      }
    } else {
      if (Math.abs(distanceY) > minSwipeDistance) {
        if (distanceY > 0) {
          handleMove('up');
        } else {
          handleMove('down');
        }
      }
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleSubmitScore = async () => {
    if (score === 0) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          score,
          maxTile: maxTileReached,
          gameData: {
            address: 'guest',
            timestamp: new Date().toISOString()
          }
        }),
      });
      
      if (response.ok) {
        console.log('Score submitted successfully');
      } else {
        console.error('Failed to submit score');
      }
    } catch (error) {
      console.error('Error submitting score:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div 
          className="text-4xl font-bold text-white"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          Loading Cosmos 2048...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-x-hidden">
      {/* Enhanced Background Effects - Mobile Optimized */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30 sm:opacity-50" />
      
      <div className="relative z-10 container mx-auto px-2 sm:px-4 py-4 sm:py-6 lg:py-8">
        <HUD 
          score={score}
          best={best}
          gameOver={gameOver}
          won={won}
          onNewGame={newGame}
          onSubmitScore={handleSubmitScore}
          isSubmitting={isSubmitting}
        />

        {/* Enhanced Game Board - Mobile Optimized */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Main Game Area - Full width on mobile */}
          <div className="w-full lg:flex-1 lg:max-w-4xl">
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-2xl lg:rounded-3xl p-4 lg:p-8 border border-white/20 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-4 lg:mb-8">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 lg:mb-3 text-glow-purple">Cosmos 2048</h2>
                <p className="text-white/70 text-sm sm:text-base lg:text-lg">
                  <span className="block sm:hidden">👆 Swipe to move tiles</span>
                  <span className="hidden sm:block">Swipe or use arrow keys to play</span>
                </p>
              </div>
              
              <div 
                className="game-board bg-white/20 backdrop-blur-sm rounded-2xl lg:rounded-3xl p-3 sm:p-4 lg:p-6 mx-auto w-full max-w-[90vw] sm:max-w-md lg:max-w-2xl"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="grid grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
                  {board.map((row, rowIndex) =>
                    row.map((cell, colIndex) => {
                      const tileData = getTileData(cell);
                      const isNew = newTilePosition && 
                        newTilePosition.row === rowIndex && 
                        newTilePosition.col === colIndex;
                      const isMerged = mergedPositions.some(pos => 
                        pos.row === rowIndex && pos.col === colIndex
                      );
                      
                      return (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          className={`game-tile aspect-square w-full rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base lg:text-xl relative overflow-hidden ${
                            cell === 0 ? 'bg-white/20' : 'shadow-lg'
                          }`}
                          style={{
                            background: cell === 0 ? 'rgba(255, 255, 255, 0.2)' : tileData.gradient || tileData.color,
                            border: cell === 0 ? '2px solid rgba(255, 255, 255, 0.3)' : 'none'
                          }}
                          initial={isNew ? { scale: 0, rotate: 180 } : { scale: 1 }}
                          animate={isNew ? { scale: 1, rotate: 0 } : { scale: 1 }}
                          transition={{ 
                            duration: isNew ? 0.3 : 0.15,
                            type: isNew ? "spring" : "easeOut"
                          }}
                          whileHover={cell !== 0 ? { scale: 1.08, rotate: 2 } : {}}
                        >
                          {cell !== 0 && (
                            <>
                              <div className="relative z-10 flex flex-col items-center justify-center">
                                <div className="text-lg sm:text-2xl md:text-3xl lg:text-5xl mb-1">{tileData.emoji}</div>
                                <div className="text-xs sm:text-sm md:text-base lg:text-lg opacity-90 font-semibold">{cell}</div>
                              </div>
                              
                              {/* Enhanced glow effect for high-value tiles */}
                              {cell >= 512 && (
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-xl sm:rounded-2xl lg:rounded-3xl animate-pulse" />
                              )}
                              
                              {/* Shimmer effect for special tiles */}
                              {cell >= 1024 && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer" />
                              )}
                            </>
                          )}
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
              
              {/* Game Status - Mobile Optimized */}
              <AnimatePresence>
                {(gameOver || won) && (
                  <motion.div 
                    className={`mt-3 sm:mt-4 lg:mt-6 p-3 sm:p-4 rounded-xl lg:rounded-2xl text-center font-bold text-sm sm:text-base lg:text-lg ${
                      won 
                        ? 'bg-gradient-to-r from-green-400/20 to-emerald-400/20 text-green-100 border border-green-400/30' 
                        : 'bg-gradient-to-r from-red-400/20 to-pink-400/20 text-red-100 border border-red-400/30'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {won ? '🎉 You reached 2048! You won!' : '💀 Game Over! No more moves available.'}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
            
            {/* Token Legend directly after game - Mobile Spacing */}
            <motion.div 
              className="mt-4 lg:mt-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <TokenLegend />
            </motion.div>
          </div>

          {/* Sidebar Components - Mobile stacked, desktop sidebar */}
          <div className="w-full lg:w-96 space-y-4 lg:space-y-6">
            <BadgeGallery />
            <Leaderboard />
          </div>
        </motion.div>
      </div>

      {/* Enhanced Game Over Modal */}
      <AnimatePresence>
        {showGameOverModal && (
          <GameOverModal
            isOpen={showGameOverModal}
            score={score}
            maxTile={maxTileReached}
            won={won}
            onClose={() => setShowGameOverModal(false)}
            onNewGame={newGame}
            onSubmitScore={handleSubmitScore}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default function GamePage() {
  return (
    <WalletProvider>
      <GameComponent />
    </WalletProvider>
  );
}