export const SITE_URL = "https://chevalier.souk.dev";

export function canonical(path: string): string {
  return `${SITE_URL}${path}`;
}
