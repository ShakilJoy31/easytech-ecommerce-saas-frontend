// app/(public)/store/[slug]/page.tsx

import StoreDetailPage from "@/components/home/StoreDetailPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  return generateDynamicMetadata({
    title: `${slug} | StoreForge`,
    description: `Browse products from ${slug} on StoreForge.`,
    keywords: ["store", "products", slug, "shop online"],
  });
}

export default async function StorePage({ params }: PageProps) {
  const { slug } = await params;
  return (
    <section className="mt-16">
      <StoreDetailPage slug={slug} />
    </section>
  );
}