// app/(public)/product/[id]/page.tsx
import CartPage from "@/components/products/Cart";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata() {
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