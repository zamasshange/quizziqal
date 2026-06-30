"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GameMode } from "@/lib/quizzical/imageQuestions";
import { pbsCmsAsset } from "@/lib/pbs-shell";

const SUMMER_ICON = pbsCmsAsset(
  "/global/UI-Assets/temp_egxqyxkkwsnjsmlunanjkqpmdwoygdijfrhr/summer.svg",
);

type PbsGamesCollageProps = {
  modes: GameMode[];
};

function shortTitle(title: string) {
  return title.replace(/^Guess the /i, "");
}

function FeaturedGameCard({ mode }: { mode: GameMode }) {
  return (
    <li className="GamesCollage_gamesListItem__a0qyq GamesCollage_twoByTwo__833i4">
      <div>
        <Link href={`/play/pic-${mode.slug}`}>
          <article
            data-pbsk-component-look-inside-card="true"
            data-use-loading-dots="true"
            className="LookInsideCard_lookInsideCard__3zfm8"
          >
            <div
              data-ga-click-ignore="true"
              className="LookInsideCard_cardSlides__GE8_p aspectCollageTwoByTwo"
            >
              <div className="LookInsideCard_cardSlide__I4tch LookInsideCard_currentSlide__sNfX7 aspectCollageTwoByTwo">
                <div
                  className="flex aspect-[908/510] w-full items-center justify-center text-7xl"
                  style={{ background: `${mode.color}44` }}
                  role="img"
                  aria-label={mode.title}
                >
                  {mode.emoji}
                </div>
              </div>
            </div>
            <p className="LookInsideCard_heading__title sr-only">{mode.title}</p>
          </article>
        </Link>
      </div>
    </li>
  );
}

function GameTile({ mode }: { mode: GameMode }) {
  const label = shortTitle(mode.title);

  return (
    <li className="GamesCollage_gamesListItem__a0qyq">
      <Link href={`/play/pic-${mode.slug}`} className="MediaItem_mediaLink__JSobH">
        <article data-hover-group="media-card" className="MediaItem_gameCard__KqR_7">
          <div className="MediaItem_imageContainer__jWZmZ aspect-square" data-use-loading-dots="true">
            <div
              className="flex h-full w-full items-center justify-center text-4xl"
              style={{ background: `${mode.color}33` }}
              aria-hidden="true"
            >
              {mode.emoji}
            </div>
          </div>
          <p className="MediaItem_heading__AybaX">{label}</p>
        </article>
      </Link>
    </li>
  );
}

export default function PbsGamesCollage({ modes }: PbsGamesCollageProps) {
  const router = useRouter();
  const [featured, ...rest] = modes;

  if (!featured) return null;

  return (
    <div className="GamesCollage_gamesGrid__jv6Iv" data-pbsk-content-module="GamesCollage" id="games">
      <div className="GamesCollage_iconHeaderWrapper__b6FGa">
        <img
          alt=""
          loading="eager"
          width={60}
          height={60}
          decoding="async"
          className="GamesCollage_iconStyling__T_knh"
          src={SUMMER_ICON}
        />
        <h2>Quick Play Games</h2>
      </div>
      <ul className="GamesCollage_gamesList__DDVyb">
        <FeaturedGameCard mode={featured} />
        {rest.map((mode) => (
          <GameTile key={mode.slug} mode={mode} />
        ))}
      </ul>
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => router.push("/discover")}
          className="sonke-btn sonke-btn-play"
        >
          Browse all quizzes
        </button>
      </div>
    </div>
  );
}
