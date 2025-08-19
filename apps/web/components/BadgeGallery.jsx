'use client';

import React, { useState, useEffect } from 'react';
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
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Your NFT Badge Collection</h2>
        <div className="text-gray-500">
          <p>Connect your Keplr wallet to view your NFT badges!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🏆 Your NFT Badge Collection</h2>
        <button
          onClick={fetchUserNFTs}
          disabled={loading}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium disabled:opacity-50"
        >
          {loading ? '🔄 Loading...' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading && !error ? (
        <div className="text-center py-8">
          <div className="inline-flex items-center space-x-2 text-gray-500">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            <span>Loading your badges...</span>
          </div>
        </div>
      ) : nfts.length === 0 ? (
        <div className="text-center py-8 space-y-4">
          <div className="text-4xl">🎮</div>
          <div className="text-gray-500">
            <p>No badges yet!</p>
            <p className="text-sm">Play Cosmos 2048 and spin the wheel to earn NFT badges.</p>
          </div>
          <div className="bg-gray-100 rounded-lg p-4 text-sm text-gray-600">
            <p><strong>How to earn badges:</strong></p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Play the 2048 game until game over</li>
              <li>Spin the Wheel of Cosmos Fortune</li>
              <li>Win NFT badges that get minted to your wallet!</li>
            </ol>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {nfts.map((nft, index) => (
            <div
              key={nft.tokenId || index}
              className="bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="text-center space-y-2">
                <div className="text-3xl">{nft.emoji || '🏆'}</div>
                <h3 className="font-semibold text-gray-800">{nft.name}</h3>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Score: <span className="font-medium">{nft.score?.toLocaleString()}</span></p>
                  <p>Max Tile: <span className="font-medium">{nft.maxTile}</span></p>
                  <p>Rarity: <span className="font-medium capitalize">{nft.rarity}</span></p>
                </div>
                {nft.tokenId && (
                  <p className="text-xs text-gray-400 font-mono truncate">
                    {nft.tokenId}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Placeholder badges for demonstration */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🎯 Available Badge Types</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { name: 'Common', emoji: '🥉', color: '#9CA3AF' },
            { name: 'Uncommon', emoji: '🥈', color: '#10B981' },
            { name: 'Rare', emoji: '🥇', color: '#3B82F6' },
            { name: 'Epic', emoji: '💎', color: '#8B5CF6' },
            { name: 'Legendary', emoji: '👑', color: '#F59E0B' },
          ].map((badge) => (
            <div
              key={badge.name}
              className="text-center p-3 bg-gray-50 rounded-lg"
            >
              <div className="text-2xl mb-1">{badge.emoji}</div>
              <div className="text-xs text-gray-600">{badge.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BadgeGallery;