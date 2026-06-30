"use client";

import PbsHomeMasthead from "@/components/skin/PbsHomeMasthead";
import PbsThemedSection from "@/components/skin/PbsThemedSection";
import PbsQuizPicks from "@/components/home/PbsQuizPicks";
import PbsGamesCollage from "@/components/home/PbsGamesCollage";
import { PBS_GAMES_MODULE_ID, PBS_HOME_MODULE_ID } from "@/lib/pbs-shell";
import { discoverQuizzes, IMAGE_GAME_MODES } from "@/lib/discoverData";

const featuredQuizzes = [...discoverQuizzes]
  .sort((a, b) => b.plays - a.plays)
  .slice(0, 6);

export default function HomePage() {
  return (
    <div className="pbs-home-shell">
      <PbsHomeMasthead />

      <PbsThemedSection moduleId={PBS_HOME_MODULE_ID} backgroundMode="color">
        <PbsQuizPicks quizzes={featuredQuizzes} />
      </PbsThemedSection>

      <PbsThemedSection moduleId={PBS_GAMES_MODULE_ID} backgroundMode="pattern">
        <PbsGamesCollage modes={IMAGE_GAME_MODES} />
      </PbsThemedSection>
    </div>
  );
}
