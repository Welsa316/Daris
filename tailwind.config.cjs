/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#1F4D3A',
        gold: '#C8A951',
        cream: '#F5F1E8'
      },
      fontFamily: {
        sans: ['system-ui', 'ui-sans-serif', 'sans-serif']
      },
      boxShadow: {
        'soft-lg': '0 18px 45px rgba(0,0,0,0.08)'
      },
      backgroundImage: {
        'subtle-pattern':
          'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.04) 1px, transparent 0)'
      }
    }
  },
  plugins: []
};

