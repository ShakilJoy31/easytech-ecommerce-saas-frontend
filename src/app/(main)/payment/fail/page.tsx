// app/payment/fail/page.tsx
import Link from "next/link";
import { XCircle, Home, ShoppingBag } from "lucide-react";

export const metadata = { title: "Payment Failed | StoreForge" };

const Page = () => (
  <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-6 mt-16">
    <div className="w-full max-w-md rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-xl">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
        <XCircle className="h-10 w-10 text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Payment Failed</h1>
      <p className="mt-2 text-sm text-gray-500">
        Your payment could not be processed. Your cart has been preserved — you
        can try again.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Link
          href="/checkout"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f3a33]"
        >
          <ShoppingBag className="h-4 w-4" />
          Try Again
        </Link>
      </div>
    </div>
  </div>
);

export default Page;