import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "the-production-entry", text: "The production entry" },
  { id: "deno-deploy", text: "Deno Deploy" },
  { id: "docker", text: "Docker" },
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
  dockerfile: {
    lang: "bash",
    src: `FROM denoland/deno:debian-2.9.2 AS build
WORKDIR /app
COPY deno.json deno.lock ./
RUN deno install --allow-scripts
COPY . .
RUN deno task build

FROM denoland/deno:distroless-2.9.2
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/deno.json /app/deno.lock ./
COPY server.prod.ts ./
EXPOSE 8000
CMD ["serve", "-A", "--host", "0.0.0.0", "--port", "8000", "server.prod.ts"]`,
  },
  compose: {
    lang: "bash",
    src: `services:
  docs:
    build: .
    expose:
      - "8000"
    restart: unless-stopped`,
  },
  composeUp: { lang: "bash", src: `docker compose up --build` },
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

      <H2 id="docker">Docker</H2>
      <p>
        The same entry runs in a container, because <code>deno serve</code>{" "}
        takes the very handler Deno Deploy expects — there's no second
        entrypoint to keep in sync. Build in a full image, where{" "}
        <code>deno install</code>{" "}
        and Vite have a toolchain to work with, then ship the result on a
        distroless one that carries nothing but the Deno binary and the app:
      </p>

      <Code html={code.dockerfile} />

      <p>
        Only three things need to reach the runtime stage: <code>dist/</code>,
        {" "}
        <code>server.prod.ts</code>, and <code>deno.json</code> alongside{" "}
        <code>deno.lock</code>. That last pair looks like a build leftover, but
        dropping it breaks the container at startup rather than at build —{" "}
        <code>server.prod.ts</code> imports <code>chevalier/static</code>{" "}
        by its import-map specifier, so Deno reads the manifest to resolve it
        and the lockfile to pin the version. Pair the build with a{" "}
        <code>.dockerignore</code> that excludes{" "}
        <code>dist/</code>, since the build stage runs{" "}
        <code>deno task build</code>{" "}
        itself and a local build would only be shipped to the daemon to be
        overwritten.
      </p>
      <p>
        A compose file runs it, and <code>expose</code>{" "}
        publishes the port to other containers but not to the host — which
        assumes a reverse proxy in front, where TLS and caching belong:
      </p>

      <Code html={code.compose} />
      <Code html={code.composeUp} />

      <p>
        To reach the site directly instead — a local smoke test, or a
        single-host deploy with nothing in front of it — map the port yourself
        with <code>docker run -p 8000:8000</code>.
      </p>
    </Doc>
  );
}
