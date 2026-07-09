import { assertEquals, assertStringIncludes } from "@std/assert";
import { createTestApp } from "chevalier/testing";
import { docEntries, docSlugs, navSections } from "../app/docs.ts";

const app = await createTestApp(new URL("../app", import.meta.url));

const text = async (path: string) => await (await app.request(path)).text();

Deno.test("landing page renders", async () => {
  const res = await app.request("/");
  assertEquals(res.status, 200);
  assertStringIncludes(await res.text(), "Ships islands");
});

Deno.test("/docs redirects to the first doc", async () => {
  const res = await app.request("/docs", { redirect: "manual" });
  assertEquals(res.status, 302);
  assertEquals(res.headers.get("location"), "/docs/introduction");
});

// meta.json is hand-maintained, so a new route file can be missing from it (and
// vanish from the nav) or an entry can outlive its page. Neither may happen.
Deno.test("meta.json indexes exactly the doc route files on disk", async () => {
  const dir = new URL("../app/routes/docs", import.meta.url);
  const onDisk = [...Deno.readDirSync(dir)]
    .filter((e) =>
      e.isFile && e.name.endsWith(".tsx") && !e.name.startsWith("_") &&
      e.name !== "index.tsx"
    )
    .map((e) => e.name.replace(/\.tsx$/, ""))
    .sort();

  assertEquals(docSlugs().sort(), onDisk);

  // And each one actually serves.
  for (const slug of onDisk) {
    const res = await app.request(`/docs/${slug}`);
    assertEquals(res.status, 200, `/docs/${slug} should render`);
    await res.body?.cancel();
  }
});

Deno.test("meta.json is not itself a route", async () => {
  const res = await app.request("/docs/meta");
  assertEquals(res.status, 404);
  await res.body?.cancel();
});

Deno.test("unknown doc slug 404s", async () => {
  const res = await app.request("/docs/no-such-page");
  assertEquals(res.status, 404);
  await res.body?.cancel();
});

// Each page passes its own slug to <Doc> as a literal. The type stops a typo,
// but not a valid-yet-wrong slug — which would serve /docs/testing under the
// Sessions title, description, and prev/next. Every route must render the
// title meta.json maps its own filename to.
Deno.test("every route renders the title its slug maps to", async () => {
  for (const doc of docEntries) {
    const html = await text(`/docs/${doc.slug}`);
    assertStringIncludes(
      html,
      `<h1>${doc.title}</h1>`,
      `/docs/${doc.slug} should render its own <h1>`,
    );
    assertStringIncludes(
      html,
      `<title>${doc.title} — Chevalier</title>`,
      `/docs/${doc.slug} should render its own <title>`,
    );
  }
});

Deno.test("the doc description renders as a meta tag", async () => {
  const html = await text("/docs/pages");
  assertStringIncludes(html, 'name="description"');
  assertStringIncludes(html, "loaders, forms, and actions");
});

Deno.test("code samples are highlighted server-side", async () => {
  const html = await text("/docs/pages");
  assertStringIncludes(html, 'class="shiki');
  assertStringIncludes(html, 'style="color:#'); // Shiki emitted token colors
});

// A page's `headings` is hand-written, so it can drift from the h2s it renders.
// That would silently break the TOC; assert the two agree.
Deno.test("each page's TOC matches the h2s it renders, in order", async () => {
  for (const slug of docSlugs()) {
    const html = await text(`/docs/${slug}`);
    const rendered = [...html.matchAll(/<h2 id="([^"]+)">([^<]*)<\/h2>/g)]
      .map(([, id, text]) => ({ id, text }));

    // The TOC only renders above one heading; below that there's nothing to check.
    if (rendered.length <= 1) continue;
    const toc = [...html.matchAll(/href="#([^"]+)"[^>]*>\s*([^<]*?)\s*</g)]
      .map(([, id, text]) => ({ id, text }));
    assertEquals(toc, rendered, `/docs/${slug}: TOC must match its <h2> tags`);
  }
});

Deno.test("nav covers every doc exactly once, in order", () => {
  const flat = navSections().flatMap((g) => g.docs);
  assertEquals(flat.length, docSlugs().length);
  assertEquals(flat.map((d) => d.slug), docEntries.map((d) => d.slug));

  const orders = docEntries.map((d) => d.order);
  assertEquals([...orders].sort((a, b) => a - b), orders, "nav must be sorted");
});

Deno.test("the sidebar links every doc and marks the current one", async () => {
  const html = await text("/docs/pages");
  for (const slug of docSlugs()) {
    assertStringIncludes(html, `href="/docs/${slug}"`);
  }
  assertStringIncludes(html, "bg-slate-100 font-medium"); // active link
});

// The sidebar links every doc, so assert on the footer arrows specifically.
Deno.test("prev/next link to adjacent docs", async () => {
  const html = await text("/docs/pages"); // between getting-started and islands
  const footer = html.slice(html.indexOf("border-t border-slate-200 pt-6"));
  assertStringIncludes(footer, "←");
  assertStringIncludes(footer, "Getting started");
  assertStringIncludes(footer, "Islands");
  assertStringIncludes(footer, "→");
});

Deno.test("the first doc has no prev, the last no next", async () => {
  const first = await text(`/docs/${docEntries[0].slug}`);
  const last = await text(`/docs/${docEntries.at(-1)!.slug}`);
  const footerOf = (h: string) =>
    h.slice(h.indexOf("border-t border-slate-200 pt-6"));
  assertEquals(footerOf(first).includes("←"), false);
  assertEquals(footerOf(last).includes("→"), false);
});
