/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      aspectRatio: {
        "21/9": "21 / 9",
      },
    },
  },
  plugins: [],
};
