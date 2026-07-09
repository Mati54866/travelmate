/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    screens: {
      xs: "380px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    extend: {
      colors: {
        brand: {
          50: "#effcf7",
          100: "#d8f5ea",
          200: "#b4ead7",
          300: "#80d8bd",
          400: "#48bf9f",
          500: "#20967d",
          600: "#147967",
          700: "#125f53",
          800: "#124c43",
          900: "#123f38",
        },
        accent: {
          400: "#f9b44d",
          500: "#f49a24",
          600: "#db7b16",
        },
      },
      fontFamily: {
        display: ["Syne", "sans-serif"],
        body: ["Outfit", "Segoe UI", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 20px 60px rgba(18, 63, 56, 0.25)",
      },
    },
  },
  plugins: [],
};
