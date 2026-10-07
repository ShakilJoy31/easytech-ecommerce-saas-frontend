// app/admin/packages/page.tsx
import PackageList from "@/components/saas-components/PackageList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Package Management | SaaS Admin",
    description:
      "Create, edit and organize subscription packages for your e-commerce SaaS platform.",
    keywords: ["packages", "subscriptions", "pricing", "saas", "admin"],
  });
}

const PackagesPage = () => {
  return <PackageList />;
};

export default PackagesPage;