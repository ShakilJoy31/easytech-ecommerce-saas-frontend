// app/store/products/new/page.tsx
import AddProductForm from "@/components/products/AddProductForm";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Add Product | Store Admin",
    description: "Add a new product to your store.",
    keywords: ["add product", "store admin"],
  });
}

const AddProductPage = () => {
  return <AddProductForm />;
};

export default AddProductPage;