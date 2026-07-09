# TODO

## High

**`server.prod.ts` is never type-checked.** `check` is narrowed to `app/` so it
won't walk `dist/`. Upstream's `check:prod` task can't restore the coverage: it
builds, then checks `server.prod.ts`, which descends into the bundle anyway —
where Shiki's dynamic imports (`core.js`, `regex.js`, `index.js`) resolve to
modules Rollup never emits. `TS2307` ×4 on a build that runs fine. Needs a
`.d.ts` stub, or upstream not checking through emitted output. Report it.

**`createTestApp` can't see the zero-JS invariant.** Islands render their HTML
under test but never hydrate, so no page has a `<script>` and the framework's
central claim is untestable there. `tests/scripts.test.ts` covers it by booting
the real production server instead, and skips when `dist/` is missing — so it
silently does nothing in a clean checkout. CI must run `deno task build` before
`deno test`, or the guard is dead weight.

**A layout still can't own `<PageHead>` or the TOC.** 0.2.1's `route` prop moved
the sidebar into `routes/docs/_layout.tsx`, but layouts render _after_ the page:
a `<PageHead>` there is silently dropped, and `headings` are out of scope. Both
stay in `<Doc>`. Fixing it needs the framework to collect head vnodes across the
layout pass.

## Nice-to-have

**`meta.json` is hand-maintained.** Adding a doc means creating the route file
_and_ adding its entry, or the page silently vanishes from the sidebar and the
prev/next chain. A glob over the route files would derive it automatically, but
that reintroduces a `docs.ts` ↔ route-file import cycle and forces the registry
async — see `docs/architecture.md`. `tests/docs.test.ts` asserts the JSON keys
and the files on disk match, so the mistake fails the suite rather than
shipping.

**Each page's `headings` is written twice.** Once as the array `<Doc>` renders
into a TOC, once as the `<H2 id>` tags. Moving the sidebar to the layout
unblocked this: `<Doc>` now renders the article before the TOC aside, so a
context-registering `<H2>` would collect in time and the array could go. A test
asserts the two agree, so the duplication is safe until then.

**No search.** Ten pages is small enough to navigate by sidebar. If the docs
grow past ~20 pages, a client-side index over `meta.json` and the per-page
headings would be the cheapest thing that works — and it would be the site's
first island, which is on-message for the framework.

**Dark mode.** Shiki is pinned to the `github-light` theme and the prose CSS
assumes a light background. Supporting dark means loading a second theme and
emitting both, then switching on `prefers-color-scheme`.
