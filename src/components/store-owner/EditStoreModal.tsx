"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Loader2,
  Pencil,
  Store as StoreIcon,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Store,
  useUpdateStoreMutation,
} from "@/redux/api/saas/storeManagementApi";

/* ============ Schema ============ */
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Only lowercase letters, numbers and hyphens"),
  tagline: z.string().optional().or(z.literal("")),
  description: z.string().optional().or(z.literal("")),
  email: z.string().optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  district: z.string().optional().or(z.literal("")),
  country: z.string().optional().or(z.literal("")),
  primaryColor: z.string().optional().or(z.literal("")),
  secondaryColor: z.string().optional().or(z.literal("")),
  facebook: z.string().optional().or(z.literal("")),
  instagram: z.string().optional().or(z.literal("")),
  whatsapp: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"]),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

export default function EditStoreModal({
  open,
  store,
  onClose,
}: {
  open: boolean;
  store: Store | null;
  onClose: () => void;
}) {
  const [updateStore, { isLoading }] = useUpdateStoreMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      tagline: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      district: "",
      country: "Bangladesh",
      primaryColor: "#1d6fff",
      secondaryColor: "#0b2545",
      facebook: "",
      instagram: "",
      whatsapp: "",
      status: "INACTIVE",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (store && open) {
      reset({
        name: store.name || "",
        slug: store.slug || "",
        tagline: store.tagline || "",
        description: store.description || "",
        email: store.email || "",
        phone: store.phone || "",
        address: store.address || "",
        district: store.district || "",
        country: store.country || "Bangladesh",
        primaryColor: store.primaryColor || "#1d6fff",
        secondaryColor: store.secondaryColor || "#0b2545",
        facebook: store.facebook || "",
        instagram: store.instagram || "",
        whatsapp: store.whatsapp || "",
        status: store.status || "INACTIVE",
      });
    }
  }, [store, open, reset]);

  const onSubmit = async (data: FormData) => {
    if (!store) return;
    try {
      await updateStore({
        id: store.id,
        name: data.name.trim(),
        slug: data.slug.trim(),
        tagline: data.tagline?.trim() || "",
        description: data.description?.trim() || "",
        email: data.email?.trim() || "",
        phone: data.phone?.trim() || "",
        address: data.address?.trim() || "",
        district: data.district?.trim() || "",
        country: data.country?.trim() || "Bangladesh",
        primaryColor: data.primaryColor || "#1d6fff",
        secondaryColor: data.secondaryColor || "#0b2545",
        facebook: data.facebook?.trim() || "",
        instagram: data.instagram?.trim() || "",
        whatsapp: data.whatsapp?.trim() || "",
        status: data.status,
      }).unwrap();
      toast.success("Store updated");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  return (
    <AnimatePresence>
      {open && store && (
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
            transition={{ duration: 0.25 }}
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
                    Edit Store
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Update "{store.name}" details.
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                {/* Identity */}
                <Section title="Store Identity">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <Field label="Store Name" required error={errors.name?.message}>
                        <div className="relative">
                          <StoreIcon className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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

                    <Field label="Slug" required error={errors.slug?.message} hint="lowercase, hyphens only">
                      <input
                        {...register("slug")}
                        disabled={isLoading}
                        className={cn(
                          inputBase,
                          errors.slug
                            ? "border-red-300 focus:border-red-500"
                            : "border-gray-200 focus:border-emerald-600"
                        )}
                      />
                    </Field>

                    <Field label="Status" error={errors.status?.message}>
                      <select
                        {...register("status")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Tagline">
                        <input
                          {...register("tagline")}
                          disabled={isLoading}
                          className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                        />
                      </Field>
                    </div>

                    <div className="sm:col-span-2">
                      <Field label="Description">
                        <textarea
                          {...register("description")}
                          rows={2}
                          disabled={isLoading}
                          className={cn(inputBase, "resize-none border-gray-200 focus:border-emerald-600")}
                        />
                      </Field>
                    </div>
                  </div>
                </Section>

                {/* Contact */}
                <Section title="Contact Information">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Email">
                      <input
                        {...register("email")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>

                    <Field label="Phone">
                      <input
                        {...register("phone")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>

                    <Field label="District">
                      <input
                        {...register("district")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>

                    <Field label="Country">
                      <input
                        {...register("country")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>

                    <div className="sm:col-span-2">
                      <Field label="Address">
                        <textarea
                          {...register("address")}
                          rows={2}
                          disabled={isLoading}
                          className={cn(inputBase, "resize-none border-gray-200 focus:border-emerald-600")}
                        />
                      </Field>
                    </div>
                  </div>
                </Section>

                {/* Socials */}
                <Section title="Social Links">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field label="Facebook">
                      <input
                        {...register("facebook")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>
                    <Field label="Instagram">
                      <input
                        {...register("instagram")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>
                    <Field label="WhatsApp">
                      <input
                        {...register("whatsapp")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>
                  </div>
                </Section>

                {/* Theme */}
                <Section title="Theme Colors">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Field label="Primary Color">
                      <input
                        {...register("primaryColor")}
                        type="text"
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>
                    <Field label="Secondary Color">
                      <input
                        {...register("secondaryColor")}
                        type="text"
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </Field>
                  </div>
                </Section>
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
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600">
        <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
        {title}
      </h3>
      {children}
    </section>
  );
}

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
      {error && (
        <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}