'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cosmosTokenMap } from '../lib/cosmosMap';

const TokenLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const tokenEntries = Object.entries(cosmosTokenMap).sort(([a], [b]) => parseInt(a) - parseInt(b));

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <div 
        className="p-4 cursor-pointer flex items-center justify-between hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🗺️</div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Cosmos Token Evolution</h3>
            <p className="text-sm text-gray-600">Journey through the ecosystem</p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-gray-400"
        >
          ⬇️
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {tokenEntries.map(([value, token]) => (
                  <motion.div
                    key={value}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: parseInt(value) * 0.02 }}
                    className="flex items-center space-x-3 p-3 rounded-xl hover:scale-105 transition-all duration-200 cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${token.color}20, ${token.color}10)`,
                      border: `1px solid ${token.color}30`
                    }}
                  >
                    <div className="flex-shrink-0">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white shadow-lg"
                        style={{ background: token.gradient || token.color }}
                      >
                        <div className="text-lg">{token.emoji}</div>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-gray-800">{token.name}</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                          {value}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 truncate mt-1">
                        {token.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Achievement Tiers */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🏆</span>
                  Achievement Tiers
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg">
                    <span>🥉</span>
                    <span>Novice (2-32)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-blue-100 rounded-lg">
                    <span>🥈</span>
                    <span>Explorer (64-256)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-purple-100 rounded-lg">
                    <span>🥇</span>
                    <span>Master (512-1024)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-yellow-100 rounded-lg">
                    <span>💎</span>
                    <span>Cosmos (2048)</span>
                  </div>
                  <div className="flex items-center space-x-2 p-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg col-span-2 sm:col-span-1">
                    <span>♾️</span>
                    <span>Infinity (4096+)</span>
                  </div>
                </div>
              </div>

              {/* Game Tips */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                  <span className="mr-2">💡</span>
                  Pro Tips
                </h4>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>• Keep your highest tile in a corner</p>
                  <p>• Build towards one direction consistently</p>
                  <p>• Connect your Keplr wallet for NFT rewards!</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TokenLegend;