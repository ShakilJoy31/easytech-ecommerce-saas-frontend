// app/admin/packages/new/page.tsx
import AddPackageForm from "@/components/saas-components/AddPackageForm";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Add Package | SaaS Admin",
    description:
      "Create a new subscription package with pricing, limits and features.",
    keywords: ["add package", "create package", "saas", "admin"],
  });
}

const AddPackagePage = () => {
  return <AddPackageForm />;
};

export default AddPackagePage;