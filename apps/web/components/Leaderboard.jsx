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
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leaderboard`);
      
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
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Leaderboard</h2>
        <div className="text-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">🏆 Leaderboard</h2>
        <div className="text-center text-red-500">{error}</div>
        <button 
          onClick={fetchLeaderboard}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors block mx-auto"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">🏆 Leaderboard</h2>
        <button
          onClick={fetchLeaderboard}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          🔄 Refresh
        </button>
      </div>
      
      {leaderboard.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No scores yet. Be the first to play!
        </div>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {leaderboard.map((entry, index) => (
            <div
              key={entry.address}
              className={`flex items-center justify-between p-3 rounded-lg ${
                index < 3
                  ? index === 0
                    ? 'bg-yellow-50 border-2 border-yellow-200'
                    : index === 1
                    ? 'bg-gray-50 border-2 border-gray-200'
                    : 'bg-orange-50 border-2 border-orange-200'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                  index < 3
                    ? index === 0
                      ? 'bg-yellow-400 text-yellow-800'
                      : index === 1
                      ? 'bg-gray-400 text-gray-800'
                      : 'bg-orange-400 text-orange-800'
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {index < 3 ? (index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉') : entry.rank}
                </div>
                
                <div>
                  <div className="font-mono text-sm text-gray-700 truncate max-w-32 sm:max-w-none">
                    {entry.address}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(entry.at)}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="font-bold text-lg text-gray-800">
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