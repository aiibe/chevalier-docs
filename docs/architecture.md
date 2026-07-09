# Architecture

How this docs site is built, and the constraints that shaped it.

## It's a Chevalier app

The site is built with Chevalier itself. That's deliberate — the framework's own
`TODO.md` asks for docs that "double as proof the framework ships real content."
Every page here is server-rendered with zero client JavaScript: the site renders
no islands, and `tests/scripts.test.ts` holds it to that against the real build.

## Docs are route files, not markdown

Each doc is a real route file under `app/routes/docs/`, so `/docs/pages` is
served by `pages.tsx` and nothing else. There is no content directory, no
frontmatter, and no markdown parser. Prose is JSX; code samples are template
literals handed to Shiki.

The site used to render `content/*.md` through `marked` behind a `[slug].tsx`
catch-all. Routing docs through a shim that reads a shadow content directory is
exactly the indirection a file-routed framework exists to delete, and the
dogfooding argument cuts the same way: ten real route files demonstrate the
framework, one catch-all demonstrates a markdown pipeline.

The trade-off is that prose lives in JSX, so text needs `{" "}` around inline
elements and entities like `&lt;` for angle brackets. `deno fmt` handles the
reflowing.

## The nav index is JSON, not a glob

`app/routes/docs/meta.json` maps each slug to its title, description, `section`,
and `order`. `app/docs.ts` reads it and builds the sidebar, the section
grouping, and the prev/next order.

Those four fields are exactly what one page needs to know about _another_ — the
sidebar lists every doc's title, and the footer names its neighbours. Everything
a page only needs about itself (its `headings`, its code samples) stays in the
route file.

The obvious alternative is `import.meta.glob("./routes/docs/*.tsx")`, reading a
`meta` export from each module. It costs an import cycle: `docs.ts` would import
every doc route file, while every doc route file imports `docs.ts` back for
`<Doc>`'s registry lookups. ESM tolerates that only if nothing runs at
module-eval time, which forces the whole registry to be lazy and async — and a
single top-level `await` deadlocks it. An earlier version of this site did
exactly that and hung under `deno test`.

JSON imports nothing, so there is no cycle and the registry is plain synchronous
code. Vite inlines the JSON into the SSR bundle (no runtime read, nothing to
ship alongside `dist/`), and Deno resolves the same static
`with { type: "json" }` import natively under `deno test`. One import, both
environments, no fallback branch.

The cost is that `meta.json` is hand-maintained: add a route file and you must
add its entry, or it silently vanishes from the nav. `tests/docs.test.ts`
asserts the JSON keys and the `.tsx` files on disk are the same set, so the
mistake fails the suite rather than shipping.

A `.json` file is safe to keep in `routes/`: Chevalier's router only treats
`.tsx`/`.jsx`/`.ts`/`.js` as routes, so `meta.json` never becomes `/docs/meta`.
A test asserts that too.

### Binding a page to its slug

Each page names its own slug as a literal, `<Doc slug="sessions">`, and that
string is what looks up the title, description, and neighbours. Two ways to get
it wrong, so there are two guards.

A slug that isn't in `meta.json` at all is a **type error**: `DocSlug` is
`keyof typeof index`, derived from the JSON's own keys, so `slug="sesions"`
fails `deno check`.

A slug that is valid but belongs to a _different_ page typechecks perfectly —
`testing.tsx` can say `slug="sessions"` and serve `/docs/testing` under the
Sessions title, description, and prev/next links. Nothing about the types can
catch that. So a test renders every route and asserts its `<h1>` and `<title>`
are the ones `meta.json` maps that route's own filename to.

## Why the page still owns most of its chrome

Chevalier 0.2.1 passes every `_layout.tsx` a `route` prop — the request `url`,
the matched route `path`, and the page's loader `data`. So the sidebar lives in
`routes/docs/_layout.tsx`, which derives the current slug from `route.path` via
`slugFromPath()` and marks the active link. On `/docs` (redirect-only) and on a
404 or error render no route matches, `slugFromPath` returns `undefined`, and
the layout renders the container without a sidebar.

The rest of the chrome cannot follow it, because **a layout renders after its
page**. Chevalier renders the page to a string first, collecting islands and any
`<PageHead>` vnodes, then wraps that string in each layout outer→inner. Two
consequences:

- A `<PageHead>` rendered from a layout is **silently dropped** — no error, no
  `<title>`. `pushHead` writes into a collector that is only open during the
  page render, so by the time the layout runs there is nothing to push to.
- A page's `headings` are only in scope during the page render, so the layout
  cannot build the table of contents. Threading them through the loader to reach
  `route.data` would work, but it moves a static array into an async loader and
  the duplication below stays either way.

So `<Doc>` (`app/components/doc.tsx`) keeps the `<PageHead>`, the `<h1>`, the
TOC, and the prev/next footer, which renders inside the page's own `<article>`.
Every page still wraps its prose in `<Doc slug="…" headings={…}>`. Hoisting the
last of it would need the framework to collect head vnodes across the layout
pass too.

## The table of contents is declared, and policed

Markdown gave the TOC for free: the renderer scraped `<h2>` tags out of the
generated HTML. JSX has nothing to scrape, and a page renders synchronously, so
`<Doc>` can't inspect its own children.

So each page declares its `h2`s in a `headings` array and writes them again as
`<H2 id="…">`. That duplication would silently rot the TOC, so
`tests/docs.test.ts` renders every doc and asserts the rendered TOC anchors
match the `<h2 id>` tags it emitted, in order. Change one without the other and
the suite fails.

The duplication used to be forced. Preact's SSR walks in document order, and
when the sidebar still lived inside `<Doc>` it rendered before the article's
`<H2>`s ever executed, so a context-registering `<H2>` collected nothing. Now
that the sidebar is in the layout, `<Doc>` renders
`<article>{children}</article>` _before_ the TOC `<aside>` beside it — so a
registering `<H2>` would populate in time. Collapsing the duplication is no
longer blocked on an extra `renderToString` pass; it just hasn't been done.

## Why Shiki is pinned to three languages

`shiki`'s top-level `codeToHtml` bundles every grammar it ships: the SSR output
was 11 MB across 311 chunks, including C++ and Emacs Lisp. Building a
`createHighlighterCore` with explicit `tsx`/`typescript`/`bash` imports brings
that to a few hundred KB.

Adding a language means adding its import in `app/highlight.ts` and widening
`Lang`. The `Samples` type then rejects any sample that names a language the
highlighter can't load, so this fails at type-check rather than at runtime.

Shiki's highlighter is async, but Chevalier renders synchronously
(`renderToString` — and async SSR is an explicit framework non-goal). So each
doc's `loader` awaits `highlightAll(samples)` and hands the rendered HTML
strings to the page as props.
