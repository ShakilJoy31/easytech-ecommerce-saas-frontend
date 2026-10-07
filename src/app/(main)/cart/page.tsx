// app/(public)/product/[id]/page.tsx
import CartPage from "@/components/products/Cart";
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

const Page = () => {
  return <section className="mt-16 "><CartPage /></section>;
};

export default Page;