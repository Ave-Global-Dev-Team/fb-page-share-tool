/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fb: {
          blue: '#1877F2',
          hover: '#166fe5',
          dark: '#0b1426',
          card: '#152238',
          cardHover: '#1c2d4a',
          border: '#243757',
          accent: '#00d2ff',
          success: '#10b981',
          warning: '#f59e0b',
          danger: '#ef4444'
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
