"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    ShoppingBag,
    ChevronLeft,
    ChevronRight,
    Package,
    Grid3x3,
    SlidersHorizontal,
    X,
    Tag,
    ArrowLeft,
} from "lucide-react";
import {
    useGetPublicProductsQuery,
    Product,
} from "@/redux/api/saas/productApi";
import ProductCard from "@/components/products/ProductCard";

interface CategoryOption {
    id: number;
    title: string;
    slug: string;
}

/* =========================================================================
   Skeleton
========================================================================= */
function ProductCardSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="aspect-square animate-pulse bg-gray-100" />
            <div className="space-y-2 p-4">
                <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-1/2 animate-pulse rounded bg-gray-100" />
            </div>
        </div>
    );
}

/* =========================================================================
   MAIN
========================================================================= */
interface StoreDetailPageProps {
    slug: string;
}

export default function StoreDetailPage({ slug }: StoreDetailPageProps) {
    const [page, setPage] = useState(1);
    const [limit] = useState(12);
    const [search, setSearch] = useState("");
    const [searchInput, setSearchInput] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [sortBy, setSortBy] = useState("createdAt");
    const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

    // ✅ KEY: Pass `storeSlug` to filter products by this store
    const { data, isLoading, isFetching } = useGetPublicProductsQuery({
        page,
        limit,
        search,
        categorySlug: categoryFilter,
        storeSlug: slug, // 👈 THIS is what filters products by the store
        sortBy,
        sortOrder,
    });

    const products = data?.data || [];
    const pagination = data?.pagination;
    const storeInfo = data?.store; // if your API returns store info

    const categories: CategoryOption[] = Array.from(
        new Map<string, CategoryOption>(
            products
                .filter((p: Product) => p.category)
                .map((p: Product) => [
                    p.category!.slug,
                    {
                        id: p.category!.id,
                        title: p.category!.title,
                        slug: p.category!.slug,
                    },
                ])
        ).values()
    );

    const handleSearch = (e: FormEvent) => {
        e.preventDefault();
        setSearch(searchInput.trim());
        setPage(1);
    };

    const handleClearFilters = () => {
        setSearch("");
        setSearchInput("");
        setCategoryFilter("");
        setPage(1);
    };

    const hasActiveFilters = search || categoryFilter;
    const totalPages = pagination?.totalPages || 1;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ===============================================================
                HERO / STORE HEADER
            =============================================================== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 py-10 sm:py-14">
                <div className="container mx-auto max-w-7xl px-4">
                    {/* Back link */}
                    <Link
                        href="/stores"
                        className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-100/80 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to all stores
                    </Link>

                    <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-4"
                    >
                        {/* Store logo */}
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/20 bg-white shadow-lg sm:h-20 sm:w-20">
                            {storeInfo?.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={storeInfo.logo}
                                    alt={storeInfo.name || slug}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white">
                                    {(storeInfo?.name || slug).charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>

                        <div className="min-w-0 flex-1">
                            <h1 className="truncate text-2xl font-bold text-white sm:text-3xl">
                                {storeInfo?.name || slug}
                            </h1>
                            {storeInfo?.tagline && (
                                <p className="mt-1 line-clamp-2 text-sm text-emerald-100/80">
                                    {storeInfo.tagline}
                                </p>
                            )}
                            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 backdrop-blur">
                                <Package className="h-3 w-3 text-emerald-300" />
                                <span className="text-[11px] font-semibold text-emerald-100">
                                    {pagination?.totalItems || 0} Products
                                </span>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
            </section>

            <div className="container mx-auto max-w-7xl px-4 py-8">
                {/* ===============================================================
                    FILTERS
                =============================================================== */}
                <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        {/* Search */}
                        <form onSubmit={handleSearch} className="relative w-full lg:max-w-md">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search products in this store..."
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
                            {/* Sort */}
                            <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1">
                                <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
                                <select
                                    value={`${sortBy}-${sortOrder}`}
                                    onChange={(e) => {
                                        const [sb, so] = e.target.value.split("-");
                                        setSortBy(sb);
                                        setSortOrder(so as "ASC" | "DESC");
                                        setPage(1);
                                    }}
                                    className="border-0 bg-transparent py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                                >
                                    <option value="createdAt-DESC">Newest</option>
                                    <option value="createdAt-ASC">Oldest</option>
                                    <option value="price-ASC">Price: Low to High</option>
                                    <option value="price-DESC">Price: High to Low</option>
                                    <option value="totalSold-DESC">Best Selling</option>
                                </select>
                            </div>

                            {/* Category filter */}
                            {categories.length > 0 && (
                                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1">
                                    <Tag className="h-3.5 w-3.5 text-gray-400" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => {
                                            setCategoryFilter(e.target.value);
                                            setPage(1);
                                        }}
                                        className="border-0 bg-transparent py-1 text-xs font-semibold text-gray-700 focus:outline-none"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((c) => (
                                            <option key={c.slug} value={c.slug}>
                                                {c.title}
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

                    {pagination && (
                        <div className="mt-3 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-500">
                            <Grid3x3 className="h-3.5 w-3.5" />
                            Showing{" "}
                            <span className="font-semibold text-gray-900">
                                {products.length}
                            </span>{" "}
                            of{" "}
                            <span className="font-semibold text-gray-900">
                                {pagination.totalItems}
                            </span>{" "}
                            product{pagination.totalItems !== 1 ? "s" : ""}
                        </div>
                    )}
                </div>

                {/* ===============================================================
                    PRODUCTS GRID
                =============================================================== */}
                {isLoading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: 10 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
                        <ShoppingBag className="mx-auto mb-3 h-12 w-12 text-gray-300" />
                        <h3 className="text-base font-semibold text-gray-900">
                            No products found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {hasActiveFilters
                                ? "Try adjusting your search or filters."
                                : "This store hasn't added any products yet."}
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
                            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 ">
                                {products.map((product: Product, idx: number) => (
                                    <motion.div
                                        key={product.id}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                    >
                                        <ProductCard product={product} showStore={false} />
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
            </div>
        </div>
    );
}