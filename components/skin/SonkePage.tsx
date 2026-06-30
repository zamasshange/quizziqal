"use client";

import type { ReactNode } from "react";
import { PBS_GAMES_MODULE_ID } from "@/lib/pbs-shell";
import SonkeSiteHeader from "./SonkeSiteHeader";

type SonkePageProps = {
  pageTitle: string;
  children: ReactNode;
  searchSlot?: ReactNode;
};

export default function SonkePage({ pageTitle, children, searchSlot }: SonkePageProps) {
  return (
    <>
      <SonkeSiteHeader pageTitle={pageTitle} />
      {searchSlot}
      <div data-component-page-section-stack="true" className="PageSectionStack_innerWrapper__FGyTf">
        <div
          data-theme-context="module"
          data-theme-background-mode="pattern"
          data-theme-module-contextid={PBS_GAMES_MODULE_ID}
          className="ThemedModule_moduleWrapper__8K1_V sonke-page-module"
        >
          <div className="ThemedModule_bgLayers__8BKwC">
            <div className="ThemedModule_solidColor__mtJEd" />
            <div className="ThemedModule_pattern__rqwkC" />
          </div>
          <div className="ThemedModule_innerContent__58wFN sonke-page-content">{children}</div>
        </div>
      </div>
    </>
  );
}
