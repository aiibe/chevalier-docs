import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [{ id: "observability", text: "Observability" }];

const samples = {
  guard: {
    lang: "ts",
    src:
      `// app/routes/admin/_middleware.ts  →  guards /admin and everything under it
import type { PageMiddleware } from "chevalier";
import { getSession } from "chevalier";

const guard: PageMiddleware = async (c, next) => {
  const session = await getSession<{ userId: number }>(
    c,
    Deno.env.get("SESSION_SECRET")!,
  );
  if (!session.data.userId) return c.redirect("/login");
  await next();
};

export default guard;`,
  },
  log: {
    lang: "ts",
    src: `// app/routes/_middleware.ts  →  logs every request
import type { PageMiddleware } from "chevalier";

const log: PageMiddleware = async (c, next) => {
  const start = performance.now();
  await next();
  const ms = (performance.now() - start).toFixed(1);
  console.log(\`\${c.req.method} \${c.req.path} \${c.res.status} \${ms}ms\`);
};

export default log;`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Middleware(
  { code }: PageProps<typeof loader>,
) {
  return (
    <Doc slug="middleware" headings={headings}>
      <p>
        Drop a <code>_middleware.ts</code> in any <code>app/routes/**</code>
        {" "}
        directory and its default export — a Hono middleware — runs before every
        page, handler, loader, and action at or under that directory. Call{" "}
        <code>next()</code> to continue; return a <code>Response</code>{" "}
        to short-circuit. This is the declarative place for an auth guard.
      </p>

      <Code html={code.guard} />

      <p>
        A <code>_middleware.ts</code> guards its own directory index{" "}
        (<code>/admin</code>) and its subtree, but not siblings. Nest
        directories to layer guards: they compose outer-to-inner, so{" "}
        <code>routes/_middleware.ts</code> wraps{" "}
        <code>routes/admin/_middleware.ts</code>. One guard per directory —
        compose multiple concerns inside the handler.
      </p>

      <H2 id="observability">Observability</H2>
      <p>
        Logging and metrics are bring-your-own — Chevalier ships no logger. To
        log every request, put a <code>_middleware.ts</code> at the root of{" "}
        <code>app/routes</code>. Drop in Hono's{" "}
        <a href="https://hono.dev/docs/middleware/builtin/logger">
          <code>logger</code>
        </a>{" "}
        for a quick start, or write your own for structured lines:
      </p>
      <Code html={code.log} />
    </Doc>
  );
}
