"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  FolderTree,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Info,
  Copy,
  Package as PackageIcon,
  Upload,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Category,
  useGetAllCategoriesQuery,
  useDeleteCategoryMutation,
  useToggleCategoryStatusMutation,
  useUpdateCategoryMutation,
} from "@/redux/api/saas/categoryApi";
import { useAddThumbnailMutation, useDeleteFileMutation } from "@/redux/features/file/fileApi";

/* ============ Confirm Dialog ============ */
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
            transition={{ duration: 0.2 }}
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

/* ============ View Modal ============ */
function ViewCategoryModal({
  open,
  category,
  onClose,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}) {
  if (!category) return null;

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  return (
    <AnimatePresence>
      {open && (
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
            className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image}
                      alt={category.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <FolderTree className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {category.title}
                    </h2>
                    {category.isActive ? (
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
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    /{category.slug}
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

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Products
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-2xl font-bold text-gray-900">
                    <PackageIcon className="h-4 w-4 text-emerald-600" />
                    {category.productCount || 0}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Order
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {category.displayOrder}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    ID
                  </p>
                  <p className="mt-1 font-mono text-lg font-bold text-gray-900">
                    #{category.id}
                  </p>
                </div>
              </div>

              {/* Description */}
              {category.description && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Description
                  </h3>
                  <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {category.description}
                  </p>
                </div>
              )}

              {/* Details */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Details
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="divide-y divide-gray-100">
                    <Row
                      label="Slug"
                      value={category.slug}
                      mono
                      copy
                      onCopy={handleCopy}
                    />
                    <Row
                      label="Created"
                      value={
                        category.createdAt
                          ? new Date(category.createdAt).toLocaleString(
                              "en-GB",
                              { dateStyle: "medium", timeStyle: "short" }
                            )
                          : "—"
                      }
                    />
                  </div>
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

function Row({
  label,
  value,
  mono,
  copy,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
  onCopy?: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "truncate text-right text-sm font-semibold text-gray-900",
            mono && "font-mono"
          )}
        >
          {value}
        </span>
        {copy && onCopy && value && (
          <button
            onClick={() => onCopy(value)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-700"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ============ Edit Modal ============ */
const editSchema = z.object({
  title: z.string().min(2, "Title is required").max(60),
  description: z.string().max(300).optional().or(z.literal("")),
  image: z.string().optional().or(z.literal("")),
  displayOrder: z.coerce.number().min(0).default(0),
  isActive: z.boolean().default(true),
});

type EditInput = z.input<typeof editSchema>;
type EditData = z.output<typeof editSchema>;

function EditCategoryModal({
  open,
  category,
  onClose,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
}) {
  const [updateCategory, { isLoading: isUpdating }] = useUpdateCategoryMutation();
  const [addThumbnail, { isLoading: isUploading }] = useAddThumbnailMutation();
  const [deleteFile] = useDeleteFileMutation();

  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = isUpdating || isUploading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<EditInput, any, EditData>({
    resolver: zodResolver(editSchema),
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

  useEffect(() => {
    if (category && open) {
      reset({
        title: category.title || "",
        description: category.description || "",
        image: category.image || "",
        displayOrder: category.displayOrder || 0,
        isActive: category.isActive ?? true,
      });
    }
  }, [category, open, reset]);

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
        if (image && image !== url) {
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

  const onSubmit = async (data: EditData) => {
    if (!category) return;
    try {
      await updateCategory({
        id: category.id,
        title: data.title.trim(),
        description: data.description?.trim() || "",
        image: data.image?.trim() || "",
        displayOrder: Number(data.displayOrder) || 0,
        isActive: Boolean(data.isActive),
      }).unwrap();
      toast.success("Category updated");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

  return (
    <AnimatePresence>
      {open && category && (
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
            className="flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <Pencil className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Edit Category
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Update "{category.title}" details.
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

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <div className="flex-1 space-y-4 overflow-y-auto p-6">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    {...register("title")}
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      errors.title
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                  {errors.title && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    rows={2}
                    disabled={isLoading}
                    className={cn(inputBase, "resize-none border-gray-200 focus:border-emerald-600")}
                  />
                </div>

                {/* Image upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Category Image
                  </label>

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
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Display Order
                    </label>
                    <input
                      {...register("displayOrder")}
                      type="number"
                      min="0"
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">
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

/* ============ Skeleton ============ */
function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-4">
          <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        </td>
      ))}
    </tr>
  );
}

/* ============ Stat Card ============ */
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

/* ============ MAIN ============ */
export default function CategoryList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const [viewTarget, setViewTarget] = useState<Category | null>(null);
  const [editTarget, setEditTarget] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Category | null>(null);

  const { data, isLoading, isFetching } = useGetAllCategoriesQuery({
    page,
    limit,
    search,
    isActive: statusFilter,
  });

  const [deleteCategory, { isLoading: isDeleting }] = useDeleteCategoryMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleCategoryStatusMutation();

  const categories: Category[] = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCategory(deleteTarget.id).unwrap();
      toast.success("Category deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      await toggleStatus({
        id: toggleTarget.id,
        isActive: !toggleTarget.isActive,
      }).unwrap();
      toast.success(
        `Category ${!toggleTarget.isActive ? "activated" : "deactivated"}`
      );
      setToggleTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const pageStats = {
    total: pagination?.totalItems || 0,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    withProducts: categories.filter((c) => (c.productCount || 0) > 0).length,
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <FolderTree className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Categories
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Organize your products by category.
              </p>
            </div>
          </div>

          <Link
            href="/admin/store/new-category"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f3a33]"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={FolderTree}
            label="Total Categories"
            value={pageStats.total}
            accent="#10b981"
          />
          <StatCard
            icon={Check}
            label="Active (page)"
            value={pageStats.active}
            accent="#3b82f6"
          />
          <StatCard
            icon={EyeOff}
            label="Inactive (page)"
            value={pageStats.inactive}
            accent="#f59e0b"
          />
          <StatCard
            icon={PackageIcon}
            label="With Products"
            value={pageStats.withProducts}
            accent="#8b5cf6"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search categories..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-24 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0b2b26] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f3a33]"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              {(["", "true", "false"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setStatusFilter(key);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === key
                      ? "bg-[#0b2b26] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {key === "" ? "All" : key === "true" ? "Active" : "Inactive"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Products
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Order
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
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <FolderTree className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No categories yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Add your first category to organize your products.
                        </p>
                        <Link
                          href="/admin/store/new-category"
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
                        >
                          <Plus className="h-4 w-4" />
                          Add Category
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {categories.map((cat, idx) => (
                      <motion.tr
                        key={cat.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                              {cat.image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={cat.image}
                                  alt={cat.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                cat.title.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {cat.title}
                              </p>
                              {cat.description && (
                                <p className="truncate text-xs text-gray-500">
                                  {cat.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-mono text-xs text-gray-600">
                            /{cat.slug}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            <PackageIcon className="h-3 w-3" />
                            {cat.productCount || 0}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {cat.displayOrder}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => setToggleTarget(cat)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                              cat.isActive
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                cat.isActive ? "bg-emerald-500" : "bg-gray-400"
                              )}
                            />
                            {cat.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(cat)}
                              title="View"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setToggleTarget(cat)}
                              title={cat.isActive ? "Deactivate" : "Activate"}
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                              {cat.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditTarget(cat)}
                              title="Edit"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(cat)}
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

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
              <p className="text-xs text-gray-500">
                Showing <b>{(page - 1) * limit + 1}</b> to{" "}
                <b>{Math.min(page * limit, pagination.totalItems)}</b> of{" "}
                <b>{pagination.totalItems}</b>
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-semibold text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-1.5 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ViewCategoryModal
        open={!!viewTarget}
        category={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <EditCategoryModal
        open={!!editTarget}
        category={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete category?"
        description={`This will permanently delete "${deleteTarget?.title}". This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? "Deactivate category?"
            : "Activate category?"
        }
        description={
          toggleTarget?.isActive
            ? `"${toggleTarget?.title}" will no longer appear in the product form.`
            : `"${toggleTarget?.title}" will become selectable for new products.`
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