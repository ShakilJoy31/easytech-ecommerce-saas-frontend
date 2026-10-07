// app/(public)/store/[slug]/page.tsx
import { generateDynamicMetadata } from "@/metadata/generateMetadata";
import StoreProductsPage from "@/components/home/StoreProductsPage";

export async function generateMetadata({ params }: { params: { slug: string } }) {
  return generateDynamicMetadata({
    title: `Store | StoreForge`,
    description: "Browse products from this store.",
    keywords: ["store", "products", "shop"],
  });
}

const Page = ({ params }: { params: { slug: string } }) => {
  return <StoreProductsPage />;
};

export default Page;