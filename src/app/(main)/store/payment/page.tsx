// app/store/payment/page.tsx
import StorePaymentForm from "@/components/payment-channels/StorePaymentForm";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Complete Payment | StoreForge",
    description:
      "Submit your manual payment to activate your store subscription.",
    keywords: ["payment", "bkash", "nagad", "store activation", "saas"],
  });
}

const StorePaymentPage = () => {
  return (
    <div className="bg-[#F4F6F8] dark:bg-gray-600">
      <StorePaymentForm />
    </div>
  );
};

export default StorePaymentPage;