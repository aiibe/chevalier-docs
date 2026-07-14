// Per-page chrome. Can't move to docs/_layout.tsx: layouts render after the
// page, so a <PageHead> there is silently dropped.
import type { ComponentChildren } from "preact";
import { PageHead } from "chevalier";
import { docMeta, type DocSlug, neighbours } from "../docs.ts";
import { canonical } from "../site.ts";

export function Code({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

/** An h2 that anchors itself. `id` must match the page's `headings`. */
export function H2({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id}>
      {children}
      <a href={`#${id}`} class="anchor" aria-label={`Link to ${children}`}>
        <svg
          viewBox="0 0 16 16"
          width="14"
          height="14"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M7.775 3.275a.75.75 0 0 0 1.06 1.06l1.25-1.25a2 2 0 1 1 2.83 2.83l-2.5 2.5a2 2 0 0 1-2.83 0 .75.75 0 0 0-1.06 1.06 3.5 3.5 0 0 0 4.95 0l2.5-2.5a3.5 3.5 0 0 0-4.95-4.95l-1.25 1.25Zm-4.69 9.64a2 2 0 0 1 0-2.83l2.5-2.5a2 2 0 0 1 2.83 0 .75.75 0 0 0 1.06-1.06 3.5 3.5 0 0 0-4.95 0l-2.5 2.5a3.5 3.5 0 1 0 4.95 4.95l1.25-1.25a.75.75 0 0 0-1.06-1.06l-1.25 1.25a2 2 0 0 1-2.83 0Z" />
        </svg>
      </a>
    </h2>
  );
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
  const url = canonical(`/docs/${slug}`);

  return (
    <>
      <PageHead>
        <title>{meta.title} — Chevalier</title>
        <meta name="description" content={meta.description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={`${meta.title} — Chevalier`} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={url} />
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
