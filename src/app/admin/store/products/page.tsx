// app/store/products/page.tsx
import ProductList from "@/components/products/ProductList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Products | Store Admin",
    description: "Manage your store's product catalog.",
    keywords: ["products", "catalog", "store admin"],
  });
}

const ProductsPage = () => {
  return <ProductList />;
};

export default ProductsPage;