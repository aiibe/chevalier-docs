import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "cookie-behaviour", text: "Cookie behaviour" },
  { id: "secrets-and-rotation", text: "Secrets and rotation" },
];

const samples = {
  guard: {
    lang: "tsx",
    src: `// app/routes/dashboard.tsx  →  guard on a session in the loader
import type { PageLoader } from "chevalier";
import { getSession } from "chevalier";

export const loader: PageLoader = async (c) => {
  const session = await getSession<{ userId: number }>(
    c,
    Deno.env.get("SESSION_SECRET")!,
  );
  if (!session.data.userId) return c.redirect("/login");
  return { userId: session.data.userId };
};`,
  },
  rotate: {
    lang: "ts",
    src: `const session = await getSession(c, [newSecret, oldSecret]);`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function Sessions(
  { code }: PageProps<typeof loader>,
) {
  return (
    <Doc slug="sessions" headings={headings}>
      <p>
        Call <code>getSession(c, secret)</code>{" "}
        from a loader or action to read and write a signed session cookie. Read
        {" "}
        <code>session.data</code>, <code>await session.set({"{ … }"})</code>
        {" "}
        to update it, and <code>session.destroy()</code> to log out. Empty{" "}
        <code>data</code>{" "}
        means no session — a fresh visitor, an expired session, or a cookie that
        failed its signature — so guard on it.
      </p>

      <Code html={code.guard} />

      <H2 id="cookie-behaviour">Cookie behaviour</H2>
      <p>
        The cookie is <code>HttpOnly</code> by default and <code>Secure</code>
        {" "}
        except on <code>localhost</code> /{" "}
        <code>127.0.0.1</code>, so it survives plain-HTTP dev.
      </p>
      <p>
        Sessions expire after 7 days: the expiry is signed into the payload and
        checked on read, so a captured cookie stops verifying too — and each
        {" "}
        <code>set</code> restamps it, so an active session keeps rolling.
      </p>
      <p>
        Pass <code>{"{ name }"}</code> to rename the cookie or{" "}
        <code>{"{ cookie }"}</code> to override its attributes — e.g.{" "}
        <code>{"{ cookie: { secure: true } }"}</code>{" "}
        behind a TLS-terminating proxy, or{" "}
        <code>{"{ cookie: { maxAge } }"}</code> for a different lifetime.
      </p>

      <H2 id="secrets-and-rotation">Secrets and rotation</H2>
      <p>
        Set <code>SESSION_SECRET</code>{" "}
        to a long random string. To rotate it without logging everyone out, pass
        an array with the new secret first:
      </p>
      <Code html={code.rotate} />
      <p>Then drop the old one once its cookies have aged out.</p>
    </Doc>
  );
}
