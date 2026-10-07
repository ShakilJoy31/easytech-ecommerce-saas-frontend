"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Loader2,
  AlertCircle,
  Pencil,
  Plus,
  Check,
  Image as ImageIcon,
  Star,
  Tag,
  Upload,
  Trash2,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Product,
  useUpdateProductMutation,
} from "@/redux/api/saas/productApi";
import { CategoryOption } from "@/redux/api/saas/categoryApi";
import dynamic from "next/dynamic";

/* ============ SunEditor (client-only) ============ */
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });
import "suneditor/dist/css/suneditor.min.css";
import { useAddThumbnailMutation, useDeleteFileMutation } from "@/redux/features/file/fileApi";

/* ============ Schema ============ */
const schema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  shortDescription: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(20000).optional().or(z.literal("")),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  compareAtPrice: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  costPrice: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  currency: z.string().default("BDT"),
  stock: z.coerce.number().min(0).default(0),
  sku: z.string().optional().or(z.literal("")),
  trackStock: z.boolean().default(true),
  categoryId: z.union([z.coerce.number().min(1), z.literal("")]).optional(),
  images: z.array(z.object({ value: z.string().min(1) })).default([]),
  tags: z.array(z.object({ value: z.string().min(1) })).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  displayOrder: z.coerce.number().min(0).default(0),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-2.5 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

/* ============ SunEditor config ============ */
const EDITOR_BUTTON_LIST = [
  ["undo", "redo"],
  ["font", "fontSize", "formatBlock"],
  ["paragraphStyle", "blockquote"],
  ["bold", "underline", "italic", "strike", "subscript", "superscript"],
  ["fontColor", "hiliteColor", "textStyle"],
  ["removeFormat"],
  ["outdent", "indent"],
  ["align", "horizontalRule", "list", "lineHeight"],
  ["table", "link", "image", "video"],
  ["fullScreen", "showBlocks", "codeView"],
  ["preview", "print"],
];

export default function EditProductModal({
  open,
  product,
  categories,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  categories: CategoryOption[];
  onClose: () => void;
}) {
  const [updateProduct, { isLoading: isUpdating }] = useUpdateProductMutation();
  const [addThumbnail, { isLoading: isUploading }] = useAddThumbnailMutation();
  const [deleteFile] = useDeleteFileMutation();

  const [tagInput, setTagInput] = useState("");
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
    control,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: 0,
      compareAtPrice: "",
      costPrice: "",
      currency: "BDT",
      stock: 0,
      sku: "",
      trackStock: true,
      categoryId: "",
      images: [],
      tags: [],
      isFeatured: false,
      isActive: true,
      displayOrder: 0,
    },
    mode: "onChange",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } =
    useFieldArray({ control, name: "images" });
  const { fields: tagFields, append: appendTag, remove: removeTag } =
    useFieldArray({ control, name: "tags" });

  const isActive = watch("isActive");
  const isFeatured = watch("isFeatured");
  const trackStock = watch("trackStock");
  const description = watch("description");

  useEffect(() => {
    if (product && open) {
      reset({
        title: product.title || "",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        price: product.price ?? 0,
        compareAtPrice: product.compareAtPrice ?? "",
        costPrice: product.costPrice ?? "",
        currency: product.currency || "BDT",
        stock: product.stock ?? 0,
        sku: product.sku || "",
        trackStock: product.trackStock ?? true,
        categoryId: product.categoryId ?? "",
        images: (product.images || []).map((v) => ({ value: v })),
        tags: (product.tags || []).map((v) => ({ value: v })),
        isFeatured: product.isFeatured ?? false,
        isActive: product.isActive ?? true,
        displayOrder: product.displayOrder ?? 0,
      });
    }
  }, [product, open, reset]);

/* ---------- Image upload (multi) ---------- */
const handleFiles = async (files: FileList | File[]) => {
  const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
  if (list.length === 0) {
    toast.error("Please select image files only");
    return;
  }

  for (const file of list) {
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
        appendImage({ value: url });
      } else {
        toast.error("Upload succeeded but no URL returned");
      }
    } catch (err: any) {
      toast.error(err?.data?.message || `Failed to upload ${file.name}`);
    }
  }
};

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const handleRemoveImage = async (idx: number) => {
    const url = imageFields[idx]?.value;
    removeImage(idx);
    if (!url) return;
    // Best-effort delete; ignore failures
    try {
      const key = url.split("/").pop() || url;
      await deleteFile(key).unwrap();
    } catch {
      /* silent */
    }
  };

  const handleAddTag = () => {
    const t = tagInput.trim();
    if (!t) return;
    if (tagFields.some((f) => f.value === t)) {
      toast.error("Tag already added");
      return;
    }
    appendTag({ value: t });
    setTagInput("");
  };

  const onSubmit = async (data: FormData) => {
    if (!product) return;
    try {
      await updateProduct({
        id: product.id,
        title: data.title.trim(),
        shortDescription: data.shortDescription?.trim() || "",
        description: data.description?.trim() || "",
        price: Number(data.price),
        compareAtPrice:
          data.compareAtPrice === "" || data.compareAtPrice === undefined
            ? null
            : Number(data.compareAtPrice),
        costPrice:
          data.costPrice === "" || data.costPrice === undefined
            ? null
            : Number(data.costPrice),
        currency: data.currency,
        stock: Number(data.stock) || 0,
        sku: data.sku?.trim() || "",
        trackStock: Boolean(data.trackStock),
        categoryId:
          data.categoryId === "" || data.categoryId === undefined
            ? null
            : Number(data.categoryId),
        images: data.images.map((i) => i.value),
        thumbnail: data.images[0]?.value || "",
        tags: data.tags.map((t) => t.value),
        isFeatured: Boolean(data.isFeatured),
        isActive: Boolean(data.isActive),
        displayOrder: Number(data.displayOrder) || 0,
      } as any).unwrap();
      toast.success("Product updated");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  return (
    <AnimatePresence>
      {open && product && (
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
                    Edit Product
                  </h2>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Update "{product.title}"
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
                {/* Basic info */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
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
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Short Description
                    </label>
                    <input
                      {...register("shortDescription")}
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    />
                  </div>

                  {/* Full Description — SunEditor */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Description
                    </label>
                    <div className="overflow-hidden rounded-xl border border-gray-200 focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/15">
                      <SunEditor
                        setContents={description || ""}
                        onChange={(content) =>
                          setValue("description", content, {
                            shouldValidate: false,
                            shouldDirty: true,
                          })
                        }
                        setOptions={{
                          buttonList: EDITOR_BUTTON_LIST,
                          height: "400px",
                          minHeight: "400px",
                          placeholder: "Write a detailed product description…",
                          font: [
                            "Arial",
                            "Comic Sans MS",
                            "Courier New",
                            "Georgia",
                            "Impact",
                            "Roboto",
                            "Tahoma",
                            "Times New Roman",
                            "Verdana",
                          ],
                        }}
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Category
                    </label>
                    <select
                      {...register("categoryId")}
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    >
                      <option value="">— No category —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
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
                          : "border-gray-200 focus:border-emerald-600"
                      )}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Compare At
                    </label>
                    <input
                      {...register("compareAtPrice")}
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Cost Price
                    </label>
                    <input
                      {...register("costPrice")}
                      type="number"
                      step="0.01"
                      min="0"
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    />
                  </div>
                </div>

                {/* Stock */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      Stock
                    </label>
                    <input
                      {...register("stock")}
                      type="number"
                      min="0"
                      disabled={isLoading || !trackStock}
                      className={cn(
                        inputBase,
                        "border-gray-200 focus:border-emerald-600 disabled:opacity-50"
                      )}
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                      SKU
                    </label>
                    <input
                      {...register("sku")}
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-gray-800">
                        Track Stock
                      </p>
                      <button
                        type="button"
                        onClick={() => setValue("trackStock", !trackStock)}
                        className={cn(
                          "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
                          trackStock ? "bg-emerald-600" : "bg-gray-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                            trackStock ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Images — file upload */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Images
                  </label>

                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "mb-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-center transition-colors",
                      isDragging
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-gray-200 bg-gray-50 hover:border-emerald-400 hover:bg-emerald-50/40"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      hidden
                      disabled={isLoading}
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          handleFiles(e.target.files);
                          e.target.value = "";
                        }
                      }}
                    />
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
                          PNG, JPG, WEBP · multiple allowed
                        </p>
                      </>
                    )}
                  </div>

                  {imageFields.length > 0 && (
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                      <AnimatePresence>
                        {imageFields.map((f, i) => (
                          <motion.div
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={f.value}
                              alt={`Image ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                            {i === 0 && (
                              <span className="absolute left-1.5 top-1.5 rounded-full bg-emerald-600 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">
                                Primary
                              </span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(i)}
                              className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                    Tags
                  </label>
                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder="e.g. new, sale"
                      disabled={isLoading}
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || isLoading}
                      className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33] disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                  {tagFields.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <AnimatePresence>
                        {tagFields.map((f, i) => (
                          <motion.span
                            key={f.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                          >
                            <Tag className="h-3 w-3" />
                            {f.value}
                            <button
                              type="button"
                              onClick={() => removeTag(i)}
                              className="rounded-full p-0.5 text-emerald-600 hover:bg-emerald-100"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </motion.span>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}
                </div>

                {/* Toggles */}
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
                      className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                    />
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                        <Star className="h-3.5 w-3.5 text-amber-500" />
                        Featured
                      </p>
                      <button
                        type="button"
                        onClick={() => setValue("isFeatured", !isFeatured)}
                        className={cn(
                          "relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors",
                          isFeatured ? "bg-amber-500" : "bg-gray-300"
                        )}
                      >
                        <span
                          className={cn(
                            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
                            isFeatured ? "translate-x-5" : "translate-x-0.5"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        Active
                      </p>
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