/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        primary: '#E85D26',
        'primary-light': '#FEF0EA',
        'primary-dark': '#7A2A0E',
        background: '#F5F4F0',
        border: '#E8E7E3',
        txt: '#1C1B19',
        'txt-2': '#6E6D69',
        'txt-3': '#B5B4B0',
        ok: '#EAF3DE',
        'ok-text': '#27500A',
        warn: '#FAEEDA',
        'warn-text': '#633806',
        info: '#E6F1FB',
        'info-text': '#0C447C',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  plugins: [],
};
