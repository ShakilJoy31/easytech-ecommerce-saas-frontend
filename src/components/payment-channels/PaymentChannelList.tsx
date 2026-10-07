"use client";

import { useState, FormEvent, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Wallet,
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
  Building2,
  Landmark,
  Smartphone,
  User as UserIcon,
  X,
  Info,
  Copy,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { cn } from "@/lib/utils";
import {
  PaymentChannel,
  useGetAllPaymentChannelsQuery,
  useDeletePaymentChannelMutation,
  useTogglePaymentChannelStatusMutation,
  useUpdatePaymentChannelMutation,
} from "@/redux/api/saas/paymentChannelApi";

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
function ViewChannelModal({
  open,
  channel,
  onClose,
}: {
  open: boolean;
  channel: PaymentChannel | null;
  onClose: () => void;
}) {
  if (!channel) return null;

  const rows = [
    { label: "Account Type", value: channel.accountTypeLabel || channel.accountType },
    { label: "Account Number", value: channel.accountNumber, copy: true },
    { label: "Account Holder", value: channel.accountHolderName || "—" },
    { label: "Bank Name", value: channel.bankName || "—" },
    { label: "Branch", value: channel.branchName || "—" },
    { label: "Routing", value: channel.routingNumber || "—" },
    { label: "Display Order", value: String(channel.displayOrder) },
  ];

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
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
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      {channel.name}
                    </h2>
                    {channel.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">/{channel.slug}</p>
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
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <div className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center justify-between px-4 py-3"
                    >
                      <span className="text-sm text-gray-500">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          {row.value}
                        </span>
                        {row.copy && row.value && row.value !== "—" && (
                          <button
                            type="button"
                            onClick={() => handleCopy(row.value)}
                            className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-emerald-700"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {channel.instructions && (
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900">
                    <span className="h-4 w-1 rounded-full bg-emerald-500" />
                    Instructions
                  </h3>
                  <p className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
                    {channel.instructions}
                  </p>
                </div>
              )}

              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <Info className="h-3.5 w-3.5" />
                  <span>
                    Created:{" "}
                    {channel.createdAt
                      ? new Date(channel.createdAt).toLocaleString("en-GB", {
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

/* ============ Edit Modal ============ */
type AccountType = "PERSONAL" | "MERCHANT" | "AGENT" | "BANK";

interface EditFormState {
  name: string;
  slug: string;
  accountType: AccountType;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  branchName: string;
  routingNumber: string;
  instructions: string;
  displayOrder: number;
  isActive: boolean;
}

function EditChannelModal({
  open,
  channel,
  onClose,
}: {
  open: boolean;
  channel: PaymentChannel | null;
  onClose: () => void;
}) {
  const [form, setForm] = useState<EditFormState>({
    name: "",
    slug: "",
    accountType: "PERSONAL",
    accountNumber: "",
    accountHolderName: "",
    bankName: "",
    branchName: "",
    routingNumber: "",
    instructions: "",
    displayOrder: 0,
    isActive: true,
  });

  const [updateChannel, { isLoading: isUpdating }] = useUpdatePaymentChannelMutation();

  useEffect(() => {
    if (channel) {
      setForm({
        name: channel.name || "",
        slug: channel.slug || "",
        accountType: channel.accountType || "PERSONAL",
        accountNumber: channel.accountNumber || "",
        accountHolderName: channel.accountHolderName || "",
        bankName: channel.bankName || "",
        branchName: channel.branchName || "",
        routingNumber: channel.routingNumber || "",
        instructions: channel.instructions || "",
        displayOrder: channel.displayOrder ?? 0,
        isActive: channel.isActive ?? true,
      });
    }
  }, [channel]);

  if (!channel) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : name === "displayOrder"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      // Exclude `slug` since it's not part of UpdateChannelInput.
      const { slug, ...payload } = form;

      await updateChannel({ id: channel.id, ...payload }).unwrap();
      toast.success("Channel updated successfully");
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update channel");
    }
  };

  const accountTypes: { value: AccountType; label: string }[] = [
    { value: "PERSONAL", label: "Personal" },
    { value: "MERCHANT", label: "Merchant" },
    { value: "AGENT", label: "Agent" },
    { value: "BANK", label: "Bank" },
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
            className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-br from-emerald-50 to-white p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white">
                  <Pencil className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Edit Channel</h2>
                  <p className="text-xs text-gray-500">
                    Update details for "{channel.name}"
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
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <div className="space-y-5 p-6">
                {/* Name + Slug */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Channel Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g., bKash Personal"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Slug
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={form.slug}
                      onChange={handleChange}
                      placeholder="e.g., bkash-personal"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
                    <p className="mt-1 text-[10px] text-gray-400">
                      Slug is managed by the server and not submitted.
                    </p>
                  </div>
                </div>

                {/* Account Type + Display Order */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Account Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="accountType"
                      value={form.accountType}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    >
                      {accountTypes.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="displayOrder"
                      value={form.displayOrder}
                      onChange={handleChange}
                      min={0}
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>

                {/* Account Number + Holder */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={form.accountNumber}
                      onChange={handleChange}
                      required
                      placeholder="e.g., 017XXXXXXXX"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      name="accountHolderName"
                      value={form.accountHolderName}
                      onChange={handleChange}
                      placeholder="e.g., John Doe"
                      className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                    />
                  </div>
                </div>

                {/* Bank fields (only show when accountType is BANK) */}
                {form.accountType === "BANK" && (
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={form.bankName}
                        onChange={handleChange}
                        placeholder="e.g., BRAC Bank"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        Branch Name
                      </label>
                      <input
                        type="text"
                        name="branchName"
                        value={form.branchName}
                        onChange={handleChange}
                        placeholder="e.g., Gulshan"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                        Routing Number
                      </label>
                      <input
                        type="text"
                        name="routingNumber"
                        value={form.routingNumber}
                        onChange={handleChange}
                        placeholder="e.g., 123456789"
                        className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15"
                      />
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-gray-700">
                    Instructions
                  </label>
                  <textarea
                    name="instructions"
                    value={form.instructions}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Payment instructions for store owners..."
                    className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm focus:border-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-500/15 resize-none"
                  />
                </div>

                {/* Active toggle */}
                <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Active Status
                    </p>
                    <p className="text-xs text-gray-500">
                      When active, this channel is visible to store owners.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({ ...prev, isActive: !prev.isActive }))
                    }
                    className={cn(
                      "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      form.isActive ? "bg-emerald-600" : "bg-gray-300"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        form.isActive ? "translate-x-5" : "translate-x-0"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-2 border-t border-gray-100 bg-gray-50 p-4">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isUpdating}
                  className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#0f3a33] disabled:opacity-50"
                >
                  {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ============ Stat Card ============ */
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

/* ============ Skeleton ============ */
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

/* ============ Type Icon ============ */
function TypeIcon({ type }: { type: string }) {
  const map: Record<string, any> = {
    PERSONAL: Smartphone,
    MERCHANT: Building2,
    AGENT: UserIcon,
    BANK: Landmark,
  };
  const Icon = map[type] || Wallet;
  return <Icon className="h-4 w-4" />;
}

/* ============ MAIN ============ */
export default function PaymentChannelList() {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const [viewTarget, setViewTarget] = useState<PaymentChannel | null>(null);
  const [editTarget, setEditTarget] = useState<PaymentChannel | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PaymentChannel | null>(null);
  const [toggleTarget, setToggleTarget] = useState<PaymentChannel | null>(null);

  const { data, isLoading, isFetching } = useGetAllPaymentChannelsQuery({
    page,
    limit,
    search,
    isActive: statusFilter,
  });

  const [deleteChannel, { isLoading: isDeleting }] = useDeletePaymentChannelMutation();
  const [toggleChannel, { isLoading: isToggling }] = useTogglePaymentChannelStatusMutation();

  const channels: PaymentChannel[] = data?.data || [];
  const pagination = data?.pagination;

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteChannel(deleteTarget.id).unwrap();
      toast.success("Channel deleted successfully");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to delete");
    }
  };

  const handleToggle = async () => {
    if (!toggleTarget) return;
    try {
      await toggleChannel({
        id: toggleTarget.id,
        isActive: !toggleTarget.isActive,
      }).unwrap();
      toast.success(`Channel ${!toggleTarget.isActive ? "activated" : "deactivated"}`);
      setToggleTarget(null);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update");
    }
  };

  const pageStats = {
    total: pagination?.totalItems || 0,
    active: channels.filter((c) => c.isActive).length,
    inactive: channels.filter((c) => !c.isActive).length,
    banks: channels.filter((c) => c.accountType === "BANK").length,
  };

  const totalPages = pagination?.totalPages || 1;

  return (
    <div className="min-h-screen w-full min-w-0 bg-gray-50 text-gray-900">
      <div className="space-y-4 p-3 md:space-y-6 md:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 p-2">
              <Wallet className="h-5 w-5 text-emerald-700" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl">
                Payment Channels
              </h1>
              <p className="hidden text-xs text-gray-500 sm:block">
                Manage channels store owners use to submit manual payments.
              </p>
            </div>
          </div>

          <Link
            href="/admin/payment-channels/new"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#0f3a33]"
          >
            <Plus className="h-4 w-4" />
            Add Channel
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          <StatCard icon={Wallet} label="Total Channels" value={pageStats.total} accent="#10b981" />
          <StatCard icon={Check} label="Active (page)" value={pageStats.active} accent="#3b82f6" />
          <StatCard icon={EyeOff} label="Inactive (page)" value={pageStats.inactive} accent="#f59e0b" />
          <StatCard icon={Landmark} label="Bank Channels" value={pageStats.banks} accent="#8b5cf6" />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <form onSubmit={handleSearch} className="relative w-full md:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search channels..."
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
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Channel</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Account</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Order</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                ) : channels.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                          <Wallet className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-base font-semibold text-gray-900">
                          No payment channels yet
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Add bKash, Nagad, or bank channels for store owners.
                        </p>
                        <Link
                          href="/admin/payment-channels/new"
                          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0b2b26] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#0f3a33]"
                        >
                          <Plus className="h-4 w-4" />
                          Add Channel
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  <AnimatePresence mode="popLayout">
                    {channels.map((channel, idx) => (
                      <motion.tr
                        key={channel.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className="border-b border-gray-100 last:border-0 transition-colors hover:bg-gray-50/60"
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-white">
                              {channel.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-gray-900">
                                {channel.name}
                              </p>
                              <p className="truncate text-xs text-gray-500">
                                /{channel.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                            <TypeIcon type={channel.accountType} />
                            {channel.accountTypeLabel || channel.accountType}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-mono text-sm font-medium text-gray-900">
                            {channel.accountNumber}
                          </p>
                          {channel.accountHolderName && (
                            <p className="truncate text-xs text-gray-500">
                              {channel.accountHolderName}
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
                            {channel.displayOrder}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <button
                            onClick={() => setToggleTarget(channel)}
                            className={cn(
                              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors",
                              channel.isActive
                                ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            )}
                          >
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full",
                                channel.isActive ? "bg-emerald-500" : "bg-gray-400"
                              )}
                            />
                            {channel.isActive ? "Active" : "Inactive"}
                          </button>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setViewTarget(channel)}
                              title="View"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setToggleTarget(channel)}
                              title={channel.isActive ? "Deactivate" : "Activate"}
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                            >
                              {channel.isActive ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Check className="h-4 w-4" />
                              )}
                            </button>
                            <button
                              onClick={() => setEditTarget(channel)}
                              title="Edit"
                              className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget(channel)}
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
      <ViewChannelModal
        open={!!viewTarget}
        channel={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <EditChannelModal
        open={!!editTarget}
        channel={editTarget}
        onClose={() => setEditTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete channel?"
        description={`This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmDialog
        open={!!toggleTarget}
        title={toggleTarget?.isActive ? "Deactivate channel?" : "Activate channel?"}
        description={
          toggleTarget?.isActive
            ? `"${toggleTarget?.name}" will no longer be visible to store owners.`
            : `"${toggleTarget?.name}" will become available for payment.`
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