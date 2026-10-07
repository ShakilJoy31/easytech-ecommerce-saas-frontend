"use client";

import { useState, FormEvent, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store as StoreIcon,
  Search,
  MapPin,
  Package as PackageIcon,
  ChevronRight,
  ChevronLeft,
  Loader2,
  Sparkles,
  ArrowRight,
  Grid3x3,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPublicStoresQuery } from "@/redux/api/saas/storeManagementApi";

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
        <div className="relative h-36 overflow-hidden bg-gradient-to-br from-emerald-100 to-emerald-50">
          {store.banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={store.banner}
              alt={store.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <StoreIcon className="h-14 w-14 text-emerald-300" />
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

          {/* Product count badge */}
          <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-gray-900 shadow-md backdrop-blur">
            <PackageIcon className="h-3 w-3" />
            {store.productCount || 0}
          </span>
        </div>
      </Link>

      {/* Info */}
      <div className="relative p-4">
        {/* Logo overlapping banner */}
        <div className="absolute -top-9 left-4 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-white shadow-md">
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

        <div className="pt-9">
          {/* Name */}
          <Link href={`/store/${store.slug}`}>
            <h3 className="truncate text-base font-bold text-gray-900 transition-colors group-hover:text-emerald-700">
              {store.name}
            </h3>
          </Link>

          {/* Tagline */}
          {store.tagline && (
            <p className="mt-0.5 line-clamp-2 min-h-[2.5rem] text-xs text-gray-500">
              {store.tagline}
            </p>
          )}

          {/* Meta */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-3 text-[11px] text-gray-500">
              {store.district && (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {store.district}
                </span>
              )}
            </div>

            <Link
              href={`/store/${store.slug}`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 transition-colors hover:text-emerald-800"
            >
              Visit Store
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* =========================================================================
   Store Card Skeleton
========================================================================= */
function StoreCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="h-36 animate-pulse bg-gray-100" />
      <div className="relative p-4 pt-9">
        <div className="absolute -top-9 left-4 h-16 w-16 animate-pulse rounded-2xl border-4 border-white bg-gray-200" />
        <div className="space-y-2">
          <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN
========================================================================= */
export default function StoresListPage() {
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  const { data, isLoading, isFetching } = useGetPublicStoresQuery({
    page,
    limit,
    search,
    district: districtFilter,
  });

  const stores = data?.data || [];
  const pagination = data?.pagination;

  /* ---------- Extract unique districts from current page for filter ---------- */
  const districts = useMemo(() => {
    const set = new Set<string>();
    stores.forEach((s: any) => {
      if (s.district) set.add(s.district);
    });
    return Array.from(set).sort();
  }, [stores]);

  /* ---------- Handlers ---------- */
  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch("");
    setSearchInput("");
    setDistrictFilter("");
    setPage(1);
  };

  const hasActiveFilters = search || districtFilter;
  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ===================================================================
          HERO
      =================================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-2xl"
          >
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur">
              <Sparkles className="h-3 w-3 text-emerald-300" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-100">
                {pagination?.totalItems || 0} Stores Available
              </span>
            </div>
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl md:text-5xl">
              Browse All Stores
            </h1>
            <p className="mt-3 text-sm text-emerald-100/80 sm:text-base">
              Discover trusted sellers on the platform. Click any store to
              explore their products.
            </p>
          </motion.div>
        </div>

        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* ===================================================================
            FILTERS
        =================================================================== */}
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="relative w-full lg:max-w-md"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search stores by name..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-24 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0b2b26] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f3a33]"
              >
                Search
              </button>
            </form>

            {/* District + clear */}
            <div className="flex flex-wrap items-center gap-2">
              {districts.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1">
                  <MapPin className="h-3.5 w-3.5 text-gray-400" />
                  <select
                    value={districtFilter}
                    onChange={(e) => {
                      setDistrictFilter(e.target.value);
                      setPage(1);
                    }}
                    className="border-0 bg-transparent py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                  >
                    <option value="">All Districts</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                >
                  <X className="h-3.5 w-3.5" />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Results count */}
          {pagination && (
            <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
              <Grid3x3 className="h-3.5 w-3.5" />
              Showing{" "}
              <span className="font-semibold text-gray-900">
                {stores.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900">
                {pagination.totalItems}
              </span>{" "}
              store{pagination.totalItems !== 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* ===================================================================
            STORES GRID
        =================================================================== */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <StoreCardSkeleton key={i} />
            ))}
          </div>
        ) : stores.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <StoreIcon className="mx-auto mb-3 h-12 w-12 text-gray-300" />
            <h3 className="text-base font-semibold text-gray-900">
              No stores found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {hasActiveFilters
                ? "Try adjusting your search or filters."
                : "There are no active stores yet."}
            </p>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <AnimatePresence mode="popLayout">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stores.map((store: any, idx: number) => (
                  <motion.div
                    key={store.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <StoreCard store={store} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <span className="px-3 text-sm font-semibold text-gray-700">
                  {page} / {totalPages}
                </span>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* ===================================================================
            CTA — Become a seller
        =================================================================== */}
        <div className="mt-12 overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-emerald-900 p-8 sm:p-12">
          <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Want to sell on StoreForge?
              </h2>
              <p className="mt-2 text-sm text-emerald-100/80 sm:text-base">
                Launch your own online store in minutes. No coding, no
                headaches — just pick a package and start selling.
              </p>
            </div>
            <Link
              href="/store/register"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-800 transition-all hover:bg-emerald-50 hover:shadow-lg"
            >
              Start Selling
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}