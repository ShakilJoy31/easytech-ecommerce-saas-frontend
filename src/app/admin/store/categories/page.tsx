// app/store/categories/page.tsx
import CategoryList from "@/components/store-owner/CategoryList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Categories | Store Admin",
    description: "Manage your store's product categories.",
    keywords: ["categories", "store admin", "products"],
  });
}

const CategoriesPage = () => {
  return <CategoryList />;
};

export default CategoriesPage;