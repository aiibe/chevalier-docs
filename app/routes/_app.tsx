// The app shell: the one document wrapping every page. Layouts and the page
// nest inside <body> as {children}.

import { Head, type LayoutProps } from "chevalier";
import { SITE_URL } from "../site.ts";

export default function App({ children }: LayoutProps) {
  return (
    <html lang="en">
      <Head>
        <title>Chevalier — a Deno meta-framework that ships islands</title>
        <link rel="icon" href="/favicon.png" type="image/png" />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Chevalier" />
        <meta property="og:image" content={`${SITE_URL}/chevalier.og.png`} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="800" />
        <meta
          property="og:image:alt"
          content="Chevalier — a Deno meta-framework that ships islands, not bundles."
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      <body class="bg-white text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
