import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "the-production-entry", text: "The production entry" },
  { id: "deno-deploy", text: "Deno Deploy" },
];

const samples = {
  build: {
    lang: "bash",
    src: `deno task build     # client + SSR build
deno task start     # serve the build`,
  },
  port: { lang: "bash", src: `deno serve -A --port 3000 server.prod.ts` },
  entry: {
    lang: "ts",
    src: `import app from "./dist/server/server.mjs";
import { serveStatic } from "chevalier/static";

const CLIENT_DIR = new URL("./dist/client", import.meta.url).pathname;
const IMMUTABLE = "public, max-age=31536000, immutable";
const REVALIDATE = "public, no-cache";

export default {
  fetch: serveStatic({
    fsRoot: CLIENT_DIR,
    fallthrough: (req) => app.fetch(req),
    cacheControl: (pathname) =>
      pathname.startsWith("/assets/") ? IMMUTABLE : REVALIDATE,
  }),
};`,
  },
  deploy: {
    lang: "bash",
    src: `deno task build
deno install -Arf jsr:@deno/deployctl
deployctl deploy --include=dist --include=deno.json --entrypoint=server.prod.ts`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Deployment(
  { code }: PageProps<typeof loader>,
) {
  return (
    <Doc slug="deployment" headings={headings}>
      <p>Build both bundles, then serve the result:</p>
      <Code html={code.build} />

      <p>
        Serves on port 8000. To change it, run <code>deno serve</code>{" "}
        directly with <code>--port</code> before the entry:
      </p>
      <Code html={code.port} />

      <H2 id="the-production-entry">The production entry</H2>
      <p>
        <code>server.prod.ts</code> serves static files from{" "}
        <code>dist/client</code>{" "}
        and falls through to the app's SSR routes. Content-hashed files under
        {" "}
        <code>/assets/</code> are pinned forever; <code>public/</code>{" "}
        files keep stable names, so they revalidate.
      </p>
      <Code html={code.entry} />
      <p>A CDN in front is still recommended for high traffic.</p>

      <H2 id="deno-deploy">Deno Deploy</H2>
      <p>
        Deploy doesn't run Vite, so build first, then ship <code>dist/</code>
        {" "}
        — it's gitignored, so include it explicitly:
      </p>
      <Code html={code.deploy} />
    </Doc>
  );
}
