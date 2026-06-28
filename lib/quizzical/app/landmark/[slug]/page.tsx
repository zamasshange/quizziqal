import type { Metadata } from "next";
import { entityPageMetadata, entityStaticParams } from "@/lib/seoEntityRoute";
import EntitySeoPage from "@/components/seo/EntitySeoPage";

export const revalidate = 2592000;

export function generateStaticParams() {
  return entityStaticParams("landmark");
}

export async function generateMetadata(
  props: PageProps<"/landmark/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return entityPageMetadata("landmark", slug);
}

export default async function LandmarkDiscoveryPage(
  props: PageProps<"/landmark/[slug]">,
) {
  const { slug } = await props.params;
  return <EntitySeoPage type="landmark" slug={slug} />;
}
