"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Package as PackageIcon,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Plus,
  X,
  Check,
  Sparkles,
  Crown,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCreatePackageMutation } from "@/redux/api/saas/packageApi";

/* =========================================================================
   Schema
   ------------------------------------------------------------------------
   `z.coerce.number()` has INPUT = unknown and OUTPUT = number.
   So we derive two types:
     - PackageFormInput  → what RHF stores internally (unknown allowed)
     - PackageFormData   → what onSubmit receives after zod transforms (numbers)
========================================================================= */
const packageSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name must be under 60 characters"),
  description: z
    .string()
    .max(500, "Description must be under 500 characters")
    .optional()
    .or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  currency: z.string().default("BDT"),
  durationDay: z.coerce.number().min(1, "Duration must be at least 1 day"),
  maxProducts: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  maxCategories: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  maxOrdersPerMonth: z
    .union([z.coerce.number().min(0), z.literal("")])
    .optional(),
  features: z
    .array(z.object({ value: z.string().min(1, "Feature cannot be empty") }))
    .default([]),
  displayOrder: z.coerce.number().min(0).default(0),
  isPopular: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// Input shape (before zod coercion) — what the form holds
type PackageFormInput = z.input<typeof packageSchema>;

// Output shape (after zod coercion) — what onSubmit receives
type PackageFormData = z.output<typeof packageSchema>;

/* =========================================================================
   Small reusable field
========================================================================= */
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

/* =========================================================================
   MAIN COMPONENT
========================================================================= */
export default function AddPackageForm() {
  const router = useRouter();
  const [createPackage, { isLoading }] = useCreatePackageMutation();
  const [featureInput, setFeatureInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
  } = useForm<PackageFormInput, any, PackageFormData>({
    resolver: zodResolver(packageSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      currency: "BDT",
      durationDay: 30,
      maxProducts: "",
      maxCategories: "",
      maxOrdersPerMonth: "",
      features: [],
      displayOrder: 0,
      isPopular: false,
      isActive: true,
    },
    mode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "features",
  });

  const isPopular = watch("isPopular");
  const isActive = watch("isActive");

  /* ---------------- feature add ---------------- */
  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    append({ value: trimmed });
    setFeatureInput("");
  };

  /* ---------------- submit ---------------- */
  const onSubmit: SubmitHandler<PackageFormData> = async (data) => {
    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || "",
        price: Number(data.price),
        currency: data.currency,
        durationDay: Number(data.durationDay),
        maxProducts:
          data.maxProducts === "" || data.maxProducts === undefined
            ? null
            : Number(data.maxProducts),
        maxCategories:
          data.maxCategories === "" || data.maxCategories === undefined
            ? null
            : Number(data.maxCategories),
        maxOrdersPerMonth:
          data.maxOrdersPerMonth === "" || data.maxOrdersPerMonth === undefined
            ? null
            : Number(data.maxOrdersPerMonth),
        features: data.features.map((f) => f.value),
        displayOrder: Number(data.displayOrder) || 0,
        isPopular: Boolean(data.isPopular),
        isActive: Boolean(data.isActive),
      };

      await createPackage(payload).unwrap();
      toast.success("Package created successfully");
      router.push("/admin/packages");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create package");
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-8xl space-y-4 p-3 md:space-y-6 md:p-6">
        {/* ============ HEADER ============ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <PackageIcon className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Create Package
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Define pricing, limits and features for a new subscription plan.
              </p>
            </div>
          </div>

          <Link
            href="/admin/packages"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-emerald-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Packages
          </Link>
        </div>

        {/* ============ FORM ============ */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 md:space-y-6"
        >
          {/* --- Identity --- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Package Identity
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Package Name"
                  required
                  error={errors.name?.message}
                  hint="e.g. Starter, Pro, Business"
                >
                  <input
                    {...register("name")}
                    type="text"
                    placeholder="Starter"
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                        : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                    )}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field
                  label="Description"
                  error={errors.description?.message}
                  hint="Optional"
                >
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder="A short description of what this plan offers..."
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      "resize-none",
                      errors.description
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                        : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                    )}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* --- Pricing --- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Pricing & Duration
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Price" required error={errors.price?.message}>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                    ৳
                  </span>
                  <input
                    {...register("price")}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      "pl-8",
                      errors.price
                        ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                        : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                    )}
                  />
                </div>
              </Field>

              <Field label="Currency" error={errors.currency?.message}>
                <select
                  {...register("currency")}
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                >
                  <option value="BDT">BDT — ৳</option>
                  <option value="USD">USD — $</option>
                  <option value="EUR">EUR — €</option>
                  <option value="INR">INR — ₹</option>
                </select>
              </Field>

              <Field
                label="Duration"
                required
                hint="in days"
                error={errors.durationDay?.message}
              >
                <select
                  {...register("durationDay")}
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                >
                  <option value={7}>7 days (Weekly)</option>
                  <option value={30}>30 days (Monthly)</option>
                  <option value={90}>90 days (Quarterly)</option>
                  <option value={180}>180 days (Half-yearly)</option>
                  <option value={365}>365 days (Yearly)</option>
                </select>
              </Field>
            </div>
          </section>

          {/* --- Limits --- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-1 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Package Limits
              </h2>
            </div>
            <p className="mb-4 flex items-center gap-1 text-xs text-gray-500">
              Leave blank for
              <InfinityIcon className="inline h-3 w-3 text-emerald-600" />
              unlimited.
            </p>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field
                label="Max Products"
                hint="blank = unlimited"
                error={errors.maxProducts?.message as any}
              >
                <input
                  {...register("maxProducts")}
                  type="number"
                  min="0"
                  placeholder="e.g. 100"
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                />
              </Field>

              <Field
                label="Max Categories"
                hint="blank = unlimited"
                error={errors.maxCategories?.message as any}
              >
                <input
                  {...register("maxCategories")}
                  type="number"
                  min="0"
                  placeholder="e.g. 10"
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                />
              </Field>

              <Field
                label="Max Orders / Month"
                hint="blank = unlimited"
                error={errors.maxOrdersPerMonth?.message as any}
              >
                <input
                  {...register("maxOrdersPerMonth")}
                  type="number"
                  min="0"
                  placeholder="e.g. 500"
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                />
              </Field>
            </div>
          </section>

          {/* --- Features --- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Features
              </h2>
            </div>

            <div className="mb-3 flex gap-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddFeature();
                  }
                }}
                placeholder="e.g. Custom domain, Priority support..."
                disabled={isLoading}
                className={cn(
                  inputBase,
                  "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                )}
              />
              <button
                type="button"
                onClick={handleAddFeature}
                disabled={!featureInput.trim() || isLoading}
                className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-[#0b2b26] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {fields.length > 0 ? (
              <ul className="space-y-2">
                <AnimatePresence>
                  {fields.map((field, idx) => (
                    <motion.li
                      key={field.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 8, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium text-gray-800">
                          {field.value}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(idx)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                        aria-label="Remove feature"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-6 text-center">
                <Sparkles className="mx-auto mb-2 h-5 w-5 text-gray-300" />
                <p className="text-xs text-gray-500">
                  No features added yet. Add what makes this plan special.
                </p>
              </div>
            )}
          </section>

          {/* --- Settings --- */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Display Settings
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
                  className={cn(
                    inputBase,
                    "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                  )}
                />
              </Field>

              {/* isPopular toggle */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Crown className="h-4 w-4 text-amber-500" />
                      Popular
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Highlight on landing page
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setValue("isPopular", !isPopular)}
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
                      isPopular ? "bg-amber-500" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                        isPopular ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* isActive toggle */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Active
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Visible on landing page
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

          {/* --- Submit --- */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/packages"
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
                  Create Package
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}