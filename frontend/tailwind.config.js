/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E85D26',
          light: '#FEF0EA',
          dark: '#7A2A0E',
        },
        background: '#F5F4F0',
        border: '#E8E7E3',
        text: {
          DEFAULT: '#1C1B19',
          secondary: '#6E6D69',
        },
      },
    },
  },
  plugins: [],
};
