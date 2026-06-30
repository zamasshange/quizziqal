"use client";

import Link from "next/link";
import { SONKE_LOGO_SVG } from "@/lib/sonke-branding";

type SonkeSiteHeaderProps = {
  pageTitle: string;
};

export default function SonkeSiteHeader({ pageTitle }: SonkeSiteHeaderProps) {
  return (
    <div
      className="MastheadContentWrapper_outerWrapper__oDKFU"
      data-theme-context="masthead"
      data-masthead-content-layout=""
      data-masthead-content-module-name="MastheadContentModulesLookInsideGamePreview"
    >
      <header className="StandardHeader_outerWrapper__zM0jM StandardHeader_isTopLevelPage__qiptW">
        <h1 className="sr-only">{pageTitle}</h1>
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
            <Link
              className="NavButton_button__NtYeN StandardHeader_navIconButton__sYlVr"
              data-icon-name="games"
              href="/discover"
            >
              <div className="squish" data-animation-disabled="true">
                <div data-nav-button-inner="true" className="NavButton_buttonInner__3WCOl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="42" height="22" viewBox="0 0 42 22" aria-hidden="true" className="StandardHeader_gamesIcon__hgfE1">
                    <path fill="var(--svg-icon-fill-color, #fff)" fillRule="evenodd" d="M31.493.2h.019c1.792.002 3.554.466 5.119 1.35a10.54 10.54 0 0 1 3.826 3.715 10.675 10.675 0 0 1 .389 10.36 10.56 10.56 0 0 1-3.537 3.995 10.413 10.413 0 0 1-10.244.775 10.5 10.5 0 0 1-4.088-3.42h-3.931a10.5 10.5 0 0 1-4.09 3.43 10.42 10.42 0 0 1-10.258-.768 10.57 10.57 0 0 1-3.543-4.001 10.68 10.68 0 0 1 .393-10.374 10.55 10.55 0 0 1 3.835-3.716A10.43 10.43 0 0 1 10.53.2zM9.28 5.501h2.652V9.48h3.971v2.652h-3.97v3.97H9.28v-3.97H5.3V9.48H9.28zm18.244 8.562a2.65 2.65 0 1 0 0-5.301 2.65 2.65 0 0 0 0 5.3m10.399-5.911a2.65 2.65 0 1 1-5.301 0 2.65 2.65 0 0 1 5.3 0" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
            <Link
              className="NavButton_button__NtYeN StandardHeader_navIconButton__sYlVr hidden sm:inline-flex"
              data-icon-name="ai"
              href="/ai"
              aria-label="AI Quiz"
            >
              <div className="squish" data-animation-disabled="true">
                <div data-nav-button-inner="true" className="NavButton_buttonInner__3WCOl">
                  <span className="text-2xl leading-none" aria-hidden="true">🤖</span>
                </div>
              </div>
            </Link>
            <Link
              className="NavButton_button__NtYeN StandardHeader_navIconButton__sYlVr hidden md:inline-flex"
              data-icon-name="library"
              href="/library"
              aria-label="Library"
            >
              <div className="squish" data-animation-disabled="true">
                <div data-nav-button-inner="true" className="NavButton_buttonInner__3WCOl">
                  <span className="text-xl font-black leading-none" aria-hidden="true">+</span>
                </div>
              </div>
            </Link>
            <Link
              className="NavButton_button__NtYeN StandardHeader_navIconButton__sYlVr"
              data-icon-name="profile"
              href="/you"
              aria-label="Your profile"
            >
              <div className="squish" data-animation-disabled="true">
                <div data-nav-button-inner="true" className="NavButton_buttonInner__3WCOl">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="var(--svg-icon-fill-color, #fff)" aria-hidden="true">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        </nav>
      </header>
    </div>
  );
}
