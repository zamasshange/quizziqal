"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { categories } from "@/lib/quizzes";
import {
  duckAmbientMusic,
  restoreAmbientMusic,
  startAmbientMusic,
  stopAmbientMusic,
} from "@/lib/atmosphere/ambientMusic";
import { useAtmosphereOptional } from "@/lib/atmosphere/context";
import { isMuted } from "@/lib/sound";

function categoryFromPath(path: string): string | undefined {
  const seg = path.split("/").filter(Boolean)[0];
  if (!seg) return undefined;
  return categories.some((c) => c.slug === seg) ? seg : undefined;
}

function isQuizPlay(path: string): boolean {
  return /^\/quiz\/[^/]+\/play/.test(path) || /^\/play\//.test(path);
}

/** Category-aware ambient music — respects global mute and ducks during SFX. */
export default function AmbientMusicLayer() {
  const pathname = usePathname();
  const atmosphere = useAtmosphereOptional();

  useEffect(() => {
    if (isMuted()) {
      stopAmbientMusic();
      return;
    }

    const override = atmosphere?.categorySlug;
    const fromPath = categoryFromPath(pathname);
    const category = override ?? fromPath;
    const quizPlay = isQuizPlay(pathname);

    if (pathname === "/" || category || quizPlay) {
      startAmbientMusic(quizPlay ? "__quiz__" : category);
      return () => stopAmbientMusic();
    }

    stopAmbientMusic();
  }, [pathname, atmosphere?.categorySlug]);

  useEffect(() => {
    const onMute = () => {
      if (isMuted()) stopAmbientMusic();
      else {
        const category =
          atmosphere?.categorySlug ?? categoryFromPath(pathname);
        const quizPlay = isQuizPlay(pathname);
        if (pathname === "/" || category || quizPlay) {
          startAmbientMusic(quizPlay ? "__quiz__" : category);
        }
      }
    };

    window.addEventListener("storage", onMute);
    const id = setInterval(onMute, 1500);
    return () => {
      window.removeEventListener("storage", onMute);
      clearInterval(id);
    };
  }, [pathname, atmosphere?.categorySlug]);

  return null;
}

export { duckAmbientMusic, restoreAmbientMusic };
