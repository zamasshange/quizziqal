import AppIcon from "@/components/icons/AppIcon";
import { categoryIconName } from "@/lib/icons/appIcons";

type CategoryIconProps = {
  slug: string;
  size?: number;
  className?: string;
};

/** Lucide icon for a quiz category slug. */
export default function CategoryIcon({
  slug,
  size = 24,
  className = "",
}: CategoryIconProps) {
  return (
    <AppIcon
      name={categoryIconName(slug)}
      size={size}
      className={className}
      aria-hidden
    />
  );
}
