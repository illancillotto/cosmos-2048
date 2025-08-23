'use client';

import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5017';
      console.log('API URL:', apiUrl);
      const response = await fetch(`${apiUrl}/leaderboard`);

      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }

      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Leaderboard error:', err);
      setError('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/30 p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-3 lg:mb-4">🏆 Leaderboard</h2>
        <div className="text-center text-gray-500 py-6">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/30 p-4 lg:p-6">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent mb-3 lg:mb-4">🏆 Leaderboard</h2>
        <div className="text-center">
          <div className="text-2xl mb-2">❌</div>
          <div className="text-red-600 text-sm mb-4">{error}</div>
          <button
            onClick={fetchLeaderboard}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl lg:rounded-3xl shadow-2xl border border-white/30 p-4 lg:p-6">
      <div className="flex justify-between items-center mb-3 lg:mb-4">
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">🏆 Leaderboard</h2>
        <button
          onClick={fetchLeaderboard}
          className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium bg-blue-50 hover:bg-blue-100 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-colors duration-200"
        >
          🔄 Refresh
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center text-gray-500 py-6 lg:py-8">
          <div className="text-3xl lg:text-4xl mb-2">🎮</div>
          <p className="text-sm lg:text-base">No scores yet. Be the first to play!</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 sm:max-h-80 lg:max-h-96 overflow-y-auto custom-scrollbar">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.address}
              className={`flex items-center justify-between p-2 sm:p-3 rounded-lg transition-colors duration-200 ${
                index < 3
                  ? index === 0
                    ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200/50'
                    : index === 1
                      ? 'bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200/50'
                      : 'bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-200/50'
                  : 'bg-gray-50/50 hover:bg-gray-100/70'
              }`}
            >
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm flex-shrink-0 ${
                    index < 3
                      ? index === 0
                        ? 'bg-yellow-400 text-yellow-800'
                        : index === 1
                          ? 'bg-gray-400 text-gray-800'
                          : 'bg-orange-400 text-orange-800'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {index < 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : entry.rank}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs sm:text-sm text-gray-700 truncate">
                    {entry.address.length > 12 ? `${entry.address.slice(0, 6)}...${entry.address.slice(-4)}` : entry.address}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(entry.at)}
                  </div>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="font-bold text-sm sm:text-base lg:text-lg text-gray-800">
                  {entry.bestScore.toLocaleString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}