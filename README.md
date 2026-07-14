# chevalier-docs

The documentation site for [Chevalier](https://github.com/aiibe/chevalier) —
built with Chevalier, so the site is also a working example of the framework.

```sh
deno install
deno task dev       # start the dev server
deno task check     # format, lint, and type-check
deno task build     # build for production
deno test -A        # run the tests (build first — see below)
```

## Writing docs

Each doc is a route file in `app/routes/docs/`, so `sessions.tsx` serves
`/docs/sessions`. Prose is JSX. Adding a doc takes **two** edits.

First, index it in `app/routes/docs/meta.json`. `section` groups pages in the
sidebar (in first-appearance order) and `order` sorts them:

```json
"sessions": {
  "title": "Sessions",
  "description": "Signed session cookies, read and written from a loader.",
  "order": 7,
  "section": "Guides"
}
```

Then write the page. It declares its own headings and code samples, and wraps
its prose in `<Doc>`:

```tsx
const headings: Heading[] = [{
  id: "cookie-behaviour",
  text: "Cookie behaviour",
}];

const samples = {
  guard: { lang: "ts", src: `const s = await getSession(c, secret);` },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Sessions({ code }: PageProps<typeof loader>) {
  return (
    <Doc slug="sessions" headings={headings}>
      <p>…</p>
      <Code html={code.guard} />
      <H2 id="cookie-behaviour">Cookie behaviour</H2>
    </Doc>
  );
}
```

The `slug` must be the file's own name. A slug missing from `meta.json` fails
`deno check`; a slug belonging to a _different_ page typechecks but fails the
tests, which assert every route renders the `<h1>` and `<title>` its own
filename maps to.

Forget the `meta.json` entry and the page vanishes from the sidebar and the
prev/next chain — so a test asserts the JSON keys and the route files on disk
are the same set. The index is JSON rather than a glob over the route files
because a glob cycles back through `app/docs.ts` and forces the registry async.

`<Doc>` renders the sidebar, the `<h1>` and `<title>` from `meta.json`, the
table of contents from `headings`, and the prev/next footer. It can't live in
`_layout.tsx`: a Chevalier layout gets only `{children}`, so it can't tell which
doc is rendering.

`headings` must match the `<H2>` tags the page renders — a test asserts it, so
the TOC can't drift.

Samples are highlighted by Shiki in the loader, limited to `tsx`, `ts`, and
`bash`. To use another language, add its import in `app/highlight.ts` and widen
`Lang`; `Samples` then type-checks every sample against it.

## Zero client JavaScript

Every page here is server-rendered and ships **no** client JavaScript. The site
renders no islands; `app/routes/docs/islands.tsx` teaches them by quoting an
island's source as a code sample. `tests/scripts.test.ts` asserts the zero-JS
claim against the production build, so it can't silently rot.

That test needs `dist/`, so build before testing:

```sh
deno task build && deno test -A
```

Without a build it skips rather than fails.

## Design notes

`TODO.md` tracks known issues, including a framework limitation this site ran
into.

## Deploy

```sh
deno task build
deno install -Arf jsr:@deno/deployctl
deployctl deploy --include=dist --include=deno.json --entrypoint=server.prod.ts
```

### Docker

The `Dockerfile` builds the site and ships it on a distroless image;
`compose.yaml` runs it. `expose` publishes port 8000 only to other containers,
so run behind a reverse proxy — or map it to the host with
`docker run -p 8000:8000`.

```sh
docker compose up --build
```
