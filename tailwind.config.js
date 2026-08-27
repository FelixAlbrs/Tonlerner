/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Notenpapier – cremeweiß, leicht vergilbt.
        paper: {
          50: '#fdfbf5',
          100: '#f7f3e8',
          200: '#efe9da',
          300: '#e3dbc8',
          400: '#d3c9b2',
        },
        // Druckerschwärze für Noten und Text.
        ink: {
          900: '#14110d',
          700: '#3a352c',
          500: '#6b6355',
          300: '#9a9184',
        },
        // Rotstift – Korrekturen und Akzente.
        pencil: {
          600: '#a32f22',
          500: '#c0392b',
          400: '#d4574a',
          100: '#f7ddd9',
        },
        // Grüne Tinte – richtige Antworten.
        quill: {
          600: '#2f6b4f',
          500: '#3d8763',
          100: '#dfeee6',
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        // Serifen für Titel – wie ein gestochener Notendruck.
        serif: ['Georgia', 'Palatino', 'Palatino Linotype', 'Times New Roman', 'serif'],
      },
      boxShadow: {
        sheet: '0 1px 2px rgba(20,17,13,0.07), 0 6px 16px -8px rgba(20,17,13,0.18)',
        raised: '0 2px 4px rgba(20,17,13,0.10), 0 12px 24px -12px rgba(20,17,13,0.30)',
      },
    },
  },
  plugins: [],
}
