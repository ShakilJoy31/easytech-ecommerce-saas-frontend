"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store as StoreIcon,
  Search,
  Eye,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldOff,
  Clock,
  TrendingUp,
  Copy,
  Info,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Package as PackageIcon,
  Calendar,
  ExternalLink,
  Ban,
  Infinity as InfinityIcon,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  Store,
  useGetAllStoresQuery,
  useGetStoreStatsQuery,
  useToggleStoreStatusMutation,
  useDeleteStoreMutation,
} from "@/redux/api/saas/storeManagementApi";
import EditStoreModal from "./EditStoreModal";


/* =========================================================================
   Status pill + colors
========================================================================= */
const statusConfig: Record<
  string,
  { bg: string; text: string; dot: string; label: string }
> = {
  ACTIVE: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Active",
  },
  INACTIVE: {
    bg: "bg-gray-100",
    text: "text-gray-600",
    dot: "bg-gray-400",
    label: "Inactive",
  },
  SUSPENDED: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Suspended",
  },
  EXPIRED: {
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
    label: "Expired",
  },
};

function StatusPill({ status }: { status: string }) {
  const c = statusConfig[status] || statusConfig.INACTIVE;
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
   View Store Modal
========================================================================= */
function ViewStoreModal({
  open,
  store,
  onClose,
}: {
  open: boolean;
  store: Store | null;
  onClose: () => void;
}) {
  if (!store) return null;

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
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
                  {store.logo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={store.logo}
                      alt={store.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <StoreIcon className="h-6 w-6" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {store.name}
                    </h2>
                    <StatusPill status={store.status} />
                  </div>
                  <p className="mt-1 font-mono text-xs text-gray-500">
                    /{store.slug} · {store.storeCode}
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
              {/* Subscription stats */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Subscription Ends
                  </p>
                  <p className="mt-1 text-sm font-bold text-gray-900">
                    {store.subscriptionEndAt
                      ? new Date(store.subscriptionEndAt).toLocaleDateString(
                          "en-GB",
                          { dateStyle: "medium" }
                        )
                      : "Not started"}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    {store.isExpired ? "Expired" : "Days Remaining"}
                  </p>
                  <p
                    className={cn(
                      "mt-1 text-2xl font-bold",
                      store.isExpired
                        ? "text-red-600"
                        : (store.daysRemaining ?? 0) <= 7
                        ? "text-amber-600"
                        : "text-emerald-600"
                    )}
                  >
                    {store.isExpired ? "—" : store.daysRemaining}
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
                    Store ID
                  </p>
                  <p className="mt-1 font-mono text-sm font-bold text-gray-900">
                    {store.storeCode}
                  </p>
                </div>
              </div>

              {/* Owner info */}
              {store.owner && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Store Owner
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 text-white">
                      <UserIcon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-base font-bold text-gray-900">
                          {store.owner.name}
                        </p>
                        {store.owner.isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {store.owner.email}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {store.owner.phone}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Package */}
              {store.package && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Current Package
                  </h3>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <PackageIcon className="h-4 w-4 text-emerald-700" />
                      <p className="text-base font-bold text-gray-900">
                        {store.package.name}
                      </p>
                      <span className="ml-auto text-sm font-bold text-gray-900">
                        {store.package.currency === "BDT" ? "৳" : store.package.currency}
                        {Number(store.package.price).toLocaleString("en-US")}
                        <span className="ml-1 text-xs font-medium text-gray-500">
                          / {store.package.durationDay}d
                        </span>
                      </span>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
                      <div>
                        <span className="text-gray-500">Products:</span>{" "}
                        <span className="font-semibold text-gray-900">
                          {store.package.maxProducts === null ? (
                            <InfinityIcon className="inline h-3 w-3 text-emerald-600" />
                          ) : (
                            store.package.maxProducts
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Categories:</span>{" "}
                        <span className="font-semibold text-gray-900">
                          {store.package.maxCategories === null ? (
                            <InfinityIcon className="inline h-3 w-3 text-emerald-600" />
                          ) : (
                            store.package.maxCategories
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Orders/Mo:</span>{" "}
                        <span className="font-semibold text-gray-900">
                          {store.package.maxOrdersPerMonth === null ? (
                            <InfinityIcon className="inline h-3 w-3 text-emerald-600" />
                          ) : (
                            store.package.maxOrdersPerMonth
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Store details */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Store Details
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="divide-y divide-gray-100">
                    <InfoRow label="Store Code" value={store.storeCode} mono copy onCopy={handleCopy} />
                    <InfoRow label="Slug" value={`/${store.slug}`} mono copy onCopy={handleCopy} />
                    {store.tagline && <InfoRow label="Tagline" value={store.tagline} />}
                    {store.email && <InfoRow label="Email" value={store.email} />}
                    {store.phone && <InfoRow label="Phone" value={store.phone} />}
                    {store.address && <InfoRow label="Address" value={store.address} />}
                    {store.district && <InfoRow label="District" value={store.district} />}
                    <InfoRow label="Country" value={store.country || "Bangladesh"} />
                    <InfoRow label="Created" value={formatDate(store.createdAt)} />
                  </div>
                </div>
              </div>

              {store.description && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Description
                  </h3>
                  <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {store.description}
                  </p>
                </div>
              )}

              {/* Socials */}
              {(store.facebook || store.instagram || store.whatsapp) && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Social Links
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {store.facebook && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        Facebook
                      </span>
                    )}
                    {store.instagram && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-700">
                        Instagram
                      </span>
                    )}
                    {store.whatsapp && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        WhatsApp
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end border-t border-gray-100 bg-gray-50 p-4">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Close
              </button>
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
export default function StoreList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "ACTIVE" | "INACTIVE" | "SUSPENDED" | "EXPIRED"
  >("");

  const [viewTarget, setViewTarget] = useState<Store | null>(null);
  const [editTarget, setEditTarget] = useState<Store | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Store | null>(null);
  const [toggleTarget, setToggleTarget] = useState<Store | null>(null);

  const { data, isLoading, isFetching } = useGetAllStoresQuery({
    page,
    limit,
    search,
    status: statusFilter,
  });

  const { data: statsData } = useGetStoreStatsQuery(undefined);
  const [toggleStatus, { isLoading: isToggling }] = useToggleStoreStatusMutation();
  const [deleteStore, { isLoading: isDeleting }] = useDeleteStoreMutation();

  const stores: Store[] = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    const newStatus = toggleTarget.status === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    try {
      await toggleStatus({ id: toggleTarget.id, status: newStatus }).unwrap();
      toast.success(`Store ${newStatus === "ACTIVE" ? "activated" : "suspended"}`);
      setToggleTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStore(deleteTarget.id).unwrap();
      toast.success("Store deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
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
              <StoreIcon className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Store Management
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                View all stores, their owners, and manage activation.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={StoreIcon}
            label="Total Stores"
            value={stats?.total ?? "—"}
            accent="#10b981"
          />
          <StatCard
            icon={ShieldCheck}
            label="Active"
            value={stats?.active ?? "—"}
            accent="#3b82f6"
            sub={
              stats?.expiringSoon ? `${stats.expiringSoon} expiring soon` : undefined
            }
          />
          <StatCard
            icon={Clock}
            label="Suspended"
            value={stats?.suspended ?? "—"}
            accent="#f59e0b"
          />
          <StatCard
            icon={ShieldOff}
            label="Expired"
            value={stats?.expired ?? "—"}
            accent="#ef4444"
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
                placeholder="Search store, owner, code..."
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
                  { key: "INACTIVE", label: "Inactive" },
                  { key: "SUSPENDED", label: "Suspended" },
                  { key: "EXPIRED", label: "Expired" },
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
                    Store
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Owner
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Package
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Subscription
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
                ) : stores.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <StoreIcon className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No stores yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Stores appear here after owners register.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {stores.map((store, idx) => (
                      <motion.tr
                        key={store.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                      >
                        {/* Store */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                              {store.logo ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={store.logo}
                                  alt={store.name}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                store.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {store.name}
                              </p>
                              <p className="truncate font-mono text-[11px] text-gray-500">
                                /{store.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner */}
                        <td className="px-4 py-4">
                          {store.owner ? (
                            <>
                              <p className="truncate font-semibold text-gray-900">
                                {store.owner.name}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                {store.owner.email}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">No owner</p>
                          )}
                        </td>

                        {/* Package */}
                        <td className="px-4 py-4">
                          {store.package ? (
                            <>
                              <p className="truncate font-semibold text-gray-900">
                                {store.package.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                ৳{Number(store.package.price).toLocaleString("en-US")}
                                /{store.package.durationDay}d
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">—</p>
                          )}
                        </td>

                        {/* Subscription */}
                        <td className="px-4 py-4">
                          {store.subscriptionEndAt ? (
                            <>
                              <p className="text-xs text-gray-700">
                                Until{" "}
                                {new Date(store.subscriptionEndAt).toLocaleDateString(
                                  "en-GB",
                                  { dateStyle: "short" }
                                )}
                              </p>
                              {store.status === "ACTIVE" && !store.isExpired && (
                                <p
                                  className={cn(
                                    "mt-0.5 text-[10px] font-semibold",
                                    (store.daysRemaining ?? 0) <= 7
                                      ? "text-amber-600"
                                      : "text-emerald-600"
                                  )}
                                >
                                  {store.daysRemaining} days left
                                </p>
                              )}
                              {store.isExpired && (
                                <p className="mt-0.5 text-[10px] font-semibold text-red-600">
                                  Expired
                                </p>
                              )}
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">Not started</p>
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusPill status={store.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(store)}
                              title="View"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setToggleTarget(store)}
                              title={
                                store.status === "ACTIVE" ? "Suspend" : "Activate"
                              }
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                              {store.status === "ACTIVE" ? (
                                <ShieldOff className="h-4 w-4" />
                              ) : (
                                <ShieldCheck className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditTarget(store)}
                              title="Edit"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(store)}
                              title="Delete"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
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
      <ViewStoreModal
        open={!!viewTarget}
        store={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <EditStoreModal
        open={!!editTarget}
        store={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.status === "ACTIVE"
            ? "Suspend this store?"
            : "Activate this store?"
        }
        description={
          toggleTarget?.status === "ACTIVE"
            ? `"${toggleTarget?.name}" and its storefront will be inaccessible.`
            : `"${toggleTarget?.name}" will become accessible to shoppers again.`
        }
        confirmText={
          toggleTarget?.status === "ACTIVE" ? "Suspend" : "Activate"
        }
        variant={toggleTarget?.status === "ACTIVE" ? "danger" : "primary"}
        isLoading={isToggling}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete this store?"
        description={`"${deleteTarget?.name}" and all its data (products, orders, etc.) will be permanently removed. The owner account will be detached.`}
        confirmText="Delete Store"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}