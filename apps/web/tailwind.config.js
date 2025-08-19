/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'cosmic': ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Orbitron', 'Space Grotesk', 'monospace'],
      },
      animation: {
        'cosmic-pulse': 'cosmic-pulse 2s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'tile-spawn': 'tile-spawn 0.2s ease-out',
        'tile-merge': 'tile-merge 0.3s ease-out',
      },
      keyframes: {
        'cosmic-pulse': {
          '0%, 100%': { 
            transform: 'scale(1)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
          },
          '50%': { 
            transform: 'scale(1.05)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.8)'
          },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'glow': {
          'from': { boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' },
          'to': { boxShadow: '0 0 30px rgba(168, 85, 247, 0.8)' },
        },
        'tile-spawn': {
          'from': { 
            transform: 'scale(0) rotate(180deg)', 
            opacity: '0' 
          },
          'to': { 
            transform: 'scale(1) rotate(0deg)', 
            opacity: '1' 
          },
        },
        'tile-merge': {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      backgroundImage: {
        'cosmic': 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.05) 50%, transparent 100%)',
        'starfield': 'radial-gradient(2px 2px at 20px 30px, #eee, transparent), radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent), radial-gradient(1px 1px at 90px 40px, #fff, transparent), radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent)',
      },
      dropShadow: {
        'glow': '0 0 10px rgba(168, 85, 247, 0.5)',
        'cosmic': '0 0 20px rgba(99, 102, 241, 0.4)',
      },
    },
  },
  plugins: [],
}