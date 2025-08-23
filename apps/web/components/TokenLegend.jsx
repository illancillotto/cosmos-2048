'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { cosmosTokenMap } from '../lib/cosmosMap';

const TokenLegend = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredToken, setHoveredToken] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const tokenEntries = Object.entries(cosmosTokenMap).sort(([a], [b]) => parseInt(a) - parseInt(b));

  // Parallax effect for mouse movement
  const rotateX = useTransform(mouseY, [-300, 300], [15, -15]);
  const rotateY = useTransform(mouseX, [-300, 300], [-15, 15]);

  // Handle scroll progress
  useEffect(() => {
    const handleScroll = () => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const progress = scrollTop / (scrollHeight - clientHeight);
        setScrollProgress(progress);
      }
    };

    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [isExpanded]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
    setHoveredToken(null);
  };

  return (
    <motion.div
      className="relative bg-gradient-to-br from-white/95 via-white/90 to-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 overflow-hidden"
      style={{
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header with enhanced styling */}
      <motion.div
        className="relative p-6 cursor-pointer group overflow-hidden"
        onClick={() => setIsExpanded(!isExpanded)}
        whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}
        transition={{ duration: 0.2 }}
      >
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.div
              className="relative"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <span className="text-2xl">🌌</span>
              </div>
              {/* Orbital rings */}
              <div className="absolute inset-0 rounded-2xl border-2 border-purple-300/30 animate-pulse" />
            </motion.div>

            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 bg-clip-text text-transparent">
                Cosmos Token Evolution
              </h3>
              <p className="text-gray-600 mt-1 font-medium">Journey through the ecosystem</p>
            </div>
          </div>

          {/* Enhanced expand/collapse button */}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.4, type: "spring", stiffness: 200 }}
            className="relative"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <motion.span
                className="text-white text-lg"
                animate={{ y: isExpanded ? -2 : 2 }}
                transition={{ duration: 0.2 }}
              >
                {isExpanded ? '↑' : '↓'}
              </motion.span>
            </div>
          </motion.div>
        </div>

        {/* Scroll to top button when expanded */}
        {isExpanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={(e) => {
              e.stopPropagation();
              scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="absolute top-4 right-20 w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center transition-colors duration-200"
          >
            <span className="text-gray-600 text-sm">↑</span>
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="border-t border-gray-200/50"
          >
            <div
              ref={scrollRef}
              className="p-6 space-y-6 max-h-[600px] overflow-y-auto custom-scrollbar"
            >
              {/* Enhanced token grid - Optimized for horizontal space */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {tokenEntries.map(([value, token], index) => (
                  <motion.div
                    key={value}
                    initial={{ scale: 0.8, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{
                      delay: index * 0.05,
                      duration: 0.4,
                      type: "spring",
                      stiffness: 100
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    onHoverStart={() => setHoveredToken(value)}
                    onHoverEnd={() => setHoveredToken(null)}
                    className="group relative cursor-pointer"
                  >
                    <div
                      className="relative p-5 rounded-2xl transition-all duration-300 overflow-hidden h-full"
                      style={{
                        background: `linear-gradient(135deg, ${token.color}15, ${token.color}05)`,
                        border: `2px solid ${token.color}30`
                      }}
                    >
                      {/* Hover glow effect */}
                      <div
                        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{
                          background: `radial-gradient(circle at center, ${token.color}20, transparent 70%)`
                        }}
                      />

                      <div className="relative flex flex-col items-center text-center space-y-3 h-full">
                        <motion.div
                          className="flex-shrink-0"
                          whileHover={{ rotate: 360 }}
                          transition={{ duration: 0.6 }}
                        >
                          <div
                            className="w-16 h-16 lg:w-20 lg:h-20 xl:w-24 xl:h-24 rounded-2xl flex items-center justify-center text-white shadow-xl relative overflow-hidden"
                            style={{ background: token.gradient || token.color }}
                          >
                            <div className="text-3xl lg:text-4xl xl:text-5xl relative z-10">{token.emoji}</div>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          </div>
                        </motion.div>

                        <div className="flex-1 flex flex-col justify-center space-y-2">
                          <motion.span
                            className="text-sm lg:text-base bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full font-bold shadow-md mx-auto"
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {value}
                          </motion.span>
                          <span className="font-bold text-gray-800 text-lg lg:text-xl">{token.name}</span>
                          <p className="text-sm lg:text-base text-gray-600 leading-relaxed line-clamp-2">
                            {token.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Enhanced Achievement Tiers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200/50"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500" />

                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-3 text-2xl">🏆</span>
                  Achievement Tiers
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {[
                    { icon: '🥉', name: 'Novice', range: '2-32', color: 'from-gray-400 to-gray-500' },
                    { icon: '🥈', name: 'Explorer', range: '64-256', color: 'from-blue-400 to-blue-500' },
                    { icon: '🥇', name: 'Master', range: '512-1024', color: 'from-purple-400 to-purple-500' },
                    { icon: '💎', name: 'Cosmos', range: '2048', color: 'from-pink-400 to-pink-500' },
                    { icon: '♾️', name: 'Infinity', range: '4096+', color: 'from-cyan-400 to-cyan-500' }
                  ].map((tier, index) => (
                    <motion.div
                      key={tier.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className="text-center p-3 bg-white rounded-xl shadow-md border border-gray-200/50 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="text-2xl mb-2">{tier.icon}</div>
                      <div className="font-semibold text-gray-800 text-sm">{tier.name}</div>
                      <div className="text-xs text-gray-600">{tier.range}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Enhanced Game Tips */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative p-6 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl border border-cyan-200/50"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 to-blue-500" />

                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="mr-3 text-2xl">💡</span>
                  Pro Tips & Strategy
                </h4>

                <div className="space-y-3">
                  {[
                    'Keep your highest tile in a corner for better control',
                    'Build towards one direction consistently',
                    'Use the corners to create stable high-value tiles',
                    'Connect your Keplr wallet for NFT rewards!',
                    'Try to maintain a snake-like pattern on the board'
                  ].map((tip, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + index * 0.1 }}
                      className="flex items-start space-x-3 p-3 bg-white/70 rounded-lg"
                    >
                      <span className="text-cyan-500 text-sm mt-1">•</span>
                      <span className="text-sm text-gray-700 leading-relaxed">{tip}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Enhanced scroll progress indicator */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-200">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500"
                style={{ width: `${scrollProgress * 100}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TokenLegend;