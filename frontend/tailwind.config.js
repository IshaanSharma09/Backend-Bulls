/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#F7FBF9",
        surface: "#E6F2EE",
        border: "#D1E4DE",
        text: {
          main: "#0F172A",
          muted: "#64748B",
        },
        brand: {
          primary: "#0E7C6B",
          accent: "#36C6A4",
          blue: "#2563EB",
          alert: "#FF6B6B",
          warning: "#F4C430",
        },
      },
    },
  },
  plugins: [],
};
