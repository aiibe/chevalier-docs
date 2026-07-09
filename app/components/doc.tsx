// Per-page chrome. Can't move to docs/_layout.tsx: layouts render after the
// page, so a <PageHead> there is silently dropped — see docs/architecture.md.
import type { ComponentChildren } from "preact";
import { PageHead } from "chevalier";
import { docMeta, type DocSlug, neighbours } from "../docs.ts";

export function Code({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

/** An h2 that anchors itself. `id` must match the page's `headings`. */
export function H2({ id, children }: { id: string; children: string }) {
  return <h2 id={id}>{children}</h2>;
}

export interface Heading {
  id: string;
  text: string;
}

export function Doc(
  { slug, headings, children }: {
    /** Must be this file's own name — a test asserts the <h1> matches. */
    slug: DocSlug;
    /** The page's h2s, in order — its on-page TOC. */
    headings: Heading[];
    children: ComponentChildren;
  },
) {
  const meta = docMeta(slug);
  const { prev, next } = neighbours(slug);

  return (
    <>
      <PageHead>
        <title>{meta.title} — Chevalier</title>
        <meta name="description" content={meta.description} />
      </PageHead>

      <div class="flex min-w-0 flex-1 gap-12">
        <article class="doc min-w-0 flex-1">
          <h1>{meta.title}</h1>
          {children}

          <nav class="mt-14 flex justify-between gap-4 border-t border-slate-200 pt-6 text-sm">
            {prev
              ? (
                <a
                  href={`/docs/${prev.slug}`}
                  class="text-slate-500 hover:text-slate-900"
                >
                  ← {prev.title}
                </a>
              )
              : <span />}
            {next
              ? (
                <a
                  href={`/docs/${next.slug}`}
                  class="text-right text-slate-500 hover:text-slate-900"
                >
                  {next.title} →
                </a>
              )
              : <span />}
          </nav>
        </article>

        {headings.length > 1 && (
          <aside class="hidden w-48 shrink-0 xl:block">
            <div class="sticky top-20">
              <p class="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                On this page
              </p>
              <ul class="space-y-1.5">
                {headings.map((h) => (
                  <li key={h.id}>
                    <a
                      href={`#${h.id}`}
                      class="block text-sm text-slate-500 hover:text-slate-900"
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </>
  );
}
