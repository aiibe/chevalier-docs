import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [];

const samples = {
  test: {
    lang: "ts",
    src: `// tests/routes.test.ts
import { assertEquals } from "@std/assert";
import { createTestApp } from "chevalier/testing";

const app = await createTestApp(new URL("../app", import.meta.url));

Deno.test("home renders", async () => {
  const res = await app.request("/");
  assertEquals(res.status, 200);
});

Deno.test("admin requires login", async () => {
  const res = await app.request("/admin", { redirect: "manual" });
  assertEquals(res.status, 302);
});`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Testing({ code }: PageProps<typeof loader>) {
  return (
    <Doc slug="testing" headings={headings}>
      <p>
        Test loaders, actions, middleware, and rendered pages without booting
        Vite. <code>createTestApp</code>{" "}
        builds the same app the dev server serves, straight from your{" "}
        <code>app/</code> directory, and every convention applies — pages,{" "}
        <code>_middleware</code>, <code>_layout</code>,{" "}
        <code>_404</code>, and the rest:
      </p>

      <Code html={code.test} />

      <p>
        Run with <code>deno test -A</code>. Files named <code>*.test.*</code> or
        {" "}
        <code>*.spec.*</code> never become routes, so colocating tests under
        {" "}
        <code>app/routes/</code> works too.
      </p>
      <p>
        One difference from the dev server: islands render their server HTML,
        but the page carries no client script, so nothing hydrates. Assert on
        the HTML; check hydration in the browser.
      </p>
    </Doc>
  );
}
