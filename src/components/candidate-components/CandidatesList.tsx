// @/app/admin/candidates/CandidatesList.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  XCircle,
  Loader2,
  UserX,
  Pencil,
  RotateCw,
  Image as ImageIcon,
  Phone,
  CreditCard,
  Briefcase,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

import {
  useGetAllCandidatesQuery,
  useCancelCandidateMutation,
  useDeleteCandidateMutation,
  GetCandidatesParams,
} from "@/redux/api/candidates/candidateApi";
import ConfirmModal, { ConfirmVariant } from "../reusable-components/ConfirmModal";
import DataTable, { Column } from "@/components/reusable-components/DataTable";

/* ============================================================
   CONSTANTS
============================================================ */

const TRADES = [
  "HELPER", "MASON", "CARPENTER", "STEEL FIXER", "ELECTRICIAN",
  "PLUMBER", "WELDER", "PAINTER", "DRIVER", "CLEANER",
  "SECURITY GUARD", "COOK", "OTHER",
];

const CANDIDATE_STATUSES = [
  "registered", "selected", "cancelled", "medically_fit", "medically_unfit",
  "visa_stamped", "training_completed", "bmet_completed", "ticketed",
  "flown", "flight_missed", "deployed",
];

const STATUS_COLORS: Record<string, string> = {
  registered: "bg-gray-800 text-gray-300 border-gray-700",
  selected: "bg-blue-900/30 text-blue-300 border-blue-800",
  cancelled: "bg-red-900/30 text-red-300 border-red-800",
  medically_fit: "bg-green-900/30 text-green-300 border-green-800",
  medically_unfit: "bg-red-900/30 text-red-300 border-red-800",
  visa_stamped: "bg-purple-900/30 text-purple-300 border-purple-800",
  training_completed: "bg-indigo-900/30 text-indigo-300 border-indigo-800",
  bmet_completed: "bg-cyan-900/30 text-cyan-300 border-cyan-800",
  ticketed: "bg-amber-900/30 text-amber-300 border-amber-800",
  flown: "bg-teal-900/30 text-teal-300 border-teal-800",
  flight_missed: "bg-orange-900/30 text-orange-300 border-orange-800",
  deployed: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
};

/* ============================================================
   TABLE STYLING (zebra rows, no row hover)
   - Odd rows  : solid card color
   - Even rows : slightly lighter tint
   - Hover state is pinned to the same color, so rows never react
============================================================ */

const TABLE_STYLES = [
  // header
  "[&_thead_tr]:bg-gray-950/60",

  // odd rows
  "[&_tbody_tr:nth-child(odd)]:bg-gray-900",
  "[&_tbody_tr:nth-child(odd):hover]:bg-gray-900",

  // even rows
  "[&_tbody_tr:nth-child(even)]:bg-gray-800/50",
  "[&_tbody_tr:nth-child(even):hover]:bg-gray-800/50",

  // subtle, clean row separators + no pointer cursor on rows
  "[&_tbody_tr]:border-b [&_tbody_tr]:border-gray-800/60",
  "[&_tbody_tr:last-child]:border-b-0",
  "[&_tbody_tr]:cursor-default",
].join(" ");

/* ============================================================
   MODAL STATE
============================================================ */

type ModalMode = "cancel" | "delete" | null;

interface ModalState {
  mode: ModalMode;
  candidateId: number | null;
  candidateName: string;
  reason: string;
}

const INITIAL_MODAL_STATE: ModalState = {
  mode: null,
  candidateId: null,
  candidateName: "",
  reason: "",
};

/* ============================================================
   AVATAR COMPONENT
============================================================ */

function CandidateAvatar({
  photo,
  name,
  size = 40,
}: {
  photo: string | null;
  name: string;
  size?: number;
}) {
  const [errored, setErrored] = useState(false);
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const palette = [
    "from-blue-600 to-indigo-600",
    "from-emerald-600 to-teal-600",
    "from-purple-600 to-pink-600",
    "from-amber-600 to-orange-600",
    "from-cyan-600 to-blue-600",
  ];
  const colorIdx =
    name.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % palette.length;

  if (photo && !errored) {
    return (
      <img
        src={photo}
        alt={name}
        onError={() => setErrored(true)}
        className="rounded-full object-cover ring-2 ring-gray-700"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-gradient-to-br ${palette[colorIdx]} flex items-center justify-center text-white font-semibold ring-2 ring-gray-700 select-none`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || "?"}
    </div>
  );
}

/* ============================================================
   COMPONENT
============================================================ */

export default function CandidatesList() {
  const [filters, setFilters] = useState<GetCandidatesParams>({
    page: 1,
    limit: 10,
    search: "",
    trade: "",
    candidateStatus: "",
    sortBy: "createdAt",
    sortOrder: "DESC",
  });

  const { data, isLoading, isFetching, refetch } = useGetAllCandidatesQuery(filters);

  const [cancelCandidate, { isLoading: isCancelling }] = useCancelCandidateMutation();
  const [deleteCandidate, { isLoading: isDeleting }] = useDeleteCandidateMutation();

  const candidates: any[] = data?.data ?? [];
  const pagination = data?.pagination;

  /* ---------- Search debounce ---------- */
  const [searchInput, setSearchInput] = useState("");
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((p) => ({ ...p, search: searchInput, page: 1 }));
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  /* ---------- Modal ---------- */
  const [modal, setModal] = useState<ModalState>(INITIAL_MODAL_STATE);

  const closeModal = () => {
    if (isCancelling || isDeleting) return;
    setModal(INITIAL_MODAL_STATE);
  };

  const openCancelModal = (id: number, name: string) =>
    setModal({ mode: "cancel", candidateId: id, candidateName: name, reason: "" });

  const openDeleteModal = (id: number, name: string) =>
    setModal({ mode: "delete", candidateId: id, candidateName: name, reason: "" });

  /* ---------- Handlers ---------- */
  const handleFilterChange = (key: keyof GetCandidatesParams, value: any) => {
    setFilters((p) => ({ ...p, [key]: value, page: 1 }));
  };

  const handleConfirm = async () => {
    if (modal.mode === "cancel" && modal.candidateId) {
      try {
        await cancelCandidate({
          id: modal.candidateId,
          cancellationReason: modal.reason.trim() || "No reason provided",
        }).unwrap();
        toast.success("Candidate cancelled.");
        setModal(INITIAL_MODAL_STATE);
        refetch();
      } catch {
        toast.error("Failed to cancel.");
      }
    } else if (modal.mode === "delete" && modal.candidateId) {
      try {
        await deleteCandidate(modal.candidateId).unwrap();
        toast.success("Candidate deleted.");
        setModal(INITIAL_MODAL_STATE);
        refetch();
      } catch {
        toast.error("Failed to delete.");
      }
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      trade: "",
      candidateStatus: "",
      sortBy: "createdAt",
      sortOrder: "DESC",
    });
  };

  const hasActiveFilters =
    !!filters.search || !!filters.trade || !!filters.candidateStatus;

  /* ---------- Table Columns ---------- */
  const columns: Column<any>[] = [
    /* ---------- Candidate (photo + name + code) ---------- */
    {
      key: "candidate",
      header: "Candidate",
      width: "260px",
      render: (c) => (
        <div className="flex items-center gap-3">
          <CandidateAvatar photo={c.photo} name={c.fullName || "?"} />
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">
              {c.fullName || "—"}
            </p>
            <p className="font-mono text-[11px] text-gray-500 mt-0.5">
              {c.candidateCode}
            </p>
          </div>
        </div>
      ),
    },

    /* ---------- Passport ---------- */
    {
      key: "passportNumber",
      header: "Passport",
      width: "140px",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <CreditCard className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
          <span className="font-mono text-xs text-gray-300 uppercase">
            {c.passportNumber || "—"}
          </span>
        </div>
      ),
    },

    /* ---------- NID ---------- */
    {
      key: "nidNumber",
      header: "NID",
      width: "150px",
      render: (c) => (
        <span className="font-mono text-xs text-gray-400">
          {c.nidNumber || "—"}
        </span>
      ),
    },

    /* ---------- Mobile ---------- */
    {
      key: "mobile",
      header: "Mobile",
      width: "140px",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Phone className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
          <span className="text-gray-300 text-xs">{c.mobile || "—"}</span>
        </div>
      ),
    },

    /* ---------- Trade ---------- */
    {
      key: "trade",
      header: "Trade",
      width: "140px",
      render: (c) => (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border border-gray-700 bg-gray-800 text-gray-300">
          <Briefcase className="h-3 w-3" />
          {c.trade || "—"}
        </span>
      ),
    },

    /* ---------- Destination ---------- */
    {
      key: "destination",
      header: "Destination",
      width: "140px",
      render: (c) => (
        <div className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
          <span className="text-xs text-gray-300 truncate">
            {c.destination || "—"}
          </span>
        </div>
      ),
    },

    /* ---------- Reference ---------- */
    {
      key: "reference",
      header: "Reference",
      width: "120px",
      render: (c) => (
        <span className="text-xs text-gray-400 truncate">
          {c.reference || "—"}
        </span>
      ),
    },

    /* ---------- Status ---------- */
    {
      key: "candidateStatus",
      header: "Status",
      width: "140px",
      align: "center",
      render: (c) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide border ${
            STATUS_COLORS[c.candidateStatus ?? "registered"] ||
            "bg-gray-800 text-gray-300 border-gray-700"
          }`}
        >
          {(c.candidateStatus ?? "registered")
            .replace(/_/g, " ")
            .toUpperCase()}
        </span>
      ),
    },

    /* ---------- Actions ---------- */
    {
      key: "actions",
      header: "Actions",
      width: "170px",
      align: "right",
      render: (c) => (
        <div className="flex justify-end gap-1">
          <Link href={`/admin/candidates/candidate-profile/${c.id}`}>
            <button
              title="View 360°"
              className="p-1.5 rounded-md text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 transition-colors"
            >
              <Eye className="h-4 w-4" />
            </button>
          </Link>

          <Link href={`/admin/candidates/candidate-profile/edit/${c.id}`}>
            <button
              title="Edit"
              className="p-1.5 rounded-md text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/20 transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </Link>

          <button
            title="Cancel"
            onClick={(e) => {
              e.stopPropagation();
              openCancelModal(c.id, c.fullName || "");
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-yellow-400 hover:bg-yellow-900/20 transition-colors"
          >
            <XCircle className="h-4 w-4" />
          </button>

          <button
            title="Delete"
            onClick={(e) => {
              e.stopPropagation();
              openDeleteModal(c.id, c.fullName || "");
            }}
            className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-red-900/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  /* ---------- Modal config ---------- */
  const modalConfig = (() => {
    if (modal.mode === "cancel") {
      return {
        variant: "warning" as ConfirmVariant,
        title: "Cancel Candidate?",
        description: `Are you sure you want to cancel "${modal.candidateName}"? This will mark them as cancelled.`,
        confirmText: "Yes, Cancel",
        cancelText: "No, Keep",
        withInput: true,
        inputLabel: "Cancellation Reason (optional)",
        inputPlaceholder: "e.g. Not willing to proceed",
      };
    }
    if (modal.mode === "delete") {
      return {
        variant: "danger" as ConfirmVariant,
        title: "Delete Candidate?",
        description: `This will permanently delete "${modal.candidateName}". This action cannot be undone.`,
        confirmText: "Yes, Delete",
        cancelText: "Cancel",
        withInput: false,
        inputLabel: "",
        inputPlaceholder: "",
      };
    }
    return null;
  })();

  return (
    <>
      <div className="space-y-4 text-white">
        {/* ---------- Filters ---------- */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name, passport, mobile, code..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>

            {/* Trade */}
            <select
              value={filters.trade || "all"}
              onChange={(e) =>
                handleFilterChange("trade", e.target.value === "all" ? "" : e.target.value)
              }
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Trades</option>
              {TRADES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            {/* Status */}
            <select
              value={filters.candidateStatus || "all"}
              onChange={(e) =>
                handleFilterChange(
                  "candidateStatus",
                  e.target.value === "all" ? "" : e.target.value
                )
              }
              className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All Statuses</option>
              {CANDIDATE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-400">Filters active</span>
              <button
                onClick={clearFilters}
                className="text-sm text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </motion.div>

        {/* ---------- Table Container ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden shadow-xl shadow-black/20"
        >
          {/* Header bar */}
          <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <UserX className="h-4 w-4 text-blue-400" />
                All Candidates
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {pagination
                  ? `${pagination.totalItems} candidate(s) found`
                  : "Loading..."}
              </p>
            </div>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 hover:border-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {/* Table (zebra rows, hover disabled) */}
          <div className={TABLE_STYLES}>
            <DataTable
              columns={columns}
              data={candidates}
              isLoading={isLoading}
              getRowKey={(c) => c.id}
              showSerial
              serialOffset={
                pagination
                  ? (pagination.currentPage - 1) * pagination.itemsPerPage
                  : 0
              }
              emptyMessage="No candidates found"
              emptyIcon={
                <UserX className="h-10 w-10 mx-auto text-gray-600 mb-3" />
              }
              pagination={
                pagination
                  ? {
                      currentPage: pagination.currentPage,
                      totalPages: pagination.totalPages,
                      totalItems: pagination.totalItems,
                      itemsPerPage: pagination.itemsPerPage,
                      onPageChange: (page) =>
                        setFilters((p) => ({ ...p, page })),
                      onLimitChange: (limit) =>
                        setFilters((p) => ({ ...p, limit, page: 1 })),
                      limitOptions: [10, 20, 30, 50, 100, 300, 500, 1000, 2000, 5000],
                    }
                  : undefined
              }
            />
          </div>
        </motion.div>
      </div>

      {/* ---------- Modal ---------- */}
      {modalConfig && (
        <ConfirmModal
          isOpen={modal.mode !== null}
          onClose={closeModal}
          onConfirm={handleConfirm}
          title={modalConfig.title}
          description={modalConfig.description}
          confirmText={modalConfig.confirmText}
          cancelText={modalConfig.cancelText}
          variant={modalConfig.variant}
          isLoading={isCancelling || isDeleting}
          withInput={modalConfig.withInput}
          inputValue={modal.reason}
          onInputChange={(v) => setModal((m) => ({ ...m, reason: v }))}
          inputLabel={modalConfig.inputLabel}
          inputPlaceholder={modalConfig.inputPlaceholder}
        />
      )}
    </>
  );
}