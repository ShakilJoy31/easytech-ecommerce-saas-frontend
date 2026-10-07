"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Loader2,
  AlertCircle,
  User,
  Phone,
  Mail,
  Store as StoreIcon,
  Check,
  Pencil,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  StoreOwnerUser,
  StoreOwnerStore,
  useUpdateStoreOwnerByAdminMutation,
} from "@/redux/api/saas/storeOwnerApi";

/* ============ Schema ============ */
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().min(1, "Email is required"),
  phone: z.string().min(1, "Phone is required"),
  isActive: z.boolean(),

  storeName: z.string().min(2, "Store name is required"),
  storeTagline: z.string().optional().or(z.literal("")),
  storeDescription: z.string().optional().or(z.literal("")),
  storePhone: z.string().optional().or(z.literal("")),
  storeEmail: z.string().optional().or(z.literal("")),
  storeAddress: z.string().optional().or(z.literal("")),
  storeDistrict: z.string().optional().or(z.literal("")),
  storeStatus: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED", "EXPIRED"]),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

/* ============ MAIN ============ */
export default function EditStoreOwnerModal({
  open,
  user,
  store,
  onClose,
}: {
  open: boolean;
  user: StoreOwnerUser | null;
  store: StoreOwnerStore | null;
  onClose: () => void;
}) {
  const [updateOwner, { isLoading }] = useUpdateStoreOwnerByAdminMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      isActive: true,
      storeName: "",
      storeTagline: "",
      storeDescription: "",
      storePhone: "",
      storeEmail: "",
      storeAddress: "",
      storeDistrict: "",
      storeStatus: "INACTIVE",
    },
    mode: "onChange",
  });

  const isActive = watch("isActive");
  const storeStatus = watch("storeStatus");

  useEffect(() => {
    if (user && open) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        isActive: user.isActive ?? true,
        storeName: store?.name || "",
        storeTagline: store?.tagline || "",
        storeDescription: store?.description || "",
        storePhone: store?.phone || "",
        storeEmail: store?.email || "",
        storeAddress: store?.address || "",
        storeDistrict: store?.district || "",
        storeStatus: (store?.status as any) || "INACTIVE",
      });
    }
  }, [user, store, open, reset]);

  const onSubmit = async (data: FormData) => {
    if (!user) return;
    try {
      await updateOwner({
        id: user.id,
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        isActive: Boolean(data.isActive),
        storeName: data.storeName.trim(),
        storeTagline: data.storeTagline?.trim() || "",
        storeDescription: data.storeDescription?.trim() || "",
        storePhone: data.storePhone?.trim() || "",
        storeEmail: data.storeEmail?.trim() || "",
        storeAddress: data.storeAddress?.trim() || "",
        storeDistrict: data.storeDistrict?.trim() || "",
        storeStatus: data.storeStatus,
      }).unwrap();

      toast.success("Store owner updated");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  return (
    <AnimatePresence>
      {open && user && (
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
                    Edit Store Owner
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Update account and store information.
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

            {/* Form body */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                {/* Owner Info */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                    <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
                    Owner Information
                  </h3>
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
                        Email <span className="text-red-500">*</span>
                      </label>
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
                          className={cn(
                            inputBase,
                            "pl-11",
                            errors.phone
                              ? "border-red-300 focus:border-red-500"
                              : "border-gray-200 focus:border-emerald-600"
                          )}
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-2">
                      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">
                              Account Active
                            </p>
                            <p className="mt-0.5 text-xs text-gray-500">
                              Owner can log in when active
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setValue("isActive", !isActive)}
                            className={cn(
                              "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
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
                </section>

                {/* Store Info */}
                <section>
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-600">
                    <span className="h-3.5 w-1 rounded-full bg-emerald-500" />
                    Store Information
                  </h3>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Store Name <span className="text-red-500">*</span>
                      </label>
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
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Tagline
                      </label>
                      <input
                        {...register("storeTagline")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Description
                      </label>
                      <textarea
                        {...register("storeDescription")}
                        rows={2}
                        disabled={isLoading}
                        className={cn(inputBase, "resize-none border-gray-200 focus:border-emerald-600")}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Store Email
                      </label>
                      <input
                        {...register("storeEmail")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Store Phone
                      </label>
                      <input
                        {...register("storePhone")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        District
                      </label>
                      <input
                        {...register("storeDistrict")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Store Status
                      </label>
                      <select
                        {...register("storeStatus")}
                        disabled={isLoading}
                        className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="SUSPENDED">Suspended</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                        Address
                      </label>
                      <textarea
                        {...register("storeAddress")}
                        rows={2}
                        disabled={isLoading}
                        className={cn(inputBase, "resize-none border-gray-200 focus:border-emerald-600")}
                      />
                    </div>
                  </div>
                </section>
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