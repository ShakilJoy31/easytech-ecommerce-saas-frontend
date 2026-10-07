"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Phone,
  Globe,
  Briefcase,
  ArrowRight,
  Calendar,
  AlertOctagon,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { PassportExpiryCandidate } from "@/redux/api/candidates/candidateApi";

interface Props {
  candidate: PassportExpiryCandidate;
}

/* ---------- urgency theme ---------- */
const URGENCY_META = {
  expired: {
    label: "Expired",
    icon: AlertOctagon,
    text: "text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-500/40",
    rowAccent: "bg-red-500",
    glow: "hover:bg-red-950/20",
  },
  critical: {
    label: "Critical",
    icon: AlertTriangle,
    text: "text-orange-300",
    bg: "bg-orange-500/15",
    border: "border-orange-500/40",
    rowAccent: "bg-orange-500",
    glow: "hover:bg-orange-950/20",
  },
  warning: {
    label: "Warning",
    icon: Clock,
    text: "text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
    rowAccent: "bg-amber-500",
    glow: "hover:bg-amber-950/20",
  },
  safe: {
    label: "Safe",
    icon: CheckCircle2,
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
    rowAccent: "bg-emerald-500",
    glow: "hover:bg-emerald-950/20",
  },
} as const;

const getInitials = (name?: string | null) => {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatDate = (iso?: string | null) => {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
};

const ExpiryRow = ({ candidate }: Props) => {
  const meta = URGENCY_META[candidate.urgency];
  const Icon = meta.icon;

  const daysLabel =
    candidate.daysUntilExpiry < 0
      ? `${Math.abs(candidate.daysUntilExpiry)}d ago`
      : candidate.daysUntilExpiry === 0
      ? "Today"
      : `${candidate.daysUntilExpiry}d`;

  const initials = getInitials(candidate.fullName);

  return (
    <motion.div
      whileHover={{ scale: 1.002 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`
        relative grid grid-cols-1 md:grid-cols-[80px_1fr_180px_160px_160px_140px_120px]
        gap-4 items-center px-4 py-3 transition-colors cursor-default
        ${meta.glow}
      `}
    >
      {/* Left accent stripe */}
      <span
        className={`absolute left-0 top-0 h-full w-[3px] ${meta.rowAccent} opacity-80`}
      />

      {/* ============ Days Badge ============ */}
      <div className="flex items-center gap-2">
        <span
          className={`
            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
            text-xs font-bold border
            ${meta.bg} ${meta.border} ${meta.text}
          `}
        >
          <Icon className="h-3.5 w-3.5" />
          {daysLabel}
        </span>
      </div>

      {/* ============ Candidate ============ */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-blue-400/30 flex items-center justify-center text-xs font-bold text-blue-100">
          {initials}
        </div>
        <div className="min-w-0">
          <Link
            href={`/admin/candidates/candidate-profile/${candidate.id}`}
            className="block text-sm font-semibold text-white truncate hover:text-blue-300 transition-colors"
            title={candidate.fullName}
          >
            {candidate.fullName}
          </Link>
          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
            <span className="truncate">{candidate.candidateCode}</span>
            {candidate.mobile && (
              <>
                <span className="text-slate-600">•</span>
                <span className="inline-flex items-center gap-1 truncate">
                  <Phone className="h-3 w-3" />
                  {candidate.mobile}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============ Passport No ============ */}
      <div className="min-w-0">
        <p className="md:hidden text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
          Passport
        </p>
        <p className="text-sm font-mono font-semibold text-slate-200 truncate">
          {candidate.passportNumber || "—"}
        </p>
      </div>

      {/* ============ Destination ============ */}
      <div className="min-w-0">
        <p className="md:hidden text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
          Destination
        </p>
        <p className="text-sm text-blue-300 font-medium truncate inline-flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{candidate.country || "—"}</span>
        </p>
      </div>

      {/* ============ Trade ============ */}
      <div className="min-w-0">
        <p className="md:hidden text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
          Trade
        </p>
        <p className="text-sm text-slate-300 truncate inline-flex items-center gap-1.5">
          <Briefcase className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{candidate.trade || "—"}</span>
        </p>
      </div>

      {/* ============ Expiry Date ============ */}
      <div className="min-w-0">
        <p className="md:hidden text-[10px] font-medium text-slate-500 uppercase tracking-wider mb-0.5">
          Expiry
        </p>
        <p
          className={`text-sm font-semibold inline-flex items-center gap-1.5 ${meta.text}`}
        >
          <Calendar className="h-3.5 w-3.5 shrink-0" />
          {formatDate(candidate.passportExpiryDate)}
        </p>
      </div>

      {/* ============ Action ============ */}
      <div className="flex md:justify-end">
        <Link
          href={`/admin/candidates/candidate-profile/${candidate.id}`}
          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:text-white transition-colors"
        >
          View
          <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </motion.div>
  );
};

export default ExpiryRow;