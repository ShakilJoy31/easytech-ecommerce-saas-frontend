"use client";

import { useState, useRef, MouseEvent } from "react";
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
  Zap,
  ZoomIn,
  X,
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

  // 🔍 Zoom state
  const [showZoom, setShowZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

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

  // 💰 Live total based on quantity
  const unitPrice = Number(product.price);
  const lineTotal = unitPrice * quantity;
  const lineTotalCompare =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Number(product.compareAtPrice) * quantity
      : null;
  const lineSavings = lineTotalCompare ? lineTotalCompare - lineTotal : 0;

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

  const buildCartItem = () => ({
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
  });

  const handleAddToCart = () => {
    if (outOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    addItem(buildCartItem(), quantity);

    toast.success(`${quantity} item${quantity > 1 ? "s" : ""} added to cart`);
  };

  const handleOrderNow = () => {
    if (outOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    addItem(buildCartItem(), quantity);
    window.location.href = "/checkout";
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

  /* =========================================================
     Zoom handlers
  ========================================================= */
  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
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
            {/* Main image with hover zoom */}
            <motion.div
              ref={imageContainerRef}
              key={activeImage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              onMouseEnter={() => setShowZoom(true)}
              onMouseLeave={() => setShowZoom(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square overflow-hidden rounded-3xl border border-gray-200 bg-white cursor-zoom-in"
            >
              {images[activeImage] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={images[activeImage]}
                  alt={product.title}
                  className="h-full w-full object-cover transition-transform duration-200"
                  style={
                    showZoom
                      ? {
                          transform: "scale(2)",
                          transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                        }
                      : undefined
                  }
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

              {/* Zoom hint */}
              {images[activeImage] && !showZoom && (
                <span className="pointer-events-none absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
                  <ZoomIn className="h-3 w-3" />
                  Hover to zoom
                </span>
              )}

              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage(
                        (activeImage - 1 + images.length) % images.length
                      );
                    }}
                    className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow-md backdrop-blur transition-all hover:bg-white hover:scale-105"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((activeImage + 1) % images.length);
                    }}
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

              {/* Quantity selector */}
              <div className="mt-5">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-gray-500">
                  Quantity
                </label>
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
              </div>

              {/* 💰 Live total price — updates with quantity */}
              <div className="mt-5 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100/50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    Total Price
                  </span>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-800">
                      {sym}
                      {lineTotal.toLocaleString("en-US")}
                    </p>
                    {lineTotalCompare && (
                      <div className="mt-0.5 flex items-center justify-end gap-2">
                        <span className="text-xs text-gray-500 line-through">
                          {sym}
                          {lineTotalCompare.toLocaleString("en-US")}
                        </span>
                        <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white">
                          Save {sym}
                          {lineSavings.toLocaleString("en-US")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all",
                    outOfStock
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "border-2 border-[#0b2b26] bg-white text-[#0b2b26] hover:bg-[#0b2b26] hover:text-white"
                  )}
                >
                  <ShoppingCart className="h-4 w-4" />
                  {outOfStock ? "Out of Stock" : "Add to Cart"}
                </button>

                <button
                  onClick={handleOrderNow}
                  disabled={outOfStock}
                  className={cn(
                    "flex flex-1 items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-semibold transition-all",
                    outOfStock
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-[#0b2b26] text-white shadow-lg shadow-emerald-900/20 hover:bg-[#0f3a33] hover:shadow-xl"
                  )}
                >
                  <Zap className="h-4 w-4" />
                  Order Now
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
                  <p className="text-xs font-medium text-gray-500">Sold by</p>
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
          {/* Description — rendered as rich HTML */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-gray-200 bg-white p-6">
              <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-gray-900">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                Product Description
              </h2>
              {product.description ? (
                <div
                  className="product-description text-sm leading-relaxed text-gray-700"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
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
                  valueClass={outOfStock ? "text-red-600" : "text-emerald-700"}
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

      {/* =========================================================
         Global CSS for the product description rich HTML
      ========================================================= */}
      <style jsx global>{`
        .product-description {
          word-wrap: break-word;
          overflow-wrap: break-word;
        }
        .product-description h1 {
          font-size: 1.75rem;
          font-weight: 700;
          line-height: 1.2;
          margin: 1rem 0 0.75rem;
          color: #0f172a;
        }
        .product-description h2 {
          font-size: 1.4rem;
          font-weight: 700;
          line-height: 1.3;
          margin: 1rem 0 0.6rem;
          color: #1e293b;
        }
        .product-description h3 {
          font-size: 1.15rem;
          font-weight: 600;
          line-height: 1.4;
          margin: 1rem 0 0.5rem;
          color: #334155;
        }
        .product-description h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0.75rem 0 0.5rem;
          color: #475569;
        }
        .product-description p {
          margin: 0.6rem 0;
          line-height: 1.7;
        }
        .product-description a {
          color: #059669;
          text-decoration: underline;
        }
        .product-description a:hover {
          color: #047857;
        }
        .product-description ul,
        .product-description ol {
          margin: 0.75rem 0;
          padding-left: 1.5rem;
        }
        .product-description ul {
          list-style: disc;
        }
        .product-description ol {
          list-style: decimal;
        }
        .product-description li {
          margin: 0.25rem 0;
          line-height: 1.7;
        }
        .product-description blockquote {
          border-left: 4px solid #10b981;
          background: #f0fdf4;
          padding: 0.75rem 1rem;
          margin: 1rem 0;
          font-style: italic;
          color: #065f46;
          border-radius: 0.5rem;
        }
        .product-description img {
          max-width: 100%;
          height: auto;
          border-radius: 0.75rem;
          margin: 1rem 0;
          display: block;
        }
        .product-description table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
          font-size: 0.875rem;
        }
        .product-description th,
        .product-description td {
          border: 1px solid #e2e8f0;
          padding: 0.5rem 0.75rem;
          text-align: left;
        }
        .product-description th {
          background: #f8fafc;
          font-weight: 600;
        }
        .product-description code {
          background: #f1f5f9;
          padding: 0.125rem 0.35rem;
          border-radius: 0.25rem;
          font-size: 0.85em;
          font-family: ui-monospace, SFMono-Regular, monospace;
          color: #be185d;
        }
        .product-description pre {
          background: #0f172a;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
          font-size: 0.85em;
        }
        .product-description pre code {
          background: transparent;
          color: inherit;
          padding: 0;
        }
        .product-description hr {
          border: 0;
          border-top: 1px solid #e2e8f0;
          margin: 1.25rem 0;
        }
        .product-description strong {
          font-weight: 700;
          color: #0f172a;
        }
        .product-description em {
          font-style: italic;
        }
        .product-description iframe {
          max-width: 100%;
          border-radius: 0.5rem;
          margin: 1rem 0;
        }
        /* Remove empty paragraph spacing from editors */
        .product-description > p:empty,
        .product-description > p > br:only-child {
          display: none;
        }
      `}</style>
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