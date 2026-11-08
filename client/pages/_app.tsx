import "@/styles/globals.css";
import type { AppProps } from "next/app";
import store from "@/store";
import { Provider } from "react-redux";
import { NextUIProvider } from "@nextui-org/react";
import { Sarabun } from "next/font/google";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const inter = Sarabun({
  subsets: ["latin"],
  weight: ["400", "700"],
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <NextUIProvider disableAnimation disableRipple skipFramerMotionAnimations>
      <style jsx global>{`
        :root {
          --font-family: ${inter.style.fontFamily};
        }
        body {
          font-family: var(--font-family), sans-serif;
        }

        * {
          letter-spacing: -0.035em;
        }
      `}</style>
      <NextThemesProvider attribute="class" defaultTheme="light">
        <Provider store={store}>
          <Component {...pageProps} />
        </Provider>
      </NextThemesProvider>
    </NextUIProvider>
  );
}
