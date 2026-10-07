"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ShoppingBag,
  ChevronLeft,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Mail,
  MapPin,
  Package as PackageIcon,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCreateOrderMutation } from "@/redux/api/saas/orderApi";
import { useCartStore } from "@/utils/helper/cartStore";

/* =========================================================================
   Schema
========================================================================= */
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().min(11, "Valid phone is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address: z.string().min(5, "Address is required"),
  district: z.string().optional().or(z.literal("")),
  note: z.string().max(300).optional().or(z.literal("")),
});

type FormInput = z.infer<typeof schema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : "₹";

/* =========================================================================
   MAIN
========================================================================= */
export default function CheckoutPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const clearCart = useCartStore((s) => s.clearCart);

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      district: "",
      note: "",
    },
    mode: "onChange",
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  // Empty cart
  if (items.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-gray-50 p-6">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
          <ShoppingBag className="h-8 w-8 text-gray-400" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Your cart is empty</h1>
        <p className="mt-1 text-sm text-gray-500">
          Add products to your cart to checkout.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0f3a33]"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  const subtotal = getSubtotal();
  const shippingCost = 0; // Free for now
  const total = subtotal + shippingCost;
  const currency = items[0]?.currency || "BDT";
  const sym = currencySymbol(currency);

  const onSubmit = async (data: FormInput) => {
    try {
      const payload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        customer: {
          name: data.name.trim(),
          phone: data.phone.trim(),
          email: data.email?.trim() || "",
          address: data.address.trim(),
          district: data.district?.trim() || "",
          note: data.note?.trim() || "",
        },
        shippingCost,
        discount: 0,
      };

      const response = await createOrder(payload as any).unwrap();

      if (response.success && response.data?.gatewayUrl) {
        // Clear cart BEFORE redirect (once paid, cart is done)
        clearCart();
        // Redirect to SSLCommerz
        window.location.href = response.data.gatewayUrl;
      } else {
        toast.error("Failed to initialize payment. Please try again.");
      }
    } catch (err: any) {
      console.error("Order error:", err);
      toast.error(err?.data?.message || "Failed to create order");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 mt-16 ">
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-emerald-700"
            >
              <ChevronLeft className="h-4 w-4" />
              Continue shopping
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">
              Checkout
            </h1>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* =========================================================
             LEFT — Customer info
          ========================================================= */}
          <div className="space-y-4">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                  Delivery Information
                </h2>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("name")}
                      disabled={isLoading}
                      placeholder="Rahim Uddin"
                      className={cn(
                        inputBase,
                        "pl-11",
                        errors.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-emerald-600"
                      )}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Phone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("phone")}
                      disabled={isLoading}
                      placeholder="01712345678"
                      className={cn(
                        inputBase,
                        "pl-11",
                        errors.phone
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-emerald-600"
                      )}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.phone.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("email")}
                      disabled={isLoading}
                      placeholder="Optional"
                      className={cn(
                        inputBase,
                        "pl-11 border-gray-200 focus:border-emerald-600"
                      )}
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Address <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      {...register("address")}
                      rows={3}
                      disabled={isLoading}
                      placeholder="House, road, area..."
                      className={cn(
                        inputBase,
                        "pl-11 resize-none",
                        errors.address
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-emerald-600"
                      )}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    District
                  </label>
                  <input
                    {...register("district")}
                    disabled={isLoading}
                    placeholder="Dhaka"
                    className={cn(
                      inputBase,
                      "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Delivery Note
                  </label>
                  <input
                    {...register("note")}
                    disabled={isLoading}
                    placeholder="Optional"
                    className={cn(
                      inputBase,
                      "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                </div>
              </div>
            </section>

            {/* Cart items */}
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                  Your Items ({items.length})
                </h2>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
                  >
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-200">
                      {item.thumbnail ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <PackageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between">
                      <div>
                        <p className="line-clamp-1 text-sm font-semibold text-gray-900">
                          {item.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          {currencySymbol(item.currency)}
                          {Number(item.price).toLocaleString("en-US")} each
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity - 1)
                            }
                            className="p-1.5 text-gray-600 hover:text-emerald-700"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[2rem] text-center text-xs font-bold">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.productId, item.quantity + 1)
                            }
                            disabled={
                              item.maxStock !== null &&
                              item.quantity >= item.maxStock
                            }
                            className="p-1.5 text-gray-600 hover:text-emerald-700 disabled:opacity-40"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <p className="text-sm font-bold text-gray-900">
                          {currencySymbol(item.currency)}
                          {(item.price * item.quantity).toLocaleString("en-US")}
                        </p>

                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* =========================================================
             RIGHT — Order summary
          ========================================================= */}
          <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
            <section className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                  Order Summary
                </h2>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold text-gray-900">
                    {sym}
                    {subtotal.toLocaleString("en-US")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-semibold text-emerald-700">
                    Free
                  </span>
                </div>
                <div className="my-2 border-t border-dashed border-gray-200" />
                <div className="flex justify-between text-base">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="text-xl font-bold text-gray-900">
                    {sym}
                    {total.toLocaleString("en-US")}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  "mt-5 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-all",
                  "bg-[#0b2b26] hover:bg-[#0f3a33] shadow-lg shadow-emerald-900/20",
                  "disabled:cursor-not-allowed disabled:opacity-60"
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    Place Order & Pay
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                Secure payment via SSLCommerz
              </div>
            </section>

            <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="text-xs text-emerald-800">
                <b>How it works:</b> You'll be redirected to SSLCommerz's secure
                payment page. After payment, you'll return here automatically.
              </p>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}