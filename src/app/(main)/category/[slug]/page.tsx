// app/(public)/category/[slug]/page.tsx
import CategoryProductsPage from "@/components/home/CategoryProductsPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  return generateDynamicMetadata({
    title: `${slug} | StoreForge`,
    description: `Browse products in the ${slug} category.`,
    keywords: ["category", "products", "shop", slug],
  });
}

const Page = async ({ params }: PageProps) => {
  const { slug } = await params;

  return <CategoryProductsPage slug={slug} />;
};

export default Page;