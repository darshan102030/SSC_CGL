/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ssc: {
          dark: '#1e293b',
          light: '#f8fafc',
          primary: '#3b82f6', // blue-500
          secondary: '#64748b', // slate-500
          success: '#22c55e', // green-500
          danger: '#ef4444', // red-500
          warning: '#eab308', // yellow-500
        },
        palette: {
          notVisited: '#e2e8f0', // slate-200
          visited: '#ef4444', // red-500
          answered: '#22c55e', // green-500
          marked: '#a855f7', // purple-500
          answeredMarked: '#3b82f6', // blue-500
        }
      }
    },
  },
  plugins: [],
}
