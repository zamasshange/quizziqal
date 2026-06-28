import LiveActivityFeed from "@/components/platform/LiveActivityFeed";
import PlayerSpotlights from "@/components/platform/PlayerSpotlights";
import RecommendedForYou from "@/components/platform/RecommendedForYou";
import TopPlayersWidget from "@/components/platform/TopPlayersWidget";

/** Homepage live platform sections — feed, spotlights, recommendations. */
export default function PlatformHub() {
  return (
    <div className="mt-4 md:mt-7">
      <TopPlayersWidget />
      <RecommendedForYou />
      <PlayerSpotlights />
      <LiveActivityFeed />
    </div>
  );
}
