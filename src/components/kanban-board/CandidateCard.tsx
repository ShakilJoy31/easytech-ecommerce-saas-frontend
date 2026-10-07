"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "framer-motion";
import {
  Phone,
  MapPin,
  Briefcase,
  AlertTriangle,
  CreditCard,
  BookUser,
  ShieldCheck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Candidate } from "@/redux/api/candidates/candidateApi";

interface Props {
  candidate: Candidate;
  isDragging?: boolean;
  isOverlay?: boolean;
}

/* ---------- passport expiry helper ---------- */
const getPassportUrgency = (expiry?: string | null) => {
  if (!expiry)
    return {
      label: "N/A",
      color: "text-slate-400",
      bar: "bg-slate-600",
      days: null as number | null,
    };
  const days = Math.ceil(
    (new Date(expiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0)
    return { label: "Expired", color: "text-red-400", bar: "bg-red-500", days };
  if (days <= 30)
    return { label: `${days}d left`, color: "text-orange-400", bar: "bg-orange-500", days };
  if (days <= 90)
    return { label: `${days}d left`, color: "text-yellow-400", bar: "bg-yellow-500", days };
  return { label: `${days}d left`, color: "text-emerald-400", bar: "bg-emerald-500", days };
};

/* ---------- initials helper ---------- */
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

/* ---------- date helper ---------- */
const formatDate = (d?: string | null) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date.getTime())) return null;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const CandidateCard = ({ candidate, isOverlay }: Props) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: candidate.id!,
    data: { candidate },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const passport = getPassportUrgency(candidate.passportExpiryDate);
  const initials = getInitials(candidate.fullName || candidate.firstName);
  const displayName = candidate.fullName || candidate.firstName || "Unknown";
  const expiryText = formatDate(candidate.passportExpiryDate);

  // Passport validity bar: remaining life out of 1 year (expired = full red bar)
  const barPercent =
    passport.days === null
      ? 0
      : passport.days < 0
      ? 100
      : Math.min(100, Math.max(6, (passport.days / 365) * 100));

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isDragging ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 320, damping: 25 }}
      className={`
        group relative rounded-2xl p-px cursor-grab active:cursor-grabbing
        bg-gradient-to-br from-slate-600/50 via-slate-700/20 to-slate-800/50
        hover:shadow-xl hover:shadow-blue-500/20 transition-shadow duration-300
        ${isOverlay ? "shadow-2xl shadow-blue-500/40 rotate-2 scale-105" : ""}
      `}
    >
      {/* Gradient border — fades in on hover */}
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/80 via-violet-500/50 to-cyan-400/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Card surface */}
      <div className="relative rounded-[15px] overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-blue-500/10 blur-2xl group-hover:bg-blue-500/20 transition-colors duration-500" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-28 w-28 rounded-full bg-violet-500/10 blur-2xl group-hover:bg-violet-500/20 transition-colors duration-500" />

        {/* Shimmer sweep on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />

        {/* Top highlight line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />

        <div className="relative p-3.5">
          {/* ============ HEADER ============ */}
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="shrink-0 relative">
              <div className="rounded-2xl p-[2px] bg-gradient-to-br from-blue-500 via-violet-500 to-cyan-400">
                <div className="h-12 w-12 rounded-[14px] overflow-hidden bg-slate-900 flex items-center justify-center">
                  {candidate.photo ? (
                    <Image
                      src={candidate.photo}
                      alt={displayName}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <span className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-br from-blue-200 to-violet-200">
                      {initials}
                    </span>
                  )}
                </div>
              </div>

              {/* Passport urgency dot */}
              {passport.days !== null && passport.days <= 30 && (
                <span
                  className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-orange-500 border-2 border-slate-900 animate-pulse"
                  title={`Passport: ${passport.label}`}
                />
              )}
            </div>

            {/* Name + Phone + Code */}
            <div className="flex-1 min-w-0">
              <Link
                href={`/admin/candidates/candidate-profile/${candidate.id}`}
                onClick={(e) => e.stopPropagation()}
                className="block text-[15px] font-bold text-white truncate leading-tight hover:text-blue-300 transition-colors"
                title={displayName}
              >
                {displayName}
              </Link>

              {/* Phone — click to call */}
              {candidate.mobile ? (
                <a
                  href={`tel:${candidate.mobile}`}
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="mt-1 inline-flex max-w-full items-center gap-1.5 text-[11px] font-medium text-slate-300 hover:text-emerald-300 transition-colors"
                  title={`Call ${candidate.mobile}`}
                >
                  <span className="shrink-0 h-4 w-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Phone className="h-2.5 w-2.5 text-emerald-400" />
                  </span>
                  <span className="truncate">{candidate.mobile}</span>
                </a>
              ) : (
                <div className="mt-1 inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                  <span className="shrink-0 h-4 w-4 rounded-full bg-slate-800 flex items-center justify-center">
                    <Phone className="h-2.5 w-2.5" />
                  </span>
                  —
                </div>
              )}
            </div>
          </div>

          {/* ============ DESTINATION BANNER ============ */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 bg-gradient-to-r from-blue-500/15 via-violet-500/10 to-transparent border border-blue-400/15">
            <div className="flex items-center gap-2 min-w-0">
              <span className="shrink-0 h-7 w-7 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.35)]">
                <MapPin className="h-3.5 w-3.5 text-blue-300" />
              </span>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold uppercase tracking-widest text-slate-500 leading-none">
                  Destination
                </p>
                <p
                  className="text-[13px] font-bold text-blue-200 truncate leading-tight mt-0.5"
                  title={candidate.country || "—"}
                >
                  {candidate.country || "—"}
                </p>
              </div>
            </div>

            {candidate.trade && (
              <span
                className="shrink-0 max-w-[110px] inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-lg bg-slate-800/80 text-slate-200 border border-slate-700/70"
                title={candidate.trade}
              >
                <Briefcase className="h-3 w-3 text-slate-400 shrink-0" />
                <span className="truncate">{candidate.trade}</span>
              </span>
            )}
          </div>

          {/* ============ DOCUMENT TILES ============ */}
          <div className="mt-2.5 grid grid-cols-2 gap-2">
            <DocTile
              icon={<CreditCard className="h-3 w-3" />}
              label="NID"
              value={candidate.nidNumber || "—"}
            />
            <DocTile
              icon={<BookUser className="h-3 w-3" />}
              label="Passport"
              value={candidate.passportNumber || "—"}
            />
          </div>

          {/* ============ PASSPORT VALIDITY ============ */}
          {passport.days !== null && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[10px] mb-1">
                <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                  <ShieldCheck className="h-3 w-3" />
                  Passport validity
                  {expiryText && (
                    <span className="text-slate-600">· {expiryText}</span>
                  )}
                </span>
                <span
                  className={`inline-flex items-center gap-0.5 font-bold ${passport.color}`}
                >
                  {passport.days <= 30 && (
                    <AlertTriangle className="h-2.5 w-2.5" />
                  )}
                  {passport.label}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full ${passport.bar} transition-all duration-500`}
                  style={{ width: `${barPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/* ============================================================
   Small document tile (NID / Passport)
============================================================ */
const DocTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => {
  return (
    <div className="min-w-0 rounded-lg px-2.5 py-1.5 bg-white/[0.03] border border-white/5 group-hover:border-white/10 transition-colors">
      <p className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-slate-500">
        {icon}
        {label}
      </p>
      <p
        className="mt-0.5 font-mono text-[11px] font-semibold text-slate-100 truncate"
        title={value}
      >
        {value}
      </p>
    </div>
  );
};

export default CandidateCard;