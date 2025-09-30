// tailwind.config.js
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        nasa: {
          blue: '#0b3d91',
          red: '#fc3d21',
          white: '#ffffff',
          gray: '#f5f5f5',
          black: '#000000'
        }
      }
    }
  },
  plugins: []
}
