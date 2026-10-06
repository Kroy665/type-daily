import { Html, Head, Main, NextScript } from "next/document";

// Applies the saved (or system) theme before first paint to avoid a flash of
// the wrong theme. Keep in sync with ThemeContext.
const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}})()`;

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta name="theme-color" content="#0e0f13" media="(prefers-color-scheme: dark)" />
        <meta name="theme-color" content="#fafaf7" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/favicon.ico" />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
