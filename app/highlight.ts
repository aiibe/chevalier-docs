// Shiki, kept apart from the nav registry (docs.ts) on purpose: doc route files
// import this for their code samples, and docs.ts imports the route files to
// collect their `meta`. Merging the two would be a runtime import cycle that
// deadlocks under `deno test`.

import { createHighlighterCore, type HighlighterCore } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/** Only the languages the docs actually use — a full Shiki bundle is ~11 MB. */
const LANGS = ["tsx", "ts", "bash"] as const;
export type Lang = typeof LANGS[number];

let highlighterPromise: Promise<HighlighterCore> | undefined;
// Grammar/theme init is expensive; build once and reuse across requests.
const getHighlighter = () =>
  highlighterPromise ??= createHighlighterCore({
    themes: [import("@shikijs/themes/github-light")],
    langs: [
      import("@shikijs/langs/tsx"),
      import("@shikijs/langs/typescript"),
      import("@shikijs/langs/bash"),
    ],
    engine: createJavaScriptRegexEngine(),
  });

/** Highlight one snippet to HTML. Async: Shiki loads grammars before render. */
export async function highlight(code: string, lang: Lang): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, { lang, theme: "github-light" });
}

/** A doc's raw samples, keyed by the name its page renders them under. */
export type Samples = Record<string, { lang: Lang; src: string }>;

/** Highlight every sample in one pass. Doc loaders hand the result to <Doc>. */
export async function highlightAll<S extends Samples>(
  samples: S,
): Promise<Record<keyof S, string>> {
  const pairs = await Promise.all(
    Object.entries(samples).map(
      async ([k, { lang, src }]) => [k, await highlight(src, lang)] as const,
    ),
  );
  return Object.fromEntries(pairs) as Record<keyof S, string>;
}
