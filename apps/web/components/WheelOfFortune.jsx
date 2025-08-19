'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { wheelPrizes } from '../lib/cosmosMap';

const WheelOfFortune = ({ onSpinComplete, isSpinning: externalSpinning, gameScore, maxTile }) => {
  const canvasRef = useRef(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedPrize, setSelectedPrize] = useState(null);
  const [showResult, setShowResult] = useState(false);

  const wheelRadius = 150;
  const centerX = wheelRadius + 20;
  const centerY = wheelRadius + 20;
  const segmentAngle = (2 * Math.PI) / wheelPrizes.length;

  // Draw the wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw wheel segments
    wheelPrizes.forEach((prize, index) => {
      const startAngle = index * segmentAngle - Math.PI / 2 + rotation;
      const endAngle = (index + 1) * segmentAngle - Math.PI / 2 + rotation;

      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, wheelRadius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = prize.color;
      ctx.fill();

      // Draw segment border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw text
      const textAngle = startAngle + segmentAngle / 2;
      const textX = centerX + Math.cos(textAngle) * (wheelRadius * 0.7);
      const textY = centerY + Math.sin(textAngle) * (wheelRadius * 0.7);

      ctx.save();
      ctx.translate(textX, textY);
      ctx.rotate(textAngle + Math.PI / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(prize.emoji, 0, -5);
      ctx.font = '10px Arial';
      ctx.fillText(prize.name, 0, 10);
      ctx.restore();
    });

    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    ctx.fillStyle = '#1F2937';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Draw center star
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('⭐', centerX, centerY + 5);

    // Draw pointer
    ctx.beginPath();
    ctx.moveTo(centerX + wheelRadius + 10, centerY);
    ctx.lineTo(centerX + wheelRadius - 10, centerY - 15);
    ctx.lineTo(centerX + wheelRadius - 10, centerY + 15);
    ctx.closePath();
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // Select prize based on weighted probability
  const selectPrize = () => {
    const random = Math.random();
    let cumulativeProbability = 0;

    for (const prize of wheelPrizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }
    
    return wheelPrizes[wheelPrizes.length - 1]; // Fallback to last prize
  };

  // Spin the wheel
  const spinWheel = () => {
    if (isSpinning || externalSpinning) return;

    setIsSpinning(true);
    setShowResult(false);
    
    const prize = selectPrize();
    const prizeIndex = wheelPrizes.findIndex(p => p.id === prize.id);
    
    // Calculate target rotation
    const targetSegmentAngle = prizeIndex * segmentAngle;
    const spins = 5 + Math.random() * 5; // 5-10 full rotations
    const targetRotation = (spins * 2 * Math.PI) - targetSegmentAngle;
    
    // Animate rotation
    let startTime = null;
    const duration = 3000; // 3 seconds
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for realistic deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = targetRotation * easeOut;
      
      setRotation(currentRotation);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Spinning complete
        setSelectedPrize(prize);
        setIsSpinning(false);
        setTimeout(() => {
          setShowResult(true);
          if (onSpinComplete) {
            onSpinComplete(prize);
          }
        }, 500);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Redraw wheel when rotation changes
  useEffect(() => {
    drawWheel();
  }, [rotation]);

  // Initial draw
  useEffect(() => {
    drawWheel();
  }, []);

  return (
    <div className="flex flex-col items-center space-y-6 p-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">🎰 Wheel of Cosmos Fortune</h2>
        <p className="text-gray-600">Spin the wheel to win exclusive NFT badges!</p>
        {gameScore && (
          <p className="text-sm text-gray-500 mt-2">
            Game Score: <span className="font-bold">{gameScore.toLocaleString()}</span> | 
            Max Tile: <span className="font-bold">{maxTile}</span>
          </p>
        )}
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={340}
          height={340}
          className="drop-shadow-lg"
        />
        
        {/* Spin button overlay */}
        <motion.button
          onClick={spinWheel}
          disabled={isSpinning || externalSpinning}
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                     px-4 py-2 rounded-full font-bold text-white shadow-lg transition-all duration-200 ${
                       isSpinning || externalSpinning
                         ? 'bg-gray-400 cursor-not-allowed'
                         : 'bg-purple-600 hover:bg-purple-700 hover:scale-110'
                     }`}
          whileHover={{ scale: isSpinning ? 1 : 1.1 }}
          whileTap={{ scale: isSpinning ? 1 : 0.95 }}
        >
          {isSpinning || externalSpinning ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Spinning...</span>
            </div>
          ) : (
            'SPIN!'
          )}
        </motion.button>
      </div>

      {/* Result Modal */}
      <AnimatePresence>
        {showResult && selectedPrize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ y: 50 }}
              animate={{ y: 0 }}
              className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">{selectedPrize.emoji}</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Congratulations! 🎉
              </h3>
              <p className="text-lg text-gray-600 mb-4">
                You won a <span style={{ color: selectedPrize.color }} className="font-bold">
                  {selectedPrize.name}
                </span>!
              </p>
              
              {selectedPrize.rarity !== 'none' && (
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600">
                    🎨 This NFT badge will be minted to your wallet with your game stats!
                  </p>
                  <div className="flex justify-between mt-2 text-xs text-gray-500">
                    <span>Rarity: <strong>{selectedPrize.rarity}</strong></span>
                    <span>Score: <strong>{gameScore?.toLocaleString()}</strong></span>
                  </div>
                </div>
              )}

              <button
                onClick={() => setShowResult(false)}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                {selectedPrize.rarity !== 'none' ? 'Mint NFT!' : 'Close'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prize Display */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-w-md">
        {wheelPrizes.map((prize) => (
          <div
            key={prize.id}
            className="flex items-center space-x-2 p-2 rounded-lg bg-gray-100 text-sm"
          >
            <span>{prize.emoji}</span>
            <span className="truncate">{prize.name}</span>
            <span className="text-xs text-gray-500">
              {(prize.probability * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WheelOfFortune;