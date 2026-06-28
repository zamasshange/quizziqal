import type { Metadata } from "next";
import SiteShell from "@/components/SiteShell";
import AiQuizGenerator from "@/components/AiQuizGenerator";
import JsonLd from "@/components/JsonLd";
import { aiGeneratorMetadata, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = aiGeneratorMetadata();

export default function AiPage() {
  return (
    <SiteShell showCategories={false} showFooter={false}>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Quizzical AI Quiz Generator",
          url: absoluteUrl("/ai"),
          applicationCategory: "EducationalApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
          description:
            "Generate custom trivia quizzes on any topic using AI and play them instantly.",
        }}
      />
      <AiQuizGenerator />
    </SiteShell>
  );
}
