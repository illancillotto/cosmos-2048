'use client';

export default function HUD({ 
  score, 
  best, 
  address, 
  gameOver, 
  won,
  onNewGame, 
  onLogin, 
  onSubmitScore,
  isSubmitting 
}) {
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

      {address && (
        <div className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm">
          Playing as: <span className="font-mono">{address}</span>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button
          onClick={onNewGame}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
        >
          New Game
        </button>
        
        {!address && (
          <button
            onClick={onLogin}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            Login Guest
          </button>
        )}
        
        {address && score > 0 && (
          <button
            onClick={onSubmitScore}
            disabled={isSubmitting}
            className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Score'}
          </button>
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