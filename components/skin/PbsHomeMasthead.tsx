"use client";

import Link from "next/link";
import { SONKE_LOGO_SVG } from "@/lib/sonke-branding";
import { pbsCmsAsset } from "@/lib/pbs-shell";

const GAMES_ICON = pbsCmsAsset("/global/Homepage-Assets/game_globalNav_02.svg");
const VIDEOS_ICON = pbsCmsAsset("/global/Homepage-Assets/video_globalNav_02.svg");

function GamesSvgIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="42"
      height="22"
      viewBox="0 0 42 22"
      aria-hidden="true"
      className="MastheadGamesVideosButtonsFeature_buttonIcon__xSkm_"
    >
      <path
        fill="var(--svg-icon-fill-color, #fff)"
        fillRule="evenodd"
        d="M31.493.2h.019c1.792.002 3.554.466 5.119 1.35a10.54 10.54 0 0 1 3.826 3.715 10.675 10.675 0 0 1 .389 10.36 10.56 10.56 0 0 1-3.537 3.995 10.413 10.413 0 0 1-10.244.775 10.5 10.5 0 0 1-4.088-3.42h-3.931a10.5 10.5 0 0 1-4.09 3.43 10.42 10.42 0 0 1-10.258-.768 10.57 10.57 0 0 1-3.543-4.001 10.68 10.68 0 0 1 .393-10.374 10.55 10.55 0 0 1 3.835-3.716A10.43 10.43 0 0 1 10.53.2zM9.28 5.501h2.652V9.48h3.971v2.652h-3.97v3.97H9.28v-3.97H5.3V9.48H9.28zm18.244 8.562a2.65 2.65 0 1 0 0-5.301 2.65 2.65 0 0 0 0 5.3m10.399-5.911a2.65 2.65 0 1 1-5.301 0 2.65 2.65 0 0 1 5.3 0"
        clipRule="evenodd"
      />
    </svg>
  );
}

function VideosSvgIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="28"
      height="28"
      viewBox="0 0 28 28"
      aria-hidden="true"
      className="MastheadGamesVideosButtonsFeature_buttonIcon__xSkm_"
    >
      <path
        fill="var(--svg-icon-fill-color, #fff)"
        d="M2 4.5A2.5 2.5 0 0 1 4.5 2h14A2.5 2.5 0 0 1 21 4.5v19A2.5 2.5 0 0 1 18.5 26h-14A2.5 2.5 0 0 1 2 23.5v-19Zm4.75 4.75v9.5l8.5-4.75-8.5-4.75Z"
      />
    </svg>
  );
}

export default function PbsHomeMasthead() {
  return (
    <div
      className="MastheadContentWrapper_outerWrapper__oDKFU"
      data-theme-context="masthead"
      data-masthead-content-layout=""
      data-masthead-content-module-name="MastheadContentModulesGamesVideosButtonsFeature"
    >
      <header className="StandardHeader_outerWrapper__zM0jM StandardHeader_isTopLevelPage__qiptW">
        <h1 className="sr-only">Quizziqal</h1>
        <nav aria-labelledby="site-nav-title" className="StandardHeader_innerWrapper__plvA5">
          <h2 id="site-nav-title" className="sr-only">
            Site Menu
          </h2>
          <div>
            <Link href="/home" className="StandardHeader_navIconButton__sYlVr StandardHeader_pbsKidsLogo__coyGC">
              <div className="squish" data-animation-disabled="true">
                <div id="logo-wrap" className="AnimatedLogo_wrapper__r4Y_H">
                  <div dangerouslySetInnerHTML={{ __html: SONKE_LOGO_SVG }} />
                </div>
              </div>
            </Link>
          </div>
        </nav>
      </header>

      <div className="MastheadContentWrapper_imageWrapper__uXEqC">
        <div className="MastheadContentWrapper_image__YwX_8 MastheadContentWrapper_scaleMasthead__kGXtO" />
      </div>

      <div
        data-cy="masthead-content"
        data-has-producer-header-footer="false"
        className="MastheadContentWrapper_contentWrapper__m8xTx contain-full"
      >
        <div
          data-pbsk-content-module="MastheadGamesVideosButtonsFeature"
          className="MastheadGamesVideosButtonsFeature_componentWrapper__RJvf5"
        >
          <div className="squish" data-animation-disabled="true">
            <Link
              href="#games"
              className="MastheadGamesVideosButtonsFeature_sectionButton__KoFyz MastheadGamesVideosButtonsFeature_gamesButton__93jJd"
            >
              <img
                alt=""
                loading="eager"
                width={1238}
                height={1238}
                decoding="async"
                className="MastheadGamesVideosButtonsFeature_buttonImage__S_Vuc"
                src={GAMES_ICON}
              />
              <div className="MastheadGamesVideosButtonsFeature_buttonContent__IUdm_">
                <GamesSvgIcon />
                <span className="MastheadGamesVideosButtonsFeature_titleText___aOwS">Games</span>
              </div>
            </Link>
          </div>

          <div className="squish" data-animation-disabled="true">
            <Link
              href="#quiz-picks"
              className="MastheadGamesVideosButtonsFeature_sectionButton__KoFyz MastheadGamesVideosButtonsFeature_videosButton__f__FI"
            >
              <img
                alt=""
                loading="eager"
                width={1238}
                height={1238}
                decoding="async"
                className="MastheadGamesVideosButtonsFeature_buttonImage__S_Vuc"
                src={VIDEOS_ICON}
              />
              <div className="MastheadGamesVideosButtonsFeature_buttonContent__IUdm_">
                <VideosSvgIcon />
                <span className="MastheadGamesVideosButtonsFeature_titleText___aOwS">Videos</span>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
