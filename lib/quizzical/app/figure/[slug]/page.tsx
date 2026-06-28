import type { Metadata } from "next";
import { entityPageMetadata, entityStaticParams } from "@/lib/seoEntityRoute";
import EntitySeoPage from "@/components/seo/EntitySeoPage";

export const revalidate = 2592000;

export function generateStaticParams() {
  return entityStaticParams("figure");
}

export async function generateMetadata(
  props: PageProps<"/figure/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return entityPageMetadata("figure", slug);
}

export default async function FigureDiscoveryPage(
  props: PageProps<"/figure/[slug]">,
) {
  const { slug } = await props.params;
  return <EntitySeoPage type="figure" slug={slug} />;
}
