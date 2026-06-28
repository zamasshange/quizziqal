import type { Metadata } from "next";
import { entityPageMetadata, entityStaticParams } from "@/lib/seoEntityRoute";
import EntitySeoPage from "@/components/seo/EntitySeoPage";

export const revalidate = 1209600;

export function generateStaticParams() {
  return entityStaticParams("celebrity");
}

export async function generateMetadata(
  props: PageProps<"/celebrity/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return entityPageMetadata("celebrity", slug);
}

export default async function CelebrityDiscoveryPage(
  props: PageProps<"/celebrity/[slug]">,
) {
  const { slug } = await props.params;
  return <EntitySeoPage type="celebrity" slug={slug} />;
}
