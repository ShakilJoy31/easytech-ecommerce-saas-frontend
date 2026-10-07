// app/store/payment/page.tsx
import StorePaymentForm from "@/components/payment-channels/StorePaymentForm";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";
import { Suspense } from "react";

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
      <Suspense
        fallback={
          <div className="flex min-h-screen items-center justify-center bg-[#F4F6F8] dark:bg-gray-600">
            <div className="text-center">
              <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Loading payment form...
              </p>
            </div>
          </div>
        }
      >
        <StorePaymentForm />
      </Suspense>
    </div>
  );
};

export default StorePaymentPage;