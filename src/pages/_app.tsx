import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Inter, JetBrains_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import ErrorBoundary from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/context/ThemeContext";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      {/* Font variables on :root so fixed and portal content inherits them too */}
      <style jsx global>{`
        :root {
          --font-sans: ${sans.style.fontFamily};
          --font-mono: ${mono.style.fontFamily};
        }
      `}</style>
      <ThemeProvider>
        <ErrorBoundary>
          <SessionProvider session={session}>
            <Component {...pageProps} />
          </SessionProvider>
        </ErrorBoundary>
      </ThemeProvider>
    </>
  );
}
