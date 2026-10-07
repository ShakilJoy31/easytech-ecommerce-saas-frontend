"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Wallet,
  Loader2,
  AlertCircle,
  Check,
  Copy,
  ChevronLeft,
  ArrowRight,
  Smartphone,
  Building2,
  Landmark,
  User as UserIcon,
  ShieldCheck,
  Info,
  Clock,
  Sparkles,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useGetPublicPaymentChannelsQuery, type PaymentChannel } from "@/redux/api/saas/paymentChannelApi";
import { useSubmitManualPaymentMutation, useGetMyManualPaymentsQuery } from "@/redux/api/saas/manualPaymentApi";
import { useGetPackageByIdQuery } from "@/redux/api/saas/packageApi";

/* ============ Schema ============ */
const schema = z.object({
  channelId: z.coerce.number().min(1, "Please select a payment channel"),
  accountNumber: z.string().min(4, "Account number is required"),
  senderAccountNumber: z.string().optional().or(z.literal("")),
  transactionId: z.string().min(4, "Transaction ID is required"),
  paymentDate: z.string().optional().or(z.literal("")),
  notes: z.string().max(300).optional().or(z.literal("")),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

/* ============ Type icon ============ */
function TypeIcon({ type }: { type: string }) {
  const map: Record<string, any> = {
    PERSONAL: Smartphone,
    MERCHANT: Building2,
    AGENT: UserIcon,
    BANK: Landmark,
  };
  const Icon = map[type] || Wallet;
  return <Icon className="h-4 w-4" />;
}

/* ============ MAIN ============ */
export default function StorePaymentForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const storeId = Number(searchParams.get("storeId") || 0);
  const slug = searchParams.get("slug") || "";
  const packageId = Number(searchParams.get("packageId") || 0);

  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  /* ---------- Data ---------- */
  const { data: channelsData, isLoading: channelsLoading } =
    useGetPublicPaymentChannelsQuery();

  const { data: packageData, isLoading: packageLoading } =
    useGetPackageByIdQuery(packageId, { skip: !packageId });

  const { data: existingPayments, refetch: refetchPayments } =
    useGetMyManualPaymentsQuery(
      { storeId },
      { skip: !storeId }
    );

  const [submitPayment, { isLoading: isSubmitting }] = useSubmitManualPaymentMutation();

  const channels = channelsData?.data || [];
  const selectedPackage = packageData?.data;
  const payments = existingPayments?.data || [];

  const pendingPayment = useMemo(
    () => payments.find((p: any) => p.status === "PENDING"),
    [payments]
  );

  const verifiedPayment = useMemo(
    () => payments.find((p: any) => p.status === "VERIFIED"),
    [payments]
  );

  /* ---------- Form ---------- */
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      channelId: 0,
      accountNumber: "",
      senderAccountNumber: "",
      transactionId: "",
      paymentDate: "",
      notes: "",
    },
    mode: "onChange",
  });

  const selectedChannelId = watch("channelId");
  const selectedChannel = useMemo(
    () => channels.find((c: PaymentChannel) => c.id === Number(selectedChannelId)),
    [channels, selectedChannelId]
  );

  useEffect(() => setMounted(true), []);

  // Auto-fill the account number when a channel is selected
  useEffect(() => {
    if (selectedChannel) {
      setValue("accountNumber", selectedChannel.accountNumber);
    }
  }, [selectedChannel, setValue]);

  /* ---------- Copy helper ---------- */
  const handleCopy = (value: string, key: string) => {
    navigator.clipboard.writeText(value);
    setCopied(key);
    toast.success("Copied");
    setTimeout(() => setCopied(null), 1500);
  };

  /* ---------- Submit ---------- */
  const onSubmit = async (data: FormData) => {
    if (!storeId || !packageId) {
      toast.error("Missing store or package info. Please register again.");
      return;
    }

    try {
      await submitPayment({
        storeId,
        packageId,
        channelId: Number(data.channelId),
        accountNumber: data.accountNumber.trim(),
        senderAccountNumber: data.senderAccountNumber?.trim() || undefined,
        transactionId: data.transactionId.trim(),
        paymentDate: data.paymentDate || undefined,
        notes: data.notes?.trim() || undefined,
      }).unwrap();

      toast.success("Payment submitted! Awaiting verification.");
      setSubmitted(true);
      refetchPayments();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to submit payment");
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  /* ---------- Missing params ---------- */
  if (!storeId || !packageId) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center">
          <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
          <h2 className="text-lg font-bold text-gray-900">Invalid payment link</h2>
          <p className="mt-2 text-sm text-gray-500">
            Missing store or package information. Please register again.
          </p>
          <Link
            href="/store/register"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
          >
            Go to Registration
          </Link>
        </div>
      </div>
    );
  }

  /* ---------- Already pending / verified ---------- */
  const showPendingState = pendingPayment || submitted;
  const showVerifiedState = verifiedPayment;

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

  return (
    <div className="min-h-screen bg-gray-50 mt-16 ">
      <div className="mx-auto max-w-7xl p-4 md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <Wallet className="h-5 w-5 text-emerald-700" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                Complete Your Payment
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Submit your payment details so we can activate your store.
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-emerald-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>

        {/* Store slug banner */}
        {slug && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <Sparkles className="h-4 w-4 text-emerald-700" />
            <p className="text-sm text-emerald-800">
              Your store <b>{slug}</b> is registered. Complete payment to activate.
            </p>
          </div>
        )}

        {/* ---------- State 1: Verified ---------- */}
        {showVerifiedState ? (
          <div className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Payment Verified ✅
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Your store has been activated. You can now sign in to your
              dashboard.
            </p>
            <Link
              href="/store/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0f3a33]"
            >
              Sign In to Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : showPendingState ? (
          /* ---------- State 2: Pending ---------- */
          <div className="rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
              <Clock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Payment Submitted
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              We've received your payment. Our team will verify it shortly
              (usually within a few hours).
            </p>

            {pendingPayment && (
              <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 text-left">
                <div className="divide-y divide-gray-100">
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Payment Code</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {pendingPayment.paymentCode}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Transaction ID</span>
                    <span className="font-mono text-sm font-semibold text-gray-900">
                      {pendingPayment.transactionId}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Amount</span>
                    <span className="text-sm font-semibold text-gray-900">
                      ৳{Number(pendingPayment.amount).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex justify-between px-4 py-3">
                    <span className="text-sm text-gray-500">Status</span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Clock className="h-3 w-3" />
                      Pending Verification
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Link
                href="/store/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Try Login
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33]"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : (
          /* ---------- State 3: Payment form ---------- */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr]">
            {/* LEFT: Form */}
            <div className="space-y-4">
              {/* Channel picker */}
              <section className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-4 flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                    Step 1 — Choose Payment Channel
                  </h2>
                </div>

                {channelsLoading ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
                    ))}
                  </div>
                ) : channels.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                    <AlertCircle className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                    <p className="text-sm text-gray-500">
                      No payment channels available. Please contact support.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {channels.map((ch: PaymentChannel) => {
                        const isSelected = Number(selectedChannelId) === ch.id;
                        return (
                          <motion.button
                            key={ch.id}
                            type="button"
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setValue("channelId", ch.id, { shouldValidate: true })}
                            className={cn(
                              "relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all",
                              isSelected
                                ? "border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                                : "border-gray-200 bg-white hover:border-emerald-300"
                            )}
                          >
                            {isSelected && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </motion.span>
                            )}

                            <div className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                              <TypeIcon type={ch.accountType} />
                              {ch.accountTypeLabel || ch.accountType}
                            </div>

                            <p className="text-sm font-bold text-gray-900">
                              {ch.name}
                            </p>

                            <div className="mt-2 flex items-center gap-2">
                              <span className="font-mono text-xs text-gray-700">
                                {ch.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCopy(ch.accountNumber, `ch-${ch.id}`);
                                }}
                                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-700"
                              >
                                {copied === `ch-${ch.id}` ? (
                                  <Check className="h-3 w-3 text-emerald-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </button>
                            </div>

                            {ch.accountHolderName && (
                              <p className="mt-1 text-[11px] text-gray-500">
                                {ch.accountHolderName}
                              </p>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>

                    {errors.channelId && (
                      <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                        <AlertCircle className="h-3 w-3" />
                        {errors.channelId.message as string}
                      </p>
                    )}
                  </>
                )}
              </section>

              {/* Instructions */}
              {selectedChannel && (
                <motion.section
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-amber-200 bg-amber-50 p-5"
                >
                  <div className="flex items-start gap-3">
                    <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-700" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-amber-900">
                        How to pay with {selectedChannel.name}
                      </p>
                      <p className="mt-1 text-xs text-amber-800">
                        {selectedChannel.instructions ||
                          `Send ৳${
                            selectedPackage?.price?.toLocaleString("en-US") || "—"
                          } to ${selectedChannel.accountNumber} and enter the transaction ID below.`}
                      </p>

                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-white px-3 py-2">
                        <span className="text-xs font-medium text-gray-500">
                          Send to:
                        </span>
                        <span className="font-mono text-sm font-bold text-gray-900">
                          {selectedChannel.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(selectedChannel.accountNumber, "send-to")
                          }
                          className="ml-auto rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-700"
                        >
                          {copied === "send-to" ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.section>
              )}

              {/* Payment form */}
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-4 rounded-2xl border border-gray-200 bg-white p-5"
              >
                <div className="flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                    Step 2 — Submit Payment Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("accountNumber")}
                      type="text"
                      disabled={isSubmitting}
                      placeholder="You sent money to"
                      className={cn(
                        inputBase,
                        errors.accountNumber
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    />
                    {errors.accountNumber && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.accountNumber.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Your Account Number
                    </label>
                    <input
                      {...register("senderAccountNumber")}
                      type="text"
                      disabled={isSubmitting}
                      placeholder="Your bKash/Nagad number"
                      className={cn(inputBase, "border-gray-200 hover:border-gray-300 focus:border-emerald-600")}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Transaction ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("transactionId")}
                      type="text"
                      disabled={isSubmitting}
                      placeholder="e.g. TX93A72B1C"
                      className={cn(
                        inputBase,
                        errors.transactionId
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    />
                    {errors.transactionId && (
                      <p className="mt-1 text-xs text-red-600">
                        {errors.transactionId.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Payment Date
                    </label>
                    <input
                      {...register("paymentDate")}
                      type="date"
                      disabled={isSubmitting}
                      className={cn(inputBase, "border-gray-200 hover:border-gray-300 focus:border-emerald-600")}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Notes
                    </label>
                    <input
                      {...register("notes")}
                      type="text"
                      disabled={isSubmitting}
                      placeholder="Optional"
                      className={cn(inputBase, "border-gray-200 hover:border-gray-300 focus:border-emerald-600")}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !selectedChannelId}
                  className={cn(
                    "mt-2 flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold text-white transition-colors",
                    "bg-[#0b2b26] hover:bg-[#0f3a33]",
                    "disabled:cursor-not-allowed disabled:opacity-50"
                  )}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Payment
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* RIGHT: Summary */}
            <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                    Order Summary
                  </h2>
                </div>

                {packageLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
                    <div className="h-8 w-24 animate-pulse rounded bg-gray-100" />
                  </div>
                ) : selectedPackage ? (
                  <>
                    <p className="text-xs text-gray-500">Package</p>
                    <p className="text-base font-bold text-gray-900">
                      {selectedPackage.name}
                    </p>

                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-gray-900">
                        {selectedPackage.currency === "BDT" ? "৳" : selectedPackage.currency}
                        {Number(selectedPackage.price).toLocaleString("en-US")}
                      </span>
                      <span className="text-sm text-gray-500">
                        / {selectedPackage.durationDay} days
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                      {[
                        {
                          label: "Products",
                          value:
                            selectedPackage.maxProducts === null
                              ? "Unlimited"
                              : selectedPackage.maxProducts,
                        },
                        {
                          label: "Categories",
                          value:
                            selectedPackage.maxCategories === null
                              ? "Unlimited"
                              : selectedPackage.maxCategories,
                        },
                        {
                          label: "Orders / Month",
                          value:
                            selectedPackage.maxOrdersPerMonth === null
                              ? "Unlimited"
                              : selectedPackage.maxOrdersPerMonth,
                        },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-gray-500">{item.label}</span>
                          <span className="font-semibold text-gray-900">
                            {item.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {selectedPackage.features?.length > 0 && (
                      <ul className="mt-4 space-y-1.5 border-t border-gray-100 pt-4">
                        {selectedPackage.features.map((f: string, i: number) => (
                          <li
                            key={i}
                            className="flex items-center gap-1.5 text-xs text-gray-700"
                          >
                            <Check className="h-3 w-3 flex-shrink-0 text-emerald-600" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Package not found</p>
                )}
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-700" />
                  <div>
                    <p className="text-sm font-semibold text-emerald-900">
                      Manual Verification
                    </p>
                    <p className="mt-1 text-xs text-emerald-800">
                      After submitting, our team verifies the transaction and
                      activates your store within a few hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}