"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Package as PackageIcon,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Star,
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  Sparkles,
  Infinity as InfinityIcon,
  X,
  Info,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Package,
  useDeletePackageMutation,
  useGetAllPackagesQuery,
  useTogglePackageStatusMutation,
  useUpdatePackageMutation,
} from "@/redux/api/saas/packageApi";

/* =========================================================================
   Confirm Dialog (delete / toggle)
========================================================================= */
function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full",
                    variant === "danger"
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-600"
                  )}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-4">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50",
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
   View Package Modal — read-only, animated
========================================================================= */
function ViewPackageModal({
  open,
  pkg,
  onClose,
}: {
  open: boolean;
  pkg: Package | null;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {open && pkg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
                  {pkg.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {pkg.name}
                    </h2>
                    {pkg.isPopular && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        <Star className="h-3 w-3 fill-amber-600 text-amber-600" />
                        Popular
                      </span>
                    )}
                    {pkg.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">/{pkg.slug}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Price row */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Price
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {pkg.currency === "BDT" ? "৳" : pkg.currency}
                    {pkg.price.toLocaleString("en-US")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Duration
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {pkg.durationDay}
                    <span className="ml-1 text-sm font-medium text-gray-500">
                      days
                    </span>
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Display Order
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {pkg.displayOrder}
                  </p>
                </div>
              </div>

              {/* Description */}
              {pkg.description && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Description
                  </h3>
                  <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {pkg.description}
                  </p>
                </div>
              )}

              {/* Limits */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Package Limits
                </h3>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    {
                      label: "Max Products",
                      value: pkg.maxProducts,
                    },
                    {
                      label: "Max Categories",
                      value: pkg.maxCategories,
                    },
                    {
                      label: "Max Orders / Month",
                      value: pkg.maxOrdersPerMonth,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-3"
                    >
                      <p className="text-xs text-gray-500">{item.label}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gray-900">
                        {item.value === null ? (
                          <>
                            <InfinityIcon className="h-4 w-4 text-emerald-600" />
                            <span>Unlimited</span>
                          </>
                        ) : (
                          item.value
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Features
                  <span className="text-xs font-normal text-gray-400">
                    ({pkg.features?.length || 0})
                  </span>
                </h3>
                {pkg.features && pkg.features.length > 0 ? (
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {pkg.features.map((feat, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700"
                      >
                        <Check className="h-4 w-4 flex-shrink-0 text-emerald-600" />
                        <span className="truncate">{feat}</span>
                      </motion.li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-6 text-center">
                    <Sparkles className="mx-auto mb-1 h-4 w-4 text-gray-300" />
                    <p className="text-xs text-gray-500">No features listed</p>
                  </div>
                )}
              </div>

              {/* Meta */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  <span>
                    Created:{" "}
                    {pkg.createdAt
                      ? new Date(pkg.createdAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
   Edit Package Modal — editable form, animated
   ------------------------------------------------------------------------
   Uses z.input / z.output split so useForm + zodResolver type-check cleanly
   when `z.coerce` is involved.
========================================================================= */
const editSchema = z.object({
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

type EditFormInput = z.input<typeof editSchema>;
type EditFormData = z.output<typeof editSchema>;

function EditPackageModal({
  open,
  pkg,
  onClose,
}: {
  open: boolean;
  pkg: Package | null;
  onClose: () => void;
}) {
  const [updatePackage, { isLoading }] = useUpdatePackageMutation();
  const [featureInput, setFeatureInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    control,
    reset,
  } = useForm<EditFormInput, any, EditFormData>({
    resolver: zodResolver(editSchema),
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

  /* Hydrate form when pkg changes */
  useEffect(() => {
    if (pkg && open) {
      reset({
        name: pkg.name,
        description: pkg.description || "",
        price: pkg.price,
        currency: pkg.currency,
        durationDay: pkg.durationDay,
        maxProducts:
          pkg.maxProducts === null ? "" : (pkg.maxProducts as any),
        maxCategories:
          pkg.maxCategories === null ? "" : (pkg.maxCategories as any),
        maxOrdersPerMonth:
          pkg.maxOrdersPerMonth === null
            ? ""
            : (pkg.maxOrdersPerMonth as any),
        features: (pkg.features || []).map((f) => ({ value: f })),
        displayOrder: pkg.displayOrder,
        isPopular: pkg.isPopular,
        isActive: pkg.isActive,
      });
      setFeatureInput("");
    }
  }, [pkg, open, reset]);

  /* Add feature */
  const handleAddFeature = () => {
    const trimmed = featureInput.trim();
    if (!trimmed) return;
    append({ value: trimmed });
    setFeatureInput("");
  };

  /* Submit */
  const onSubmit = async (data: EditFormData) => {
    if (!pkg) return;
    try {
      const payload = {
        id: pkg.id,
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

      await updatePackage(payload as any).unwrap();
      toast.success("Package updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update package");
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

  return (
    <AnimatePresence>
      {open && pkg && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Edit Package
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Update "{pkg.name}" details below.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form body */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                {/* Identity */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Package Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("name")}
                      type="text"
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        errors.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs font-medium text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      rows={2}
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "resize-none border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    />
                  </div>
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Price <span className="text-red-500">*</span>
                    </label>
                    <input
                      {...register("price")}
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        errors.price
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Currency
                    </label>
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
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Duration (days)
                    </label>
                    <select
                      {...register("durationDay")}
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    >
                      <option value={7}>7 days</option>
                      <option value={30}>30 days</option>
                      <option value={90}>90 days</option>
                      <option value={180}>180 days</option>
                      <option value={365}>365 days</option>
                    </select>
                  </div>
                </div>

                {/* Limits */}
                <div>
                  <p className="mb-2 text-xs text-gray-500">
                    Leave blank for unlimited.
                  </p>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Max Products
                      </label>
                      <input
                        {...register("maxProducts")}
                        type="number"
                        min="0"
                        placeholder="Unlimited"
                        disabled={isLoading}
                        className={cn(
                          inputBase,
                          "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Max Categories
                      </label>
                      <input
                        {...register("maxCategories")}
                        type="number"
                        min="0"
                        placeholder="Unlimited"
                        disabled={isLoading}
                        className={cn(
                          inputBase,
                          "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                        )}
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Max Orders / Month
                      </label>
                      <input
                        {...register("maxOrdersPerMonth")}
                        type="number"
                        min="0"
                        placeholder="Unlimited"
                        disabled={isLoading}
                        className={cn(
                          inputBase,
                          "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Features
                  </label>
                  <div className="mb-2 flex gap-2">
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
                      placeholder="Add a feature..."
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
                      className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33] disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                  {fields.length > 0 ? (
                    <ul className="space-y-1.5">
                      <AnimatePresence>
                        {fields.map((field, idx) => (
                          <motion.li
                            key={field.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 8, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                          >
                            <div className="flex items-center gap-2">
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                              <span className="text-sm text-gray-800">
                                {field.value}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => remove(idx)}
                              className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </motion.li>
                        ))}
                      </AnimatePresence>
                    </ul>
                  ) : (
                    <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-3 text-center text-xs text-gray-500">
                      No features yet
                    </p>
                  )}
                </div>

                {/* Display settings */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Display Order
                    </label>
                    <input
                      {...register("displayOrder")}
                      type="number"
                      min="0"
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "border-gray-200 hover:border-gray-300 focus:border-emerald-600"
                      )}
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                          <Crown className="h-3.5 w-3.5 text-amber-500" />
                          Popular
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

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                          <Check className="h-3.5 w-3.5 text-emerald-600" />
                          Active
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
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33] disabled:opacity-60"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
   Stat Card
========================================================================= */
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}15`, color: accent }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
  );
}

/* =========================================================================
   Skeleton Row
========================================================================= */
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}

/* =========================================================================
   MAIN COMPONENT
========================================================================= */
export default function PackageList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const [viewTarget, setViewTarget] = useState<Package | null>(null);
  const [editTarget, setEditTarget] = useState<Package | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Package | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Package | null>(null);

  const { data, isLoading, isFetching } = useGetAllPackagesQuery({
    page,
    limit,
    search,
    isActive: statusFilter,
  });

  const [deletePackage, { isLoading: isDeleting }] = useDeletePackageMutation();
  const [togglePackageStatus, { isLoading: isToggling }] =
    useTogglePackageStatusMutation();

  const packages: Package[] = data?.data || [];
  const pagination = data?.pagination;

  /* ---------------- handlers ---------------- */
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deletePackage(deleteTarget.id).unwrap();
      toast.success("Package deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete package");
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      await togglePackageStatus({
        id: toggleTarget.id,
        isActive: !toggleTarget.isActive,
      }).unwrap();
      toast.success(
        `Package ${!toggleTarget.isActive ? "activated" : "deactivated"}`
      );
      setToggleTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update status");
    }
  };

  /* ---------------- page stats ---------------- */
  const pageStats = {
    total: pagination?.totalItems || 0,
    active: packages.filter((p) => p.isActive).length,
    popular: packages.filter((p) => p.isPopular).length,
    avgPrice: packages.length
      ? Math.round(
          packages.reduce((sum, p) => sum + p.price, 0) / packages.length
        )
      : 0,
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="space-y-4 p-3 md:space-y-6 md:p-6">
        {/* ============ HEADER ============ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <PackageIcon className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Package Management
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Create, edit and organize subscription plans for your stores.
              </p>
            </div>
          </div>

          <Link
            href="/admin/packages/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f3a33]"
          >
            <Plus className="h-4 w-4" />
            Add Package
          </Link>
        </div>

        {/* ============ STATS ============ */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={PackageIcon}
            label="Total Packages"
            value={pageStats.total}
            accent="#10b981"
          />
          <StatCard
            icon={Check}
            label="Active (this page)"
            value={pageStats.active}
            accent="#3b82f6"
          />
          <StatCard
            icon={Crown}
            label="Popular (this page)"
            value={pageStats.popular}
            accent="#f59e0b"
          />
          <StatCard
            icon={Sparkles}
            label="Avg. Price"
            value={`৳${pageStats.avgPrice.toLocaleString("en-US")}`}
            accent="#8b5cf6"
          />
        </div>

        {/* ============ FILTERS ============ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearch}
              className="relative w-full md:max-w-md"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, slug or description..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-24 text-sm text-gray-900 placeholder-gray-400 focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0b2b26] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#0f3a33]"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              {(
                [
                  { key: "", label: "All" },
                  { key: "true", label: "Active" },
                  { key: "false", label: "Inactive" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === tab.key
                      ? "bg-[#0b2b26] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ============ TABLE ============ */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Package
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Limits
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : packages.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <PackageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No packages yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Get started by creating your first subscription
                          package.
                        </p>
                        <Link
                          href="/admin/packages/new"
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33]"
                        >
                          <Plus className="h-4 w-4" />
                          Create Package
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {packages.map((pkg, idx) => (
                      <motion.tr
                        key={pkg.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-100 transition-colors last:border-0 hover:bg-gray-50/60"
                      >
                        {/* Package name + meta */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                              {pkg.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="truncate font-semibold text-gray-900">
                                  {pkg.name}
                                </p>
                                {pkg.isPopular && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                                    <Star className="h-3 w-3 fill-amber-600 text-amber-600" />
                                    Popular
                                  </span>
                                )}
                              </div>
                              <p className="truncate text-xs text-gray-500">
                                /{pkg.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-4 py-4">
                          <p className="font-semibold text-gray-900">
                            {pkg.currency === "BDT" ? "৳" : pkg.currency}
                            {pkg.price.toLocaleString("en-US")}
                          </p>
                          <p className="text-xs text-gray-500">
                            per {pkg.durationLabel?.toLowerCase()}
                          </p>
                        </td>

                        {/* Duration */}
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            {pkg.durationLabel}
                          </span>
                        </td>

                        {/* Limits */}
                        <td className="px-4 py-4">
                          <div className="flex flex-col gap-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-500">
                                Products:
                              </span>
                              {pkg.maxProducts === null ? (
                                <InfinityIcon className="h-3 w-3 text-emerald-600" />
                              ) : (
                                pkg.maxProducts
                              )}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="font-medium text-gray-500">
                                Categories:
                              </span>
                              {pkg.maxCategories === null ? (
                                <InfinityIcon className="h-3 w-3 text-emerald-600" />
                              ) : (
                                pkg.maxCategories
                              )}
                            </span>
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <button
                            onClick={() => setToggleTarget(pkg)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                              pkg.isActive
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            {pkg.isActive ? (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                Active
                              </>
                            ) : (
                              <>
                                <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                Inactive
                              </>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            {/* View */}
                            <button
                              onClick={() => setViewTarget(pkg)}
                              title="View"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {/* Toggle status */}
                            <button
                              onClick={() => setToggleTarget(pkg)}
                              title={pkg.isActive ? "Deactivate" : "Activate"}
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                              {pkg.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>

                            {/* Edit */}
                            <button
                              onClick={() => setEditTarget(pkg)}
                              title="Edit"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => setDeleteTarget(pkg)}
                              title="Delete"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>

          {/* ============ PAGINATION ============ */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing{" "}
                <span className="font-semibold text-gray-900">
                  {(page - 1) * limit + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-gray-900">
                  {Math.min(page * limit, pagination.totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-gray-900">
                  {pagination.totalItems}
                </span>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-semibold text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============ VIEW MODAL ============ */}
      <ViewPackageModal
        open={!!viewTarget}
        pkg={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      {/* ============ EDIT MODAL ============ */}
      <EditPackageModal
        open={!!editTarget}
        pkg={editTarget}
        onClose={() => setEditTarget(null)}
      />

      {/* ============ DELETE DIALOG ============ */}
      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete package?"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ============ TOGGLE DIALOG ============ */}
      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive ? "Deactivate package?" : "Activate package?"
        }
        description={
          toggleTarget?.isActive
            ? `"${toggleTarget?.name}" will no longer be visible to new stores.`
            : `"${toggleTarget?.name}" will become available on the landing page.`
        }
        confirmText={toggleTarget?.isActive ? "Deactivate" : "Activate"}
        variant="primary"
        isLoading={isToggling}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}