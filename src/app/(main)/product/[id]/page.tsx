// app/(public)/product/[id]/page.tsx
import ProductDetailPage from "@/components/products/ProductDetailPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {

  return generateDynamicMetadata({
    title: `Product | StoreForge`,
    description: "View product details, images, price and more.",
    keywords: ["product", "shop", "buy online"],
  });
}

const Page = async ({ params }: PageProps) => {
  const { id } = await params;

  return <ProductDetailPage id={id} />;
};

export default Page;