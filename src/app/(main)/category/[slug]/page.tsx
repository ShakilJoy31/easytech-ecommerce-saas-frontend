// app/(public)/category/[slug]/page.tsx
import CategoryProductsPage from "@/components/home/CategoryProductsPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  return generateDynamicMetadata({
    title: `Category | StoreForge`,
    description: `Browse products in this category.`,
    keywords: ["category", "products", "shop"],
  });
}

const Page = ({ params }: { params: { slug: string } }) => {
  return <CategoryProductsPage slug={params.slug} />;
};

export default Page;