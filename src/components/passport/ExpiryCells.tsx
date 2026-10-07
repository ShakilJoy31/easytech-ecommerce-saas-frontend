"use client";

import Link from "next/link";
import Image from "next/image";
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

/* ---------- urgency theme ---------- */
const URGENCY_META = {
  expired: {
    icon: AlertOctagon,
    text: "text-red-300",
    bg: "bg-red-500/15",
    border: "border-red-500/40",
  },
  critical: {
    icon: AlertTriangle,
    text: "text-orange-300",
    bg: "bg-orange-500/15",
    border: "border-orange-500/40",
  },
  warning: {
    icon: Clock,
    text: "text-amber-300",
    bg: "bg-amber-500/15",
    border: "border-amber-500/40",
  },
  safe: {
    icon: CheckCircle2,
    text: "text-emerald-300",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
  },
} as const;

/* ---------- helpers ---------- */
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

/* ============================================================
   CELL: Days badge
============================================================ */
export const DaysCell = ({
  candidate,
}: {
  candidate: PassportExpiryCandidate;
}) => {
  const meta = URGENCY_META[candidate.urgency];
  const Icon = meta.icon;

  const daysLabel =
    candidate.daysUntilExpiry < 0
      ? `${Math.abs(candidate.daysUntilExpiry)}d ago`
      : candidate.daysUntilExpiry === 0
      ? "Today"
      : `${candidate.daysUntilExpiry}d`;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
        text-xs font-bold border whitespace-nowrap
        ${meta.bg} ${meta.border} ${meta.text}
      `}
    >
      <Icon className="h-3.5 w-3.5" />
      {daysLabel}
    </span>
  );
};

/* ============================================================
   CELL: Candidate (photo + name + code + mobile)
============================================================ */
export const CandidateCell = ({
  candidate,
}: {
  candidate: PassportExpiryCandidate;
}) => {
  const initials = getInitials(candidate.fullName);
  const photo = (candidate as any).photo as string | null | undefined;

  return (
    <div className="flex items-center gap-3 min-w-0">
      {/* Photo / initials fallback */}
      <div className="shrink-0 h-10 w-10 rounded-xl overflow-hidden ring-1 ring-blue-500/20 bg-gradient-to-br from-blue-500/30 to-violet-500/30 flex items-center justify-center text-xs font-bold text-blue-100">
        {photo ? (
          <Image
            src={photo}
            alt={candidate.fullName || "candidate"}
            width={40}
            height={40}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Name + meta */}
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
  );
};

/* ============================================================
   CELL: Passport number
============================================================ */
export const PassportCell = ({
  candidate,
}: {
  candidate: PassportExpiryCandidate;
}) => (
  <span className="text-sm font-mono font-semibold text-slate-200 truncate">
    {candidate.passportNumber || "—"}
  </span>
);

/* ============================================================
   CELL: Destination
============================================================ */
export const DestinationCell = ({
  candidate,
}: {
  candidate: PassportExpiryCandidate;
}) => (
  <span className="text-sm text-blue-300 font-medium inline-flex items-center gap-1.5 min-w-0">
    <Globe className="h-3.5 w-3.5 shrink-0" />
    <span className="truncate">{candidate.country || "—"}</span>
  </span>
);

/* ============================================================
   CELL: Trade
============================================================ */
export const TradeCell = ({
  candidate,
}: {
  candidate: PassportExpiryCandidate;
}) => (
  <span className="text-sm text-slate-300 inline-flex items-center gap-1.5 min-w-0">
    <Briefcase className="h-3.5 w-3.5 shrink-0" />
    <span className="truncate">{candidate.trade || "—"}</span>
  </span>
);

/* ============================================================
   CELL: Expiry date
============================================================ */
export const ExpiryDateCell = ({
  candidate,
}: {
  candidate: PassportExpiryCandidate;
}) => {
  const meta = URGENCY_META[candidate.urgency];
  return (
    <span
      className={`text-sm font-semibold inline-flex items-center gap-1.5 whitespace-nowrap ${meta.text}`}
    >
      <Calendar className="h-3.5 w-3.5 shrink-0" />
      {formatDate(candidate.passportExpiryDate)}
    </span>
  );
};

/* ============================================================
   CELL: View action
============================================================ */
export const ViewActionCell = ({
  candidate,
}: {
  candidate: PassportExpiryCandidate;
}) => (
  <Link
    href={`/admin/candidates/candidate-profile/${candidate.id}`}
    className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-700 hover:border-slate-600 hover:text-white transition-colors"
  >
    View
    <ArrowRight className="h-3 w-3" />
  </Link>
);