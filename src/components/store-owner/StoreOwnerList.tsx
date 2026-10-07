"use client";

import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Plus,
  Search,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Store as StoreIcon,
  Mail,
  Phone,
  X,
  Info,
  ShieldCheck,
  ShieldOff,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  StoreOwnerUser,
  StoreOwnerStore,
  useGetAllStoreOwnersQuery,
  useDeleteStoreOwnerMutation,
  useToggleStoreOwnerStatusMutation,
  useGetStoreOwnerStatsQuery,
} from "@/redux/api/saas/storeOwnerApi";
import EditStoreOwnerModal from "./EditStoreOwnerModal";


/* ============ Helpers ============ */
const statusColors: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700 border-emerald-200",
  INACTIVE: "bg-gray-100 text-gray-600 border-gray-200",
  SUSPENDED: "bg-amber-50 text-amber-700 border-amber-200",
  EXPIRED: "bg-red-50 text-red-700 border-red-200",
};

function StoreStatusBadge({ status }: { status?: string }) {
  if (!status)
    return (
      <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-500">
        No Store
      </span>
    );
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        statusColors[status] || statusColors.INACTIVE
      )}
    >
      {status}
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

/* ============ Confirm Dialog ============ */
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

/* ============ View Modal ============ */
function ViewStoreOwnerModal({
  open,
  user,
  store,
  onClose,
}: {
  open: boolean;
  user: StoreOwnerUser | null;
  store: StoreOwnerStore | null;
  onClose: () => void;
}) {
  if (!user) return null;

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
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-lg font-bold text-white">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold text-gray-900">
                      {user.name}
                    </h2>
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {user.phone}
                    </span>
                  </div>
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
              {store ? (
                <>
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                      <span className="h-4 w-1 rounded-full bg-emerald-500" />
                      Store Information
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <div className="divide-y divide-gray-100">
                        <Row label="Store Name" value={store.name} />
                        <Row label="Store Code" value={store.storeCode} mono />
                        <Row label="Slug" value={`/${store.slug}`} mono />
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm text-gray-500">Status</span>
                          <StoreStatusBadge status={store.status} />
                        </div>
                        {store.email && <Row label="Store Email" value={store.email} />}
                        {store.phone && <Row label="Store Phone" value={store.phone} />}
                        {store.address && <Row label="Address" value={store.address} />}
                        {store.district && <Row label="District" value={store.district} />}
                        {store.package && (
                          <>
                            <Row label="Package" value={store.package.name} />
                            <Row
                              label="Subscription"
                              value={
                                store.subscriptionStartAt && store.subscriptionEndAt
                                  ? `${new Date(
                                      store.subscriptionStartAt
                                    ).toLocaleDateString("en-GB")} → ${new Date(
                                      store.subscriptionEndAt
                                    ).toLocaleDateString("en-GB")}`
                                  : "Not started"
                              }
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-6 text-center">
                  <StoreIcon className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    No store linked to this account
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  <span>
                    Created:{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleString("en-GB", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })
                      : "—"}
                  </span>
                </div>
              </div>
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

function Row({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <span className="text-sm text-gray-500">{label}</span>
      <span
        className={cn(
          "truncate text-right text-sm font-semibold text-gray-900",
          mono && "font-mono"
        )}
      >
        {value}
      </span>
    </div>
  );
}

/* ============ MAIN ============ */
export default function StoreOwnerList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const [viewTarget, setViewTarget] = useState<{
    user: StoreOwnerUser;
    store: StoreOwnerStore | null;
  } | null>(null);
  const [editTarget, setEditTarget] = useState<{
    user: StoreOwnerUser;
    store: StoreOwnerStore | null;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StoreOwnerUser | null>(null);
  const [toggleTarget, setToggleTarget] = useState<StoreOwnerUser | null>(null);

  const { data, isLoading, isFetching } = useGetAllStoreOwnersQuery({
    page,
    limit,
    search,
    isActive: statusFilter,
  });

  const { data: statsData } = useGetStoreOwnerStatsQuery(undefined);

  const [deleteStoreOwner, { isLoading: isDeleting }] = useDeleteStoreOwnerMutation();
  const [toggleStatus, { isLoading: isToggling }] = useToggleStoreOwnerStatusMutation();

  const users: any[] = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteStoreOwner(deleteTarget.id).unwrap();
      toast.success("Store owner deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      await toggleStatus({
        id: toggleTarget.id,
        isActive: !toggleTarget.isActive,
      }).unwrap();
      toast.success(
        `Store owner ${!toggleTarget.isActive ? "activated" : "deactivated"}`
      );
      setToggleTarget(null);
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
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <Users className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Store Owners
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manage all store owners registered on the platform.
              </p>
            </div>
          </div>

          <Link
            href="/admin/users/store-owners/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f3a33]"
          >
            <Plus className="h-4 w-4" />
            Add Store Owner
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={Users}
            label="Total Owners"
            value={stats?.total ?? "—"}
            accent="#10b981"
          />
          <StatCard
            icon={ShieldCheck}
            label="Active Owners"
            value={stats?.active ?? "—"}
            accent="#3b82f6"
          />
          <StatCard
            icon={ShieldOff}
            label="Inactive Owners"
            value={stats?.inactive ?? "—"}
            accent="#f59e0b"
          />
          <StatCard
            icon={StoreIcon}
            label="Active Stores"
            value={stats?.activeStores ?? "—"}
            accent="#8b5cf6"
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
                placeholder="Search by name, email or phone..."
                className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-10 pr-24 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg bg-[#0b2b26] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#0f3a33]"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              {(["", "true", "false"] as const).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setStatusFilter(key);
                    setPage(1);
                  }}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors",
                    statusFilter === key
                      ? "bg-[#0b2b26] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {key === "" ? "All" : key === "true" ? "Active" : "Inactive"}
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
                    Owner
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Store
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Store Status
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Account
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No store owners yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Create your first store owner to get started.
                        </p>
                        <Link
                          href="/admin/users/store-owners/new"
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
                        >
                          <Plus className="h-4 w-4" />
                          Add Store Owner
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {users.map((u: any, idx: number) => (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {u.name}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                ID #{u.id}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="truncate text-xs text-gray-700">
                            {u.email}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {u.phone}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          {u.store ? (
                            <>
                              <p className="truncate font-semibold text-gray-900">
                                {u.store.name}
                              </p>
                              <p className="truncate font-mono text-[11px] text-gray-500">
                                /{u.store.slug}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">No store</p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <StoreStatusBadge status={u.store?.status} />
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => setToggleTarget(u)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                              u.isActive
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                u.isActive ? "bg-emerald-500" : "bg-gray-400"
                              )}
                            />
                            {u.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() =>
                                setViewTarget({ user: u, store: u.store })
                              }
                              title="View"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setToggleTarget(u)}
                              title={u.isActive ? "Deactivate" : "Activate"}
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                              {u.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                setEditTarget({ user: u, store: u.store })
                              }
                              title="Edit"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(u)}
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
      <ViewStoreOwnerModal
        open={!!viewTarget}
        user={viewTarget?.user || null}
        store={viewTarget?.store || null}
        onClose={() => setViewTarget(null)}
      />

      <EditStoreOwnerModal
        open={!!editTarget}
        user={editTarget?.user || null}
        store={editTarget?.store || null}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete store owner?"
        description={`This will permanently delete "${deleteTarget?.name}" and their store. This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={
          toggleTarget?.isActive
            ? "Deactivate store owner?"
            : "Activate store owner?"
        }
        description={
          toggleTarget?.isActive
            ? `"${toggleTarget?.name}" will no longer be able to log in.`
            : `"${toggleTarget?.name}" will be able to log in again.`
        }
        confirmText={toggleTarget?.isActive ? "Deactivate" : "Activate"}
        variant="primary"
        isLoading={isToggling}
        onConfirm={handleToggle}
        onCancel={() => setToggleTarget(null)}
      />
    </div>
  );
}