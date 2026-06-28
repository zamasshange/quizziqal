"use client";

import ProgressionToasts from "@/components/progression/ProgressionToasts";
import CelebrationOverlay from "@/components/atmosphere/CelebrationOverlay";
import XpFloatLayer from "@/components/atmosphere/XpFloatLayer";
import AmbientMusicLayer from "@/components/atmosphere/AmbientMusicLayer";

/** Global game atmosphere overlays — mounted once in root layout. */
export default function ProgressionLayer() {
  return (
    <>
      <AmbientMusicLayer />
      <XpFloatLayer />
      <CelebrationOverlay />
      <ProgressionToasts />
    </>
  );
}
