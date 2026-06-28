import type { Metadata } from "next";
import { entityPageMetadata, entityStaticParams } from "@/lib/seoEntityRoute";
import EntitySeoPage from "@/components/seo/EntitySeoPage";

export const revalidate = 1209600;

export function generateStaticParams() {
  return entityStaticParams("movie");
}

export async function generateMetadata(
  props: PageProps<"/movie/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  return entityPageMetadata("movie", slug);
}

export default async function MovieDiscoveryPage(
  props: PageProps<"/movie/[slug]">,
) {
  const { slug } = await props.params;
  return <EntitySeoPage type="movie" slug={slug} />;
}
