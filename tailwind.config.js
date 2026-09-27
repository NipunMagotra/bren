/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07080a',
          900: '#0a0c10',
          850: '#0e1117',
          800: '#141822',
          750: '#1a1f2c',
          700: '#222838',
        },
        cyan: {
          400: '#00f0ff',
          500: '#06b6d4',
        },
        lime: {
          400: '#a3e635',
          500: '#84cc16',
        },
        neon: {
          cyan: '#00f0ff',
          lime: '#22c55e',
          pink: '#f43f5e',
          amber: '#f59e0b',
          purple: '#a855f7'
        }
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['"Space Grotesk"', '"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
