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

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleMove]);

  // Touch handling for mobile
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    setTouchEnd({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY
    });
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distanceX = touchStart.x - touchEnd.x;
    const distanceY = touchStart.y - touchEnd.y;
    const isHorizontalSwipe = Math.abs(distanceX) > Math.abs(distanceY);
    
    if (isHorizontalSwipe) {
      if (Math.abs(distanceX) > 50) {
        if (distanceX > 0) {
          handleMove('left');
        } else {
          handleMove('right');
        }
      }
    } else {
      if (Math.abs(distanceY) > 50) {
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <HUD 
          score={score}
          best={best}
          gameOver={gameOver}
          won={won}
          onNewGame={newGame}
          onSubmitScore={handleSubmitScore}
          isSubmitting={isSubmitting}
        />

        {/* Enhanced Game Board */}
        <motion.div 
          className="flex flex-col lg:flex-row gap-8 items-center justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          {/* Main Game Area */}
          <div className="flex-1 max-w-5xl mx-auto">
            <motion.div 
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-10 border border-white/20 shadow-2xl"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <div className="text-center mb-10">
                <h2 className="text-5xl font-bold text-white mb-4 text-glow-purple">Cosmos 2048</h2>
                <p className="text-white/70 text-xl">Swipe or use arrow keys to play</p>
              </div>
              
              <div 
                className="game-board bg-white/20 backdrop-blur-sm rounded-3xl p-8 mx-auto max-w-3xl"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="grid grid-cols-4 gap-5">
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
                          className={`game-tile w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-3xl flex items-center justify-center text-white font-bold text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl relative overflow-hidden ${
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
                              <div className="relative z-10">
                                <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl mb-3">{tileData.emoji}</div>
                                <div className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl opacity-90 font-semibold">{cell}</div>
                              </div>
                              
                              {/* Enhanced glow effect for high-value tiles */}
                              {cell >= 512 && (
                                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/30 to-orange-400/30 rounded-3xl animate-pulse" />
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
              
              {/* Simple Token Legend for Mobile */}
              <div className="mt-8 lg:hidden">
                <motion.div 
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <h3 className="text-xl font-bold text-white mb-4 text-center">🎯 Token Legend</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { value: 2, emoji: '⚛️', name: 'ATOM' },
                      { value: 4, emoji: '🧪', name: 'OSMO' },
                      { value: 8, emoji: '🌀', name: 'JUNO' },
                      { value: 16, emoji: '⭐', name: 'STARS' },
                      { value: 32, emoji: '🔐', name: 'SCRT' },
                      { value: 64, emoji: '🚀', name: 'EVMOS' },
                      { value: 128, emoji: '☁️', name: 'AKT' },
                      { value: 256, emoji: '🌱', name: 'REGEN' }
                    ].map((token) => (
                      <div 
                        key={token.value}
                        className="flex flex-col items-center p-3 bg-white/20 rounded-xl border border-white/30"
                      >
                        <div className="text-2xl mb-1">{token.emoji}</div>
                        <div className="text-sm font-semibold text-white">{token.value}</div>
                        <div className="text-xs text-white/70 text-center">{token.name}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <p className="text-sm text-white/60">
                      💎 Higher values unlock rare tokens and NFT badges!
                    </p>
                  </div>
                </motion.div>
              </div>
              
              {/* Game Status */}
              <AnimatePresence>
                {(gameOver || won) && (
                  <motion.div 
                    className={`mt-6 p-4 rounded-2xl text-center font-bold text-lg ${
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
          </div>

          {/* Sidebar Components */}
          <div className="w-full lg:w-80 space-y-6">
            <TokenLegend />
            <BadgeGallery />
            <Leaderboard />
          </div>
        </motion.div>
      </div>

      {/* Enhanced Game Over Modal */}
      <AnimatePresence>
        {showGameOverModal && (
          <GameOverModal
            score={score}
            maxTile={maxTileReached}
            won={won}
            onClose={() => setShowGameOverModal(false)}
            onNewGame={newGame}
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