import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#242825",
        muted: "#6e746e",
        paper: "#f8f7f2",
        moss: "#58705d",
        lavender: "#8881a5",
      },
      fontFamily: {
        sans: ["var(--font-body)", "sans-serif"],
        display: ["var(--font-display)", "serif"],
      },
      boxShadow: {
        soft: "0 18px 50px rgba(48, 56, 49, 0.07)",
      },
    },
  },
  plugins: [],
};

export default config;
