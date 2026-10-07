// app/admin/users/store-owners/new/page.tsx
import AddStoreOwnerForm from "@/components/store-owner/AddStoreOwnerForm";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Add Store Owner | SaaS Admin",
    description: "Manually create a store owner and their store.",
    keywords: ["add store owner", "create user", "saas", "admin"],
  });
}

const AddStoreOwnerPage = () => {
  return <AddStoreOwnerForm />;
};

export default AddStoreOwnerPage;