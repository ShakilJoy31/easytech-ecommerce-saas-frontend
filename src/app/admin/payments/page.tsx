// app/admin/payments/page.tsx
import ManualPaymentList from "@/components/payment-channels/ManualPaymentList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";
import { Suspense } from "react";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Manual Payments | SaaS Admin",
    description:
      "Review and verify manual payments submitted by store owners.",
    keywords: ["manual payments", "verify", "saas", "admin", "subscription"],
  });
}

const ManualPaymentsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-gray-500">Loading payments...</p>
          </div>
        </div>
      }
    >
      <ManualPaymentList />
    </Suspense>
  );
};

export default ManualPaymentsPage;