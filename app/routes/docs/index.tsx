// /docs has no page of its own — send readers to the first doc.
import type { PageLoader } from "chevalier";

export const loader =
  ((c) => c.redirect("/docs/introduction", 302)) satisfies PageLoader;

export default function DocsIndex() {
  return null;
}
