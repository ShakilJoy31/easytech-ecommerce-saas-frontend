"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  Store as StoreIcon,
  Package as PackageIcon,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/utils/helper/cartStore";

const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : c === "INR" ? "₹" : c;

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.getSubtotal());
  const totalItems = useCartStore((s) => s.getTotalItems());
  const storeCount = useCartStore((s) => s.getStoreCount());

  const sym = currencySymbol(items[0]?.currency || "BDT");

  /* ---------- Empty state ---------- */
  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-md text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50"
          >
            <ShoppingCart className="h-9 w-9 text-emerald-600" />
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse our stores and add products to get started.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33]"
          >
            <ChevronLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Cart ---------- */
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
              Shopping Cart
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {totalItems} item{totalItems !== 1 ? "s" : ""} from{" "}
              {storeCount} store{storeCount !== 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => {
              clearCart();
              toast.success("Cart cleared");
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* =============== ITEMS =============== */}
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {items.map((item) => {
                const itemSym = currencySymbol(item.currency);
                const itemTotal = item.price * item.quantity;
                const atMax =
                  item.maxStock !== null && item.quantity >= item.maxStock;

                return (
                  <motion.div
                    key={item.productId}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="rounded-2xl border border-gray-200 bg-white p-4"
                  >
                    <div className="flex gap-4">
                      {/* Image */}
                      <Link
                        href={`/product/${item.productId}`}
                        className="flex-shrink-0"
                      >
                        <div className="h-24 w-24 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 sm:h-28 sm:w-28">
                          {item.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.thumbnail}
                              alt={item.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <PackageIcon className="h-8 w-8 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* Details */}
                      <div className="flex min-w-0 flex-1 flex-col">
                        {/* Store */}
                        {item.storeName && (
                          <Link
                            href={`/store/${item.storeSlug}`}
                            className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors hover:text-emerald-700"
                          >
                            <StoreIcon className="h-3 w-3" />
                            {item.storeName}
                          </Link>
                        )}

                        {/* Title */}
                        <Link href={`/product/${item.productId}`}>
                          <h3 className="line-clamp-2 text-sm font-semibold text-gray-900 transition-colors hover:text-emerald-700 sm:text-base">
                            {item.title}
                          </h3>
                        </Link>

                        {/* Price */}
                        <p className="mt-1 text-sm font-bold text-gray-900">
                          {itemSym}
                          {Number(item.price).toLocaleString("en-US")}
                        </p>

                        {/* Bottom row: qty controls + total */}
                        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-3">
                          {/* Quantity */}
                          <div className="inline-flex items-center rounded-xl border border-gray-200">
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity - 1)
                              }
                              className="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="w-9 text-center text-sm font-semibold text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.productId, item.quantity + 1)
                              }
                              disabled={atMax}
                              className="flex h-9 w-9 items-center justify-center text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Total + Remove */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Subtotal</p>
                              <p className="text-sm font-bold text-gray-900">
                                {itemSym}
                                {Number(itemTotal).toLocaleString("en-US")}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                removeItem(item.productId);
                                toast.success("Removed from cart");
                              }}
                              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              aria-label="Remove item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {atMax && (
                          <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-amber-600">
                            <AlertCircle className="h-3 w-3" />
                            Max available stock reached
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Continue shopping */}
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Continue Shopping
            </Link>
          </div>

          {/* =============== ORDER SUMMARY =============== */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-base font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-4 space-y-2.5 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal ({totalItems} item{totalItems !== 1 ? "s" : ""})</span>
                  <span className="font-semibold text-gray-900">
                    {sym}
                    {Number(subtotal).toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-xs text-gray-400">
                    Calculated at checkout
                  </span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm font-semibold text-gray-900">
                  Total
                </span>
                <span className="text-lg font-bold text-emerald-700">
                  {sym}
                  {Number(subtotal).toLocaleString("en-US")}
                </span>
              </div>

              <Link
                href="/checkout"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33]"
              >
                Proceed to Checkout
                <ArrowRight className="h-4 w-4" />
              </Link>

              <p className="mt-3 text-center text-[11px] text-gray-400">
                Secure checkout · 100% buyer protection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}