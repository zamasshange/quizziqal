import type { ImageCategory } from "./imageQuestions";
import bootstrap from "./imageQuizBootstrap.json";

type BootstrapEntry = { image_url?: string | null };

/** Instant preview photo from bundled bootstrap — no API wait. */
export function getBootstrapPreviewUrl(
  category: ImageCategory,
  terms: string[],
): string | null {
  for (const term of terms) {
    const key = `${category}|${term}`;
    const entry = (bootstrap as Record<string, BootstrapEntry>)[key];
    const url = entry?.image_url?.trim();
    if (url) return url;
  }
  return null;
}
