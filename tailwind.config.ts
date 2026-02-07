/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#800000', // Maroon/Dark Red (minimal use)
          light: '#A00000',
          dark: '#600000',
        },
        secondary: {
          DEFAULT: '#FFFFFF', // White
          cream: '#F5F5F5',
        },
        blue: {
          DEFAULT: '#1D4E89', // Patriotic Blue
          50: '#EBF2F9',
          100: '#D7E5F3',
          200: '#AFCBE7',
          300: '#87B1DB',
          400: '#5F97CF',
          500: '#377DC3',
          600: '#2C6399',
          700: '#1D4E89', // Main blue
          800: '#173A66',
          900: '#0F2643',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
