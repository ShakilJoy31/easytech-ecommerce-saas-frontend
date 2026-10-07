"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Wallet,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Plus,
  Check,
  Building2,
  Landmark,
  Smartphone,
  User as UserIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCreatePaymentChannelMutation } from "@/redux/api/saas/paymentChannelApi";

/* ============ Schema ============ */
const schema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    accountType: z.enum(["PERSONAL", "MERCHANT", "AGENT", "BANK"]),
    accountNumber: z.string().min(4, "Account number is required"),
    accountHolderName: z.string().optional().or(z.literal("")),
    bankName: z.string().optional().or(z.literal("")),
    branchName: z.string().optional().or(z.literal("")),
    routingNumber: z.string().optional().or(z.literal("")),
    instructions: z.string().max(500).optional().or(z.literal("")),
    displayOrder: z.coerce.number().min(0).default(0),
    isActive: z.boolean().default(true),
  })
  .refine(
    (d) => d.accountType !== "BANK" || (d.bankName && d.bankName.length > 0),
    {
      message: "Bank name is required for BANK type",
      path: ["bankName"],
    }
  );

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

/* ============ Field ============ */
function Field({
  label,
  hint,
  error,
  required,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-800">
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600"
          >
            <AlertCircle className="h-3 w-3" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

/* ============ MAIN ============ */
export default function AddPaymentChannelForm() {
  const router = useRouter();
  const [createChannel, { isLoading }] = useCreatePaymentChannelMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      accountType: "PERSONAL",
      accountNumber: "",
      accountHolderName: "",
      bankName: "",
      branchName: "",
      routingNumber: "",
      instructions: "",
      displayOrder: 0,
      isActive: true,
    },
    mode: "onChange",
  });

  const accountType = watch("accountType");
  const isActive = watch("isActive");
  const isBank = accountType === "BANK";

  const onSubmit = async (data: FormData) => {
    try {
      await createChannel({
        name: data.name.trim(),
        accountType: data.accountType,
        accountNumber: data.accountNumber.trim(),
        accountHolderName: data.accountHolderName?.trim() || undefined,
        bankName: data.bankName?.trim() || undefined,
        branchName: data.branchName?.trim() || undefined,
        routingNumber: data.routingNumber?.trim() || undefined,
        instructions: data.instructions?.trim() || undefined,
        displayOrder: Number(data.displayOrder) || 0,
        isActive: Boolean(data.isActive),
      }).unwrap();

      toast.success("Payment channel created successfully");
      router.push("/admin/payment-channels");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create channel");
    }
  };

  const accountTypes = [
    { value: "PERSONAL", label: "Personal", icon: Smartphone, desc: "bKash/Nagad personal" },
    { value: "MERCHANT", label: "Merchant", icon: Building2, desc: "bKash/Nagad merchant" },
    { value: "AGENT", label: "Agent", icon: UserIcon, desc: "Agent account" },
    { value: "BANK", label: "Bank", icon: Landmark, desc: "Bank transfer" },
  ] as const;

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-8xl space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <Wallet className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Add Payment Channel
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Store owners will use this channel to submit manual payments.
              </p>
            </div>
          </div>

          <Link
            href="/admin/payment-channels"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-emerald-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Channels
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          {/* Channel type */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Channel Type
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              {accountTypes.map((type) => {
                const isSelected = accountType === type.value;
                const Icon = type.icon;
                return (
                  <motion.button
                    key={type.value}
                    type="button"
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setValue("accountType", type.value as any, { shouldValidate: true })}
                    className={cn(
                      "relative overflow-hidden rounded-2xl border-2 p-3 text-left transition-all",
                      isSelected
                        ? "border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                        : "border-gray-200 bg-white hover:border-emerald-300"
                    )}
                  >
                    {isSelected && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"
                      >
                        <Check className="h-3 w-3" />
                      </motion.span>
                    )}
                    <Icon className={cn("mb-2 h-5 w-5", isSelected ? "text-emerald-700" : "text-gray-400")} />
                    <p className="text-xs font-bold text-gray-900">{type.label}</p>
                    <p className="mt-0.5 text-[10px] text-gray-500">{type.desc}</p>
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Channel details */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Channel Details
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Channel Name"
                required
                hint="e.g. bKash, Nagad"
                error={errors.name?.message}
              >
                <input
                  {...register("name")}
                  type="text"
                  placeholder="bKash"
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    errors.name
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                      : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                />
              </Field>

              <Field
                label="Account Number"
                required
                hint={isBank ? "Bank account no" : "Mobile number"}
                error={errors.accountNumber?.message}
              >
                <input
                  {...register("accountNumber")}
                  type="text"
                  placeholder={isBank ? "1234567890" : "01712345678"}
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    errors.accountNumber
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                      : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                />
              </Field>

              <div className="md:col-span-2">
                <Field
                  label="Account Holder Name"
                  hint="Optional"
                  error={errors.accountHolderName?.message}
                >
                  <input
                    {...register("accountHolderName")}
                    type="text"
                    placeholder="Rahim Uddin"
                    disabled={isLoading}
                    className={cn(inputBase, "border-gray-200 hover:border-gray-300 focus:border-emerald-600")}
                  />
                </Field>
              </div>

              {isBank && (
                <>
                  <Field
                    label="Bank Name"
                    required
                    error={errors.bankName?.message}
                  >
                    <input
                      {...register("bankName")}
                      type="text"
                      placeholder="Dutch Bangla Bank"
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        errors.bankName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                          : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    />
                  </Field>

                  <Field
                    label="Branch Name"
                    hint="Optional"
                    error={errors.branchName?.message}
                  >
                    <input
                      {...register("branchName")}
                      type="text"
                      placeholder="Dhanmondi"
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 hover:border-gray-300 focus:border-emerald-600")}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Field
                      label="Routing Number"
                      hint="Optional"
                      error={errors.routingNumber?.message}
                    >
                      <input
                        {...register("routingNumber")}
                        type="text"
                        placeholder="090261726"
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 hover:border-gray-300 focus:border-emerald-600")}
                      />
                    </Field>
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <Field
                  label="Instructions"
                  hint="Shown to the store owner"
                  error={errors.instructions?.message}
                >
                  <textarea
                    {...register("instructions")}
                    rows={3}
                    placeholder={
                      isBank
                        ? "Transfer the amount to this account and enter the reference number below."
                        : "Send Money to 01712345678, then enter the Transaction ID below."
                    }
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      "resize-none border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                    )}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Settings */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Display Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field
                label="Display Order"
                hint="lower = first"
                error={errors.displayOrder?.message}
              >
                <input
                  {...register("displayOrder")}
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 hover:border-gray-300 focus:border-emerald-600")}
                />
              </Field>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Active
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Visible to store owners
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue("isActive", !isActive)}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
                      isActive ? "bg-emerald-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                        isActive ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/payment-channels"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancel
            </Link>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2b26] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-[#0f3a33] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Channel
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}