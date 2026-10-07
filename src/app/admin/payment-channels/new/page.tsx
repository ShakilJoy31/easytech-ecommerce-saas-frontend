// app/admin/payment-channels/new/page.tsx
import { generateDynamicMetadata } from "@/metadata/generateMetadata";
import AddPaymentChannelForm from "@/components/payment-channels/AddPaymentChannelForm";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Add Payment Channel | SaaS Admin",
    description: "Add a new payment channel for manual payment submission.",
    keywords: ["add channel", "payment", "saas", "admin"],
  });
}

const AddPaymentChannelPage = () => {
  return <AddPaymentChannelForm />;
};

export default AddPaymentChannelPage;