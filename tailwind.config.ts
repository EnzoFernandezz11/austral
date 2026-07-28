import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#17221d",
        paper: "#f7f6f2",
        brand: {
          DEFAULT: "#275d45",
          soft: "#e5efe9",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgb(23 34 29 / 0.06), 0 8px 30px rgb(23 34 29 / 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
