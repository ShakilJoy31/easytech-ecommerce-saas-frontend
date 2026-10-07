// app/(public)/stores/page.tsx
import StoresListPage from "@/components/products/StoresListPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Browse All Stores | StoreForge",
    description:
      "Discover trusted sellers on the platform. Browse all active stores and shop their products.",
    keywords: [
      "stores",
      "sellers",
      "online shops",
      "marketplace",
      "browse stores",
    ],
  });
}

const StoresPage = () => {
  return <section className="mt-16 "><StoresListPage /></section>;
};

export default StoresPage;