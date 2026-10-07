"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Package as PackageIcon,
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
  Star,
  X,
  Copy,
  Info,
  Tag,
  Image as ImageIcon,
  TrendingUp,
  Zap,
  FolderTree,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Product,
  useGetAllProductsQuery,
  useDeleteProductMutation,
  useToggleProductStatusMutation,
  useToggleProductFeaturedMutation,
  useUpdateProductMutation,
} from "@/redux/api/saas/productApi";
import { useGetCategoryOptionsQuery } from "@/redux/api/saas/categoryApi";
import EditProductModal from "./EditProductModal";

/* ============ Helpers ============ */
const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : c === "INR" ? "₹" : c;

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
function ViewProductModal({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}) {
  if (!product) return null;

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  const sym = currencySymbol(product.currency);
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : 0;

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
            className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  {product.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {product.title}
                    </h2>
                    {product.isFeatured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                        <Star className="h-3 w-3 fill-amber-600 text-amber-600" />
                        Featured
                      </span>
                    )}
                    {product.isActive ? (
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
                    {product.productCode} · /{product.slug}
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
              {/* Pricing + stock stats */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Price
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {sym}
                    {Number(product.price).toLocaleString("en-US")}
                  </p>
                  {discount > 0 && product.compareAtPrice && (
                    <p className="text-xs text-gray-500">
                      <span className="line-through">
                        {sym}
                        {Number(product.compareAtPrice).toLocaleString("en-US")}
                      </span>{" "}
                      <span className="font-semibold text-emerald-600">
                        -{discount}%
                      </span>
                    </p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Stock
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-bold",
                      product.trackStock && product.stock === 0
                        ? "text-red-600"
                        : "text-gray-900"
                    )}
                  >
                    {product.trackStock ? product.stock : "∞"}
                  </p>
                  {!product.trackStock && (
                    <p className="text-xs text-gray-500">Not tracked</p>
                  )}
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Sold
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {product.totalSold}
                  </p>
                  <p className="text-xs text-gray-500">
                    {product.totalViews} views
                  </p>
                </div>
              </div>

              {/* Category */}
              {product.category && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Category
                  </h3>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <FolderTree className="h-4 w-4 text-emerald-700" />
                    <p className="text-sm font-bold text-gray-900">
                      {product.category.title}
                    </p>
                    <span className="font-mono text-xs text-gray-500">
                      /{product.category.slug}
                    </span>
                  </div>
                </div>
              )}

              {/* Images */}
              {product.images.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Images ({product.images.length})
                  </h3>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                    {product.images.map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={img}
                          alt={`${product.title} ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Description
                  </h3>
                  <p className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {product.tags.length > 0 && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
                      >
                        <Tag className="h-3 w-3" />
                        {t}
                      </span>
                    ))}
                  </div>
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
                    <InfoRow
                      label="Product Code"
                      value={product.productCode}
                      mono
                      copy
                      onCopy={handleCopy}
                    />
                    <InfoRow
                      label="Slug"
                      value={`/${product.slug}`}
                      mono
                      copy
                      onCopy={handleCopy}
                    />
                    {product.sku && <InfoRow label="SKU" value={product.sku} mono />}
                    {product.costPrice !== null && (
                      <InfoRow
                        label="Cost Price"
                        value={`${sym}${Number(product.costPrice).toLocaleString("en-US")}`}
                      />
                    )}
                    <InfoRow label="Display Order" value={String(product.displayOrder)} />
                    <InfoRow
                      label="Created"
                      value={
                        product.createdAt
                          ? new Date(product.createdAt).toLocaleString("en-GB", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })
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

function InfoRow({
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

/* ============ Skeleton ============ */
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
export default function ProductList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");

  const [viewTarget, setViewTarget] = useState<Product | null>(null);
  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Product | null>(null);
  const [featureTarget, setFeatureTarget] = useState<Product | null>(null);

  const { data, isLoading, isFetching } = useGetAllProductsQuery({
    page,
    limit,
    search,
    isActive: statusFilter,
    categoryId: categoryFilter,
  });

  const { data: categoriesData } = useGetCategoryOptionsQuery();
  const categories = categoriesData?.data || [];

  const [deleteProduct, { isLoading: isDeleting }] = useDeleteProductMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleProductStatusMutation();
  const [toggleFeatured, { isLoading: isFeaturing }] =
    useToggleProductFeaturedMutation();

  const products: Product[] = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProduct(deleteTarget.id).unwrap();
      toast.success("Product deleted");
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
        `Product ${!toggleTarget.isActive ? "activated" : "deactivated"}`
      );
      setToggleTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handleFeature = async () => {
    if (!featureTarget) return;
    try {
      await toggleFeatured(featureTarget.id).unwrap();
      toast.success(
        `Product ${!featureTarget.isFeatured ? "featured" : "unfeatured"}`
      );
      setFeatureTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const pageStats = {
    total: pagination?.totalItems || 0,
    active: products.filter((p) => p.isActive).length,
    featured: products.filter((p) => p.isFeatured).length,
    outOfStock: products.filter((p) => p.trackStock && p.stock === 0).length,
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <PackageIcon className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Products
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manage your store's catalog.
              </p>
            </div>
          </div>

          <Link
            href="/admin/store/add-new-product"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f3a33]"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={PackageIcon}
            label="Total Products"
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
            icon={Star}
            label="Featured (page)"
            value={pageStats.featured}
            accent="#f59e0b"
          />
          <StatCard
            icon={Zap}
            label="Out of Stock (page)"
            value={pageStats.outOfStock}
            accent="#ef4444"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by title, SKU, code..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-24 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0b2b26] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f3a33]"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              {categories.length > 0 && (
                <select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-emerald-600 focus:outline-none"
                >
                  <option value="">All Categories</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              )}

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
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Product
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Category
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Price
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Stock
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
                ) : products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <PackageIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No products yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Add your first product to start selling.
                        </p>
                        <Link
                          href="/admin/store/add-new-product"
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
                        >
                          <Plus className="h-4 w-4" />
                          Add Product
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {products.map((product, idx) => {
                      const sym = currencySymbol(product.currency);
                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                        >
                          {/* Product */}
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                                {product.thumbnail ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={product.thumbnail}
                                    alt={product.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  product.title.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="truncate font-semibold text-gray-900">
                                    {product.title}
                                  </p>
                                  {product.isFeatured && (
                                    <Star className="h-3.5 w-3.5 flex-shrink-0 fill-amber-500 text-amber-500" />
                                  )}
                                </div>
                                <p className="truncate font-mono text-[11px] text-gray-500">
                                  {product.productCode}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="px-4 py-4">
                            {product.category ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                                <FolderTree className="h-3 w-3" />
                                {product.category.title}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>

                          {/* Price */}
                          <td className="px-4 py-4">
                            <p className="font-bold text-gray-900">
                              {sym}
                              {Number(product.price).toLocaleString("en-US")}
                            </p>
                            {product.compareAtPrice &&
                              product.compareAtPrice > product.price && (
                                <p className="text-xs text-gray-500 line-through">
                                  {sym}
                                  {Number(product.compareAtPrice).toLocaleString(
                                    "en-US"
                                  )}
                                </p>
                              )}
                          </td>

                          {/* Stock */}
                          <td className="px-4 py-4">
                            {product.trackStock ? (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
                                  product.stock === 0
                                    ? "bg-red-50 text-red-700"
                                    : product.stock < 10
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-emerald-50 text-emerald-700"
                                )}
                              >
                                {product.stock}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-400">∞</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="px-4 py-4">
                            <button
                              onClick={() => setToggleTarget(product)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                                product.isActive
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                              )}
                            >
                              <span
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full",
                                  product.isActive
                                    ? "bg-emerald-500"
                                    : "bg-gray-400"
                                )}
                              />
                              {product.isActive ? "Active" : "Inactive"}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setViewTarget(product)}
                                title="View"
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setFeatureTarget(product)}
                                title={
                                  product.isFeatured ? "Unfeature" : "Feature"
                                }
                                className={cn(
                                  "rounded-lg p-2 transition-colors",
                                  product.isFeatured
                                    ? "text-amber-500 hover:bg-amber-50"
                                    : "text-gray-500 hover:bg-amber-50 hover:text-amber-600"
                                )}
                              >
                                <Star
                                  className={cn(
                                    "h-4 w-4",
                                    product.isFeatured && "fill-amber-500"
                                  )}
                                />
                              </button>
                              <button
                                onClick={() => setToggleTarget(product)}
                                title={product.isActive ? "Deactivate" : "Activate"}
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                              >
                                {product.isActive ? (
                                  <EyeOff className="h-4 w-4" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </button>
                              <button
                                onClick={() => setEditTarget(product)}
                                title="Edit"
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setDeleteTarget(product)}
                                title="Delete"
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })}
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
      <ViewProductModal
        open={!!viewTarget}
        product={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <EditProductModal
        open={!!editTarget}
        product={editTarget}
        categories={categories}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete product?"
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
          toggleTarget?.isActive ? "Deactivate product?" : "Activate product?"
        }
        description={
          toggleTarget?.isActive
            ? `"${toggleTarget?.title}" will be hidden from the storefront.`
            : `"${toggleTarget?.title}" will become visible to shoppers.`
        }
        confirmText={toggleTarget?.isActive ? "Deactivate" : "Activate"}
        variant="primary"
        isLoading={isToggling}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!featureTarget}
        title={
          featureTarget?.isFeatured
            ? "Remove from featured?"
            : "Mark as featured?"
        }
        description={
          featureTarget?.isFeatured
            ? `"${featureTarget?.title}" will no longer be featured.`
            : `"${featureTarget?.title}" will be highlighted on your homepage.`
        }
        confirmText={featureTarget?.isFeatured ? "Unfeature" : "Feature"}
        variant="primary"
        isLoading={isFeaturing}
        onConfirm={handleFeature}
        onCancel={() => setFeatureTarget(null)}
      />
    </div>
  );
}