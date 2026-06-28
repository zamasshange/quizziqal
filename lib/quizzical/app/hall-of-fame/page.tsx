import SiteShell from "@/components/SiteShell";
import HallOfFameClient from "@/components/progression/HallOfFameClient";

export const metadata = {
  title: "Hall of Fame | Quizzical",
  description:
    "Permanent recognition for Season Champions, Knowledge Legends, and the greatest explorers in Quizzical history.",
};

export default function HallOfFamePage() {
  return (
    <SiteShell>
      <div className="py-8">
        <HallOfFameClient />
      </div>
    </SiteShell>
  );
}
