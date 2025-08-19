'use client';

import { useWallet } from '../contexts/WalletContext';
import { motion } from 'framer-motion';

export default function HUD({
  score,
  best,
  gameOver,
  won,
  onNewGame,
  onSubmitScore,
  isSubmitting
}) {
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    connect,
    disconnect,
    formatAddress,
    isKeplrAvailable,
    error
  } = useWallet();

  return (
    <motion.div
      className="flex flex-col gap-6 mb-8"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <motion.h1
          className="text-5xl lg:text-6xl font-display font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-glow"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}
        >
          Cosmos 2048
        </motion.h1>

        {/* Enhanced Score Display */}
        <div className="flex gap-4">
          <motion.div
            className="relative bg-gradient-to-br from-purple-600 to-purple-700 text-white px-6 py-4 rounded-2xl text-center min-w-24 shadow-cosmic hover:shadow-cosmic-hover transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-transparent rounded-2xl" />
            <div className="relative">
              <div className="text-xs font-semibold text-purple-100 mb-1">SCORE</div>
              <div className="text-2xl font-bold tracking-wider">{score.toLocaleString()}</div>
            </div>
          </motion.div>

          <motion.div
            className="relative bg-gradient-to-br from-yellow-500 to-yellow-600 text-white px-6 py-4 rounded-2xl text-center min-w-24 shadow-cosmic hover:shadow-cosmic-hover transition-all duration-300"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-transparent rounded-2xl" />
            <div className="relative">
              <div className="text-xs font-semibold text-yellow-100 mb-1">BEST</div>
              <div className="text-2xl font-bold tracking-wider">{best.toLocaleString()}</div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Wallet Status */}
      {isConnected ? (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <div className="relative bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-6 py-4 rounded-2xl border border-green-200/50 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <motion.div
                  className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <span className="text-white text-lg">🌟</span>
                </motion.div>
                <div>
                  <div className="font-semibold text-lg">{formatAddress(address)}</div>
                  <div className="text-sm text-green-600 font-medium">{balance.toFixed(2)} STARS</div>
                </div>
              </div>
              <motion.button
                onClick={disconnect}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Disconnect
              </motion.button>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          {!isKeplrAvailable && (
            <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-6 py-4 rounded-2xl border border-red-200/50 shadow-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold">Keplr wallet not detected</div>
                  <a
                    href="https://keplr.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 hover:text-red-800 underline font-medium"
                  >
                    Install Keplr
                  </a>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-gradient-to-r from-red-100 to-pink-100 text-red-800 px-6 py-4 rounded-2xl border border-red-200/50 shadow-lg">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">❌</span>
                <div className="font-semibold">{error}</div>
              </div>
            </div>
          )}

          {isKeplrAvailable && !isConnected && (
            <motion.button
              onClick={connect}
              disabled={isConnecting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-cosmic hover:shadow-cosmic-hover transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isConnecting ? (
                <div className="flex items-center justify-center space-x-3">
                  <motion.div
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-2xl">🔗</span>
                  <span>Connect Keplr Wallet</span>
                </div>
              )}
            </motion.button>
          )}
        </motion.div>
      )}

      {/* Enhanced Action Buttons */}
      <motion.div
        className="flex gap-3 flex-wrap"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <motion.button
          onClick={onNewGame}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-cosmic hover:shadow-cosmic-hover flex items-center space-x-2"
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="text-xl">🔄</span>
          <span>New Game</span>
        </motion.button>

        {gameOver && (
          <motion.button
            onClick={onSubmitScore}
            disabled={isSubmitting}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-cosmic hover:shadow-cosmic-hover flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            {isSubmitting ? (
              <motion.div
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              <span className="text-xl">🏆</span>
            )}
            <span>{isSubmitting ? 'Submitting...' : 'Submit Score'}</span>
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}