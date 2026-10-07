"use client";

import { useState, useEffect, FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Receipt,
  Search,
  Loader2,
  AlertCircle,
  Check,
  X,
  Eye,
  ChevronLeft,
  ChevronRight,
  Clock,
  ShieldCheck,
  Wallet,
  TrendingUp,
  Copy,
  Info,
  Store as StoreIcon,
  Package as PackageIcon,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  useGetAllManualPaymentsQuery,
  useVerifyManualPaymentMutation,
  useRejectManualPaymentMutation,
  useGetManualPaymentStatsQuery,
} from "@/redux/api/saas/manualPaymentApi";

/* =========================================================================
   Status pill
========================================================================= */
function StatusPill({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string; label: string }> = {
    PENDING: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      dot: "bg-amber-500",
      label: "Pending",
    },
    VERIFIED: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      dot: "bg-emerald-500",
      label: "Verified",
    },
    REJECTED: {
      bg: "bg-red-50",
      text: "text-red-700",
      dot: "bg-red-500",
      label: "Rejected",
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

/* =========================================================================
   View Modal
========================================================================= */
function ViewPaymentModal({
  open,
  payment,
  onClose,
  onVerifyClick,
  onRejectClick,
}: {
  open: boolean;
  payment: any;
  onClose: () => void;
  onVerifyClick: () => void;
  onRejectClick: () => void;
}) {
  if (!payment) return null;

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success("Copied");
  };

  const rows = [
    { label: "Payment Code", value: payment.paymentCode, mono: true, copy: true },
    { label: "Transaction ID", value: payment.transactionId, mono: true, copy: true },
    { label: "Account Number", value: payment.accountNumber, mono: true, copy: true },
    {
      label: "Sender Account",
      value: payment.senderAccountNumber || "—",
      mono: !!payment.senderAccountNumber,
    },
    {
      label: "Amount",
      value: `${payment.currency === "BDT" ? "৳" : payment.currency}${Number(
        payment.amount
      ).toLocaleString("en-US")}`,
    },
    {
      label: "Payment Date",
      value: payment.paymentDate
        ? new Date(payment.paymentDate).toLocaleDateString("en-GB", {
            dateStyle: "medium",
          })
        : "—",
    },
    {
      label: "Submitted At",
      value: new Date(payment.createdAt).toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      }),
    },
  ];

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
            className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Payment Details
                    </h2>
                    <StatusPill status={payment.status} />
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-gray-500">
                    {payment.paymentCode}
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
              {/* Store + Package cards */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {payment.store && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <StoreIcon className="h-3.5 w-3.5 text-gray-500" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Store
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {payment.store.name}
                    </p>
                    <p className="text-xs text-gray-500">/{payment.store.slug}</p>
                    <div className="mt-2">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                          payment.store.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-700"
                            : payment.store.status === "INACTIVE"
                            ? "bg-gray-200 text-gray-700"
                            : "bg-amber-100 text-amber-700"
                        )}
                      >
                        {payment.store.status}
                      </span>
                    </div>
                  </div>
                )}

                {payment.package && (
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <PackageIcon className="h-3.5 w-3.5 text-gray-500" />
                      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                        Package
                      </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">
                      {payment.package.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {payment.package.durationDay} days ·{" "}
                      {payment.package.currency === "BDT"
                        ? "৳"
                        : payment.package.currency}
                      {Number(payment.package.price).toLocaleString("en-US")}
                    </p>
                  </div>
                )}
              </div>

              {/* Details table */}
              <div>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                  <span className="h-4 w-1 rounded-full bg-emerald-500" />
                  Payment Information
                </h3>
                <div className="overflow-hidden rounded-xl border border-gray-200">
                  <div className="divide-y divide-gray-100">
                    {rows.map((row) => (
                      <div
                        key={row.label}
                        className="flex items-center justify-between gap-3 px-4 py-3"
                      >
                        <span className="text-sm text-gray-500">
                          {row.label}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-right text-sm font-semibold text-gray-900",
                              row.mono && "font-mono"
                            )}
                          >
                            {row.value}
                          </span>
                          {row.copy && row.value && row.value !== "—" && (
                            <button
                              onClick={() => handleCopy(row.value)}
                              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-emerald-700"
                            >
                              <Copy className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Channel */}
              {payment.channel && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Payment Channel
                  </h3>
                  <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-emerald-700" />
                      <p className="text-sm font-bold text-gray-900">
                        {payment.channel.name}
                      </p>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        {payment.channel.accountType}
                      </span>
                    </div>
                    <p className="mt-1 font-mono text-xs text-gray-600">
                      {payment.channel.accountNumber}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes / Rejection reason */}
              {payment.notes && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Notes
                  </h3>
                  <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {payment.notes}
                  </p>
                </div>
              )}

              {payment.status === "REJECTED" && payment.rejectionReason && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                    <span className="h-4 w-1 rounded-full bg-red-500" />
                    Rejection Reason
                  </h3>
                  <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {payment.rejectionReason}
                  </p>
                </div>
              )}
            </div>

            {/* Footer actions */}
            <div className="flex flex-col gap-2 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:justify-between">
              <button
                onClick={onClose}
                className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
              >
                Close
              </button>

              {payment.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={onRejectClick}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={onVerifyClick}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700"
                  >
                    <Check className="h-4 w-4" />
                    Verify & Activate
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
   Verify Confirm Modal
========================================================================= */
function VerifyModal({
  open,
  payment,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  payment: any;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  isLoading: boolean;
}) {
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (open) setNotes("");
  }, [open]);

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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Verify & activate?
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This will activate the store{" "}
                    <b>{payment?.store?.name}</b> and start a{" "}
                    <b>{payment?.package?.durationDay}-day</b> subscription.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Notes <span className="text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="e.g. Verified in bKash app"
                  className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                />
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => onConfirm(notes)}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Verify & Activate
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* =========================================================================
   Reject Modal
========================================================================= */
function RejectModal({
  open,
  payment,
  onClose,
  onConfirm,
  isLoading,
}: {
  open: boolean;
  payment: any;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
      setError("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Please provide a reason");
      return;
    }
    onConfirm(reason.trim());
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
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    Reject this payment?
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Store owner will be notified and asked to submit a valid
                    payment.
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-sm font-semibold text-gray-800">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    if (error) setError("");
                  }}
                  rows={3}
                  placeholder="e.g. Transaction ID not found in bKash"
                  className={cn(
                    "w-full resize-none rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-4",
                    error
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500/15"
                      : "border-gray-200 focus:border-emerald-600 focus:ring-emerald-500/15"
                  )}
                />
                {error && (
                  <p className="mt-1 text-xs font-medium text-red-600">
                    {error}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 border-t border-gray-100 bg-gray-50 p-4">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
   MAIN
========================================================================= */
export default function ManualPaymentList() {
  const searchParams = useSearchParams();
  const initialStatus =
    (searchParams.get("status") as "" | "PENDING" | "VERIFIED" | "REJECTED") ||
    "";

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "" | "PENDING" | "VERIFIED" | "REJECTED"
  >(initialStatus);

  const [viewTarget, setViewTarget] = useState<any>(null);
  const [verifyTarget, setVerifyTarget] = useState<any>(null);
  const [rejectTarget, setRejectTarget] = useState<any>(null);

  const { data, isLoading, isFetching } = useGetAllManualPaymentsQuery({
    page,
    limit,
    search,
    status: statusFilter,
  });

  const { data: statsData } = useGetManualPaymentStatsQuery(undefined);

  const [verifyPayment, { isLoading: isVerifying }] = useVerifyManualPaymentMutation();
  const [rejectPayment, { isLoading: isRejecting }] = useRejectManualPaymentMutation();

  const payments = data?.data || [];
  const pagination = data?.pagination;
  const stats = statsData?.data;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  /* ---------- Verify ---------- */
  const handleVerify = async (notes: string) => {
    if (!verifyTarget) return;
    try {
      await verifyPayment({ id: verifyTarget.id, notes }).unwrap();
      toast.success("Payment verified! Store is now active.");
      setVerifyTarget(null);
      setViewTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to verify");
    }
  };

  /* ---------- Reject ---------- */
  const handleReject = async (reason: string) => {
    if (!rejectTarget) return;
    try {
      await rejectPayment({
        id: rejectTarget.id,
        rejectionReason: reason,
      }).unwrap();
      toast.success("Payment rejected");
      setRejectTarget(null);
      setViewTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to reject");
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
              <Receipt className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Manual Payments
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Verify payments and activate store subscriptions.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard
            icon={Receipt}
            label="Total Payments"
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
            icon={ShieldCheck}
            label="Verified"
            value={stats?.verified ?? "—"}
            accent="#3b82f6"
          />
          <StatCard
            icon={TrendingUp}
            label="Total Verified Amount"
            value={`৳${Number(stats?.totalVerifiedAmount || 0).toLocaleString(
              "en-US"
            )}`}
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
                placeholder="Search by code or transaction ID..."
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
                  { key: "VERIFIED", label: "Verified" },
                  { key: "REJECTED", label: "Rejected" },
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
                    Payment
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
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <Receipt className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No payments found
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Manual payments submitted by store owners appear here.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {payments.map((payment: any, idx: number) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                      >
                        {/* Payment code + trx */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl",
                                payment.status === "PENDING"
                                  ? "bg-amber-100 text-amber-700"
                                  : payment.status === "VERIFIED"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-red-100 text-red-700"
                              )}
                            >
                              {payment.status === "PENDING" ? (
                                <Clock className="h-4 w-4" />
                              ) : payment.status === "VERIFIED" ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <X className="h-4 w-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-mono text-xs font-semibold text-gray-900">
                                {payment.paymentCode}
                              </p>
                              <p className="truncate font-mono text-[11px] text-gray-500">
                                {payment.transactionId}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Store */}
                        <td className="px-4 py-4">
                          {payment.store ? (
                            <>
                              <p className="truncate font-semibold text-gray-900">
                                {payment.store.name}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                /{payment.store.slug}
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">—</p>
                          )}
                        </td>

                        {/* Package */}
                        <td className="px-4 py-4">
                          {payment.package ? (
                            <>
                              <p className="font-semibold text-gray-900">
                                {payment.package.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {payment.package.durationDay} days
                              </p>
                            </>
                          ) : (
                            <p className="text-xs text-gray-400">—</p>
                          )}
                        </td>

                        {/* Amount */}
                        <td className="px-4 py-4">
                          <p className="font-bold text-gray-900">
                            {payment.currency === "BDT"
                              ? "৳"
                              : payment.currency}
                            {Number(payment.amount).toLocaleString("en-US")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.createdAt).toLocaleDateString(
                              "en-GB",
                              { dateStyle: "short" }
                            )}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          <StatusPill status={payment.status} />
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(payment)}
                              title="View"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            {payment.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => setVerifyTarget(payment)}
                                  title="Verify"
                                  className="rounded-lg p-2 text-emerald-600 transition-colors hover:bg-emerald-50"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => setRejectTarget(payment)}
                                  title="Reject"
                                  className="rounded-lg p-2 text-red-500 transition-colors hover:bg-red-50"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
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

      {/* ============ Modals ============ */}
      <ViewPaymentModal
        open={!!viewTarget}
        payment={viewTarget}
        onClose={() => setViewTarget(null)}
        onVerifyClick={() => {
          setVerifyTarget(viewTarget);
          setViewTarget(null);
        }}
        onRejectClick={() => {
          setRejectTarget(viewTarget);
          setViewTarget(null);
        }}
      />

      <VerifyModal
        open={!!verifyTarget}
        payment={verifyTarget}
        onClose={() => setVerifyTarget(null)}
        onConfirm={handleVerify}
        isLoading={isVerifying}
      />

      <RejectModal
        open={!!rejectTarget}
        payment={rejectTarget}
        onClose={() => setRejectTarget(null)}
        onConfirm={handleReject}
        isLoading={isRejecting}
      />
    </div>
  );
}