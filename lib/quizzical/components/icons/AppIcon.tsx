import type { LucideIcon } from "lucide-react";
import { APP_ICONS, type AppIconName } from "@/lib/icons/appIcons";

type AppIconProps = {
  name: AppIconName;
  /** Pixel size — passed to Lucide width/height */
  size?: number;
  className?: string;
  strokeWidth?: number;
  "aria-hidden"?: boolean;
  title?: string;
};

/** Consistent Lucide icon wrapper — use instead of emoji in UI chrome. */
export default function AppIcon({
  name,
  size = 20,
  className = "",
  strokeWidth = 2.25,
  title,
  ...rest
}: AppIconProps) {
  const Icon: LucideIcon = APP_ICONS[name];
  return (
    <Icon
      width={size}
      height={size}
      strokeWidth={strokeWidth}
      className={`shrink-0 ${className}`}
      aria-hidden={rest["aria-hidden"] ?? !title}
      aria-label={title}
    />
  );
}

export { APP_ICONS, type AppIconName };
