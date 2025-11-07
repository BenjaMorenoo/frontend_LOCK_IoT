/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'institutional': {
          'white': '#FFFFFF',
          'black': '#000000',
          'gold': '#FFB800',
          'gold-light': '#FFD700',
          'gold-dark': '#E6A600',
          'gray-light': '#F8F9FA',
          'gray-medium': '#6C757D',
          'gray-dark': '#343A40',
        },
      },
      backgroundImage: {
        'institutional-gradient': 'linear-gradient(135deg, #FFFFFF 0%, #FFF9E6 50%, #FFECB3 100%)',
        'institutional-gold-gradient': 'linear-gradient(135deg, #FFD700 0%, #FFB800 50%, #E6A600 100%)',
        'institutional-dark-gradient': 'linear-gradient(135deg, #343A40 0%, #000000 100%)',
      },
      boxShadow: {
        'institutional': '0 10px 25px rgba(255, 184, 0, 0.15)',
        'institutional-lg': '0 20px 40px rgba(255, 184, 0, 0.2)',
      },
      keyframes: {
        fadeIn: { 
          '0%': { opacity: '0', transform: 'translateY(20px)' }, 
          '100%': { opacity: '1', transform: 'translateY(0)' } 
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 184, 0, 0.4)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 184, 0, 0.6)' }
        },
        goldShimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' }
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.6s ease-out',
        slideInLeft: 'slideInLeft 0.6s ease-out',
        slideInRight: 'slideInRight 0.6s ease-out',
        scaleIn: 'scaleIn 0.5s ease-out',
        float: 'float 3s ease-in-out infinite',
        glow: 'glow 2s ease-in-out infinite',
        goldShimmer: 'goldShimmer 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
