import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "loading-data", text: "Loading data" },
  { id: "forms", text: "Forms" },
];

const samples = {
  about: {
    lang: "tsx",
    src: `// app/routes/about.tsx  →  GET /about
export default function About() {
  return <h1>About</h1>;
}`,
  },
  loader: {
    lang: "tsx",
    src: `// app/routes/blog/[slug].tsx  →  GET /blog/:slug
import type { PageLoader, PageProps } from "chevalier";

export const loader = (async (c) => {
  const post = await getPost(c.req.param("slug"));
  if (!post) return c.notFound(); // Response → skips render
  return { post };
}) satisfies PageLoader;

export default function Post({ post, params }: PageProps<typeof loader>) {
  return <article>{post.title}</article>;
}`,
  },
  form: {
    lang: "tsx",
    src: `// app/routes/guestbook.tsx  →  GET renders, POST signs
import type { PageAction, PageLoader, PageProps } from "chevalier";

export const loader = (() => ({ entries: readEntries() })) satisfies PageLoader;

export const action: PageAction = async (c) => {
  const message = (await c.req.formData()).get("message")?.toString();
  if (message) addEntry(message);
  return c.redirect(c.req.path, 303); // PRG: re-GET runs the loader again
};

export default function Guestbook({ entries }: PageProps<typeof loader>) {
  return (
    <form method="post">
      <input name="message" />
      <button type="submit">Sign</button>
    </form>
  );
}`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Pages({ code }: PageProps<typeof loader>) {
  return (
    <Doc slug="pages" headings={headings}>
      <p>
        A page is a default-exported Preact component under{" "}
        <code>app/routes/**</code>. It renders inside the layout and is
        GET-only. Other methods 404.
      </p>

      <Code html={code.about} />

      <p>
        The filename is the URL. <code>index.tsx</code> → <code>/</code>,{" "}
        <code>blog/[slug].tsx</code> → <code>/blog/:slug</code> (read it with
        {" "}
        <code>c.req.param("slug")</code>), and <code>docs/[...rest].tsx</code>
        {" "}
        catches <code>/docs/a/b/c</code>.{" "}
        <code>_</code>-prefixed files are convention, never routes.
      </p>

      <H2 id="loading-data">Loading data</H2>
      <p>
        A page also gets its route <code>params</code>{" "}
        as a prop. To fetch data before render, <code>export const loader</code>
        {" "}
        — it runs with the Hono context, and whatever object it returns is
        merged into the page props. It may be{" "}
        <code>async</code>; render stays sync. Return a <code>Response</code>
        {" "}
        instead to short-circuit (redirect, 404, custom status).
      </p>
      <p>
        Type the loader with{" "}
        <code>satisfies PageLoader</code>, then type the page with{" "}
        <code>PageProps&lt;typeof loader&gt;</code>{" "}
        — the payload flows through, so the page can't drift from what the
        loader returns:
      </p>
      <Code html={code.loader} />

      <H2 id="forms">Forms</H2>
      <p>
        To handle a form, <code>export const action</code> alongside{" "}
        <code>loader</code>: <code>loader</code> reads on GET,{" "}
        <code>action</code> writes on POST. A{" "}
        <code>&lt;form method="post"&gt;</code>{" "}
        posts to its own page, so both live in one file. Return a{" "}
        <code>303</code>{" "}
        redirect (normally back to the same path) — the browser re-GETs and{" "}
        <code>loader</code> re-runs with the new state.
      </p>
      <Code html={code.form} />

      <p>
        Actions are CSRF-protected out of the box: same-origin{" "}
        <code>&lt;form&gt;</code>{" "}
        posts just work, while a cross-origin post from a browser is rejected
        with a <code>403</code>. A post larger than 1 MiB is rejected with a
        {" "}
        <code>413</code>{" "}
        — plenty for forms; for file uploads, use a handler and set your own
        limit.
      </p>
      <p>
        Use <code>action</code>{" "}
        for a form that belongs to a page. For a standalone endpoint with no
        page, use a <a href="/docs/handlers">handler</a>.
      </p>
    </Doc>
  );
}
