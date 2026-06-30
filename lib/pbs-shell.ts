/** PBS homepage purple module — video/quiz picks row */
export const PBS_HOME_MODULE_ID = "f0673b59";

/** PBS games grid module context id — yellow summer pattern theme */
export const PBS_GAMES_MODULE_ID = "e8fb4aca";

const CMS_ASSETS = "https://cms-assets.prod.pbskids.org";

/** PBS CMS asset URL (images load cross-origin in img tags). */
export function pbsCmsAsset(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${CMS_ASSETS}${normalized}`;
}

const PBS_STYLESHEETS = [
  "/_next/static/css/c3c0a1b97ff938a8.css",
  "/_next/static/css/90ebed8fae37aeba.css",
  "/_next/static/css/bc38ad885b667d85.css",
  "/_next/static/css/b8e46b6ce17420bc.css",
  "/_next/static/css/8472b57d332d0edb.css",
  "/_next/static/css/48f2aeb793facfc4.css",
  "/_next/static/css/2e7d8b6178279125.css",
  "/_next/static/css/103436aca65ddc5e.css",
] as const;

export function getPbsStylesheetHrefs(): string[] {
  return [...PBS_STYLESHEETS];
}

export function getPbsFontPreloads(): { href: string; type: string }[] {
  return [];
}
