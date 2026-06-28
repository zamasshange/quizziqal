import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import Button3D from "@/components/Button3D";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Page Not Found",
  description: "This page could not be found on Quizzical.site.",
  path: "/404",
  keywords: ["quizzical", "quiz not found"],
  noIndex: true,
});

export default function NotFound() {
  return (
    <SiteShell showCategories={false}>
      <div className="mx-auto mt-10 flex max-w-md flex-col items-center gap-5 text-center">
        <div className="text-7xl">🤔</div>
        <h1 className="font-display text-5xl font-extrabold">404</h1>
        <p className="text-lg font-bold text-ink/60">
          We couldn&apos;t find that page. Maybe it was a trick question?
        </p>
        <Button3D href="/" variant="grass" size="lg">
          Back to Quizzical
        </Button3D>
      </div>
    </SiteShell>
  );
}
