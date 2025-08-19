'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../contexts/WalletContext';
import { getUserNFTs } from '../lib/nftMinter';

const BadgeGallery = () => {
  const { isConnected, address } = useWallet();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isConnected && address) {
      fetchUserNFTs();
    }
  }, [isConnected, address]);

  const fetchUserNFTs = async () => {
    setLoading(true);
    setError('');

    try {
      const userNFTs = await getUserNFTs(address);
      setNfts(userNFTs);
    } catch (err) {
      setError('Failed to fetch your NFT badges');
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <motion.div
        className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <motion.div
          className="text-6xl mb-6"
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          🏆
        </motion.div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-4">
          Your NFT Badge Collection
        </h2>
        <div className="text-gray-600 text-lg">
          <p>Connect your Keplr wallet to view your NFT badges!</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
          🏆 Your NFT Badge Collection
        </h2>
        <motion.button
          onClick={fetchUserNFTs}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-cosmic hover:shadow-cosmic-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          {loading ? (
            <motion.div
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
          ) : (
            <span className="text-xl">🔄</span>
          )}
          <span>{loading ? 'Loading...' : 'Refresh'}</span>
        </motion.button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 p-4 rounded-2xl border border-red-200/50 mb-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">❌</span>
              <span className="font-semibold">{error}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {loading && !error ? (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center space-x-3 text-gray-600"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-8 h-8 border-3 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span className="text-lg font-medium">Loading your badges...</span>
          </motion.div>
        </motion.div>
      ) : nfts.length === 0 ? (
        <motion.div
          className="text-center py-12 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-8xl"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            🎮
          </motion.div>
          <div className="text-gray-600 text-lg">
            <p className="font-semibold mb-2">No badges yet!</p>
            <p className="text-base">Play Cosmos 2048 and spin the wheel to earn NFT badges.</p>
          </div>
          <motion.div
            className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 text-sm text-gray-700 border border-purple-200/50 max-w-md mx-auto"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <p className="font-bold mb-3 text-purple-800">How to earn badges:</p>
            <ol className="list-decimal list-inside space-y-2 text-left">
              <li>Play the 2048 game until game over</li>
              <li>Spin the Wheel of Cosmos Fortune</li>
              <li>Win NFT badges that get minted to your wallet!</li>
            </ol>
          </motion.div>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {nfts.map((nft, index) => (
            <motion.div
              key={nft.tokenId || index}
              className="bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200/50 rounded-2xl p-6 hover:shadow-cosmic-hover transition-all duration-300 group cursor-pointer"
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ scale: 1.05, y: -5 }}
            >
              <div className="text-center space-y-4">
                <motion.div
                  className="text-5xl"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {nft.emoji || '🏆'}
                </motion.div>
                <h3 className="font-bold text-gray-800 text-lg">{nft.name}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Score:</span>
                    <span className="font-semibold text-purple-700">{nft.score?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Max Tile:</span>
                    <span className="font-semibold text-blue-700">{nft.maxTile}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Rarity:</span>
                    <span className="font-semibold text-pink-700 capitalize">{nft.rarity}</span>
                  </div>
                </div>
                {nft.tokenId && (
                  <div className="pt-2 border-t border-gray-200/50">
                    <p className="text-xs text-gray-500 font-mono truncate">
                      {nft.tokenId}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Enhanced Available Badge Types */}
      <motion.div
        className="mt-12 pt-8 border-t border-gray-200/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">🎯 Available Badge Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { name: 'Common', emoji: '🥉', color: 'from-gray-400 to-gray-500', rarity: '40%' },
            { name: 'Uncommon', emoji: '🥈', color: 'from-green-400 to-green-500', rarity: '30%' },
            { name: 'Rare', emoji: '🥇', color: 'from-blue-400 to-blue-500', rarity: '15%' },
            { name: 'Epic', emoji: '💎', color: 'from-purple-400 to-purple-500', rarity: '10%' },
            { name: 'Legendary', emoji: '👑', color: 'from-yellow-400 to-yellow-500', rarity: '4%' },
          ].map((badge, index) => (
            <motion.div
              key={badge.name}
              className="text-center p-4 bg-white rounded-2xl shadow-md border border-gray-200/50 hover:shadow-lg transition-all duration-200 group cursor-pointer"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1, duration: 0.3 }}
              whileHover={{ scale: 1.05, y: -3 }}
            >
              <motion.div
                className="text-4xl mb-3"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                {badge.emoji}
              </motion.div>
              <div className="font-semibold text-gray-800 mb-1">{badge.name}</div>
              <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full inline-block">
                {badge.rarity}
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BadgeGallery;