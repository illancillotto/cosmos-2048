export const cosmosTokenMap = {
  2: { name: 'ATOM', emoji: '⚛️', color: '#1B1B1B' },
  4: { name: 'OSMO', emoji: '🌌', color: '#722CF1' },
  8: { name: 'JUNO', emoji: '🪐', color: '#F0827D' },
  16: { name: 'STARS', emoji: '⭐', color: '#DB2777' },
  32: { name: 'HUAHUA', emoji: '🐕', color: '#FCA5A5' },
  64: { name: 'SCRT', emoji: '🔐', color: '#1F2937' },
  128: { name: 'LUNA', emoji: '🌙', color: '#F59E0B' },
  256: { name: 'UST', emoji: '💰', color: '#10B981' },
  512: { name: 'AKT', emoji: '☁️', color: '#3B82F6' },
  1024: { name: 'REGEN', emoji: '🌱', color: '#22C55E' },
  2048: { name: 'COSMOS', emoji: '🚀', color: '#8B5CF6' }
};

export const getTileData = (value) => {
  return cosmosTokenMap[value] || { 
    name: value.toString(), 
    emoji: '✨', 
    color: '#6B7280' 
  };
};