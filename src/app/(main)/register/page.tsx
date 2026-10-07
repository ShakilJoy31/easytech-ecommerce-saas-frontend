
import StoreOwnerRegisterForm from "@/components/authentication/StoreOwnerRegisterForm";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Create Your Store | StoreForge",
    description:
      "Launch your online store in minutes. Choose a package, create your store, and start selling with our all-in-one e-commerce platform.",
    keywords: [
      "create online store",
      "sell online",
      "ecommerce platform",
      "store builder",
      "start online business",
      "store signup",
    ],
  });
}

const StoreRegisterPage = () => {
  return (
    <div className="bg-[#F4F6F8] dark:bg-gray-600">
      <StoreOwnerRegisterForm />
    </div>
  );
};

export default StoreRegisterPage;