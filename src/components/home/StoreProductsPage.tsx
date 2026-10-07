"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  Store as StoreIcon,
  ChevronRight,
  ChevronLeft,
  Star,
  TrendingUp,
  Sparkles,
  MapPin,
  Package as PackageIcon,
  ArrowRight,
  Zap,
  Loader2,
  X,
  Heart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPublicStoresQuery } from "@/redux/api/saas/storeManagementApi";
import { useGetPublicCategoriesQuery } from "@/redux/api/saas/categoryApi";
import { useGetPublicProductsQuery } from "@/redux/api/saas/productApi";

/* =========================================================================
   Helpers
========================================================================= */
const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : c === "INR" ? "₹" : c;

/* =========================================================================
   Product Card
========================================================================= */
function ProductCard({ product }: { product: any }) {
  const sym = currencySymbol(product.currency || "BDT");
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(
          ((product.compareAtPrice - product.price) / product.compareAtPrice) * 100
        )
      : 0;

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

        {/* Discount badge */}
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            -{discount}%
          </span>
        )}

        {/* Featured badge */}
        {product.isFeatured && !discount && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-lg">
            <Star className="h-3 w-3 fill-white" />
            Featured
          </span>
        )}

        {/* Wishlist button */}
        <button
          onClick={(e) => {
            e.preventDefault();
          }}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-1.5 text-gray-400 opacity-0 backdrop-blur transition-all hover:bg-white hover:text-red-500 group-hover:opacity-100"
        >
          <Heart className="h-4 w-4" />
        </button>
      </Link>

      {/* Info */}
      <div className="flex flex-1 flex-col p-4">
        {/* Store */}
        {product.store && (
          <Link
            href={`/store/${product.store.slug}`}
            className="mb-1 inline-flex items-center gap-1 text-[11px] font-medium text-gray-500 transition-colors hover:text-emerald-700"
          >
            <StoreIcon className="h-3 w-3" />
            {product.store.name}
          </Link>
        )}

        {/* Title */}
        <Link href={`/product/${product.id}`}>
          <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-gray-900 transition-colors group-hover:text-emerald-700">
            {product.title}
          </h3>
        </Link>

        {/* Price */}
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

        {/* Stock hint */}
        {product.trackStock && product.stock === 0 && (
          <p className="mt-1 text-[11px] font-semibold text-red-500">
            Out of stock
          </p>
        )}

        {/* Add to cart */}
        <button
          disabled={product.trackStock && product.stock === 0}
          className={cn(
            "mt-3 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
            product.trackStock && product.stock === 0
              ? "cursor-not-allowed bg-gray-100 text-gray-400"
              : "bg-[#0b2b26] text-white hover:bg-[#0f3a33]"
          )}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {product.trackStock && product.stock === 0
            ? "Out of stock"
            : "Add to Cart"}
        </button>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   Product Card Skeleton
========================================================================= */
function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="aspect-square animate-pulse bg-gray-100" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
        <div className="h-4 w-2/3 animate-pulse rounded bg-gray-100" />
        <div className="h-8 w-full animate-pulse rounded-xl bg-gray-100" />
      </div>
    </div>
  );
}

/* =========================================================================
   Store Card
========================================================================= */
function StoreCard({ store }: { store: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition-shadow hover:shadow-xl hover:shadow-gray-200/70"
    >
      {/* Banner */}
      <Link href={`/store/${store.slug}`} className="block">
        <div className="relative h-32 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50">
          {store.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.banner}
              alt={store.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <StoreIcon className="h-12 w-12 text-emerald-300" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      </Link>

      {/* Info */}
      <div className="relative p-4">
        {/* Logo overlapping banner */}
        <div className="absolute -top-8 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
          {store.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.logo}
              alt={store.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
              {store.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="pt-10">
          <Link href={`/store/${store.slug}`}>
            <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
              {store.name}
            </h3>
          </Link>

          {store.tagline && (
            <p className="mt-0.5 line-clamp-1 text-xs text-gray-500">
              {store.tagline}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              {store.district && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {store.district}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <PackageIcon className="h-3 w-3" />
                {store.productCount || 0}
              </span>
            </div>

            <Link
              href={`/store/${store.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              Visit
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   Category Card
========================================================================= */
function CategoryCard({ category }: { category: any }) {
  return (
    <Link
      href={`/category/${category.slug}`}
      className="group flex flex-col items-center gap-2 rounded-2xl border border-gray-200 bg-white p-4 transition-all hover:border-emerald-300 hover:shadow-lg"
    >
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-emerald-100 to-emerald-50 ring-2 ring-emerald-100 transition-transform group-hover:scale-105">
        {category.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={category.image}
            alt={category.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-xl font-bold text-emerald-700">
            {category.title.charAt(0).toUpperCase()}
          </span>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700">
          {category.title}
        </p>
        <p className="text-[11px] text-gray-500">
          {category.productCount} product{category.productCount !== 1 ? "s" : ""}
        </p>
      </div>
    </Link>
  );
}

/* =========================================================================
   Section Header
========================================================================= */
function SectionHeader({
  title,
  subtitle,
  href,
  hrefLabel = "View All",
}: {
  title: string;
  subtitle?: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
        >
          {hrefLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* =========================================================================
   MAIN
========================================================================= */
export default function PublicHomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");

  /* ---------- Data ---------- */
  const { data: storesData, isLoading: loadingStores } = useGetPublicStoresQuery({
    limit: 8,
  });
  const { data: categoriesData, isLoading: loadingCategories } =
    useGetPublicCategoriesQuery();
  const { data: featuredData, isLoading: loadingFeatured } =
    useGetPublicProductsQuery({ isFeatured: true, limit: 8 });
  const { data: newArrivalsData, isLoading: loadingNew } =
    useGetPublicProductsQuery({ limit: 8, sortBy: "createdAt", sortOrder: "DESC" });

  const stores = storesData?.data || [];
  const categories = categoriesData?.data || [];
  const featuredProducts = featuredData?.data || [];
  const newArrivals = newArrivalsData?.data || [];

  /* ---------- Search submit ---------- */
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
    if (searchInput.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchInput.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===================================================================
          HERO — You drop your slider component right here
      =================================================================== */}
      <section className="relative">
        {/*
          ⚠️ REPLACE this placeholder with your own slider component.
          Example:
            import MySlider from "@/components/sliders/MySlider";
            <MySlider />
        */}
        <div className="relative h-[280px] w-full overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 sm:h-[360px] md:h-[420px]">
          <div className="absolute inset-0 flex items-center">
            <div className="container mx-auto max-w-7xl px-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-lg"
              >
                <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
                  <Sparkles className="h-3 w-3 text-emerald-300" />
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                    Multi-Store Marketplace
                  </span>
                </div>
                <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
                  Shop from your <span className="text-emerald-300">favorite stores</span> — all in one place.
                </h1>
                <p className="mt-3 text-sm text-emerald-100/80 sm:text-base">
                  Discover products from trusted vendors, compare prices, and
                  checkout with confidence.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
        </div>

        {/* Search bar floating over slider bottom */}
        <div className="container mx-auto max-w-3xl px-4">
          <form
            onSubmit={handleSearch}
            className="-mt-7 flex items-center gap-2 rounded-2xl border border-gray-200 bg-white p-2 shadow-xl shadow-gray-200/60 md:-mt-8"
          >
            <Search className="ml-2 h-5 w-5 flex-shrink-0 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products, stores, categories..."
              className="flex-1 border-0 bg-transparent py-2.5 text-sm outline-none placeholder:text-gray-400"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33]"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      {/* ===================================================================
          CATEGORIES
      =================================================================== */}
      <section className="container mx-auto max-w-7xl px-4 pt-12 md:pt-16">
        <SectionHeader
          title="Shop by Category"
          subtitle="Browse products across all stores"
        />

        {loadingCategories ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <Sparkles className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-500">No categories yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
            {categories.slice(0, 16).map((cat, idx) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
              >
                <CategoryCard category={cat} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ===================================================================
          BROWSE STORES
      =================================================================== */}
      <section className="container mx-auto max-w-7xl px-4 pt-12 md:pt-16">
        <SectionHeader
          title="Browse Stores"
          subtitle="Discover trusted sellers on the platform"
          href="/stores"
          hrefLabel="See all stores"
        />

        {loadingStores ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-56 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <StoreIcon className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-500">No stores yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {stores.map((store, idx) => (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <StoreCard store={store} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ===================================================================
          FEATURED PRODUCTS
      =================================================================== */}
      {(loadingFeatured || featuredProducts.length > 0) && (
        <section className="container mx-auto max-w-7xl px-4 pt-12 md:pt-16">
          <SectionHeader
            title="Featured Products"
            subtitle="Hand-picked items from across the platform"
            href="/products?featured=true"
          />

          {loadingFeatured ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {featuredProducts.map((p, idx) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ===================================================================
          NEW ARRIVALS
      =================================================================== */}
      <section className="container mx-auto max-w-7xl px-4 py-12 md:py-16">
        <SectionHeader
          title="New Arrivals"
          subtitle="The latest products added by our stores"
          href="/products"
        />

        {loadingNew ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : newArrivals.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-12 text-center">
            <PackageIcon className="mx-auto mb-2 h-6 w-6 text-gray-300" />
            <p className="text-sm text-gray-500">No products yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* ===================================================================
          TRUST / STATS BANNER
      =================================================================== */}
      <section className="border-t border-gray-200 bg-white">
        <div className="container mx-auto max-w-7xl px-4 py-12">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { icon: StoreIcon, label: "Active Stores", value: stores.length + "+" },
              { icon: PackageIcon, label: "Products", value: "1000+" },
              { icon: Zap, label: "Fast Delivery", value: "24h" },
              { icon: Star, label: "Trusted", value: "100%" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                    <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs font-medium text-gray-500">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}