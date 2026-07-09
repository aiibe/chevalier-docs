import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [{ id: "health-checks", text: "Health checks" }];

const samples = {
  api: {
    lang: "ts",
    src: `// app/routes/api.ts  →  mounted at /api
import { Hono } from "hono";

export const app = new Hono()
  .get("/", (c) => c.json({ ok: true })) // GET  /api
  .post("/echo", async (c) => c.json({ echo: await c.req.json() })); // POST /api/echo`,
  },
  health: {
    lang: "ts",
    src: `// app/routes/health.ts  →  GET /health returns { ok: true }
import { Hono } from "hono";

export const app = new Hono().get("/", (c) => c.json({ ok: true }));`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Handlers(
  { code }: PageProps<typeof loader>,
) {
  return (
    <Doc slug="handlers" headings={headings}>
      <p>
        Any route file can{" "}
        <code>export const app</code>, a Hono sub-app that serves any HTTP
        method. Its routes are <strong>file-relative</strong>. A handler at{" "}
        <code>routes/api.ts</code> declares <code>.get("/")</code> for{" "}
        <code>GET /api</code> and <code>.post("/echo")</code> for{" "}
        <code>POST /api/echo</code>.
      </p>

      <Code html={code.api} />

      <p>
        Use a handler for a standalone endpoint with no page. For a form that
        belongs to a page, use an <a href="/docs/pages">action</a>.
      </p>

      <H2 id="health-checks">Health checks</H2>
      <p>
        For a health check a load balancer or uptime probe can hit, add a
        handler that returns <code>200</code>:
      </p>
      <Code html={code.health} />
    </Doc>
  );
}
