'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WheelOfFortune from './WheelOfFortune';
import { mintGameBadgeNFT } from '../lib/nftMinter';
import { useWallet } from '../contexts/WalletContext';
import { getTileData, getTileRarity } from '../lib/cosmosMap';

const GameOverModal = ({ 
  isOpen, 
  onClose, 
  score, 
  maxTile, 
  won, 
  onNewGame, 
  onSubmitScore 
}) => {
  const { isConnected, address, offlineSigner } = useWallet();
  const [showWheel, setShowWheel] = useState(false);
  const [wheelPrize, setWheelPrize] = useState(null);
  const [isMintingNFT, setIsMintingNFT] = useState(false);
  const [mintResult, setMintResult] = useState(null);
  const [nftMinted, setNftMinted] = useState(false);

  const maxTileData = getTileData(maxTile);
  const rarity = getTileRarity(maxTile);

  const handleSpinWheel = () => {
    setShowWheel(true);
  };

  const handleWheelComplete = async (prize) => {
    setWheelPrize(prize);
    
    // Auto-mint NFT if connected and won a prize
    if (isConnected && prize.rarity !== 'none') {
      await handleMintNFT(prize);
    }
  };

  const handleMintNFT = async (prize) => {
    if (!isConnected || !offlineSigner || nftMinted) {
      return;
    }

    setIsMintingNFT(true);

    try {
      const gameData = {
        score: score,
        maxTile: maxTile,
        timestamp: Date.now(),
        address: address,
        won: won,
        rarity: rarity
      };

      const result = await mintGameBadgeNFT(offlineSigner, gameData, prize);
      
      setMintResult(result);
      
      if (result.success) {
        setNftMinted(true);
      }

    } catch (error) {
      console.error('Error minting NFT:', error);
      setMintResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsMintingNFT(false);
    }
  };

  const handleClose = () => {
    setShowWheel(false);
    setWheelPrize(null);
    setMintResult(null);
    setNftMinted(false);
    onClose();
  };

  const handlePlayAgain = () => {
    handleClose();
    onNewGame();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={(e) => e.target === e.currentTarget && !showWheel && handleClose()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          className={`bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto ${
            showWheel ? 'p-0' : 'p-8'
          }`}
        >
          {!showWheel ? (
            // Game Over Screen
            <div className="text-center space-y-6">
              <div className="text-6xl mb-4">
                {won ? '🎉' : '💀'}
              </div>
              
              <h2 className="text-3xl font-bold text-gray-800">
                {won ? 'Congratulations!' : 'Game Over!'}
              </h2>
              
              <div className="text-lg text-gray-600 space-y-2">
                {won ? (
                  <p>You reached the legendary <strong>{maxTile}</strong> tile!</p>
                ) : (
                  <p>No more moves available. Better luck next time!</p>
                )}
              </div>

              {/* Game Stats */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{score.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Final Score</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="text-2xl">{maxTileData.emoji}</span>
                      <span className="text-2xl font-bold" style={{ color: maxTileData.color }}>
                        {maxTile}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Highest Tile</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600 capitalize">{rarity}</div>
                    <div className="text-sm text-gray-600">Achievement</div>
                  </div>
                </div>

                {/* Cosmos Token Info */}
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-lg font-semibold text-gray-700 mb-2">
                    You mastered <span style={{ color: maxTileData.color }}>{maxTileData.name}</span>!
                  </div>
                  <p className="text-sm text-gray-500">{maxTileData.description}</p>
                </div>
              </div>

              {/* Wallet Connection Notice */}
              {!isConnected && (
                <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-yellow-600">⚠️</span>
                    <span className="text-sm text-yellow-800">
                      Connect your Keplr wallet to mint NFT badges from the wheel!
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSpinWheel}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-lg font-bold text-lg shadow-lg"
                >
                  🎰 Spin the Wheel of Cosmos!
                </motion.button>
                
                <button
                  onClick={onSubmitScore}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg"
                >
                  📊 Submit Score
                </button>
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={handlePlayAgain}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  🎮 Play Again
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            // Wheel of Fortune Screen
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Spin for Your NFT Badge!</h3>
                <button
                  onClick={() => setShowWheel(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              
              <WheelOfFortune
                onSpinComplete={handleWheelComplete}
                gameScore={score}
                maxTile={maxTile}
              />

              {/* NFT Minting Status */}
              {wheelPrize && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  {isMintingNFT && (
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 text-blue-600">
                        <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Minting your NFT badge...</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">Please confirm the transaction in your Keplr wallet</p>
                    </div>
                  )}

                  {mintResult && !isMintingNFT && (
                    <div className="text-center">
                      {mintResult.success ? (
                        <div className="text-green-600 space-y-2">
                          <div className="text-lg font-bold">🎉 NFT Minted Successfully!</div>
                          <p className="text-sm">
                            Token ID: <span className="font-mono">{mintResult.tokenId}</span>
                          </p>
                          <p className="text-xs text-gray-500">
                            Transaction: {mintResult.transactionHash}
                          </p>
                        </div>
                      ) : (
                        <div className="text-red-600">
                          <div className="font-bold">❌ Minting Failed</div>
                          <p className="text-sm">{mintResult.error}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {!isConnected && wheelPrize.rarity !== 'none' && (
                    <div className="text-center text-orange-600">
                      <div className="font-bold">⚠️ Wallet Not Connected</div>
                      <p className="text-sm">Connect your Keplr wallet to mint this NFT badge!</p>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={handlePlayAgain}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  🎮 Play Again
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GameOverModal;