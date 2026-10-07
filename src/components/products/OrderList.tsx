"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
  Package as PackageIcon,
  Phone,
  MapPin,
  Mail,
  User,
  Copy,
  Truck,
  Info,
  TrendingUp,
  Clock,
  Ban,
  Printer,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Order,
  useGetStoreOrdersQuery,
  useGetOrderStatsQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/api/saas/orderApi";

const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : "₹";

/* ============ Helpers ============ */
const orderStatusConfig: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  PENDING: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500", label: "Pending" },
  CONFIRMED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500", label: "Confirmed" },
  PROCESSING: { bg: "bg-indigo-50", text: "text-indigo-700", dot: "bg-indigo-500", label: "Processing" },
  SHIPPED: { bg: "bg-purple-50", text: "text-purple-700", dot: "bg-purple-500", label: "Shipped" },
  DELIVERED: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", label: "Delivered" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500", label: "Cancelled" },
  RETURNED: { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-400", label: "Returned" },
};

const paymentStatusConfig: Record<string, { bg: string; text: string; label: string }> = {
  UNPAID: { bg: "bg-red-50", text: "text-red-700", label: "Unpaid" },
  PAID: { bg: "bg-emerald-50", text: "text-emerald-700", label: "Paid" },
  PARTIAL: { bg: "bg-amber-50", text: "text-amber-700", label: "Partial" },
  REFUNDED: { bg: "bg-gray-100", text: "text-gray-700", label: "Refunded" },
};

function OrderStatusPill({ status }: { status: string }) {
  const c = orderStatusConfig[status] || orderStatusConfig.PENDING;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        c.bg,
        c.text
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", c.dot)} />
      {c.label}
    </span>
  );
}

function PaymentStatusPill({ status }: { status: string }) {
  const c = paymentStatusConfig[status] || paymentStatusConfig.UNPAID;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold", c.bg, c.text)}>
      {c.label}
    </span>
  );
}

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

/* ============ View Order Modal ============ */
function ViewOrderModal({
  open,
  order,
  onClose,
  onStatusChange,
}: {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onStatusChange: (status: string) => void;
}) {
  if (!order) return null;

  const items = order.items || [];
  const sym = currencySymbol(order.currency);

  const handleCopy = (v: string) => {
    navigator.clipboard.writeText(v);
    toast.success("Copied");
  };

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
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <ShoppingCart className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Order #{order.orderNumber}
                    </h2>
                    <OrderStatusPill status={order.status} />
                    <PaymentStatusPill status={order.paymentStatus} />
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : ""}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Customer */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Customer
                </h3>
                <div className="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-gray-500" />
                    <span className="font-semibold text-gray-900">
                      {order.customerName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-900">
                      {order.customerPhone}
                    </span>
                    <button
                      onClick={() => handleCopy(order.customerPhone)}
                      className="rounded p-0.5 text-gray-400 hover:text-emerald-700"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                  </div>
                  {order.customerEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="truncate text-gray-900">
                        {order.customerEmail}
                      </span>
                    </div>
                  )}
                  <div className="flex items-start gap-2 text-sm sm:col-span-2">
                    <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-500" />
                    <span className="text-gray-900">
                      {order.customerAddress}
                      {order.customerDistrict && `, ${order.customerDistrict}`}
                    </span>
                  </div>
                  {order.customerNote && (
                    <div className="sm:col-span-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                      <b>Note:</b> {order.customerNote}
                    </div>
                  )}
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Items ({items.length})
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="divide-y divide-gray-100">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3"
                      >
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                          {item.productImage ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.productImage}
                              alt={item.productTitle}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <PackageIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-gray-900">
                            {item.productTitle}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">
                            {sym}
                            {Number(item.unitPrice).toLocaleString("en-US")} ×{" "}
                            {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-bold text-gray-900">
                          {sym}
                          {Number(item.totalPrice).toLocaleString("en-US")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Totals */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Summary
                </h3>
                <div className="space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-semibold text-gray-900">
                      {sym}
                      {Number(order.subtotal).toLocaleString("en-US")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-semibold text-gray-900">
                      {sym}
                      {Number(order.shippingCost).toLocaleString("en-US")}
                    </span>
                  </div>
                  {Number(order.discount) > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Discount</span>
                      <span className="font-semibold text-red-600">
                        -{sym}
                        {Number(order.discount).toLocaleString("en-US")}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-dashed border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="font-bold text-gray-900">Total</span>
                      <span className="text-lg font-bold text-gray-900">
                        {sym}
                        {Number(order.total).toLocaleString("en-US")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment reference */}
              {order.paymentReference && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">
                      Payment Reference
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-gray-900">
                        {order.paymentReference}
                      </span>
                      <button
                        onClick={() => handleCopy(order.paymentReference!)}
                        className="rounded p-0.5 text-gray-400 hover:text-emerald-700"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer — status update */}
            <div className="border-t border-gray-100 bg-gray-50 p-4">
              <p className="mb-2 text-xs font-semibold text-gray-600">
                Update Order Status:
              </p>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    "CONFIRMED",
                    "PROCESSING",
                    "SHIPPED",
                    "DELIVERED",
                    "CANCELLED",
                  ] as const
                ).map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    disabled={order.status === s}
                    className={cn(
                      "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                      order.status === s
                        ? "cursor-not-allowed bg-gray-200 text-gray-500"
                        : "bg-white text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 border border-gray-200"
                    )}
                  >
                    {orderStatusConfig[s]?.label || s}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============ MAIN ============ */
export default function OrderList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(15);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [viewTarget, setViewTarget] = useState<Order | null>(null);

  const { data, isLoading, isFetching, refetch } = useGetStoreOrdersQuery({
    page,
    limit,
    search,
    status: statusFilter,
  });

  const { data: statsData } = useGetOrderStatsQuery(undefined);

  const [updateStatus, { isLoading: isUpdating }] = useUpdateOrderStatusMutation();

  const orders: Order[] = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleStatusChange = async (status: string) => {
    if (!viewTarget) return;
    try {
      const updated = await updateStatus({
        id: viewTarget.id,
        status,
      }).unwrap();
      toast.success(`Order marked as ${status}`);
      setViewTarget(updated.data);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <ShoppingCart className="h-5 w-5 text-emerald-700" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                Orders
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manage incoming orders from your customers.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={stats?.total ?? "—"}
            accent="#10b981"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={stats?.pending ?? "—"}
            accent="#f59e0b"
          />
          <StatCard
            icon={Truck}
            label="Shipped"
            value={stats?.shipped ?? "—"}
            accent="#8b5cf6"
          />
          <StatCard
            icon={TrendingUp}
            label="Revenue"
            value={`৳${Number(stats?.totalRevenue || 0).toLocaleString("en-US")}`}
            accent="#3b82f6"
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <form
              onSubmit={handleSearch}
              className="relative w-full lg:max-w-md"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by order number, customer..."
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
              {(
                [
                  { key: "", label: "All" },
                  { key: "PENDING", label: "Pending" },
                  { key: "CONFIRMED", label: "Confirmed" },
                  { key: "SHIPPED", label: "Shipped" },
                  { key: "DELIVERED", label: "Delivered" },
                  { key: "CANCELLED", label: "Cancelled" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === tab.key
                      ? "bg-[#0b2b26] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {tab.label}
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
                    Order
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Items
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Total
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Payment
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
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <ShoppingCart className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No orders yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Orders from your storefront will appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {orders.map((order, idx) => {
                      const sym = currencySymbol(order.currency);
                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                        >
                          <td className="px-4 py-4">
                            <p className="font-mono text-xs font-bold text-gray-900">
                              {order.orderNumber}
                            </p>
                            <p className="text-[11px] text-gray-500">
                              {order.createdAt
                                ? new Date(order.createdAt).toLocaleDateString(
                                    "en-GB",
                                    { dateStyle: "medium" }
                                  )
                                : ""}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <p className="truncate font-semibold text-gray-900">
                              {order.customerName}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                              {order.customerPhone}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                              <PackageIcon className="h-3 w-3" />
                              {order.totalQuantity || order.itemCount || 0}
                            </span>
                          </td>

                          <td className="px-4 py-4">
                            <p className="font-bold text-gray-900">
                              {sym}
                              {Number(order.total).toLocaleString("en-US")}
                            </p>
                          </td>

                          <td className="px-4 py-4">
                            <PaymentStatusPill status={order.paymentStatus} />
                          </td>

                          <td className="px-4 py-4">
                            <OrderStatusPill status={order.status} />
                          </td>

                          <td className="px-4 py-4">
                            <div className="flex items-center justify-end">
                              <button
                                onClick={() => setViewTarget(order)}
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                title="View order"
                              >
                                <Eye className="h-4 w-4" />
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

      {/* View Modal */}
      <ViewOrderModal
        open={!!viewTarget}
        order={viewTarget}
        onClose={() => setViewTarget(null)}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
}