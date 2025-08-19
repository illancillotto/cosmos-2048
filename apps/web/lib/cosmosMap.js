export const cosmosTokenMap = {
  2: { 
    name: 'ATOM', 
    emoji: '⚛️', 
    color: '#00D4FF',
    gradient: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 50%, #006699 100%)',
    glow: 'shadow-cyan-500/50',
    description: 'Cosmos Hub native token'
  },
  4: { 
    name: 'OSMO', 
    emoji: '🧪', 
    color: '#9945FF',
    gradient: 'linear-gradient(135deg, #9945FF 0%, #7C3AED 50%, #5B21B6 100%)',
    glow: 'shadow-purple-500/50',
    description: 'Osmosis DEX token'
  },
  8: { 
    name: 'JUNO', 
    emoji: '🌀', 
    color: '#FF6B9D',
    gradient: 'linear-gradient(135deg, #FF6B9D 0%, #F43F5E 50%, #DC2626 100%)',
    glow: 'shadow-rose-500/50',
    description: 'Juno smart contracts'
  },
  16: { 
    name: 'STARS', 
    emoji: '⭐', 
    color: '#FF0080',
    gradient: 'linear-gradient(135deg, #FF0080 0%, #E91E63 50%, #AD1457 100%)',
    glow: 'shadow-pink-500/50',
    description: 'Stargaze NFT hub'
  },
  32: { 
    name: 'SCRT', 
    emoji: '🔐', 
    color: '#4FD1C7',
    gradient: 'linear-gradient(135deg, #4FD1C7 0%, #14B8A6 50%, #0F766E 100%)',
    glow: 'shadow-teal-500/50',
    description: 'Secret Network privacy'
  },
  64: { 
    name: 'EVMOS', 
    emoji: '🚀', 
    color: '#FF4E50',
    gradient: 'linear-gradient(135deg, #FF4E50 0%, #EF4444 50%, #DC2626 100%)',
    glow: 'shadow-red-500/50',
    description: 'Evmos EVM compatibility'
  },
  128: { 
    name: 'AKT', 
    emoji: '☁️', 
    color: '#4FC3F7',
    gradient: 'linear-gradient(135deg, #4FC3F7 0%, #3B82F6 50%, #1D4ED8 100%)',
    glow: 'shadow-blue-500/50',
    description: 'Akash cloud computing'
  },
  256: { 
    name: 'REGEN', 
    emoji: '🌱', 
    color: '#4ADE80',
    gradient: 'linear-gradient(135deg, #4ADE80 0%, #22C55E 50%, #15803D 100%)',
    glow: 'shadow-green-500/50',
    description: 'Regen regenerative economy'
  },
  512: { 
    name: 'CRO', 
    emoji: '💎', 
    color: '#3B82F6',
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1E40AF 100%)',
    glow: 'shadow-blue-600/50',
    description: 'Crypto.com Chain'
  },
  1024: { 
    name: 'KAVA', 
    emoji: '🔥', 
    color: '#FFB347',
    gradient: 'linear-gradient(135deg, #FFB347 0%, #F59E0B 50%, #D97706 100%)',
    glow: 'shadow-amber-500/50',
    description: 'Kava DeFi platform'
  },
  2048: { 
    name: 'COSMOS', 
    emoji: '🌌', 
    color: '#A855F7',
    gradient: 'linear-gradient(135deg, #C084FC 0%, #A855F7 30%, #9333EA 70%, #7C3AED 100%)',
    glow: 'shadow-purple-600/70',
    description: 'Internet of Blockchains',
    special: true
  },
  4096: { 
    name: 'INFINITY', 
    emoji: '♾️', 
    color: '#FF10F0',
    gradient: 'linear-gradient(135deg, #FF10F0 0%, #C026D3 25%, #A21CAF 50%, #86198F 75%, #701A75 100%)',
    glow: 'shadow-fuchsia-500/80',
    description: 'Beyond the cosmos!',
    special: true
  }
};

export const getTileData = (value) => {
  return cosmosTokenMap[value] || { 
    name: value.toString(), 
    emoji: '✨', 
    color: '#6B7280',
    gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 100%)',
    description: 'Unknown token'
  };
};

// Get tile animation class based on value
export const getTileAnimationClass = (value) => {
  if (value >= 4096) return 'animate-cosmic-pulse cosmic-glow';
  if (value >= 2048) return 'animate-glow';
  if (value >= 1024) return 'animate-float';
  if (value >= 512) return 'animate-pulse';
  return '';
};

// Get rarity level for NFT minting
export const getTileRarity = (maxTile) => {
  if (maxTile >= 4096) return 'legendary';
  if (maxTile >= 2048) return 'epic';
  if (maxTile >= 1024) return 'rare';
  if (maxTile >= 512) return 'uncommon';
  return 'common';
};

// Prize configurations for Wheel of Fortune
export const wheelPrizes = [
  {
    id: 'common_badge',
    name: 'Common Badge',
    emoji: '🥉',
    color: '#9CA3AF',
    probability: 0.4,
    rarity: 'common'
  },
  {
    id: 'uncommon_badge', 
    name: 'Uncommon Badge',
    emoji: '🥈',
    color: '#10B981',
    probability: 0.3,
    rarity: 'uncommon'
  },
  {
    id: 'rare_badge',
    name: 'Rare Badge',
    emoji: '🥇',
    color: '#3B82F6',
    probability: 0.15,
    rarity: 'rare'
  },
  {
    id: 'epic_badge',
    name: 'Epic Badge',
    emoji: '💎',
    color: '#8B5CF6',
    probability: 0.1,
    rarity: 'epic'
  },
  {
    id: 'legendary_badge',
    name: 'Legendary Badge',
    emoji: '👑',
    color: '#F59E0B',
    probability: 0.04,
    rarity: 'legendary'
  },
  {
    id: 'nothing',
    name: 'Try Again',
    emoji: '😅',
    color: '#EF4444',
    probability: 0.01,
    rarity: 'none'
  }
];