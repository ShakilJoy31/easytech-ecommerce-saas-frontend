// app/admin/subscriptions/page.tsx
import SubscriptionList from "@/components/store-owner/SubscriptionList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Subscriptions & Billing | SaaS Admin",
    description:
      "View and manage all store subscriptions, billing history, and renewals.",
    keywords: ["subscriptions", "billing", "saas", "admin", "renewals"],
  });
}

const SubscriptionsPage = () => {
  return <SubscriptionList />;
};

export default SubscriptionsPage;