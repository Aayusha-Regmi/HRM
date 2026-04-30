/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#2a629a',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        accent: {
          100: '#fff7ed',
          500: '#ff7f3e',
          600: '#ea580c',
        }
      },
      fontFamily: {
        'public-sans': ['Public Sans', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}