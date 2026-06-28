import type { Metadata } from "next";
import { entityPageMetadata, entityStaticParams } from "@/lib/seoEntityRoute";
import EntitySeoPage from "@/components/seo/EntitySeoPage";

export const revalidate = 2592000;

export function generateStaticParams() {
  return entityStaticParams("country");
}

export async function generateMetadata(
  props: PageProps<"/country/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return entityPageMetadata("country", slug);
}

export default async function CountryDiscoveryPage(
  props: PageProps<"/country/[slug]">,
) {
  const { slug } = await props.params;
  return <EntitySeoPage type="country" slug={slug} />;
}
