// app/store/orders/page.tsx
import OrderList from "@/components/products/OrderList";
import { generateDynamicMetadata } from "@/metadata/generateMetadata";


export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Orders | Store Admin",
    description: "View and manage incoming orders.",
    keywords: ["orders", "store admin"],
  });
}

const Page = () => <OrderList />;

export default Page;