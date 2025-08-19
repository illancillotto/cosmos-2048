'use client';

import React, { useEffect, useState } from 'react';

const Confetti = ({ isActive, onComplete, duration = 3000 }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!isActive) {
      setParticles([]);
      return;
    }

    // Create confetti particles
    const newParticles = [];
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE'];
    const emojis = ['🎉', '✨', '🌟', '💫', '🎊', '🎈', '🎆'];

    for (let i = 0; i < 50; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -10,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        velocity: {
          x: (Math.random() - 0.5) * 4,
          y: Math.random() * 3 + 2
        },
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        opacity: Math.random() * 0.8 + 0.2,
        type: Math.random() > 0.7 ? 'emoji' : 'circle'
      });
    }

    setParticles(newParticles);

    // Clean up after duration
    const timer = setTimeout(() => {
      setParticles([]);
      if (onComplete) onComplete();
    }, duration);

    return () => clearTimeout(timer);
  }, [isActive, duration, onComplete]);

  useEffect(() => {
    if (particles.length === 0) return;

    const animationFrame = requestAnimationFrame(updateParticles);
    return () => cancelAnimationFrame(animationFrame);
  }, [particles]);

  const updateParticles = () => {
    setParticles(prev => 
      prev.map(particle => ({
        ...particle,
        x: particle.x + particle.velocity.x,
        y: particle.y + particle.velocity.y,
        rotation: particle.rotation + particle.rotationSpeed,
        velocity: {
          ...particle.velocity,
          y: particle.velocity.y + 0.1 // gravity
        },
        opacity: Math.max(0, particle.opacity - 0.005)
      })).filter(particle => 
        particle.y < window.innerHeight + 50 && 
        particle.opacity > 0
      )
    );
  };

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute"
          style={{
            left: particle.x,
            top: particle.y,
            transform: `rotate(${particle.rotation}deg)`,
            opacity: particle.opacity,
            fontSize: particle.type === 'emoji' ? `${particle.size}px` : undefined
          }}
        >
          {particle.type === 'emoji' ? (
            particle.emoji
          ) : (
            <div
              className="rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default Confetti;