'use client';

import { useWallet } from '../contexts/WalletContext';

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
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-purple-600">Cosmos 2048</h1>
        
        <div className="flex gap-4">
          <div className="bg-gray-800 text-white px-4 py-2 rounded-lg text-center min-w-20">
            <div className="text-xs font-semibold text-gray-300">SCORE</div>
            <div className="text-lg font-bold">{score}</div>
          </div>
          <div className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-center min-w-20">
            <div className="text-xs font-semibold text-yellow-100">BEST</div>
            <div className="text-lg font-bold">{best}</div>
          </div>
        </div>
      </div>

      {/* Wallet Status */}
      {isConnected ? (
        <div className="space-y-2">
          <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm flex items-center justify-between">
            <div>
              <span className="font-semibold">🌟 {formatAddress(address)}</span>
              <div className="text-xs text-green-600">{balance.toFixed(2)} STARS</div>
            </div>
            <button
              onClick={disconnect}
              className="text-green-600 hover:text-green-800 text-xs underline"
            >
              Disconnect
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {!isKeplrAvailable && (
            <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm">
              ⚠️ Keplr wallet not detected. <a href="https://keplr.app" target="_blank" rel="noopener noreferrer" className="underline">Install Keplr</a>
            </div>
          )}
          {error && (
            <div className="bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onNewGame}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          🎮 New Game
        </button>
        
        {!isConnected ? (
          <button
            onClick={connect}
            disabled={isConnecting || !isKeplrAvailable}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
          >
            {isConnecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting...</span>
              </>
            ) : (
              <>
                <span>🔗 Connect Keplr</span>
              </>
            )}
          </button>
        ) : (
          score > 0 && (
            <button
              onClick={onSubmitScore}
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
              {isSubmitting ? 'Submitting...' : '📊 Submit Score'}
            </button>
          )
        )}
      </div>

      {(gameOver || won) && (
        <div className={`text-center py-3 px-4 rounded-lg font-bold text-lg ${
          won 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {won ? '🎉 You reached 2048! You won!' : '💀 Game Over! No more moves available.'}
        </div>
      )}
    </div>
  );
}