// Root layout: site header + footer, nested inside the app shell (_app.tsx).
// The docs sidebar is a nested _layout under routes/docs/.

import type { LayoutProps } from "chevalier";

const REPO = "https://github.com/aiibe/chevalier";
const JSR = "https://jsr.io/@chevalier/core";

export default function Layout({ children }: LayoutProps) {
  return (
    <div class="flex min-h-screen flex-col">
      <header class="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div class="mx-auto flex max-w-6xl items-center gap-6 px-6 py-3">
          <a
            href="/"
            class="flex items-center gap-2 font-semibold text-slate-900"
          >
            <img src="/chevalier.png" alt="" width="24" height="24" />
            Chevalier
          </a>
          <nav class="flex items-center gap-5 text-sm">
            <a
              href="/docs/introduction"
              class="text-slate-600 hover:text-slate-900"
            >
              Docs
            </a>
            <a href={JSR} class="text-slate-600 hover:text-slate-900">JSR</a>
            <a href={REPO} class="text-slate-600 hover:text-slate-900">
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <main class="flex-1">{children}</main>

      <footer class="border-t border-slate-200">
        <div class="mx-auto max-w-6xl px-6 py-8 text-sm text-slate-500">
          <p>
            Chevalier is MIT-licensed. This site is built with Chevalier — every
            page here is server-rendered and ships no client JavaScript.
          </p>
        </div>
      </footer>
    </div>
  );
}
