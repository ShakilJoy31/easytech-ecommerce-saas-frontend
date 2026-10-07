"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import {
  Package as PackageIcon,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Plus,
  Check,
  X,
  Upload,
  Trash2,
  Star,
  Tag,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCreateProductMutation } from "@/redux/api/saas/productApi";
import { useGetCategoryOptionsQuery } from "@/redux/api/saas/categoryApi";
import dynamic from "next/dynamic";

/* ============ SunEditor (client-only) ============ */
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });
import "suneditor/dist/css/suneditor.min.css";
import {
  useAddThumbnailMutation,
  useDeleteFileMutation,
} from "@/redux/features/file/fileApi";

/* ============ Schema ============ */
const schema = z.object({
  title: z.string().min(2, "Title is required").max(120),
  shortDescription: z.string().max(200).optional().or(z.literal("")),
  description: z.string().max(20000).optional().or(z.literal("")),

  price: z.union([
    z.coerce.number().min(0, "Price must be 0 or more"),
    z.literal(""),
  ]),

  compareAtPrice: z
    .union([z.coerce.number().min(0), z.literal("")])
    .optional(),
  costPrice: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
  currency: z.string().default("BDT"),

  stock: z.union([z.coerce.number().min(0), z.literal("")]),

  sku: z.string().optional().or(z.literal("")),
  trackStock: z.boolean().default(true),
  categoryId: z.union([z.coerce.number().min(1), z.literal("")]).optional(),
  images: z
    .array(z.object({ value: z.string().min(1, "URL cannot be empty") }))
    .default([]),
  tags: z
    .array(z.object({ value: z.string().min(1, "Tag cannot be empty") }))
    .default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),

  displayOrder: z.union([z.coerce.number().min(0), z.literal("")]),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

const inputBase =
  "w-full rounded-xl border bg-white px-4 py-3 text-sm font-medium text-gray-900 placeholder-gray-400 transition-all focus:outline-none focus:ring-4 focus:ring-emerald-500/15";

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
export default function AddProductForm() {
  const router = useRouter();
  const [createProduct, { isLoading: isCreating }] = useCreateProductMutation();
  const [addThumbnail, { isLoading: isUploading }] = useAddThumbnailMutation();
  const [deleteFile] = useDeleteFileMutation();

  const { data: categoriesData, isLoading: isLoadingCats } =
    useGetCategoryOptionsQuery();
  const categories = categoriesData?.data || [];

  const [tagInput, setTagInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = isCreating || isUploading;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    control,
  } = useForm<FormInput, any, FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: "",
      compareAtPrice: "",
      costPrice: "",
      currency: "BDT",
      stock: "",
      sku: "",
      trackStock: true,
      categoryId: "",
      images: [],
      tags: [],
      isFeatured: false,
      isActive: true,
      displayOrder: "",
    },
    mode: "onChange",
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } =
    useFieldArray({ control, name: "images" });
  const { fields: tagFields, append: appendTag, remove: removeTag } =
    useFieldArray({ control, name: "tags" });

  const isFeatured = watch("isFeatured");
  const isActive = watch("isActive");
  const trackStock = watch("trackStock");
  const price = watch("price");
  const compareAtPrice = watch("compareAtPrice");
  const description = watch("description");

  const discountPercent = useMemo(() => {
    const p = Number(price);
    const c = Number(compareAtPrice);
    if (!p || !c || c <= p) return 0;
    return Math.round(((c - p) / c) * 100);
  }, [price, compareAtPrice]);

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
    try {
      const key = url.split("/").pop() || url;
      await deleteFile(key).unwrap();
    } catch {
      /* silent */
    }
  };

  const handleAddTag = () => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (tagFields.some((t) => t.value === trimmed)) {
      toast.error("Tag already added");
      return;
    }
    appendTag({ value: trimmed });
    setTagInput("");
  };

  const onSubmit = async (data: FormData) => {
    try {
      const payload = {
        title: data.title.trim(),
        shortDescription: data.shortDescription?.trim() || "",
        description: data.description?.trim() || "",
        price: Number(data.price) || 0,
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
      };

      await createProduct(payload as any).unwrap();
      toast.success("Product created successfully");
      router.push("/admin/store/products");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to create product");
    }
  };

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-8xl space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <PackageIcon className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Add Product
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Add a new product to your store's catalog.
              </p>
            </div>
          </div>

          <Link
            href="/admin/store/products"
            className="inline-flex items-center gap-1 text-sm text-gray-500 transition-colors hover:text-emerald-700"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
          {/* Identity */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <SectionHeader title="Product Information" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <Field
                  label="Product Title"
                  required
                  error={errors.title?.message}
                >
                  <input
                    {...register("title")}
                    placeholder="e.g. Wireless Earbuds Pro"
                    disabled={isLoading}
                    className={cn(
                      inputBase,
                      errors.title
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                </Field>
              </div>

              <div className="md:col-span-2">
                <Field
                  label="Short Description"
                  hint="Optional"
                  error={errors.shortDescription?.message}
                >
                  <input
                    {...register("shortDescription")}
                    placeholder="Short catchy line..."
                    disabled={isLoading}
                    className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                  />
                </Field>
              </div>

              {/* Full Description — SunEditor */}
              <div className="md:col-span-2">
                <Field
                  label="Full Description"
                  hint="Optional"
                  error={errors.description?.message}
                >
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
                </Field>
              </div>
            </div>
          </section>

          {/* Category */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <SectionHeader title="Category" />

            {isLoadingCats ? (
              <div className="h-12 animate-pulse rounded-xl bg-gray-100" />
            ) : categories.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-center">
                <AlertCircle className="mx-auto mb-1 h-4 w-4 text-gray-400" />
                <p className="text-xs text-gray-500">
                  No categories yet.{" "}
                  <Link
                    href="/store/categories/new"
                    className="font-semibold text-emerald-700 hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            ) : (
              <Field label="Select Category" error={errors.categoryId?.message as any}>
                <select
                  {...register("categoryId")}
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                >
                  <option value="">— No category —</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.title}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </section>

          {/* Pricing */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <SectionHeader title="Pricing" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Price" required error={errors.price?.message as any}>
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
                        ? "border-red-300 focus:border-red-500"
                        : "border-gray-200 focus:border-emerald-600"
                    )}
                  />
                </div>
              </Field>

              <Field
                label="Compare At Price"
                hint="Original price"
                error={errors.compareAtPrice?.message as any}
              >
                <input
                  {...register("compareAtPrice")}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
                {discountPercent > 0 && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-xs font-semibold text-emerald-700"
                  >
                    🎉 {discountPercent}% off
                  </motion.p>
                )}
              </Field>

              <Field
                label="Cost Price"
                hint="Internal only"
                error={errors.costPrice?.message as any}
              >
                <input
                  {...register("costPrice")}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Optional"
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
              </Field>
            </div>
          </section>

          {/* Stock */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <SectionHeader title="Stock & SKU" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Stock" error={errors.stock?.message as any}>
                <input
                  {...register("stock")}
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={isLoading || !trackStock}
                  className={cn(
                    inputBase,
                    "border-gray-200 focus:border-emerald-600 disabled:opacity-50"
                  )}
                />
              </Field>

              <Field label="SKU" hint="Optional">
                <input
                  {...register("sku")}
                  placeholder="e.g. WEB-001"
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
              </Field>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Track Stock
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Hide stock when off
                    </p>
                  </div>
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
          </section>

          {/* Images — file upload */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <SectionHeader title="Product Images" />

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
                "mb-3 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors",
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

            {imageFields.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                <AnimatePresence>
                  {imageFields.map((field, idx) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={field.value}
                        alt={`Image ${idx + 1}`}
                        className="h-full w-full object-cover"
                      />
                      {idx === 0 && (
                        <span className="absolute left-2 top-2 rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                          Primary
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                <p className="text-xs text-gray-500">
                  No images yet. Upload above.
                </p>
              </div>
            )}
          </section>

          {/* Tags */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <SectionHeader title="Tags" />

            <div className="mb-3 flex gap-2">
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
                placeholder="e.g. new, sale, trending"
                disabled={isLoading}
                className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim() || isLoading}
                className="flex flex-shrink-0 items-center gap-1 rounded-xl bg-[#0b2b26] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33] disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Add
              </button>
            </div>

            {tagFields.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {tagFields.map((field, idx) => (
                    <motion.span
                      key={field.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100"
                    >
                      <Tag className="h-3 w-3" />
                      {field.value}
                      <button
                        type="button"
                        onClick={() => removeTag(idx)}
                        className="rounded-full p-0.5 text-emerald-600 hover:bg-emerald-100"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <p className="text-xs text-gray-500">No tags yet.</p>
            )}
          </section>

          {/* Display */}
          <section className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <SectionHeader title="Display Settings" />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="Display Order" hint="lower = first">
                <input
                  {...register("displayOrder")}
                  type="number"
                  min="0"
                  placeholder="0"
                  disabled={isLoading}
                  className={cn(inputBase, "border-gray-200 focus:border-emerald-600")}
                />
              </Field>

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Star className="h-3.5 w-3.5 text-amber-500" />
                      Featured
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Showcase on homepage
                    </p>
                  </div>
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

              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                      <Check className="h-3.5 w-3.5 text-emerald-600" />
                      Active
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500">
                      Visible in storefront
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
              href="/admin/store/products"
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
                  Create Product
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="h-4 w-1 rounded-full bg-emerald-500" />
      <h2 className="text-sm font-bold uppercase tracking-wider text-gray-700">
        {title}
      </h2>
    </div>
  );
}