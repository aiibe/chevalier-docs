// The sidebar only. The rest of a doc's chrome must render from the page
// itself — see docs/architecture.md.
import type { LayoutProps } from "chevalier";
import { navSections, slugFromPath } from "../../docs.ts";

export default function DocsLayout({ children, route }: LayoutProps) {
  const slug = slugFromPath(route.path);

  return (
    <div class="mx-auto flex max-w-6xl gap-12 px-6 py-10">
      {slug && (
        <aside class="hidden w-52 shrink-0 lg:block">
          <nav class="sticky top-20 space-y-6">
            {navSections().map((group) => (
              <div key={group.section}>
                <p class="mb-2 text-xs font-semibold tracking-wide text-slate-400 uppercase">
                  {group.section}
                </p>
                <ul class="space-y-1">
                  {group.docs.map((doc) => (
                    <li key={doc.slug}>
                      <a
                        href={`/docs/${doc.slug}`}
                        class={`block rounded px-2 py-1 text-sm ${
                          doc.slug === slug
                            ? "bg-slate-100 font-medium text-slate-900"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        }`}
                      >
                        {doc.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
      )}
      {children}
    </div>
  );
}
