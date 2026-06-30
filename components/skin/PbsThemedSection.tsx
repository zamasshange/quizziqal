import type { ReactNode } from "react";

type PbsThemedSectionProps = {
  moduleId: string;
  backgroundMode?: "color" | "pattern";
  children: ReactNode;
  id?: string;
};

export default function PbsThemedSection({
  moduleId,
  backgroundMode = "color",
  children,
  id,
}: PbsThemedSectionProps) {
  return (
    <div data-component-page-section-stack="true" className="PageSectionStack_innerWrapper__FGyTf">
      <div
        id={id}
        data-theme-context="module"
        data-theme-background-mode={backgroundMode}
        data-theme-module-contextid={moduleId}
        className="ThemedModule_moduleWrapper__8K1_V"
      >
        <div className="ThemedModule_bgLayers__8BKwC">
          <div className="ThemedModule_solidColor__mtJEd" />
          {backgroundMode === "pattern" ? <div className="ThemedModule_pattern__rqwkC" /> : null}
        </div>
        <div className="ThemedModule_innerContent__58wFN">{children}</div>
      </div>
    </div>
  );
}
