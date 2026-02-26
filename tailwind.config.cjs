/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1F4D3A',
          50: '#f0f7f4',
          100: '#daeee3',
          200: '#b7dcca',
          300: '#87c3a8',
          400: '#55a583',
          500: '#358a67',
          600: '#266f52',
          700: '#1F4D3A',
          800: '#1a4232',
          900: '#163728',
          950: '#0c2019'
        },
        gold: {
          DEFAULT: '#C8A951',
          50: '#fdf9ef',
          100: '#f9efd3',
          200: '#f2dca5',
          300: '#eac56d',
          400: '#C8A951',
          500: '#d99d2b',
          600: '#c07e20',
          700: '#a0601d',
          800: '#834d1e',
          900: '#6c401c'
        },
        cream: {
          DEFAULT: '#F5F1E8',
          50: '#FDFCF9',
          100: '#F5F1E8',
          200: '#EDE6D5',
          300: '#E0D5BB'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans Arabic', 'system-ui', 'ui-sans-serif', 'sans-serif'],
        display: ['Playfair Display', 'Noto Sans Arabic', 'Georgia', 'serif']
      },
      boxShadow: {
        soft: '0 2px 15px rgba(0,0,0,0.04)',
        'soft-md': '0 8px 30px rgba(0,0,0,0.06)',
        'soft-lg': '0 18px 45px rgba(0,0,0,0.08)',
        card: '0 1px 3px rgba(0,0,0,0.03), 0 8px 24px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.06), 0 16px 40px rgba(0,0,0,0.08)'
      },
      backgroundImage: {
        'subtle-pattern':
          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)'
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
        'fade-in-up-delay': 'fadeInUp 0.8s ease-out 0.15s forwards',
        'fade-in-up-delay-2': 'fadeInUp 0.8s ease-out 0.3s forwards',
        'fade-in-up-delay-3': 'fadeInUp 0.8s ease-out 0.45s forwards',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        pulseSoft: {
          '0%, 100%': {
            transform: 'scale(1)',
            boxShadow: '0 0 0 0 rgba(37, 211, 102, 0.5)'
          },
          '50%': {
            transform: 'scale(1.04)',
            boxShadow: '0 0 0 10px rgba(37, 211, 102, 0)'
          }
        }
      }
    }
  },
  plugins: []
};
