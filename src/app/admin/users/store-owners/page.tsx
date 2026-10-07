// app/admin/users/store-owners/page.tsx
import StoreOwnerList from "@/components/store-owner/StoreOwnerList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Store Owners | SaaS Admin",
    description:
      "Manage all store owners registered on your platform.",
    keywords: ["store owners", "users", "saas", "admin"],
  });
}

const StoreOwnersPage = () => {
  return <StoreOwnerList />;
};

export default StoreOwnersPage;