import PaymentSuccessPage from "@/components/products/PaymentSuccessPage";


export const metadata = { title: "Payment Success | StoreForge" };

const Page = ({ searchParams }: { searchParams: { tran_id?: string } }) => {
  return <section className="mt-16"><PaymentSuccessPage tranId={searchParams.tran_id || ""} /></section>;
};

export default Page;