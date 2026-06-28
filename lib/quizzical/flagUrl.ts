/** Self-hosted flag PNGs in /public/flags — no CDN or proxy required. */

export function flagUrlFromIso2(iso2: string): string {
  return `/flags/${iso2.trim().toLowerCase()}.png`;
}

export function flagUrlFromCode(code: string): string {
  return flagUrlFromIso2(code);
}
