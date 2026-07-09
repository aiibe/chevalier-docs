import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "the-app-shell", text: "The app shell" },
  { id: "nested-layouts", text: "Nested layouts" },
  { id: "the-route-prop", text: "The route prop" },
  { id: "per-page-head", text: "Per-page head" },
  { id: "error-pages", text: "Error pages" },
];

const samples = {
  app: {
    lang: "tsx",
    src: `// app/routes/_app.tsx
import { Head, type LayoutProps } from "chevalier";

export default function App({ children }: LayoutProps) {
  return (
    <html lang="en">
      <Head>
        <title>My App</title>
        <link rel="icon" href="/favicon.png" />
      </Head>
      <body>{children}</body>
    </html>
  );
}`,
  },
  layout: {
    lang: "tsx",
    src: `// app/routes/_layout.tsx
import type { LayoutProps } from "chevalier";

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <nav>…</nav>
      {children}
    </>
  );
}`,
  },
  route: {
    lang: "tsx",
    src: `// app/routes/docs/_layout.tsx
import type { LayoutProps } from "chevalier";

export default function DocsLayout({ children, route }: LayoutProps) {
  return (
    <>
      <nav>
        {links.map((l) => (
          <a href={l.href} aria-current={route.url === l.href ? "page" : undefined}>
            {l.title}
          </a>
        ))}
      </nav>
      {children}
    </>
  );
}`,
  },
  head: {
    lang: "tsx",
    src: `import { PageHead } from "chevalier";

export default function About() {
  return (
    <>
      <PageHead>
        <title>About — My App</title>
        <meta name="description" content="…" />
      </PageHead>
      <h1>About</h1>
    </>
  );
}`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Layouts({ code }: PageProps<typeof loader>) {
  return (
    <Doc slug="layouts" headings={headings}>
      <p>
        Drop these files in <code>app/routes/</code>{" "}
        and Chevalier picks them up — no wiring.
      </p>

      <H2 id="the-app-shell">The app shell</H2>
      <p>
        <code>_app.tsx</code> is the <strong>document shell</strong>: the single
        {" "}
        <code>&lt;html&gt;</code>…<code>&lt;body&gt;</code>{" "}
        structure wrapping every page. There's one, app-root-only. Render{" "}
        <code>&lt;Head&gt;</code> for the <code>&lt;head&gt;</code>{" "}
        — it adds charset/viewport meta and your stylesheets, and you put the
        app-wide{" "}
        <code>&lt;title&gt;</code>, favicon, and any extra tags inside it — and
        {" "}
        <code>{"{children}"}</code>{" "}
        for the page. Omit the file to use the built-in shell.
      </p>
      <Code html={code.app} />

      <H2 id="nested-layouts">Nested layouts</H2>
      <p>
        <code>_layout.tsx</code> is <strong>body-only chrome</strong>{" "}
        (nav, sidebar, footer) wrapping a page. Drop one at any level to wrap
        that directory and everything under it. Layouts{" "}
        <strong>nest</strong>: a route gets every ancestor{" "}
        <code>_layout.tsx</code>, outer→inner, each wrapping the next via{" "}
        <code>{"{children}"}</code>, all inside the app shell. A route with no
        {" "}
        <code>_layout.tsx</code> ancestor renders bare in the shell.
      </p>
      <Code html={code.layout} />

      <H2 id="the-route-prop">The route prop</H2>
      <p>
        Every <code>_layout.tsx</code> — and the <code>_app</code>{" "}
        shell — also receives{" "}
        <code>route</code>, so chrome can react to the current page without
        reaching for the raw request:
      </p>
      <ul>
        <li>
          <code>route.url</code> — the request path, e.g.{" "}
          <code>/docs/layouts</code>. What you match on to highlight the active
          nav link.
        </li>
        <li>
          <code>route.path</code> — the matched route pattern, e.g.{" "}
          <code>/docs/:slug</code>. <code>undefined</code>{" "}
          on a 404 or error render, since no route matched.
        </li>
        <li>
          <code>route.data</code> — the same{" "}
          <code>{"{ params, ...loaderData }"}</code> object the page receives.
        </li>
      </ul>
      <Code html={code.route} />
      <p>
        Layouts render <em>after</em> the page, so a layout can't contribute to
        {" "}
        <code>&lt;head&gt;</code>: a <code>&lt;PageHead&gt;</code>{" "}
        rendered from a layout is silently dropped. Keep it in the page.
      </p>

      <H2 id="per-page-head">Per-page head</H2>
      <p>
        Render <code>&lt;PageHead&gt;</code>{" "}
        anywhere in a page's JSX to add tags to <code>&lt;head&gt;</code> — a
        {" "}
        <code>&lt;title&gt;</code>, meta, links. They land in the shell's{" "}
        <code>&lt;Head&gt;</code>, and a page <code>&lt;title&gt;</code>{" "}
        overrides the shell default:
      </p>
      <Code html={code.head} />

      <H2 id="error-pages">Error pages</H2>
      <ul>
        <li>
          <code>_404.tsx</code>{" "}
          renders with status 404 for any unmatched route (and for a page's own
          {" "}
          <code>c.notFound()</code>).
        </li>
        <li>
          <code>_error.tsx</code>{" "}
          renders with status 500 and receives the thrown <code>error</code>
          {" "}
          as a prop. The error is also logged server-side via{" "}
          <code>console.error</code>.
        </li>
      </ul>
      <p>
        <code>_app</code>, <code>_404</code>, and <code>_error</code>{" "}
        are opt-in and app-root-only; omit any to fall back to the built-in
        shell / Hono's defaults. <code>_layout.tsx</code> and{" "}
        <code>_middleware.ts</code> are both per-directory.
      </p>
    </Doc>
  );
}
