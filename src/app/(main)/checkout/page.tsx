// app/(public)/checkout/page.tsx
import CheckoutPage from "@/components/products/CheckoutPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Checkout | StoreForge",
    description: "Complete your order securely.",
    keywords: ["checkout", "payment", "order"],
  });
}

const Page = () => <CheckoutPage />;

export default Page;