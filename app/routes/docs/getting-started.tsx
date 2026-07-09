import type { PageLoader, PageProps } from "chevalier";
import { highlightAll, type Samples } from "../../highlight.ts";
import { Code, Doc, H2, type Heading } from "../../components/doc.tsx";

const headings: Heading[] = [
  { id: "add-to-an-existing-project", text: "Add to an existing project" },
  { id: "look-around", text: "Look around" },
  { id: "project-layout", text: "Project layout" },
];

const samples = {
  scaffold: {
    lang: "bash",
    src: `deno run -Ar jsr:@chevalier/init my-app
cd my-app
deno install
deno task dev`,
  },
  tasks: {
    lang: "bash",
    src: `deno task dev       # vite dev server
deno task build     # client + SSR build
deno task preview   # preview the build`,
  },
  add: { lang: "bash", src: `deno add jsr:@chevalier/core` },
  example: {
    lang: "bash",
    src: `cd examples/basic && deno install && deno task dev`,
  },
} satisfies Samples;

export const loader = (async () => ({
  code: await highlightAll(samples),
})) satisfies PageLoader;

export default function GettingStarted({ code }: PageProps<typeof loader>) {
  return (
    <Doc slug="getting-started" headings={headings}>
      <p>Scaffold a fresh app in one command:</p>
      <Code html={code.scaffold} />

      <p>
        Open the printed URL. You get a working app — a page, an island, a
        static page, a form, and an <code>/api</code>{" "}
        handler. Edit the island and it hot-updates in place, keeping its state;
        edit a route or <code>_layout.tsx</code>{" "}
        and the page does a full reload.
      </p>

      <p>The scaffolded app comes with these tasks:</p>
      <Code html={code.tasks} />

      <H2 id="add-to-an-existing-project">Add to an existing project</H2>
      <p>
        Add the core package and import <code>defineApp</code>:
      </p>
      <Code html={code.add} />

      <H2 id="look-around">Look around</H2>
      <p>Run the bundled example:</p>
      <Code html={code.example} />

      <H2 id="project-layout">Project layout</H2>
      <p>
        Routes live in <code>app/routes/</code>, islands in{" "}
        <code>app/islands/</code>. Static files (favicon,{" "}
        <code>robots.txt</code>
        , images) go in <code>public/</code> and are served from the site root.
      </p>
      <p>
        Styling is <a href="https://tailwindcss.com">Tailwind</a>{" "}
        v4 — write utility classes in any component. Add your own CSS or{" "}
        <code>@theme</code> in <code>app/styles.css</code>.
      </p>
    </Doc>
  );
}
