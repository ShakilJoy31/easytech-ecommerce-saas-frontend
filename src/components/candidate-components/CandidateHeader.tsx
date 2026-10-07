"use client";

import { Phone, Mail, MapPin, Briefcase, Pencil, RefreshCw } from "lucide-react";
import { Candidate } from "@/redux/api/candidates/candidateApi";
import Link from "next/link";

interface Props {
  candidate: Candidate;
  onEdit: () => void;
  onUpdateStatus: () => void;
}

/* ============================================================
   STATUS BADGE COLORS
============================================================ */

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
   COMPONENT
============================================================ */

export default function CandidateHeader({
  candidate,
  onEdit,
  onUpdateStatus,
}: Props) {
  const initials = (candidate.fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const statusKey = String(candidate.candidateStatus ?? "")
    .toLowerCase()
    .replace(/\s+/g, "_");
  const statusColor =
    STATUS_COLORS[statusKey] || "bg-gray-800 text-gray-300 border-gray-700";

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* ---------- Avatar ---------- */}
          <div className="relative h-24 w-24 md:h-28 md:w-28 flex-shrink-0">
            {/* Gradient ring */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 p-[3px] shadow-lg">
              <div className="relative h-full w-full rounded-full overflow-hidden bg-gray-800">
                {candidate.photo ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={candidate.photo}
                    alt={candidate.fullName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-2xl font-bold text-blue-300 bg-blue-900/20">
                    {initials}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ---------- Info ---------- */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl font-bold text-white truncate">
                    {candidate.fullName}
                  </h1>

                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}
                  >
                    {(candidate.candidateStatus ?? "unknown")
                      .replace(/_/g, " ")
                      .toUpperCase()}
                  </span>

                  {/* Cancelled badge */}
                  {candidate.isCancelled && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-300 border border-red-800 font-medium">
                      CANCELLED
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 font-mono mt-1 truncate">
                  {candidate.candidateCode}
                </p>
              </div>

              {/* ---------- Actions ---------- */}
              <div className="flex gap-2 flex-shrink-0">
                <Link href={`/admin/candidates/candidate-profile/edit/${candidate.id}`}>
                  <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </button>
                </Link>
              
                <button
                  onClick={onUpdateStatus}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4" />
                  Update Status
                </button>
              </div>
            </div>

            {/* ---------- Info grid ---------- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
              <InfoItem
                icon={<Briefcase className="h-4 w-4" />}
                label="Trade"
              >
                {candidate.trade || "—"}
              </InfoItem>
              <InfoItem icon={<Phone className="h-4 w-4" />} label="Mobile">
                {candidate.mobile || "—"}
              </InfoItem>
              <InfoItem icon={<Mail className="h-4 w-4" />} label="Email">
                {candidate.email || "—"}
              </InfoItem>
              <InfoItem icon={<MapPin className="h-4 w-4" />} label="Destination">
                {candidate.country || "—"}
              </InfoItem>
            </div>

            {/* ---------- Reference ---------- */}
            {candidate.reference && (
              <div className="text-xs text-gray-500">
                Reference:{" "}
                <span className="font-medium text-gray-300">
                  {candidate.reference}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   INFO ITEM
============================================================ */

function InfoItem({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2 min-w-0">
      <span className="text-gray-500 mt-0.5 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-white truncate">{children}</p>
      </div>
    </div>
  );
}