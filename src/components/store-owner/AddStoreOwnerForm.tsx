"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Users,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Plus,
  Check,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Store as StoreIcon,
  Crown,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCreateStoreOwnerByAdminMutation } from "@/redux/api/saas/storeOwnerApi";
import { useGetPublicPackagesQuery } from "@/redux/api/saas/packageApi";


/* ============ Schema ============ */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{11,14}$/;

const schema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().refine((v) => emailRegex.test(v), "Valid email required"),
    phone: z.string().refine((v) => phoneRegex.test(v), "Valid phone required"),
    password: z.string().min(6, "Min 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password required"),

    storeName: z.string().min(2, "Store name required"),
    storeTagline: z.string().optional().or(z.literal("")),
    storeDescription: z.string().optional().or(z.literal("")),
    storePhone: z.string().optional().or(z.literal("")),
    storeEmail: z.string().optional().or(z.literal("")),
    storeAddress: z.string().optional().or(z.literal("")),
    storeDistrict: z.string().optional().or(z.literal("")),
    packageId: z.coerce.number().min(1, "Select a package"),

    activateStore: z.boolean().default(false),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

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

/* ============ MAIN ============ */
export default function AddStoreOwnerForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [createOwner, { isLoading }] = useCreateStoreOwnerByAdminMutation();
  const { data: packagesData, isLoading: loadingPkgs } = useGetPublicPackagesQuery(undefined);
  const packages = packagesData?.data || [];

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
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      storeName: "",
      storeTagline: "",
      storeDescription: "",
      storePhone: "",
      storeEmail: "",
      storeAddress: "",
      storeDistrict: "",
      packageId: 0,
      activateStore: false,
    },
    mode: "onChange",
  });

  const selectedPackageId = watch("packageId");
  const activateStore = watch("activateStore");
  const selectedPackage = useMemo(
    () => packages.find((p: any) => p.id === Number(selectedPackageId)),
    [packages, selectedPackageId]
  );

  const onSubmit = async (data: FormData) => {
    try {
      await createOwner({
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        password: data.password,
        storeName: data.storeName.trim(),
        storeTagline: data.storeTagline?.trim() || "",
        storeDescription: data.storeDescription?.trim() || "",
        storePhone: data.storePhone?.trim() || "",
        storeEmail: data.storeEmail?.trim() || "",
        storeAddress: data.storeAddress?.trim() || "",
        storeDistrict: data.storeDistrict?.trim() || "",
        packageId: Number(data.packageId),
        isActive: true,
        activateStore: Boolean(data.activateStore),
      }).unwrap();

      toast.success("Store owner created successfully");
      router.push("/admin/users/store-owners");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create");
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-8xl space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <Users className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Add Store Owner
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manually create a store owner account and their store.
              </p>
            </div>
          </div>

          <Link
            href="/admin/users/store-owners"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-emerald-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          {/* Owner Info */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Owner Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Full Name" required error={errors.name?.message}>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("name")}
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "pl-11",
                        errors.name
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-emerald-600"
                      )}
                    />
                  </div>
                </Field>
              </div>

              <Field label="Email" required error={errors.email?.message}>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("email")}
                    type="email"
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      "pl-11",
                      errors.email
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                </div>
              </Field>

              <Field label="Phone" required error={errors.phone?.message}>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("phone")}
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      "pl-11",
                      errors.phone
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                </div>
              </Field>

              <Field label="Password" required error={errors.password?.message}>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      "pl-11 pr-11",
                      errors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </Field>

              <Field
                label="Confirm Password"
                required
                error={errors.confirmPassword?.message}
              >
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    {...register("confirmPassword")}
                    type="password"
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      "pl-11",
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                </div>
              </Field>
            </div>
          </section>

          {/* Store Info */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Store Information
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field label="Store Name" required error={errors.storeName?.message}>
                  <div className="relative">
                    <StoreIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                      {...register("storeName")}
                      disabled={isLoading}
                      className={cn(
                        inputBase,
                        "pl-11",
                        errors.storeName
                          ? "border-red-300 focus:border-red-500"
                          : "border-gray-200 focus:border-emerald-600"
                      )}
                    />
                  </div>
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field label="Tagline" hint="Optional">
                  <input
                    {...register("storeTagline")}
                    disabled={isLoading}
                    className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                  />
                </Field>
              </div>

              <Field label="Store Phone" hint="Optional">
                <input
                  {...register("storePhone")}
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
              </Field>

              <Field label="Store Email" hint="Optional">
                <input
                  {...register("storeEmail")}
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
              </Field>

              <Field label="District" hint="Optional">
                <input
                  {...register("storeDistrict")}
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
              </Field>

              <div className="md:col-span-2">
                <Field label="Address" hint="Optional">
                  <textarea
                    {...register("storeAddress")}
                    rows={2}
                    disabled={isLoading}
                    className={cn(inputBase, "resize-none border-gray-200 focus:border-emerald-600")}
                  />
                </Field>
              </div>
            </div>
          </section>

          {/* Package */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Package & Activation
              </h2>
            </div>

            {loadingPkgs ? (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {packages.map((pkg: any) => {
                  const isSelected = Number(selectedPackageId) === pkg.id;
                  return (
                    <motion.button
                      key={pkg.id}
                      type="button"
                      whileHover={{ y: -2 }}
                      onClick={() =>
                        setValue("packageId", pkg.id, { shouldValidate: true })
                      }
                      className={cn(
                        "relative overflow-hidden rounded-2xl border-2 p-4 text-left transition-all",
                        isSelected
                          ? "border-emerald-600 bg-emerald-50 shadow-lg shadow-emerald-500/10"
                          : "border-gray-200 bg-white hover:border-emerald-300"
                      )}
                    >
                      {pkg.isPopular && (
                        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                          <Crown className="h-3 w-3" />
                          Popular
                        </span>
                      )}
                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </motion.span>
                      )}
                      <p className="text-sm font-bold text-gray-900">{pkg.name}</p>
                      <p className="mt-1 text-xl font-bold text-gray-900">
                        {pkg.currency === "BDT" ? "৳" : pkg.currency}
                        {Number(pkg.price).toLocaleString("en-US")}
                        <span className="ml-1 text-xs font-medium text-gray-500">
                          / {pkg.durationLabel || `${pkg.durationDay}d`}
                        </span>
                      </p>
                      <div className="mt-2 flex flex-col gap-1 text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          Products:{" "}
                          {pkg.maxProducts === null ? (
                            <InfinityIcon className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <b>{pkg.maxProducts}</b>
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          Categories:{" "}
                          {pkg.maxCategories === null ? (
                            <InfinityIcon className="h-3 w-3 text-emerald-600" />
                          ) : (
                            <b>{pkg.maxCategories}</b>
                          )}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}

            {errors.packageId && (
              <p className="mt-2 flex items-center gap-1 text-xs font-medium text-red-600">
                <AlertCircle className="h-3 w-3" />
                {errors.packageId.message as string}
              </p>
            )}

            {/* Activate toggle */}
            <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Activate store immediately
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Skips manual payment verification. Only use for trusted
                    clients.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setValue("activateStore", !activateStore)}
                  className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
                    activateStore ? "bg-emerald-600" : "bg-gray-300"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                      activateStore ? "translate-x-5" : "translate-x-0.5"
                    )}
                  />
                </button>
              </div>
            </div>
          </section>

          {/* Submit */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin/users/store-owners"
              className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
            >
              Cancel
            </Link>
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.01 }}
              whileTap={{ scale: isLoading ? 1 : 0.99 }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b2b26] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-[#0f3a33] disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Create Store Owner
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}