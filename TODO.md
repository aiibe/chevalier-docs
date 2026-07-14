# TODO

## High

**`server.prod.ts` is never type-checked.** The `check` task is narrowed to
`app/` and `vite.config.ts` so that it won't walk `dist/`, which leaves the
production entry unchecked. Upstream's `check:prod` task can't restore the
coverage, because it builds first and then checks `server.prod.ts`, which
descends into the bundle anyway — and there Shiki's dynamic imports (`core.js`,
`regex.js`, `index.js`) resolve to modules Rollup never emits, so a build that
runs perfectly well reports four `TS2307` errors. Fixing this needs a `.d.ts`
stub, or upstream not type-checking through emitted output. Worth reporting.

**`createTestApp` can't see the zero-JS invariant.** Islands render their server
HTML under test but never hydrate, so no page ever carries a `<script>` and the
framework's central claim is untestable there — the assertion would pass even if
the build shipped a bundle. `tests/scripts.test.ts` covers it instead by booting
the real production server, but that test skips when `dist/` is missing, so it
does nothing at all in a clean checkout. CI has to run `deno task build` before
`deno test`, or the guard is dead weight.

**A layout still can't own `<PageHead>` or the TOC.** Chevalier 0.2.1's `route`
prop was enough to move the sidebar into `routes/docs/_layout.tsx`, but the rest
of the chrome can't follow, because layouts render _after_ the page: a
`<PageHead>` there is silently dropped, and a page's `headings` are already out
of scope. Both therefore stay in `<Doc>`. Hoisting them needs the framework to
collect head vnodes across the layout pass as well.

## Nice-to-have

**`meta.json` is hand-maintained.** Adding a doc means creating the route file
_and_ adding its entry, or the page silently vanishes from the sidebar and the
prev/next chain. A glob over the route files would derive the index
automatically, but it reintroduces a `docs.ts` ↔ route-file import cycle and
forces the registry to be async, where a single top-level `await` deadlocks it.
For now `tests/docs.test.ts` asserts that the JSON keys and the files on disk
are the same set, so forgetting an entry fails the suite rather than shipping.

**Each page's `headings` is written twice.** Once as the array `<Doc>` renders
into a table of contents, and again as the `<H2 id>` tags themselves. Moving the
sidebar into the layout unblocked collapsing this: `<Doc>` now renders the
article before the TOC aside, so a context-registering `<H2>` would collect its
headings in time and the array could go. Such an `<H2>` would still have to emit
the hover self-link it owns today. A test asserts the array and the tags agree,
so the duplication is safe until someone does the work.

**No search.** Ten pages is small enough to navigate from the sidebar. Should
the docs grow past roughly twenty, a client-side index over `meta.json` and the
per-page headings is the cheapest thing that would work — and it would become
the site's first island, which is on-message for the framework.

**Dark mode.** Shiki is pinned to the `github-light` theme and the prose CSS
assumes a light background throughout. Supporting dark means loading a second
theme and emitting both, then switching between them on `prefers-color-scheme`.
