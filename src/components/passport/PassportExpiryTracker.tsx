"use client";

import { useMemo, useState, useEffect } from "react";
import {
  Search,
  RefreshCw,
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Users,
  ChevronDown,
} from "lucide-react";

import {
  useGetPassportExpiryListQuery,
  PassportExpiryCandidate,
} from "@/redux/api/candidates/candidateApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import DataTable, {
  Column,
} from "@/components/reusable-components/DataTable";
import ExpirySummaryCard from "./ExpirySummaryCard";
import {
  CandidateCell,
  DaysCell,
  DestinationCell,
  ExpiryDateCell,
  PassportCell,
  TradeCell,
  ViewActionCell,
} from "./ExpiryCells";

type UrgencyFilter = "all" | "expired" | "critical" | "warning";

const DAY_OPTIONS = [
  { value: 30, label: "30 days" },
  { value: 60, label: "60 days" },
  { value: 90, label: "90 days" },
  { value: 180, label: "6 months" },
  { value: 365, label: "1 year" },
];

/* ============================================================
   COLUMN DEFINITIONS
============================================================ */

const columns: Column<PassportExpiryCandidate>[] = [
  {
    key: "days",
    header: "Days",
    width: "90px",
    render: (c) => <DaysCell candidate={c} />,
  },
  {
    key: "candidate",
    header: "Candidate",
    render: (c) => <CandidateCell candidate={c} />,
  },
  {
    key: "passportNumber",
    header: "Passport No.",
    width: "180px",
    render: (c) => <PassportCell candidate={c} />,
  },
  {
    key: "country",
    header: "Destination",
    width: "160px",
    render: (c) => <DestinationCell candidate={c} />,
  },
  {
    key: "trade",
    header: "Trade",
    width: "160px",
    render: (c) => <TradeCell candidate={c} />,
  },
  {
    key: "passportExpiryDate",
    header: "Expiry Date",
    width: "150px",
    render: (c) => <ExpiryDateCell candidate={c} />,
  },
  {
    key: "action",
    header: "Action",
    width: "110px",
    align: "right",
    render: (c) => <ViewActionCell candidate={c} />,
  },
];

/* ============================================================
   MAIN COMPONENT
============================================================ */

const PassportExpiryTracker = () => {
  const [days, setDays] = useState(90);
  const [search, setSearch] = useState("");
  const [urgency, setUrgency] = useState<UrgencyFilter>("all");

  /* ---------- Pagination state ---------- */
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Reset to page 1 whenever the day window changes
  useEffect(() => {
    setPage(1);
  }, [days]);

  // Reset to page 1 whenever the urgency tab changes (client-side filter)
  useEffect(() => {
    setPage(1);
  }, [urgency]);

  const { data, isLoading, isFetching, refetch, isError } =
    useGetPassportExpiryListQuery({ days, page, limit });

  const summary = data?.summary ?? {
    total: 0,
    expired: 0,
    critical: 0,
    warning: 0,
  };

  const candidates = data?.data ?? [];
  const pagination = data?.pagination;

  /* ---------- Client-side filter: urgency tab + search ---------- */
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return candidates.filter((c) => {
      if (urgency !== "all" && c.urgency !== urgency) return false;
      if (!q) return true;

      return [
        c.fullName,
        c.candidateCode,
        c.passportNumber,
        c.mobile,
        c.trade,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [candidates, urgency, search]);

  /* ---------- When a local filter is active, hide server pagination UI ----------
     Otherwise the page count mismatches what the user sees on screen. */
  const hasClientFilter = urgency !== "all" || search.trim().length > 0;

  return (
    <div className="space-y-6">
      {/* ============ SUMMARY CARDS ============ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <ExpirySummaryCard
          icon={Users}
          label="Total At Risk"
          value={summary.total}
          color="slate"
          active={urgency === "all"}
          onClick={() => setUrgency("all")}
        />
        <ExpirySummaryCard
          icon={ShieldAlert}
          label="Expired"
          value={summary.expired}
          color="red"
          active={urgency === "expired"}
          onClick={() => setUrgency("expired")}
        />
        <ExpirySummaryCard
          icon={AlertTriangle}
          label="Critical (≤30d)"
          value={summary.critical}
          color="orange"
          active={urgency === "critical"}
          onClick={() => setUrgency("critical")}
        />
        <ExpirySummaryCard
          icon={Clock}
          label="Warning (≤90d)"
          value={summary.warning}
          color="amber"
          active={urgency === "warning"}
          onClick={() => setUrgency("warning")}
        />
      </div>

      {/* ============ TOOLBAR ============ */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search name, passport, code, mobile…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="appearance-none pl-3 pr-9 py-2 rounded-md border border-gray-700 bg-gray-800 text-white text-sm outline-none focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/20 transition cursor-pointer"
            >
              {DAY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  Within {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            title="Reload"
            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* ============ TABLE ============ */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <ShieldAlert className="h-10 w-10 text-red-400 mb-3" />
            <p className="text-slate-300 font-medium">
              Failed to load passport expiry data.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="mt-3 border-gray-700 text-slate-300 hover:bg-gray-800"
            >
              Try again
            </Button>
          </div>
        ) : (
          <DataTable<PassportExpiryCandidate>
            columns={columns}
            data={filtered}
            isLoading={isLoading}
            getRowKey={(c) => c.id}
            showSerial
            serialOffset={
              // Only offset when a client-side filter is NOT applied
              !hasClientFilter && pagination
                ? (pagination.currentPage - 1) * pagination.itemsPerPage
                : 0
            }
            emptyMessage={
              candidates.length === 0
                ? `No passports expiring within ${days} days. Great! Everyone is compliant. 🎉`
                : "No candidates match your filters."
            }
            emptyIcon={
              <CheckCircle2 className="h-10 w-10 mx-auto text-emerald-400 mb-3" />
            }
            pagination={
              // Show server-side pagination only when no client-side filter is active
              !hasClientFilter && pagination
                ? {
                    currentPage: pagination.currentPage,
                    totalPages: pagination.totalPages,
                    totalItems: pagination.totalItems,
                    itemsPerPage: pagination.itemsPerPage,
                    onPageChange: (p) => setPage(p),
                    onLimitChange: (l) => {
                      setLimit(l);
                      setPage(1);
                    },
                    limitOptions: [10, 20, 30, 50, 100, 300, 500, 1000, 2000, 5000],
                  }
                : undefined
            }
          />
        )}

        {/* Footer count */}
        {!isError && filtered.length > 0 && (
          <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/80 text-xs text-slate-400">
            {hasClientFilter ? (
              <>
                Showing{" "}
                <span className="font-semibold text-white">
                  {filtered.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {candidates.length}
                </span>{" "}
                loaded candidate{candidates.length !== 1 ? "s" : ""} (filtered
                locally)
              </>
            ) : (
              <>
                Showing{" "}
                <span className="font-semibold text-white">
                  {(pagination?.currentPage! - 1) *
                    (pagination?.itemsPerPage ?? 0) +
                    1}
                </span>
                –
                <span className="font-semibold text-white">
                  {Math.min(
                    pagination?.currentPage! * (pagination?.itemsPerPage ?? 0),
                    pagination?.totalItems ?? 0
                  )}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-white">
                  {pagination?.totalItems ?? 0}
                </span>{" "}
                candidate{(pagination?.totalItems ?? 0) !== 1 ? "s" : ""}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassportExpiryTracker;