import SiteShell from "@/components/SiteShell";
import KnowledgeAtlasClient from "@/components/progression/KnowledgeAtlasClient";

export const metadata = {
  title: "World Knowledge Atlas | Quizzical",
  description:
    "Fill your World Knowledge Atlas — countries, landmarks, athletes, movies, and more. Quizzical's ultimate discovery quest.",
};

export default function KnowledgeAtlasPage() {
  return (
    <SiteShell>
      <div className="py-8">
        <KnowledgeAtlasClient />
      </div>
    </SiteShell>
  );
}
