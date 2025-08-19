'use client';

import { useState, useEffect, useCallback } from 'react';
import HUD from '../components/HUD';
import Leaderboard from '../components/Leaderboard';
import { initializeGame, move, canMove, hasWon, spawnRandomTile } from '../lib/game2048';
import { getTileData } from '../lib/cosmosMap';

export default function HomePage() {
  const [board, setBoard] = useState(null);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [token, setToken] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedToken = localStorage.getItem('cosmos2048_token');
      const savedAddress = localStorage.getItem('cosmos2048_address');
      const savedBest = localStorage.getItem('cosmos2048_best');
      
      if (savedToken && savedAddress) {
        setToken(savedToken);
        setAddress(savedAddress);
      }
      
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
  };

  const handleMove = useCallback((direction) => {
    if (!board || gameOver || won) return;

    const result = move(board, direction);
    
    if (result.moved) {
      let newBoard = spawnRandomTile(result.board);
      setBoard(newBoard);
      setScore(prevScore => prevScore + result.gained);
      
      if (hasWon(newBoard) && !won) {
        setWon(true);
      }
      
      if (!canMove(newBoard)) {
        setGameOver(true);
      }
    }
  }, [board, gameOver, won]);

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

  const handleLogin = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/guest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        setAddress(data.address);
        
        if (typeof window !== 'undefined') {
          localStorage.setItem('cosmos2048_token', data.token);
          localStorage.setItem('cosmos2048_address', data.address);
        }
      } else {
        console.error('Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleSubmitScore = async () => {
    if (!token || score === 0 || isSubmitting) return;

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/scores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          score,
          runId: `run-${Date.now()}`,
          commit: 'manual-submit'
        }),
      });

      if (response.ok) {
        alert('Score submitted successfully! 🎉');
      } else {
        console.error('Score submission failed');
        alert('Failed to submit score. Please try again.');
      }
    } catch (error) {
      console.error('Submit score error:', error);
      alert('Failed to submit score. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTileStyle = (value) => {
    const tileData = getTileData(value);
    const baseClasses = "game-tile w-16 h-16 sm:w-20 sm:h-20 rounded-lg flex items-center justify-center font-bold text-white shadow-md cursor-pointer";
    
    if (value === 0) {
      return `${baseClasses} bg-gray-300`;
    }
    
    return `${baseClasses} text-sm sm:text-base`;
  };

  if (!board) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg shadow-xl p-6">
            <HUD
              score={score}
              best={best}
              address={address}
              gameOver={gameOver}
              won={won}
              onNewGame={newGame}
              onLogin={handleLogin}
              onSubmitScore={handleSubmitScore}
              isSubmitting={isSubmitting}
            />

            <div className="game-board bg-gray-400 p-4 rounded-lg inline-block mx-auto">
              <div className="grid grid-cols-4 gap-2">
                {board.map((row, rowIndex) =>
                  row.map((cell, colIndex) => {
                    const tileData = getTileData(cell);
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={getTileStyle(cell)}
                        style={{
                          backgroundColor: cell === 0 ? '#D1D5DB' : tileData.color,
                          color: cell === 0 ? '#6B7280' : 'white'
                        }}
                      >
                        {cell === 0 ? '' : (
                          <div className="text-center">
                            <div className="text-xs opacity-75">{tileData.emoji}</div>
                            <div className="font-bold">{cell}</div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="mt-4 text-center text-gray-600 text-sm">
              <p>Use arrow keys or swipe to move tiles</p>
              <p>Combine tiles with the same number to reach <strong>2048</strong>!</p>
            </div>
          </div>

          <div>
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}