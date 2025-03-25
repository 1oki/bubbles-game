/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/*.{html,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        clifford: '#da373d',
      },
      screens:{
        // xs: '335px',
        sm: '480px',
        md: '780px',
        lg: '1024px',
        xl: '1280px',
        xxl: '1440px',
        '3xl': '1600px',
        // '4xl': '1920px'
    }
    }
  },
  plugins: [],
}

