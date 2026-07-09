// Landing page. Deliberately island-free: it ships zero client JS, which is
// the claim the page makes. The sample is highlighted server-side in the loader.
import { type PageLoader, type PageProps } from "chevalier";
import { highlight } from "../highlight.ts";

const SAMPLE = `// app/routes/index.tsx  →  GET /
import Counter from "../islands/counter.tsx";

export default function Home() {
  return (
    <main>
      <h1>Chevalier</h1>
      <Counter start={3} /> {/* the only JS shipped */}
    </main>
  );
}`;

const FEATURES = [
  {
    title: "File-based routing",
    body:
      "routes/index.tsx → /, blog/[slug].tsx → /blog/:slug, docs/[...rest].tsx catch-all. Familiar conventions, no config.",
  },
  {
    title: "Per-page islands",
    body:
      "Each page ships only the JS for the islands it actually rendered. No islands, no <script>.",
  },
  {
    title: "Split hot-reload",
    body:
      "Islands hot-update in place with state preserved. Route and layout edits force a full reload.",
  },
  {
    title: "Hono all the way down",
    body:
      "The HTTP layer stays Hono. Any route file can export const app to serve any method, as a sub-app.",
  },
  {
    title: "Tailwind v4",
    body:
      "Scaffolds with Tailwind wired for dev and production — utility classes work in pages and islands.",
  },
  {
    title: "Deno-native",
    body: "JSR package, Vite dev server, no package.json.",
  },
];

export const loader = (async () => ({
  sample: await highlight(SAMPLE, "tsx"),
})) satisfies PageLoader;

export default function Home({ sample }: PageProps<typeof loader>) {
  return (
    <>
      <section class="mx-auto max-w-6xl px-6 pt-16 pb-12">
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <img
              src="/chevalier.png"
              alt="Chevalier mascot"
              width="96"
              height="82"
              class="mb-6"
            />
            <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Ships islands,<br />not bundles.
            </h1>
            <p class="mt-5 max-w-lg text-lg text-slate-600">
              Chevalier is a small, file-routed Deno meta-framework that renders
              with Preact. A page with no islands ships{" "}
              <strong class="font-semibold text-slate-900">zero</strong>{" "}
              client JavaScript.
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="/docs/getting-started"
                class="rounded-md bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700"
              >
                Get started
              </a>
              <a
                href="/docs/introduction"
                class="rounded-md border border-slate-300 px-5 py-2.5 text-sm font-medium text-slate-700 hover:border-slate-400"
              >
                Read the docs
              </a>
            </div>

            <div class="mt-6 flex items-center gap-2 font-mono text-sm text-slate-500">
              <span class="select-none text-red-500">$</span>
              <code>deno run -Ar jsr:@chevalier/init my-app</code>
            </div>
          </div>

          <div
            class="doc-code min-w-0 rounded-xl border border-slate-200 shadow-sm"
            dangerouslySetInnerHTML={{ __html: sample }}
          />
        </div>
      </section>

      <section class="border-t border-slate-200 bg-slate-50">
        <div class="mx-auto max-w-6xl px-6 py-14">
          <div class="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title}>
                <h2 class="mb-1.5 font-semibold text-slate-900">{f.title}</h2>
                <p class="text-sm leading-relaxed text-slate-600">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
