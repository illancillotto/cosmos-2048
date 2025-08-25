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
  
  // Enhanced Animation states
  const [newTilePosition, setNewTilePosition] = useState(null);
  const [mergedPositions, setMergedPositions] = useState([]);
  const [animatingTiles, setAnimatingTiles] = useState(new Set());
  const [particleEffects, setParticleEffects] = useState([]);
  const [glowingTiles, setGlowingTiles] = useState(new Set());
  
  // Dramatic effect states
  const [screenShake, setScreenShake] = useState('');
  const [flashBurst, setFlashBurst] = useState([]);
  const [rippleEffects, setRippleEffects] = useState([]);
  const [comboEffects, setComboEffects] = useState([]);
  const [explosionParticles, setExplosionParticles] = useState([]);

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

  // Animation helpers
  const getAnimationType = (value) => {
    if (value >= 4096) return 'explosive';  // Explosive effect for 4096+
    if (value >= 2048) return 'legendary';  // Rainbow effect for 2048+
    if (value >= 512) return 'cosmic';      // Cosmic effect for 512-1024
    if (value >= 64) return 'merge';        // Standard merge for 64-256
    return 'basic';                         // Basic animation for 2-32
  };

  const getAnimationClass = (animationType) => {
    switch (animationType) {
      case 'explosive': return 'animate-tile-merge-explosive';
      case 'legendary': return 'animate-tile-merge-legendary';
      case 'cosmic': return 'animate-tile-merge-cosmic';
      case 'merge': return 'animate-tile-merge';
      default: return 'animate-tile-merge';
    }
  };

  const triggerParticleEffect = (position, value) => {
    const particleId = `${position.row}-${position.col}-${Date.now()}`;
    const newParticle = {
      id: particleId,
      position,
      value,
      type: getAnimationType(value)
    };
    
    setParticleEffects(prev => [...prev, newParticle]);
    
    // Remove particle after animation
    setTimeout(() => {
      setParticleEffects(prev => prev.filter(p => p.id !== particleId));
    }, 800);
  };

  const addGlowEffect = (position, duration = 3000) => {
    const glowId = `${position.row}-${position.col}`;
    setGlowingTiles(prev => new Set([...prev, glowId]));
    
    setTimeout(() => {
      setGlowingTiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(glowId);
        return newSet;
      });
    }, duration);
  };

  // Subtle screen shake based on merge value
  const triggerScreenShake = (value) => {
    let shakeClass = '';
    if (value >= 4096) {
      shakeClass = 'animate-screen-shake-intense';
    } else if (value >= 2048) {
      shakeClass = 'animate-screen-shake-medium';
    } else if (value >= 1024) {
      shakeClass = 'animate-screen-shake-small';
    }
    
    if (shakeClass) {
      setScreenShake(shakeClass);
      setTimeout(() => setScreenShake(''), 400);
    }
  };

  // Flash burst overlay for dramatic effect
  const triggerFlashBurst = (position, value) => {
    const flashId = `flash-${position.row}-${position.col}-${Date.now()}`;
    const flashData = {
      id: flashId,
      position,
      value,
      color: value >= 4096 ? 'from-white via-yellow-200 to-orange-300' :
             value >= 2048 ? 'from-yellow-200 via-orange-300 to-red-400' :
             value >= 512 ? 'from-purple-400 via-pink-400 to-cyan-400' :
             'from-blue-300 via-purple-300 to-pink-300'
    };
    
    setFlashBurst(prev => [...prev, flashData]);
    
    setTimeout(() => {
      setFlashBurst(prev => prev.filter(f => f.id !== flashId));
    }, 400);
  };

  // Ripple effect for impact
  const triggerRippleEffect = (position, value) => {
    const rippleId = `ripple-${position.row}-${position.col}-${Date.now()}`;
    const rippleData = {
      id: rippleId,
      position,
      value,
      color: value >= 2048 ? 'border-yellow-400' :
             value >= 512 ? 'border-purple-400' :
             'border-cyan-400'
    };
    
    setRippleEffects(prev => [...prev, rippleData]);
    
    setTimeout(() => {
      setRippleEffects(prev => prev.filter(r => r.id !== rippleId));
    }, 600);
  };

  // Subtle explosion particles - only for higher values
  const createExplosionParticles = (position, value) => {
    if (value < 256) return; // No particles for small values
    
    const particleCount = value >= 4096 ? 8 : value >= 2048 ? 6 : value >= 512 ? 4 : 3;
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (360 / particleCount) * i + Math.random() * 30 - 15; // Add some randomness
      const distance = 25 + Math.random() * 35; // Reduced distance
      const dx = Math.cos(angle * Math.PI / 180) * distance;
      const dy = Math.sin(angle * Math.PI / 180) * distance;
      
      particles.push({
        id: `particle-${position.row}-${position.col}-${i}-${Date.now()}`,
        position,
        dx,
        dy,
        color: value >= 4096 ? ['bg-red-300', 'bg-yellow-300', 'bg-orange-300'][i % 3] :
               value >= 2048 ? ['bg-yellow-300', 'bg-orange-300'][i % 2] :
               value >= 512 ? ['bg-purple-300', 'bg-pink-300'][i % 2] :
               'bg-blue-300',
        size: value >= 2048 ? 'w-2 h-2' : value >= 512 ? 'w-1.5 h-1.5' : 'w-1 h-1'
      });
    }
    
    setExplosionParticles(prev => [...prev, ...particles]);
    
    setTimeout(() => {
      const particleIds = particles.map(p => p.id);
      setExplosionParticles(prev => prev.filter(p => !particleIds.includes(p.id)));
    }, 600);
  };

  // Combo multiplier effect for multiple merges - only for significant combos
  const triggerComboEffect = (mergeCount, totalValue) => {
    if (mergeCount >= 3 || (mergeCount >= 2 && totalValue >= 1024)) {
      const comboId = `combo-${Date.now()}`;
      const comboData = {
        id: comboId,
        count: mergeCount,
        value: totalValue,
        multiplier: mergeCount
      };
      
      setComboEffects(prev => [...prev, comboData]);
      
      setTimeout(() => {
        setComboEffects(prev => prev.filter(c => c.id !== comboId));
      }, 800);
    }
  };

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
    setAnimatingTiles(new Set());
    setParticleEffects([]);
    setGlowingTiles(new Set());
    // Reset dramatic effects
    setScreenShake('');
    setFlashBurst([]);
    setRippleEffects([]);
    setComboEffects([]);
    setExplosionParticles([]);
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
      
      // Handle merge animations and effects
      if (result.mergePositions && result.mergePositions.length > 0) {
        setMergedPositions(result.mergePositions);
        
        // Calculate total merge value and trigger combo effects
        const totalMergeValue = result.mergePositions.reduce((sum, pos) => sum + pos.value, 0);
        const maxMergeValue = Math.max(...result.mergePositions.map(pos => pos.value));
        
        // Trigger screen shake based on highest merge value
        triggerScreenShake(maxMergeValue);
        
        // Trigger combo effect for multiple merges
        triggerComboEffect(result.mergePositions.length, totalMergeValue);
        
        // Trigger animations for each merge
        result.mergePositions.forEach(mergePos => {
          const animationType = getAnimationType(mergePos.value);
          
          // Add animation class based on tile value
          const tileId = `${mergePos.row}-${mergePos.col}`;
          setAnimatingTiles(prev => new Set([...prev, tileId]));
          
          // Trigger selective effects based on value
          triggerParticleEffect(mergePos, mergePos.value);
          
          // Only show flash burst for significant merges
          if (mergePos.value >= 512) {
            triggerFlashBurst(mergePos, mergePos.value);
          }
          
          // Ripple effect for medium+ merges
          if (mergePos.value >= 256) {
            triggerRippleEffect(mergePos, mergePos.value);
          }
          
          // Explosion particles for high-value merges
          createExplosionParticles(mergePos, mergePos.value);
          
          // Add glow effect for high-value tiles
          if (mergePos.value >= 512) {
            addGlowEffect(mergePos, animationType === 'explosive' ? 6000 : animationType === 'legendary' ? 5000 : 3000);
          }
          
          // Remove animation class after animation completes
          setTimeout(() => {
            setAnimatingTiles(prev => {
              const newSet = new Set(prev);
              newSet.delete(tileId);
              return newSet;
            });
          }, animationType === 'explosive' ? 1000 : animationType === 'legendary' ? 800 : animationType === 'cosmic' ? 600 : 400);
        });
        
        // Clear merge positions after animation
        setTimeout(() => setMergedPositions([]), 100);
      }
      
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
    <div className={`min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-x-hidden ${screenShake}`}>
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
                      const tileId = `${rowIndex}-${colIndex}`;
                      const isAnimating = animatingTiles.has(tileId);
                      const isGlowing = glowingTiles.has(tileId);
                      
                      // Get animation class for merged tiles
                      let animationClass = '';
                      if (isMerged && isAnimating) {
                        const mergeData = mergedPositions.find(pos => 
                          pos.row === rowIndex && pos.col === colIndex
                        );
                        if (mergeData) {
                          const animationType = getAnimationType(mergeData.value);
                          animationClass = getAnimationClass(animationType);
                        }
                      }
                      
                      return (
                        <motion.div
                          key={`${rowIndex}-${colIndex}`}
                          className={`game-tile aspect-square w-full rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center text-white font-bold text-xs sm:text-sm md:text-base lg:text-xl relative overflow-hidden ${
                            cell === 0 ? 'bg-white/20' : 'shadow-lg'
                          } ${animationClass} ${isGlowing ? 'animate-glow-pulse' : ''}`}
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

      {/* Dramatic Visual Effects Overlays */}
      
      {/* Flash Burst Effects - Subtle */}
      <AnimatePresence>
        {flashBurst.map(flash => (
          <div
            key={flash.id}
            className="fixed pointer-events-none z-20"
            style={{
              left: `${(flash.position.col + 0.5) * 25}%`,
              top: `${(flash.position.row + 0.5) * 25}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`w-24 h-24 rounded-full bg-gradient-radial ${flash.color} opacity-40 animate-flash-burst`} />
          </div>
        ))}
      </AnimatePresence>

      {/* Ripple Effects */}
      <AnimatePresence>
        {rippleEffects.map(ripple => (
          <div
            key={ripple.id}
            className="fixed pointer-events-none z-40"
            style={{
              left: `${(ripple.position.col + 0.5) * 25}%`,
              top: `${(ripple.position.row + 0.5) * 25}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className={`w-16 h-16 rounded-full border-4 ${ripple.color} animate-ripple-effect`} />
            <div className={`absolute inset-0 w-16 h-16 rounded-full border-2 ${ripple.color} opacity-60 animate-ripple-effect`} 
                 style={{ animationDelay: '0.1s' }} />
            <div className={`absolute inset-0 w-16 h-16 rounded-full border-1 ${ripple.color} opacity-30 animate-ripple-effect`} 
                 style={{ animationDelay: '0.2s' }} />
          </div>
        ))}
      </AnimatePresence>

      {/* Explosion Particles */}
      <AnimatePresence>
        {explosionParticles.map(particle => (
          <div
            key={particle.id}
            className="fixed pointer-events-none z-30"
            style={{
              left: `${(particle.position.col + 0.5) * 25}%`,
              top: `${(particle.position.row + 0.5) * 25}%`,
              transform: 'translate(-50%, -50%)',
              '--dx': `${particle.dx}px`,
              '--dy': `${particle.dy}px`
            }}
          >
            <div className={`${particle.size} ${particle.color} rounded-full animate-particle-explosion shadow-lg`} />
          </div>
        ))}
      </AnimatePresence>

      {/* Combo Multiplier Effects - More Subtle */}
      <AnimatePresence>
        {comboEffects.map(combo => (
          <motion.div
            key={combo.id}
            className="fixed top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
            initial={{ scale: 0, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.8, y: 20, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="text-center bg-black/20 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="text-2xl font-bold text-yellow-400 drop-shadow-lg animate-combo-multiplier">
                COMBO x{combo.multiplier}
              </div>
              <div className="text-sm text-white/80 mt-1">
                +{combo.value}
              </div>
            </div>
          </motion.div>
        ))}
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