import type { ReactNode } from "react";

export function ContentModule({
  children,
  className = "",
  panel = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  panel?: boolean;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={`sonke-inner-section ${panel ? "sonke-feature-panel" : ""} ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <div className="GamesCollage_iconHeaderWrapper__b6FGa sonke-section-heading">
      <h2 className="sonke-section-title">{children}</h2>
    </div>
  );
}
