import PaymentSuccessPage from "@/components/products/PaymentSuccessPage";

export const metadata = { title: "Payment Success | StoreForge" };

interface PageProps {
  searchParams: Promise<{ tran_id?: string }>;
}

const Page = async ({ searchParams }: PageProps) => {
  const { tran_id } = await searchParams;

  return (
    <section className="mt-16">
      <PaymentSuccessPage tranId={tran_id || ""} />
    </section>
  );
};

export default Page;