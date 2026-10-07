// app/admin/payment-channels/page.tsx
import PaymentChannelList from "@/components/payment-channels/PaymentChannelList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Payment Channels | SaaS Admin",
    description:
      "Manage payment channels used by stores to submit manual payments.",
    keywords: ["payment channels", "bkash", "nagad", "saas", "admin"],
  });
}

const PaymentChannelsPage = () => {
  return <PaymentChannelList />;
};

export default PaymentChannelsPage;