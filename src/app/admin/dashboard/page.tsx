import StorelyAdminPanel from "@/components/admin-components/AdminDashboard";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Dashboard | Storely",
    description:
      "Manage your store, products, orders, and subscriptions from one place — Storely.",
    keywords: [
      "storely",
      "dashboard",
      "ecommerce",
      "store management",
      "orders",
      "products",
      "subscriptions",
      "admin",
    ],
  });
}

const Home = () => {
  return (
    <div className="">
      <StorelyAdminPanel />
    </div>
  );
};

export default Home;