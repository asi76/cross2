/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'dark-bg':     '#080810',
        'dark-card':   '#0d0d1a',
        'dark-hover':  '#141422',
        'dark-border': '#2a2a40',
      },
    },
  },
  plugins: [],
}
