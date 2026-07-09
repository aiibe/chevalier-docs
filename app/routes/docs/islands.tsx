import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "what-a-page-ships", text: "What a page ships" },
  { id: "hot-reload", text: "Hot reload" },
];

const samples = {
  counter: {
    lang: "tsx",
    src: `// app/islands/counter.tsx (interactive on the client after hydration)
import { useState } from "preact/hooks";

export default function Counter({ start = 0 }: { start?: number }) {
  const [n, setN] = useState(start);
  return (
    <button type="button" onClick={() => setN((v) => v + 1)}>
      counts: {n}
    </button>
  );
}`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Islands({ code }: PageProps<typeof loader>) {
  return (
    <Doc slug="islands" headings={headings}>
      <p>
        An island is a component that hydrates on the client. Make one by
        putting it under <code>app/islands/</code>{" "}
        (reserved at any depth). There is no <code>island()</code> wrapper. Its
        {" "}
        <strong>default export</strong> hydrates.
      </p>

      <Code html={code.counter} />

      <p>
        Import it into a page like any component and pass props. Chevalier
        serializes the props and hydrates the island in the browser. A page that
        renders no islands emits no client script at all.
      </p>

      <H2 id="what-a-page-ships">What a page ships</H2>
      <p>
        An island is server-rendered to HTML like any component, then hydrated
        in the browser — the markup arrives complete, and the JavaScript only
        takes over the interactive part. A page that imports one island ships
        exactly that island's worth of JavaScript, and nothing else.
      </p>
      <p>
        That is the whole model: adding an island never grows a page that
        doesn't use it. This documentation site is the demonstration — it
        renders no islands, so it ships <strong>zero</strong>{" "}
        client JavaScript on every page, and a test asserts that against the
        production build.
      </p>

      <H2 id="hot-reload">Hot reload</H2>
      <p>
        In dev, islands hot-update in place with their state preserved (Preact
        Fast Refresh). Edit <code>counter.tsx</code>{" "}
        and the count stays where it was. Edit a route or a{" "}
        <code>_layout.tsx</code>{" "}
        and the page does a full reload instead — there's no island state to
        preserve, so a reload is simpler and always correct.
      </p>
    </Doc>
  );
}
