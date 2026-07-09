import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "features", text: "Features" },
  { id: "alternatives", text: "Alternatives" },
  { id: "stability", text: "Stability" },
];

const samples = {
  page: {
    lang: "tsx",
    src: `// app/routes/index.tsx  →  GET /
import Counter from "../islands/counter.tsx";

export default function Home() {
  return (
    <main>
      <h1>Chevalier</h1>
      <Counter start={3} /> {/* the only JS this page ships */}
    </main>
  );
}`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Introduction({ code }: PageProps<typeof loader>) {
  return (
    <Doc slug="introduction" headings={headings}>
      <p>
        <strong>Chevalier</strong> (<em>knight</em>{" "}
        in French) is a small, file-routed Deno meta-framework that renders with
        {" "}
        <a href="https://preactjs.com">Preact</a>{" "}
        and ships islands, not bundles.
      </p>

      <p>
        It keeps <a href="https://hono.dev">Hono</a>{" "}
        for the HTTP layer and brings a Preact view layer. A page with no
        islands ships <strong>zero</strong>{" "}
        client JavaScript. Adding an island never grows a page that doesn't use
        it.
      </p>

      <Code html={code.page} />

      <H2 id="features">Features</H2>
      <ul>
        <li>
          <strong>File-based routing.</strong> <code>routes/index.tsx</code> →
          {" "}
          <code>/</code>, <code>blog/[slug].tsx</code> →{" "}
          <code>/blog/:slug</code>, <code>docs/[...rest].tsx</code>{" "}
          catch-all. Familiar conventions, no config.
        </li>
        <li>
          <strong>Per-page islands.</strong>{" "}
          Each page ships only the JS for the islands it actually rendered. No
          islands, no <code>&lt;script&gt;</code>. An island is declared by{" "}
          <em>path</em>, never a wrapper in your code.
        </li>
        <li>
          <strong>Split hot-reload.</strong>{" "}
          Islands hot-update in place with state preserved (Preact Fast
          Refresh). Route and layout edits force a full reload.
        </li>
        <li>
          <strong>Hono all the way down.</strong>{" "}
          The HTTP layer stays Hono. Any route file can{" "}
          <code>export const app</code> to serve any method, as a Hono sub-app.
        </li>
        <li>
          <strong>Tailwind v4.</strong>{" "}
          Scaffolds with Tailwind wired for dev and production — utility classes
          work in pages and islands out of the box.
        </li>
        <li>
          <strong>Deno-native.</strong> JSR package, Vite dev server, no{" "}
          <code>package.json</code>.
        </li>
      </ul>

      <H2 id="alternatives">Alternatives</H2>
      <p>Chevalier is inspired by these. Reach for them if they fit better.</p>
      <ul>
        <li>
          <a href="https://github.com/honojs/honox">HonoX</a>. The closest
          shape. File routing and islands on Hono, with its own view layer
          instead of Preact.
        </li>
        <li>
          <a href="https://github.com/denoland/fresh">Fresh</a>. The Deno-native
          standard. Islands, file routing, and zero client JS by default,
          rendered with Preact.
        </li>
      </ul>

      <H2 id="stability">Stability</H2>
      <p>
        Chevalier is pre-1.0; the API can change between releases. Every release
        is recorded in the{" "}
        <a href="https://github.com/aiibe/chevalier/blob/main/CHANGELOG.md">
          changelog
        </a>, which also states the stability policy. Pin an exact version and
        read the entry before upgrading.
      </p>
    </Doc>
  );
}
