/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,js}"
  ],
  theme: {
    extend: {
      colors: {
        'theme-green': '#4A7856',
        'theme-green-dark': '#2E4D36',
        'theme-green-light': '#A2C5AC',
        'theme-green-xlight': '#E0EFE3',
        'theme-brown': '#8C6E4E',
        'theme-beige': '#F5F5DC',
      }
    },
  },
  plugins: [],
}