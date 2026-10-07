// app/admin/stores/page.tsx
import StoreList from "@/components/store-owner/StoreList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Store Management | SaaS Admin",
    description:
      "Manage all stores on the platform — activate, suspend, and view store details.",
    keywords: ["stores", "store management", "saas", "admin"],
  });
}

const StoresPage = () => {
  return <StoreList />;
};

export default StoresPage;