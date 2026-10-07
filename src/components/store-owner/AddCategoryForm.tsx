"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  FolderTree,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Plus,
  Check,
  Upload,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCreateCategoryMutation } from "@/redux/api/saas/categoryApi";
import { useAddThumbnailMutation, useDeleteFileMutation } from "@/redux/features/file/fileApi";


/* ============ Schema ============ */
const schema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(60, "Title must be under 60 characters"),
  description: z
    .string()
    .max(300, "Description must be under 300 characters")
    .optional()
    .or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  displayOrder: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
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
export default function AddCategoryForm() {
  const router = useRouter();
  const [createCategory, { isLoading: isCreating }] = useCreateCategoryMutation();
  const [addThumbnail, { isLoading: isUploading }] = useAddThumbnailMutation();
  const [deleteFile] = useDeleteFileMutation();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = isCreating || isUploading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      image: "",
      displayOrder: 0,
      isActive: true,
    },
    mode: "onChange",
  });

  const isActive = watch("isActive");
  const image = watch("image");

  /* ---------- Upload image ---------- */
  const handleUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await addThumbnail(formData).unwrap();

      // Response shape: { success: true, data: ["https://..."] }
      const url = Array.isArray(res?.data)
        ? res.data[0]
        : typeof res?.data === "string"
        ? res.data
        : "";

      if (url) {
        // Delete the previous image (best-effort)
        if (image) {
          try {
            const oldKey = image.split("/").pop() || image;
            await deleteFile(oldKey).unwrap();
          } catch {
            /* silent */
          }
        }
        setValue("image", url, { shouldValidate: true, shouldDirty: true });
      } else {
        toast.error("Upload succeeded but no URL returned");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to upload image");
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleUpload(file);
  };

  const handleRemoveImage = async () => {
    const current = image;
    setValue("image", "", { shouldValidate: true, shouldDirty: true });
    if (!current) return;
    try {
      const key = current.split("/").pop() || current;
      await deleteFile(key).unwrap();
    } catch {
      /* silent */
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      await createCategory({
        title: data.title.trim(),
        description: data.description?.trim() || "",
        image: data.image?.trim() || "",
        displayOrder: Number(data.displayOrder) || 0,
        isActive: Boolean(data.isActive),
      }).unwrap();

      toast.success("Category created successfully");
      router.push("/admin/store/categories");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create category");
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-8xl space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <FolderTree className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Add Category
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Create a new product category for your store.
              </p>
            </div>
          </div>

          <Link
            href="/admin/store/categories"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-emerald-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
                Category Details
              </h2>
            </div>

            <div className="space-y-4">
              <Field
                label="Title"
                required
                error={errors.title?.message}
                hint="e.g. Electronics, Fashion"
              >
                <input
                  {...register("title")}
                  type="text"
                  placeholder="Electronics"
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    errors.title
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-emerald-600"
                  )}
                />
              </Field>

              <Field
                label="Description"
                hint="Optional"
                error={errors.description?.message}
              >
                <textarea
                  {...register("description")}
                  rows={3}
                  placeholder="Short description of this category..."
                  disabled={isLoading}
                  className={cn(
                    inputBase,
                    "resize-none",
                    errors.description
                      ? "border-red-300 focus:border-red-500"
                      : "border-gray-200 focus:border-emerald-600"
                  )}
                />
              </Field>

              {/* Image upload */}
              <Field
                label="Category Image"
                hint="Optional"
                error={errors.image?.message}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={isLoading}
                  onChange={handleFileInput}
                />

                {image ? (
                  <div className="group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt="Category"
                      className="h-48 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute right-3 top-3 rounded-full bg-black/60 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      aria-label="Remove image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
                      isDragging
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/40"
                    )}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mb-2 h-6 w-6 animate-spin text-emerald-600" />
                        <p className="text-sm font-semibold text-gray-700">
                          Uploading…
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 h-6 w-6 text-emerald-600" />
                        <p className="text-sm font-semibold text-gray-800">
                          Click or drag &amp; drop to upload
                        </p>
                        <p className="mt-0.5 text-xs text-gray-500">
                          PNG, JPG, WEBP
                        </p>
                      </>
                    )}
                  </div>
                )}
              </Field>
            </div>
          </section>

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
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
              </Field>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Check className="h-4 w-4 text-emerald-600" />
                      Active
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Visible in product form
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
              href="/admin/store/categories"
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
                  Create Category
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}