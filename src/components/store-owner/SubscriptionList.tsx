"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Search,
  Eye,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  ShieldOff,
  TrendingUp,
  Copy,
  Info,
  Store as StoreIcon,
  Package as PackageIcon,
  Calendar,
  Ban,
  RefreshCw,
  Crown,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Subscription,
  useGetAllSubscriptionsQuery,
  useGetSubscriptionStatsQuery,
  useCancelSubscriptionMutation,
} from "@/redux/api/saas/subscriptionApi";

/* =========================================================================
   Status pill
========================================================================= */
function StatusPill({ status }: { status: string }) {
  const config: Record<
    string,
    { bg: string; text: string; dot: string; label: string }
  > = {
    PENDING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Pending",
    },
    ACTIVE: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Active",
    },
    EXPIRED: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Expired",
    },
    CANCELLED: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      dot: "bg-gray-400",
      label: "Cancelled",
    },
    REFUNDED: {
      bg: "bg-blue-50",
      text: "text-blue-700",
      dot: "bg-blue-500",
      label: "Refunded",
    },
  };
  const c = config[status] || config.PENDING;
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

/* =========================================================================
   Stat Card
========================================================================= */
function StatCard({
  icon: Icon,
  label,
  value,
  accent,
  sub,
}: {
  icon: any;
  label: string;
  value: string | number;
  accent: string;
  sub?: string;
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
      {sub && <p className="mt-1 text-[10px] text-gray-400">{sub}</p>}
    </div>
  );
}

/* =========================================================================
   Skeleton
========================================================================= */
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

/* =========================================================================
   Confirm Dialog
========================================================================= */
function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  variant = "danger",
  onConfirm,
  onCancel,
  isLoading,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full",
                    variant === "danger"
                      ? "bg-red-100 text-red-600"
                      : "bg-emerald-100 text-emerald-600"
                  )}
                >
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{description}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-4">
              <button
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={isLoading}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50",
                  variant === "danger"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-emerald-600 hover:bg-emerald-700"
                )}
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
   View Modal
========================================================================= */
function ViewSubscriptionModal({
  open,
  sub,
  onClose,
  onCancelClick,
}: {
  open: boolean;
  sub: Subscription | null;
  onClose: () => void;
  onCancelClick: () => void;
}) {
  if (!sub) return null;

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  const formatDate = (d?: string | null) =>
    d
      ? new Date(d).toLocaleString("en-GB", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : "—";

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
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Subscription #{sub.id}
                    </h2>
                    <StatusPill status={sub.status} />
                    {sub.isRenewal && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        <RefreshCw className="h-3 w-3" />
                        Renewal
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Created {formatDate(sub.createdAt)}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {/* Price + Period cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount Paid
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {sub.currency === "BDT" ? "৳" : sub.currency}
                    {Number(sub.price).toLocaleString("en-US")}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Duration
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {sub.durationDay}
                    <span className="ml-1 text-sm font-medium text-gray-500">
                      days
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {sub.durationLabel}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {sub.isExpired ? "Expired" : "Days Remaining"}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-bold",
                      sub.isExpired
                        ? "text-red-600"
                        : sub.daysRemaining! <= 7
                        ? "text-amber-600"
                        : "text-emerald-600"
                    )}
                  >
                    {sub.isExpired ? "—" : sub.daysRemaining}
                  </p>
                  {sub.isExpired && (
                    <p className="mt-0.5 text-xs text-red-500">
                      Ended {formatDate(sub.endAt)}
                    </p>
                  )}
                </div>
              </div>

              {/* Store */}
              {sub.store && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Store
                  </h3>
                  <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                      <StoreIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-gray-900">
                          {sub.store.name}
                        </p>
                        <span
                          className={cn(
                            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                            sub.store.status === "ACTIVE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-gray-200 text-gray-700"
                          )}
                        >
                          {sub.store.status}
                        </span>
                      </div>
                      <p className="mt-0.5 font-mono text-xs text-gray-500">
                        /{sub.store.slug} · {sub.store.storeCode}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Package */}
              {sub.package && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Package
                  </h3>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4 text-emerald-700" />
                      <p className="text-base font-bold text-gray-900">
                        {sub.package.name}
                      </p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                      <div>
                        <span className="text-gray-500">Products:</span>{" "}
                        <span className="font-semibold text-gray-900">
                          {sub.package.maxProducts === null ? (
                            <InfinityIcon className="inline h-3 w-3 text-emerald-600" />
                          ) : (
                            sub.package.maxProducts
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Categories:</span>{" "}
                        <span className="font-semibold text-gray-900">
                          {sub.package.maxCategories === null ? (
                            <InfinityIcon className="inline h-3 w-3 text-emerald-600" />
                          ) : (
                            sub.package.maxCategories
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Package Price:</span>{" "}
                        <span className="font-semibold text-gray-900">
                          ৳{Number(sub.package.price).toLocaleString("en-US")}
                        </span>
                      </div>
                    </div>
                    {sub.package.features && sub.package.features.length > 0 && (
                      <ul className="mt-3 space-y-1 border-t border-gray-200 pt-3">
                        {sub.package.features.slice(0, 4).map((f, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-1.5 text-xs text-gray-600"
                          >
                            <Check className="h-3 w-3 flex-shrink-0 text-emerald-600" />
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}

              {/* Period details */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Subscription Period
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="divide-y divide-gray-100">
                    <InfoRow label="Start Date" value={formatDate(sub.startAt)} />
                    <InfoRow label="End Date" value={formatDate(sub.endAt)} />
                    <InfoRow label="Duration" value={`${sub.durationDay} days`} />
                    <InfoRow
                      label="Is Renewal"
                      value={sub.isRenewal ? "Yes" : "No"}
                    />
                    {sub.previousSubscriptionId && (
                      <InfoRow
                        label="Previous Sub ID"
                        value={`#${sub.previousSubscriptionId}`}
                        mono
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Manual payment */}
              {sub.manualPayment && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Payment Reference
                  </h3>
                  <div className="overflow-hidden rounded-xl border border-gray-200">
                    <div className="divide-y divide-gray-100">
                      <InfoRow
                        label="Payment Code"
                        value={sub.manualPayment.paymentCode}
                        mono
                        copy
                        onCopy={handleCopy}
                      />
                      <InfoRow
                        label="Transaction ID"
                        value={sub.manualPayment.transactionId}
                        mono
                        copy
                        onCopy={handleCopy}
                      />
                      <InfoRow
                        label="Account Number"
                        value={sub.manualPayment.accountNumber}
                        mono
                      />
                      <div className="flex items-center justify-between px-4 py-3">
                        <span className="text-sm text-gray-500">
                          Payment Status
                        </span>
                        <StatusPill status={sub.manualPayment.status} />
                      </div>
                      {sub.manualPayment.verifiedAt && (
                        <InfoRow
                          label="Verified At"
                          value={formatDate(sub.manualPayment.verifiedAt)}
                        />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {sub.notes && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Notes
                  </h3>
                  <p className="whitespace-pre-wrap rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {sub.notes}
                  </p>
                </div>
              )}

              {/* Meta */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  <span>
                    Last updated: {formatDate(sub.updatedAt || sub.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-between">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Close
              </button>

              {sub.status === "ACTIVE" && (
                <button
                  onClick={onCancelClick}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  <Ban className="h-4 w-4" />
                  Cancel Subscription
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({
  label,
  value,
  mono,
  copy,
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  copy?: boolean;
  onCopy?: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "truncate text-right text-sm font-semibold text-gray-900",
            mono && "font-mono"
          )}
        >
          {value}
        </span>
        {copy && onCopy && value && value !== "—" && (
          <button
            onClick={() => onCopy(value)}
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-700"
          >
            <Copy className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}

/* =========================================================================
   MAIN
========================================================================= */
export default function SubscriptionList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED" | "REFUNDED"
  >("");

  const [viewTarget, setViewTarget] = useState<Subscription | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Subscription | null>(null);

  const { data, isLoading, isFetching } = useGetAllSubscriptionsQuery({
    page,
    limit,
    search,
    status: statusFilter,
  });

  const { data: statsData } = useGetSubscriptionStatsQuery(undefined);

  const [cancelSubscription, { isLoading: isCancelling }] =
    useCancelSubscriptionMutation();

  const subs: Subscription[] = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    try {
      await cancelSubscription({ id: cancelTarget.id }).unwrap();
      toast.success("Subscription cancelled");
      setCancelTarget(null);
      setViewTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to cancel");
    }
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <CreditCard className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Subscriptions & Billing
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Track all store subscriptions, billing history and renewals.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={CreditCard}
            label="Total Subscriptions"
            value={stats?.total ?? "—"}
            accent="#10b981"
          />
          <StatCard
            icon={ShieldCheck}
            label="Active"
            value={stats?.active ?? "—"}
            accent="#3b82f6"
            sub={
              stats?.expiringSoon
                ? `${stats.expiringSoon} expiring soon`
                : undefined
            }
          />
          <StatCard
            icon={ShieldOff}
            label="Expired"
            value={stats?.expired ?? "—"}
            accent="#f59e0b"
          />
          <StatCard
            icon={TrendingUp}
            label="Active Revenue"
            value={`৳${Number(stats?.activeRevenue || 0).toLocaleString(
              "en-US"
            )}`}
            accent="#8b5cf6"
            sub={`Total: ৳${Number(stats?.totalRevenue || 0).toLocaleString(
              "en-US"
            )}`}
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form
              onSubmit={handleSearch}
              className="relative w-full md:max-w-md"
            >
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by store or package..."
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
                  { key: "ACTIVE", label: "Active" },
                  { key: "PENDING", label: "Pending" },
                  { key: "EXPIRED", label: "Expired" },
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
                    Subscription
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Store
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Package
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Period
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
                ) : subs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <CreditCard className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No subscriptions yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Subscriptions appear here after a payment is verified.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {subs.map((sub, idx) => (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                                sub.status === "ACTIVE"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : sub.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : sub.status === "EXPIRED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                              )}
                            >
                              <CreditCard className="h-4 w-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-semibold text-gray-900">
                                SUB-{String(sub.id).padStart(5, "0")}
                              </p>
                              <p className="truncate text-[11px] text-gray-500">
                                {sub.createdAt
                                  ? new Date(sub.createdAt).toLocaleDateString(
                                      "en-GB",
                                      { dateStyle: "medium" }
                                    )
                                  : "—"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          {sub.store ? (
                            <>
                              <p className="truncate font-semibold text-gray-900">
                                {sub.store.name}
                              </p>
                              <p className="truncate font-mono text-[11px] text-gray-500">
                                /{sub.store.slug}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">—</p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          {sub.package ? (
                            <>
                              <p className="truncate font-semibold text-gray-900">
                                {sub.package.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {sub.durationDay} days
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">—</p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900">
                            {sub.currency === "BDT" ? "৳" : sub.currency}
                            {Number(sub.price).toLocaleString("en-US")}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p className="text-xs text-gray-700">
                            {new Date(sub.startAt).toLocaleDateString("en-GB", {
                              dateStyle: "short",
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            →{" "}
                            {new Date(sub.endAt).toLocaleDateString("en-GB", {
                              dateStyle: "short",
                            })}
                          </p>
                          {sub.status === "ACTIVE" && !sub.isExpired && (
                            <p
                              className={cn(
                                "mt-0.5 text-[10px] font-semibold",
                                (sub.daysRemaining ?? 0) <= 7
                                  ? "text-amber-600"
                                  : "text-emerald-600"
                              )}
                            >
                              {sub.daysRemaining} days left
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <StatusPill status={sub.status} />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(sub)}
                              title="View details"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            {sub.status === "ACTIVE" && (
                              <button
                                onClick={() => setCancelTarget(sub)}
                                title="Cancel subscription"
                                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                              >
                                <Ban className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    ))}
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

      {/* Modals */}
      <ViewSubscriptionModal
        open={!!viewTarget}
        sub={viewTarget}
        onClose={() => setViewTarget(null)}
        onCancelClick={() => {
          setCancelTarget(viewTarget);
          setViewTarget(null);
        }}
      />

      <ConfirmDialog
        open={!!cancelTarget}
        title="Cancel subscription?"
        description={
          cancelTarget
            ? `This will cancel subscription #${cancelTarget.id} and suspend the store. This cannot be undone.`
            : ""
        }
        confirmText="Cancel Subscription"
        variant="danger"
        isLoading={isCancelling}
        onConfirm={handleCancel}
        onCancel={() => setCancelTarget(null)}
      />
    </div>
  );
}