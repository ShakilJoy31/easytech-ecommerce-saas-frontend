// app/(public)/product/[id]/page.tsx
import ProductDetailPage from "@/components/products/ProductDetailPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}) {
  return generateDynamicMetadata({
    title: `Product | StoreForge`,
    description: "View product details, images, price and more.",
    keywords: ["product", "shop", "buy online"],
  });
}

const Page = ({ params }: { params: { id: string } }) => {
  return <ProductDetailPage id={params.id} />;
};

export default Page;