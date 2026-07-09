// The app shell: the one document wrapping every page. Layouts and the page
// nest inside <body> as {children}.

import { Head, type LayoutProps } from "chevalier";

export default function App({ children }: LayoutProps) {
  return (
    <html lang="en">
      <Head>
        <title>Chevalier — a Deno meta-framework that ships islands</title>
        <meta
          name="description"
          content="Chevalier is a small, file-routed Deno meta-framework that renders with Preact and ships islands, not bundles."
        />
        <link rel="icon" href="/favicon.png" type="image/png" />
      </Head>
      <body class="bg-white text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
