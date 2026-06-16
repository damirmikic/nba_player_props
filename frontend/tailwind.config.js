/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        best: {
          light: 'rgba(34, 197, 94, 0.2)',
          DEFAULT: '#22c55e',
        },
        highlight: {
          light: 'rgba(251, 191, 36, 0.15)',
          DEFAULT: '#fbbf24',
        },
      },
    },
  },
  plugins: [],
}
