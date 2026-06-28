import type { Metadata } from "next";
import { entityMetadata } from "@/lib/seo";
import { getStaticEntityParams, getEntity } from "@/lib/seoEntities";
import type { SeoEntityType } from "@/lib/seoEntitySlugs";

export function entityStaticParams(type: SeoEntityType) {
  return getStaticEntityParams(type);
}

export async function entityPageMetadata(
  type: SeoEntityType,
  slug: string,
): Promise<Metadata> {
  const entity = getEntity(type, slug);
  if (!entity) return { title: "Not found" };
  return entityMetadata(entity);
}
