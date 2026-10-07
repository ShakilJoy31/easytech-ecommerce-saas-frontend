// app/admin/payments/page.tsx
import ManualPaymentList from "@/components/payment-channels/ManualPaymentList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Manual Payments | SaaS Admin",
    description:
      "Review and verify manual payments submitted by store owners.",
    keywords: ["manual payments", "verify", "saas", "admin", "subscription"],
  });
}

const ManualPaymentsPage = () => {
  return <ManualPaymentList />;
};

export default ManualPaymentsPage;