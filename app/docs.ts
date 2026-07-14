// Nav registry. The index stays JSON, not a glob over the route files: that
// cycles back through this module and forces the registry async.

import index from "./routes/docs/meta.json" with { type: "json" };

export interface DocMeta {
  title: string;
  description: string;
  order: number;
  section: string;
}

/**
 * Every slug meta.json indexes. `<Doc slug>` takes this, not `string`, so a
 * typo fails `deno check` rather than throwing on the request.
 */
export type DocSlug = keyof typeof index;

/** Just enough of a doc to link to it. */
export interface DocLink {
  slug: DocSlug;
  title: string;
}

export interface DocEntry extends DocMeta {
  slug: DocSlug;
}

/** Every doc, in nav order. */
export const docEntries: DocEntry[] = Object.entries(
  index as Record<DocSlug, DocMeta>,
)
  .map(([slug, meta]) => ({ slug: slug as DocSlug, ...meta }))
  .sort((a, b) => a.order - b.order);

export const docSlugs = (): DocSlug[] => docEntries.map((d) => d.slug);

/** A doc's own metadata: its <h1>, its <title>, its description. */
export function docMeta(slug: DocSlug): DocEntry {
  // Non-null: DocSlug is derived from meta.json's own keys.
  return docEntries.find((d) => d.slug === slug)!;
}

/**
 * The doc a layout is wrapping, from the matched route path. `undefined` when no
 * doc matched: a 404/error render, or /docs itself.
 */
export function slugFromPath(path: string | undefined): DocSlug | undefined {
  const last = path?.split("/").pop();
  return docEntries.some((d) => d.slug === last) ? last as DocSlug : undefined;
}

export interface NavSection {
  section: string;
  docs: DocLink[];
}

/** Nav tree, grouped by `section` in first-appearance order, sorted by `order`. */
export function navSections(): NavSection[] {
  const grouped: NavSection[] = [];
  for (const { slug, title, section } of docEntries) {
    const found = grouped.find((g) => g.section === section);
    if (found) found.docs.push({ slug, title });
    else grouped.push({ section, docs: [{ slug, title }] });
  }
  return grouped;
}

/** The docs either side of `slug` in nav order, for the page footer. */
export function neighbours(
  slug: DocSlug,
): { prev: DocLink | null; next: DocLink | null } {
  const i = docEntries.findIndex((d) => d.slug === slug);
  const link = (d: DocEntry): DocLink => ({ slug: d.slug, title: d.title });
  return {
    prev: i > 0 ? link(docEntries[i - 1]) : null,
    next: i >= 0 && i < docEntries.length - 1 ? link(docEntries[i + 1]) : null,
  };
}
