/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans Variable"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        wave: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'wave-slow': 'wave 22s linear infinite',
        'wave-fast': 'wave 13s linear infinite',
      },
      colors: {
        laut: {
          50: '#EAF3FA',
          100: '#D6E7F4',
          500: '#3D85B8',
          700: '#1F5E8C',
          900: '#123F63',
        },
        mangrove: {
          50: '#E7F4EF',
          600: '#1B7A5A',
          700: '#146248',
        },
      },
    },
  },
  plugins: [],
}

