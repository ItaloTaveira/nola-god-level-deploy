module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        primary: '#0064B2',
        secondary: '#33FF57',
      },
      backgroundColor: {
        'page-bg': '#0064B2',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      boxShadow: {
        'custom-light': '0 4px 6px rgba(0, 0, 0, 0.1)',
        'custom-dark': '0 20px 12px rgba(0, 0, 0, 0.5)',
      },
      fontFamily: {
        sans: ['Helvetica Neue', 'Arial', 'sans-serif'],
      },

      
    },
  },
  plugins: [],
}
