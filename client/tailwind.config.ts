import type { Config } from "tailwindcss";
import webSetting from "./helpers/webSetting.json";
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      borderColor: {
        DEFAULT: "#f2f2f2",
        dark: "#ffffff1d",
      },
      colors: {
        clean: {
          main: webSetting.main,
          navi: webSetting.navi,
        },
        gray: "#b7bdc6",
      },
    },
  },
  plugins: [nextui()],
};

export default config;
