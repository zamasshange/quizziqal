import type { Metadata } from "next";
import AchievementsClient from "@/components/progression/AchievementsClient";

export const metadata: Metadata = {
  title: "Achievements",
  description: "Track your Quizzical achievements, badges, and mastery milestones.",
};

export default function AchievementsPage() {
  return <AchievementsClient />;
}
