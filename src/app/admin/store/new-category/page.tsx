// app/store/categories/new/page.tsx
import AddCategoryForm from "@/components/store-owner/AddCategoryForm";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Add Category | Store Admin",
    description: "Create a new product category for your store.",
    keywords: ["add category", "store admin"],
  });
}

const AddCategoryPage = () => {
  return <AddCategoryForm />;
};

export default AddCategoryPage;