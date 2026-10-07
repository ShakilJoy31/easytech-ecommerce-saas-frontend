"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  DollarSign,
  Package as PackageIcon,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  BarChart3,
  Loader2,
  Calendar,
  Download,
  RefreshCw,
  ChevronRight,
  ArrowUpRight,
  Wallet,
  Boxes,
  Award,
  Crown,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetSalesOverviewQuery,
  useGetRevenueChartQuery,
  useGetTopProductsQuery,
  useGetRecentOrdersQuery,
  useGetPaymentBreakdownQuery,
  useGetSalesByCategoryQuery,
  type SalesRange,
} from "@/redux/api/saas/salesApi";

const currencySymbol = (c: string) =>
  c === "BDT" ? "৳" : c === "USD" ? "$" : c === "EUR" ? "€" : "₹";

/* =========================================================================
   Range Presets
========================================================================= */
const RANGE_PRESETS: { key: SalesRange; label: string }[] = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last7days", label: "7 Days" },
  { key: "last30days", label: "30 Days" },
  { key: "thisMonth", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "thisYear", label: "This Year" },
];

/* =========================================================================
   KPI Card
========================================================================= */
function KPICard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon: any;
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-gray-200 bg-white p-5"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}15`, color: accent }}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold",
              trend.isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-700"
            )}
          >
            {trend.isPositive ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
      {sub && <p className="mt-1 text-[10px] text-gray-400">{sub}</p>}
    </motion.div>
  );
}

/* =========================================================================
   Simple SVG Bar Chart
========================================================================= */
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        No data available
      </div>
    );
  }

  return (
    <div className="relative h-64">
      <div className="flex h-full items-end gap-1">
        {data.map((point, i) => {
          const heightPct = (point.value / maxValue) * 100;
          return (
            <div
              key={i}
              className="group relative flex flex-1 flex-col items-center justify-end"
              style={{ minWidth: data.length > 30 ? "4px" : "12px" }}
            >
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-300 hover:from-emerald-600 hover:to-emerald-500"
                style={{ height: `${Math.max(heightPct, 2)}%` }}
              />
              {/* Tooltip on hover */}
              <div className="pointer-events-none absolute bottom-full mb-2 hidden w-max rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-xl group-hover:block z-10">
                <p className="font-semibold">{point.label}</p>
                <p className="text-emerald-300">
                  ৳{point.value.toLocaleString("en-US")}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* X-axis labels — only if not too many */}
      {data.length <= 15 && (
        <div className="mt-2 flex justify-between">
          {data.map((point, i) => (
            <span
              key={i}
              className="flex-1 text-center text-[10px] text-gray-400"
              style={{ minWidth: 0 }}
            >
              {data.length <= 10
                ? point.label
                : i % 2 === 0
                ? point.label
                : ""}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================================================================
   Top Product Row
========================================================================= */
function TopProductRow({
  product,
  rank,
}: {
  product: any;
  rank: number;
}) {
  const medalColors = [
    "bg-amber-100 text-amber-700",
    "bg-gray-100 text-gray-700",
    "bg-orange-100 text-orange-700",
  ];

  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-3 transition-colors hover:border-emerald-200">
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-xs font-bold",
          rank < 3 ? medalColors[rank] : "bg-gray-50 text-gray-500"
        )}
      >
        {rank === 0 && <Crown className="h-4 w-4" />}
        {rank === 1 && <Award className="h-4 w-4" />}
        {rank === 2 && <Sparkles className="h-4 w-4" />}
        {rank > 2 && `#${rank + 1}`}
      </div>

      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <PackageIcon className="h-4 w-4 text-gray-400" />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-semibold text-gray-900">
          {product.title}
        </p>
        <p className="text-xs text-gray-500">
          {product.totalQuantity} sold · {product.orderCount} order
          {product.orderCount !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm font-bold text-gray-900">
          ৳{product.totalRevenue.toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}

/* =========================================================================
   Payment method pill
========================================================================= */
function PaymentRow({ payment, total }: { payment: any; total: number }) {
  const pct = total > 0 ? Math.round((payment.revenue / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-gray-700">
          {payment.method === "OTHER"
            ? "Card / Online"
            : payment.method === "COD"
            ? "Cash on Delivery"
            : payment.method}
        </span>
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">
            ৳{payment.revenue.toLocaleString("en-US")}
          </span>
          <span className="text-xs text-gray-500">({pct}%)</span>
        </div>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-gray-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400"
        />
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN
========================================================================= */
export default function SalesReportPage() {
  const [range, setRange] = useState<SalesRange>("last30days");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const queryParams = useMemo(
    () => ({
      range,
      dateFrom: range === "custom" ? dateFrom : "",
      dateTo: range === "custom" ? dateTo : "",
    }),
    [range, dateFrom, dateTo]
  );

  const { data: overviewData, isLoading: loadingOverview, refetch: refetchOverview } =
    useGetSalesOverviewQuery(queryParams);
  const { data: chartData, isLoading: loadingChart } =
    useGetRevenueChartQuery(queryParams);
  const { data: topProductsData, isLoading: loadingTop } =
    useGetTopProductsQuery({ ...queryParams, limit: 8 });
  const { data: recentOrdersData, isLoading: loadingRecent } =
    useGetRecentOrdersQuery({ limit: 5 });
  const { data: paymentData, isLoading: loadingPayments } =
    useGetPaymentBreakdownQuery(queryParams);
  const { data: categoryData, isLoading: loadingCategory } =
    useGetSalesByCategoryQuery(queryParams);

  const overview = overviewData?.data;
  const chartPoints = chartData?.data?.points || [];
  const chartGrouping = chartData?.data?.grouping || "day";
  const topProducts = topProductsData?.data || [];
  const recentOrders = recentOrdersData?.data || [];
  const payments = paymentData?.data || [];
  const categories = categoryData?.data || [];

  const handleRefresh = () => {
    refetchOverview();
  };

  const handleCustomRange = (e: React.FormEvent) => {
    e.preventDefault();
    setRange("custom");
  };

  const totalPaymentRevenue = payments.reduce((s, p) => s + p.revenue, 0);

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="space-y-4 p-3 md:space-y-6 md:p-6">
        {/* ============ HEADER ============ */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <BarChart3 className="h-5 w-5 text-emerald-700" />
            </span>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gray-900 md:text-2xl">
                Sales Reports
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Track revenue, orders, and business performance.
              </p>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* ============ RANGE FILTER ============ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 overflow-x-auto">
              <Calendar className="h-4 w-4 flex-shrink-0 text-gray-400" />
              {RANGE_PRESETS.map((preset) => (
                <button
                  key={preset.key}
                  onClick={() => {
                    setRange(preset.key);
                    setShowCustom(false);
                  }}
                  className={cn(
                    "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    range === preset.key
                      ? "bg-[#0b2b26] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {preset.label}
                </button>
              ))}
              <button
                onClick={() => setShowCustom(!showCustom)}
                className={cn(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                  range === "custom"
                    ? "bg-[#0b2b26] text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                Custom
              </button>
            </div>

            {/* Custom range */}
            {showCustom && (
              <form
                onSubmit={handleCustomRange}
                className="flex flex-wrap items-center gap-2"
              >
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                />
                <span className="text-xs text-gray-400">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:border-emerald-600 focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                >
                  Apply
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ============ KPI CARDS ============ */}
        {loadingOverview ? (
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-2xl bg-gray-100"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <KPICard
              icon={DollarSign}
              label="Total Revenue"
              value={`৳${(overview?.revenue.gross || 0).toLocaleString("en-US")}`}
              sub={`Net: ৳${(overview?.revenue.net || 0).toLocaleString("en-US")}`}
              accent="#10b981"
            />
            <KPICard
              icon={ShoppingCart}
              label="Paid Orders"
              value={overview?.orders.paid || 0}
              sub={`${overview?.orders.total || 0} total orders`}
              accent="#3b82f6"
            />
            <KPICard
              icon={Boxes}
              label="Units Sold"
              value={(overview?.metrics.unitsSold || 0).toLocaleString("en-US")}
              sub={`Avg. ৳${Math.round(overview?.metrics.avgOrderValue || 0).toLocaleString("en-US")} per order`}
              accent="#8b5cf6"
            />
            <KPICard
              icon={Users}
              label="Unique Customers"
              value={overview?.metrics.uniqueCustomers || 0}
              sub="By phone number"
              accent="#f59e0b"
            />
          </div>
        )}

        {/* ============ ORDER STATUS BREAKDOWN ============ */}
        {overview && (
          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-500" />
                <p className="text-xs font-medium text-gray-500">Pending</p>
              </div>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {overview.orders.pending}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-medium text-gray-500">Delivered</p>
              </div>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {overview.orders.delivered}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <p className="text-xs font-medium text-gray-500">Cancelled</p>
              </div>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {overview.orders.cancelled}
              </p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-4">
              <div className="flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-500" />
                <p className="text-xs font-medium text-gray-500">Total Orders</p>
              </div>
              <p className="mt-2 text-xl font-bold text-gray-900">
                {overview.orders.total}
              </p>
            </div>
          </div>
        )}

        {/* ============ REVENUE CHART ============ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                Revenue Trend
              </h2>
              <p className="mt-1 text-xs text-gray-500">
                {chartGrouping === "day" ? "Daily" : "Monthly"} revenue from
                paid orders
              </p>
            </div>
            {overview && (
              <div className="text-right">
                <p className="text-xs text-gray-500">Period Total</p>
                <p className="text-lg font-bold text-gray-900">
                  ৳{overview.revenue.gross.toLocaleString("en-US")}
                </p>
              </div>
            )}
          </div>

          {loadingChart ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
            </div>
          ) : (
            <BarChart
              data={chartPoints.map((p) => ({
                label: p.label,
                value: p.revenue,
              }))}
            />
          )}
        </div>

        {/* ============ TOP PRODUCTS + PAYMENTS ============ */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Top Products */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700">
                <span className="h-4 w-1 rounded-full bg-emerald-500" />
                Top Selling Products
              </h2>
            </div>

            {loadingTop ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            ) : topProducts.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-12 text-center">
                <PackageIcon className="mx-auto mb-2 h-6 w-6 text-gray-300" />
                <p className="text-sm text-gray-500">
                  No product sales in this period
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {topProducts.map((product, idx) => (
                  <TopProductRow
                    key={product.productId || idx}
                    product={product}
                    rank={idx}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Payment breakdown */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              Payment Methods
            </h2>

            {loadingPayments ? (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 animate-pulse rounded-xl bg-gray-100"
                  />
                ))}
              </div>
            ) : payments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
                <Wallet className="mx-auto mb-2 h-5 w-5 text-gray-300" />
                <p className="text-xs text-gray-500">No payments yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {payments.map((p) => (
                  <PaymentRow
                    key={p.method}
                    payment={p}
                    total={totalPaymentRevenue}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ============ SALES BY CATEGORY ============ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700">
            <span className="h-4 w-1 rounded-full bg-emerald-500" />
            Sales by Category
          </h2>

          {loadingCategory ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : categories.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
              <BarChart3 className="mx-auto mb-2 h-5 w-5 text-gray-300" />
              <p className="text-xs text-gray-500">No category sales yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-left text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Category
                    </th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Units
                    </th>
                    <th className="pb-2 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-gray-50 last:border-0"
                    >
                      <td className="py-3 font-semibold text-gray-900">
                        {cat.categoryName}
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {cat.totalQuantity}
                      </td>
                      <td className="py-3 text-right font-bold text-gray-900">
                        ৳{cat.totalRevenue.toLocaleString("en-US")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ============ RECENT ORDERS ============ */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-gray-700">
              <span className="h-4 w-1 rounded-full bg-emerald-500" />
              Recent Orders
            </h2>
            <Link
              href="/store/orders"
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View All
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {loadingRecent ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 py-8 text-center">
              <ShoppingCart className="mx-auto mb-2 h-5 w-5 text-gray-300" />
              <p className="text-xs text-gray-500">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order: any) => (
                <Link
                  key={order.id}
                  href="/store/orders"
                  className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 p-3 transition-colors hover:border-emerald-200"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-semibold text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="truncate text-xs text-gray-500">
                      {order.customerName} · {order.totalQuantity} item
                      {order.totalQuantity !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      ৳{Number(order.total).toLocaleString("en-US")}
                    </p>
                    <p
                      className={cn(
                        "text-[10px] font-semibold uppercase tracking-wider",
                        order.paymentStatus === "PAID"
                          ? "text-emerald-600"
                          : "text-amber-600"
                      )}
                    >
                      {order.paymentStatus}
                    </p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}