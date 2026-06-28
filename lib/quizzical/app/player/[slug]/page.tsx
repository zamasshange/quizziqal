import type { Metadata } from "next";
import { entityPageMetadata, entityStaticParams } from "@/lib/seoEntityRoute";
import EntitySeoPage from "@/components/seo/EntitySeoPage";

export const revalidate = 1209600;

export function generateStaticParams() {
  return entityStaticParams("player");
}

export async function generateMetadata(
  props: PageProps<"/player/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return entityPageMetadata("player", slug);
}

export default async function PlayerDiscoveryPage(
  props: PageProps<"/player/[slug]">,
) {
  const { slug } = await props.params;
  return <EntitySeoPage type="player" slug={slug} />;
}
