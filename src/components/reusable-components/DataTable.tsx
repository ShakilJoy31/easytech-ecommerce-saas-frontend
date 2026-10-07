// @/components/reusable-components/DataTable.tsx
"use client";

import { ReactNode, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";

/* ============================================================
   TYPES
============================================================ */

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface PaginationConfig {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  getRowKey: (row: T, index: number) => string | number;
  onRowClick?: (row: T) => void;
  pagination?: PaginationConfig;
  showSerial?: boolean;
  serialOffset?: number;
  compact?: boolean;
}

/* ============================================================
   ROW STYLING
============================================================ */

const ROW_EVEN = "bg-[#111827]";
const ROW_ODD = "bg-[#172033]";
const ROW_HOVER = "group-hover:bg-[#1b2a47]";

const ACCENT_BAR =
  "bg-[linear-gradient(#3b82f6,#3b82f6)] bg-no-repeat [background-position:left_center] " +
  "[background-size:3px_0%] group-hover:[background-size:3px_100%] " +
  "[transition:background-size_300ms_cubic-bezier(0.22,1,0.36,1),background-color_300ms_ease]";

/* ============================================================
   COMPONENT
============================================================ */

export default function DataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage = "No data found",
  emptyIcon,
  getRowKey,
  onRowClick,
  pagination,
  showSerial = false,
  serialOffset = 0,
  compact = false,
}: DataTableProps<T>) {
  const cellPadding = compact ? "px-4 py-2.5" : "px-4 py-3.5";

  return (
    <div className="w-full">
      {/* ---------- Table ---------- */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-separate border-spacing-0">
          {/* Head */}
          <thead>
            <tr className="bg-gray-900/80 backdrop-blur">
              {showSerial && (
                <th
                  className={`sticky left-0 z-10 backdrop-blur text-left ${cellPadding} text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800`}
                  style={{ width: "56px" }}
                >
                  SL
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  } ${cellPadding} text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-800 whitespace-nowrap ${
                    col.headerClassName || ""
                  }`}
                  style={col.width ? { width: col.width } : undefined}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {isLoading ? (
              <tr>
                <td
                  colSpan={columns.length + (showSerial ? 1 : 0)}
                  className="text-center py-16"
                >
                  <Loader2 className="h-7 w-7 animate-spin mx-auto text-blue-500" />
                  <p className="text-sm text-gray-500 mt-3">Loading data...</p>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showSerial ? 1 : 0)}
                  className="text-center py-16"
                >
                  {emptyIcon ?? (
                    <Inbox className="h-10 w-10 mx-auto text-gray-600 mb-3" />
                  )}
                  <p className="text-gray-500">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              <AnimatePresence initial={false}>
                {data.map((row, index) => {
                  const isEven = index % 2 === 0;
                  const rowBg = isEven ? ROW_EVEN : ROW_ODD;

                  return (
                    <motion.tr
                      key={getRowKey(row, index)}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18, delay: index * 0.015 }}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                      className={`group relative ${
                        onRowClick ? "cursor-pointer" : ""
                      }`}
                    >
                      {showSerial && (
                        <td
                          className={`sticky left-0 z-[1] ${rowBg} ${ROW_HOVER} ${ACCENT_BAR} ${cellPadding} text-xs font-mono text-gray-500 group-hover:text-blue-400 border-b border-gray-800/60 group-hover:border-blue-900/40 transition-colors duration-300`}
                        >
                          {serialOffset + index + 1}
                        </td>
                      )}
                      {columns.map((col, colIdx) => (
                        <td
                          key={col.key}
                          className={`${
                            col.align === "right"
                              ? "text-right"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left"
                          } ${cellPadding} ${rowBg} ${ROW_HOVER} ${
                            !showSerial && colIdx === 0 ? ACCENT_BAR : ""
                          } border-b border-gray-800/60 group-hover:border-blue-900/40 transition-colors duration-300 ${
                            col.className || ""
                          }`}
                        >
                          {col.render
                            ? col.render(row, index)
                            : ((row as any)[col.key] as ReactNode)}
                        </td>
                      ))}
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------- Pagination ---------- */}
      {pagination && pagination.totalItems > 0 && (
        <Pagination {...pagination} />
      )}
    </div>
  );
}

/* ============================================================
   PROFESSIONAL PAGINATION
   - First / Prev / Pages / Next / Last
   - Jump-to-page input
   - Rows per page selector
   - Info text
============================================================ */

function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
  limitOptions = [10, 20, 30, 50, 100],
}: PaginationConfig) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  /* ---- Local state for jump-to-page input ---- */
  const [jumpValue, setJumpValue] = useState<string>(String(currentPage));

  // Keep the input in sync when page changes from outside
  useEffect(() => {
    setJumpValue(String(currentPage));
  }, [currentPage]);

  const goTo = (page: number) => {
    const safe = Math.min(Math.max(1, page), totalPages);
    if (safe !== currentPage) onPageChange(safe);
  };

  const commitJump = () => {
    const n = parseInt(jumpValue, 10);
    if (isNaN(n)) {
      setJumpValue(String(currentPage));
      return;
    }
    goTo(n);
  };

  /* ---- Build the compact page list with ellipsis ---- */
  const buildPages = (): (number | "ellipsis-l" | "ellipsis-r")[] => {
    const pages: (number | "ellipsis-l" | "ellipsis-r")[] = [];

    // Small total — show everything
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    const c = currentPage;

    // Always show page 1
    pages.push(1);

    // Left ellipsis + first block
    if (c > 4) pages.push("ellipsis-l");

    // Middle window (3 pages around current)
    const start = Math.max(2, c - 1);
    const end = Math.min(totalPages - 1, c + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    // Right ellipsis + last block
    if (c < totalPages - 3) pages.push("ellipsis-r");

    // Always show last page
    pages.push(totalPages);

    return pages;
  };

  const pages = buildPages();

  const btnBase =
    "inline-flex items-center justify-center h-9 rounded-lg text-sm font-medium transition-all duration-150 border select-none disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-800 disabled:hover:border-gray-700";

  const btnIdle =
    "border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-white";

  const btnActive =
    "border-blue-500 bg-blue-600 text-white shadow-lg shadow-blue-600/25 hover:bg-blue-500 hover:border-blue-400";

  return (
    <div className="border-t border-gray-800 bg-gray-900/40">
      {/* ============ Top row: info + rows per page ============ */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 px-4 pt-4 pb-2">
        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span>
            Showing{" "}
            <span className="font-semibold text-white">{startItem}</span>
            {"–"}
            <span className="font-semibold text-white">{endItem}</span> of{" "}
            <span className="font-semibold text-white">{totalItems}</span>
          </span>

          <span className="hidden sm:inline text-gray-600">•</span>

          <span className="hidden sm:inline">
            Page{" "}
            <span className="font-semibold text-white">{currentPage}</span> of{" "}
            <span className="font-semibold text-white">{totalPages}</span>
          </span>
        </div>

        {onLimitChange && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>Rows per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="px-2 py-1.5 text-xs rounded-md bg-gray-800 border border-gray-700 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              {limitOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* ============ Bottom row: navigation ============ */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-4 pb-4">
        {/* ---------- Left: jump-to-page ---------- */}
        <div className="flex items-center gap-2 text-xs text-gray-400 order-2 lg:order-1">
          <span className="hidden sm:inline">Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            value={jumpValue}
            onChange={(e) => setJumpValue(e.target.value)}
            onBlur={commitJump}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                commitJump();
                (e.target as HTMLInputElement).blur();
              }
              if (e.key === "Escape") {
                setJumpValue(String(currentPage));
                (e.target as HTMLInputElement).blur();
              }
            }}
            className="w-16 px-2 py-1.5 text-xs text-center rounded-md bg-gray-800 border border-gray-700 text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-gray-500">/ {totalPages}</span>
        </div>

        {/* ---------- Right: pagination controls ---------- */}
        <div className="flex items-center justify-center lg:justify-end gap-1 order-1 lg:order-2">
          {/* First */}
          <button
            type="button"
            onClick={() => goTo(1)}
            disabled={currentPage <= 1}
            aria-label="First page"
            title="First page"
            className={`${btnBase} ${btnIdle} w-9`}
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          {/* Prev */}
          <button
            type="button"
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            title="Previous page"
            className={`${btnBase} ${btnIdle} w-9`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Page numbers with ellipsis */}
          {pages.map((p, i) => {
            if (p === "ellipsis-l" || p === "ellipsis-r") {
              return (
                <span
                  key={`e-${i}`}
                  className="inline-flex items-center justify-center w-9 h-9 text-gray-500 select-none"
                >
                  …
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => goTo(p)}
                aria-current={isActive ? "page" : undefined}
                className={`${btnBase} ${
                  isActive ? btnActive : btnIdle
                } min-w-[36px] px-2.5`}
              >
                {p}
              </button>
            );
          })}

          {/* Next */}
          <button
            type="button"
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            title="Next page"
            className={`${btnBase} ${btnIdle} w-9`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {/* Last */}
          <button
            type="button"
            onClick={() => goTo(totalPages)}
            disabled={currentPage >= totalPages}
            aria-label="Last page"
            title="Last page"
            className={`${btnBase} ${btnIdle} w-9`}
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}