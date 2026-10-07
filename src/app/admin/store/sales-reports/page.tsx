// app/store/reports/page.tsx
import SalesReportPage from "@/components/saas-components/SalesReportPage";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Sales Reports | Store Admin",
    description:
      "Track your store's revenue, orders, top products, and business performance.",
    keywords: ["sales reports", "analytics", "revenue", "store admin"],
  });
}

const Page = () => <SalesReportPage />;

export default Page;