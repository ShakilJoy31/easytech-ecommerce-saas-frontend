"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
  Store as StoreIcon,
  Package as PackageIcon,
  Star,
  Tag,
  Truck,
  ShieldCheck,
  RotateCcw,
  Minus,
  Plus,
  Heart,
  Share2,
  AlertCircle,
  Loader2,
  Check,
  MapPin,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useGetPublicProductByIdQuery } from "@/redux/api/saas/productApi";

import { currencySymbol } from "./ProductCard";
import { useCartStore } from "@/utils/helper/cartStore";

export default function ProductDetailPage({ id }: { id: string }) {
  const { data, isLoading, isError } = useGetPublicProductByIdQuery(id);
  const product = data?.data;

  const addItem = useCartStore((s) => s.addItem);

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  /* =========================================================
     Loading
  ========================================================= */
  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  /* =========================================================
     Not found
  ========================================================= */
  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center bg-gray-50 p-6">
        <PackageIcon className="mb-4 h-12 w-12 text-gray-300" />
        <h1 className="text-xl font-bold text-gray-900">Product not found</h1>
        <p className="mt-1 text-sm text-gray-500">
          This product may have been removed or is currently unavailable.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    );
  }

  const sym = currencySymbol(product.currency || "BDT");
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : 0;

  const images: string[] =
    product.images && product.images.length > 0
      ? product.images
      : product.thumbnail
      ? [product.thumbnail]
      : [];

  const outOfStock = product.trackStock && product.stock === 0;
  const maxQty = product.trackStock ? product.stock : 999;

  /* =========================================================
     Handlers
  ========================================================= */
  const handleQuantityChange = (delta: number) => {
    const next = quantity + delta;
    if (next < 1) return;
    if (next > maxQty) {
      toast.error(`Only ${maxQty} in stock`);
      return;
    }
    setQuantity(next);
  };

  const handleAddToCart = () => {
    if (outOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    addItem(
      {
        productId: product.id,
        title: product.title,
        slug: product.slug,
        price: product.price,
        currency: product.currency || "BDT",
        thumbnail: product.thumbnail || images[0] || null,
        storeId: product.storeId,
        storeName: product.store?.name || "",
        storeSlug: product.store?.slug || "",
        maxStock: product.trackStock ? product.stock : null,
      },
      quantity
    );

    toast.success(`${quantity} item${quantity > 1 ? "s" : ""} added to cart`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.title,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto max-w-7xl px-4 py-6 md:py-8">
        {/* Breadcrumb */}
        <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs font-medium text-gray-500">
          <Link href="/" className="hover:text-emerald-700">
            Home
          </Link>
          {product.store && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/store/${product.store.slug}`}
                className="hover:text-emerald-700"
              >
                {product.store.name}
              </Link>
            </>
          )}
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/category/${product.category.slug}`}
                className="hover:text-emerald-700"
              >
                {product.category.title}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-gray-900">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* =========================================================
             Left — Image gallery
          ========================================================= */}
          <div className="space-y-4">
            {/* Main image */}
            <motion.div
              key={activeImage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="relative aspect-square overflow-hidden rounded-3xl border border-gray-200 bg-white"
            >
              {images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <PackageIcon className="h-16 w-16 text-gray-200" />
                </div>
              )}

              {discount > 0 && (
                <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  -{discount}% off
                </span>
              )}

              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setActiveImage(
                        (activeImage - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur transition-all hover:bg-white hover:scale-105"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() =>
                      setActiveImage((activeImage + 1) % images.length)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur transition-all hover:bg-white hover:scale-105"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Action buttons top-right */}
              <div className="absolute right-4 top-4 flex flex-col gap-2">
                <button
                  onClick={handleShare}
                  className="rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur transition-all hover:bg-white hover:text-emerald-700"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button className="rounded-full bg-white/90 p-2 text-gray-600 shadow-md backdrop-blur transition-all hover:bg-white hover:text-red-500">
                  <Heart className="h-4 w-4" />
                </button>
              </div>
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all",
                      activeImage === idx
                        ? "border-emerald-600 ring-4 ring-emerald-500/15"
                        : "border-gray-200 hover:border-emerald-300"
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={`${product.title} ${idx + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* =========================================================
             Right — Product info
          ========================================================= */}
          <div className="space-y-6">
            {/* Store */}
            {product.store && (
              <Link
                href={`/store/${product.store.slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
              >
                <StoreIcon className="h-3.5 w-3.5" />
                {product.store.name}
              </Link>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl font-bold leading-tight text-gray-900 sm:text-3xl md:text-4xl">
                {product.title}
              </h1>

              {product.shortDescription && (
                <p className="mt-3 text-sm text-gray-600 sm:text-base">
                  {product.shortDescription}
                </p>
              )}
            </div>

            {/* Rating row (static placeholder) */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={cn(
                      "h-4 w-4",
                      s <= 4
                        ? "fill-amber-400 text-amber-400"
                        : "fill-gray-200 text-gray-200"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs font-medium text-gray-500">
                4.0 · {product.totalSold} sold
              </span>
            </div>

            {/* Price block */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-wrap items-baseline gap-3">
                <p className="text-3xl font-bold text-gray-900">
                  {sym}
                  {Number(product.price).toLocaleString("en-US")}
                </p>
                {product.compareAtPrice && product.compareAtPrice > product.price && (
                  <>
                    <p className="text-lg text-gray-400 line-through">
                      {sym}
                      {Number(product.compareAtPrice).toLocaleString("en-US")}
                    </p>
                    <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-bold text-red-600">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="mt-3 flex items-center gap-2 text-sm">
                {outOfStock ? (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-red-600">
                    <AlertCircle className="h-4 w-4" />
                    Out of Stock
                  </span>
                ) : product.trackStock ? (
                  <>
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                      <Check className="h-4 w-4" />
                      In Stock
                    </span>
                    {product.stock <= 10 && (
                      <span className="text-xs font-medium text-amber-600">
                        Only {product.stock} left!
                      </span>
                    )}
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                    <Check className="h-4 w-4" />
                    Available
                  </span>
                )}
              </div>

              {/* Quantity + Add to cart */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                {/* Quantity */}
                <div className="inline-flex items-center rounded-xl border border-gray-200 bg-gray-50">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1 || outOfStock}
                    className="p-3 text-gray-600 transition-colors hover:text-emerald-700 disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[3rem] text-center text-base font-bold text-gray-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={outOfStock || quantity >= maxQty}
                    className="p-3 text-gray-600 transition-colors hover:text-emerald-700 disabled:opacity-40"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                {/* Add to cart */}
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all",
                    outOfStock
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-[#0b2b26] text-white shadow-lg shadow-emerald-900/20 hover:bg-[#0f3a33] hover:shadow-xl"
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>
              </div>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                { icon: Truck, label: "Fast Delivery", desc: "24-48 hours" },
                { icon: ShieldCheck, label: "Secure", desc: "Buyer protection" },
                { icon: RotateCcw, label: "Easy Returns", desc: "7 days return" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3"
                  >
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-900">
                        {item.label}
                      </p>
                      <p className="text-[11px] text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Store card */}
            {product.store && (
              <Link
                href={`/store/${product.store.slug}`}
                className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-4 transition-colors hover:border-emerald-300"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  {product.store.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.store.logo}
                      alt={product.store.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <StoreIcon className="h-5 w-5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-500">
                    Sold by
                  </p>
                  <p className="truncate text-sm font-bold text-gray-900">
                    {product.store.name}
                  </p>
                  {product.store.tagline && (
                    <p className="truncate text-xs text-gray-500">
                      {product.store.tagline}
                    </p>
                  )}
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
              </Link>
            )}
          </div>
        </div>

        {/* =========================================================
           Description + Tags
        ========================================================= */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Description */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                Product Description
              </h2>
              {product.description ? (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm italic text-gray-400">
                  No description provided.
                </p>
              )}

              {/* Tags */}
              {product.tags && product.tags.length > 0 && (
                <div className="mt-6 border-t border-gray-100 pt-6">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((t: string, i: number) => (
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
            </div>
          </div>

          {/* Specs / Meta */}
          <div>
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                Specifications
              </h2>
              <div className="space-y-3 text-sm">
                <SpecRow label="Product Code" value={product.productCode} mono />
                {product.sku && <SpecRow label="SKU" value={product.sku} mono />}
                {product.category && (
                  <SpecRow label="Category" value={product.category.title} />
                )}
                <SpecRow
                  label="Availability"
                  value={outOfStock ? "Out of Stock" : "In Stock"}
                  valueClass={
                    outOfStock ? "text-red-600" : "text-emerald-700"
                  }
                />
                {product.trackStock && (
                  <SpecRow label="Stock" value={String(product.stock)} />
                )}
                <SpecRow label="Sold" value={String(product.totalSold)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({
  label,
  value,
  mono,
  valueClass,
}: {
  label: string;
  value: string;
  mono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span
        className={cn(
          "text-right font-semibold text-gray-900",
          mono && "font-mono text-xs",
          valueClass
        )}
      >
        {value}
      </span>
    </div>
  );
}