"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Package as PackageIcon,
  Home,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useGetOrderByTransactionQuery } from "@/redux/api/saas/orderApi";

const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : "₹";

export default function PaymentSuccessPage({ tranId }: { tranId: string }) {
  const { data, isLoading } = useGetOrderByTransactionQuery(tranId, {
    skip: !tranId,
  });

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  const order = data?.data?.order;
  const items = data?.data?.items || [];
  const store = data?.data?.store;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-3xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-8 text-center text-white">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur"
            >
              <CheckCircle2 className="h-10 w-10" />
            </motion.div>
            <h1 className="text-2xl font-bold sm:text-3xl">
              Payment Successful!
            </h1>
            <p className="mt-2 text-sm text-emerald-100">
              Your order has been placed and confirmed.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-8">
            {order ? (
              <>
                {/* Order info */}
                <div className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Order Number</p>
                      <p className="font-mono font-semibold text-gray-900">
                        {order.orderNumber}
                      </p>
                    </div>
                    {order.invoiceNumber && (
                      <div>
                        <p className="text-xs text-gray-500">Invoice</p>
                        <p className="font-mono font-semibold text-gray-900">
                          {order.invoiceNumber}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-gray-500">Total Paid</p>
                      <p className="font-bold text-emerald-700">
                        {currencySymbol(order.currency)}
                        {Number(order.total).toLocaleString("en-US")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Payment Status</p>
                      <p className="font-semibold text-emerald-700">
                        {order.paymentStatus}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-700">
                    Items ({items.length})
                  </h3>
                  <div className="space-y-2">
                    {items.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 rounded-xl border border-gray-200 p-3"
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <PackageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                            {item.productTitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            Qty: {item.quantity} ·{" "}
                            {currencySymbol(order.currency)}
                            {Number(item.unitPrice).toLocaleString("en-US")}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {currencySymbol(order.currency)}
                          {Number(item.totalPrice).toLocaleString("en-US")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Store */}
                {store && (
                  <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="text-xs text-emerald-700">
                      Your order is being prepared by{" "}
                      <b className="text-emerald-900">{store.name}</b>
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-sm text-gray-500">
                Loading order details...
              </p>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
              <Link
                href="/"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0f3a33]"
              >
                <ShoppingBag className="h-4 w-4" />
                Continue Shopping
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}