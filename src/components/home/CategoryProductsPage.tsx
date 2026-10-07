"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package as PackageIcon,
  Search,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Grid3x3,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGetPublicProductsQuery } from "@/redux/api/saas/productApi";
import { useGetPublicCategoriesQuery } from "@/redux/api/saas/categoryApi";
import ProductCard from "../products/ProductCard";


export default function CategoryProductsPage({ slug }: { slug: string }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  const { data, isLoading, isFetching } = useGetPublicProductsQuery({
    categorySlug: slug,
    page,
    limit: 12,
    search,
    sortBy,
    sortOrder,
  });

  const { data: categoriesData } = useGetPublicCategoriesQuery();
  const categories = categoriesData?.data || [];
  const activeCategory = categories.find((c: any) => c.slug === slug);

  const products = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Category hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 to-emerald-900 py-12 sm:py-16">
        <div className="container mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 transition-colors hover:text-white"
            >
              <ChevronLeft className="h-3 w-3" />
              Back to Home
            </Link>

            <div className="flex items-center gap-4">
              {activeCategory?.image ? (
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/10 backdrop-blur ring-2 ring-white/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeCategory.image}
                    alt={activeCategory.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-2 ring-white/20">
                  <span className="text-2xl font-bold text-white">
                    {(activeCategory?.title || slug).charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  {activeCategory?.title || "Category"}
                </h1>
                {pagination && (
                  <p className="mt-1 text-sm text-emerald-100/80">
                    {pagination.totalItems} product
                    {pagination.totalItems !== 1 ? "s" : ""} available
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/4 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Filters */}
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
          <form
            onSubmit={handleSearch}
            className="relative w-full lg:max-w-md"
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search in this category..."
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
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Sort
            </div>
            <select
              value={`${sortBy}:${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split(":");
                setSortBy(sb);
                setSortOrder(so as "ASC" | "DESC");
                setPage(1);
              }}
              className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 focus:border-emerald-600 focus:outline-none"
            >
              <option value="createdAt:DESC">Newest first</option>
              <option value="createdAt:ASC">Oldest first</option>
              <option value="price:ASC">Price: low to high</option>
              <option value="price:DESC">Price: high to low</option>
              <option value="totalSold:DESC">Best selling</option>
              <option value="title:ASC">Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Products */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="h-80 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-white py-20 text-center">
            <PackageIcon className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <h3 className="text-base font-semibold text-gray-900">
              No products in this category
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Try searching or check back later.
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
            >
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {products.map((product: any, idx: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-sm font-semibold text-gray-700">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || isFetching}
                  className="rounded-lg border border-gray-200 bg-white p-2 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
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