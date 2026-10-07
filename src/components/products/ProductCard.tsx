"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ShoppingCart,
  Star,
  Package as PackageIcon,
  Store as StoreIcon,
  Heart,
  Zap,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCartStore } from "@/utils/helper/cartStore";

export const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : c === "INR" ? "₹" : c;

export interface ProductCardProps {
  product: any;
  showStore?: boolean;
}

export default function ProductCard({
  product,
  showStore = true,
}: ProductCardProps) {
  const sym = currencySymbol(product.currency || "BDT");
  const addItem = useCartStore((s) => s.addItem);
  const inCart = useCartStore((s) =>
    s.items.some((i) => i.productId === product.id)
  );

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) *
            100
        )
      : 0;

  const outOfStock = product.trackStock && product.stock === 0;

  const buildCartItem = () => ({
    productId: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    currency: product.currency || "BDT",
    thumbnail: product.thumbnail || product.images?.[0] || null,
    storeId: product.storeId,
    storeName: product.store?.name || "",
    storeSlug: product.store?.slug || "",
    maxStock: product.trackStock ? product.stock : null,
  });

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      toast.error("Product is out of stock");
      return;
    }
    if (inCart) {
      toast("Already in cart");
      return;
    }

    addItem(buildCartItem(), 1);
    toast.success("Added to cart");
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (outOfStock) {
      toast.error("Product is out of stock");
      return;
    }

    // Add only if not already present
    if (!inCart) addItem(buildCartItem(), 1);
    window.location.href = "/checkout";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-xl hover:shadow-gray-200/70"
    >
      {/* Image */}
      <Link
        href={`/product/${product.id}`}
        className="relative block aspect-square overflow-hidden bg-gray-100"
      >
        {product.thumbnail || product.images?.[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.thumbnail || product.images[0]}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PackageIcon className="h-10 w-10 text-gray-300" />
          </div>
        )}

        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            -{discount}%
          </span>
        )}

        {product.isFeatured && !discount && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            <Star className="h-3 w-3 fill-white" />
            Featured
          </span>
        )}

        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm">
            <span className="rounded-full bg-red-500 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
              Out of Stock
            </span>
          </div>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-gray-400 opacity-0 backdrop-blur transition-all hover:bg-white hover:text-red-500 group-hover:opacity-100"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {showStore && product.store && (
          <Link
            href={`/store/${product.store.slug}`}
            className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors hover:text-emerald-700"
          >
            <StoreIcon className="h-3 w-3" />
            {product.store.name}
          </Link>
        )}

        <Link href={`/product/${product.id}`} className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-emerald-700">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-base font-bold text-gray-900">
            {sym}
            {Number(product.price).toLocaleString("en-US")}
          </p>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <p className="text-xs font-medium text-gray-400 line-through">
              {sym}
              {Number(product.compareAtPrice).toLocaleString("en-US")}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={outOfStock || inCart}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              outOfStock
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : inCart
                ? "cursor-not-allowed border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-[#0b2b26] bg-white text-[#0b2b26] hover:bg-[#0b2b26] hover:text-white"
            )}
          >
            {inCart ? (
              <>
                <Check className="h-3.5 w-3.5" />
                In Cart
              </>
            ) : (
              <>
                <ShoppingCart className="h-3.5 w-3.5" />
                {outOfStock ? "Out of Stock" : "Add to Cart"}
              </>
            )}
          </button>

          <button
            onClick={handleOrderNow}
            disabled={outOfStock}
            className={cn(
              "inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
              outOfStock
                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                : "bg-[#0b2b26] text-white hover:bg-[#0f3a33]"
            )}
          >
            <Zap className="h-3.5 w-3.5" />
            Order Now
          </button>
        </div>
      </div>
    </motion.div>
  );
}