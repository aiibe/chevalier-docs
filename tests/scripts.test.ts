// Guards the claim the site makes in its footer: every page is server-rendered
// and ships no client JavaScript. The site renders no islands at all.
//
// createTestApp can't prove this — it never emits client scripts, so it would
// pass even if the build shipped a bundle. Only the real build tells the truth,
// so this suite boots the production server and is skipped when dist/ is absent.
import { assertEquals } from "@std/assert";

const built = await Deno.stat("dist/server/server.mjs")
  .then(() => true)
  .catch(() => false);

const PAGES = [
  "/",
  "/docs/introduction",
  "/docs/getting-started",
  "/docs/pages",
  "/docs/islands",
  "/docs/handlers",
  "/docs/layouts",
  "/docs/sessions",
  "/docs/middleware",
  "/docs/testing",
  "/docs/deployment",
];

Deno.test({
  name: "no page ships client JavaScript",
  ignore: !built, // run `deno task build` first
  async fn() {
    const server = new Deno.Command(Deno.execPath(), {
      args: ["serve", "-A", "--port", "8123", "server.prod.ts"],
      stdout: "null",
      stderr: "null",
    }).spawn();

    try {
      await waitForServer("http://localhost:8123/");

      const shipping: string[] = [];
      for (const path of PAGES) {
        const html = await (await fetch(`http://localhost:8123${path}`)).text();
        if (html.includes("<script")) shipping.push(path);
      }

      assertEquals(shipping, []);
    } finally {
      server.kill();
      await server.status;
    }
  },
});

async function waitForServer(url: string, tries = 50) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url);
      await res.body?.cancel();
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  throw new Error(`server never came up at ${url}`);
}
