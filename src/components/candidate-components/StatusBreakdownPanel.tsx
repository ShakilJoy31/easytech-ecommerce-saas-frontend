"use client";

import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import { ArrowRight, Layers } from "lucide-react";

import { useGetStatusBreakdownQuery } from "@/redux/api/candidates/candidateApi";

/* ============================================================
   MOTION
============================================================ */
const containerVariants: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

/* ============================================================
   STATUS TINTS — each status value gets a distinct color
   Fallback = slate
============================================================ */
const STATUS_TINT: Record<string, string> = {
  // passport
  valid: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  expired: "border-red-500/30 bg-red-500/10 text-red-300",
  renewed: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  lost: "border-orange-500/30 bg-orange-500/10 text-orange-300",
  damaged: "border-rose-500/30 bg-rose-500/10 text-rose-300",

  // cv
  not_sent: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  sent: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  shortlisted: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  rejected: "border-red-500/30 bg-red-500/10 text-red-300",

  // selection
  registered: "border-slate-500/30 bg-slate-500/10 text-slate-300",
  screening: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  cv_preparing: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  cv_sent: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  interview: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  selected: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  cancelled: "border-red-500/30 bg-red-500/10 text-red-300",
  not_willing: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  duplicate: "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300",
  on_hold: "border-orange-500/30 bg-orange-500/10 text-orange-300",

  // medical
  not_started: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  appointment_booked: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  report_pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  fit: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  unfit: "border-red-500/30 bg-red-500/10 text-red-300",
  retest: "border-orange-500/30 bg-orange-500/10 text-orange-300",

  // visa
  applied: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  approved: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  stamped: "border-purple-500/30 bg-purple-500/10 text-purple-300",

  // training
  not_required: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  admission_pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  admitted: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  started: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  completed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  dropped: "border-rose-500/30 bg-rose-500/10 text-rose-300",
  did_not_take_admission: "border-orange-500/30 bg-orange-500/10 text-orange-300",

  // bmet
  document_pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  submitted: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  under_process: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",

  // ticket
  not_ready: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  ready_for_ticket: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  ticket_requested: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  ticket_received: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  pta_pending: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  flight_booked: "border-violet-500/30 bg-violet-500/10 text-violet-300",
  departed: "border-teal-500/30 bg-teal-500/10 text-teal-300",
  arrived: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  flight_missed: "border-orange-500/30 bg-orange-500/10 text-orange-300",

  // pta
  requested: "border-amber-500/30 bg-amber-500/10 text-amber-300",

  // flight
  not_booked: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  booked: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  done: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  missed: "border-red-500/30 bg-red-500/10 text-red-300",
  rescheduled: "border-amber-500/30 bg-amber-500/10 text-amber-300",

  // deployment
  not_deployed: "border-gray-500/30 bg-gray-500/10 text-gray-300",
  ready: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  in_transit: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  deployed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  returned: "border-orange-500/30 bg-orange-500/10 text-orange-300",

  // candidate
  medically_fit: "border-green-500/30 bg-green-500/10 text-green-300",
  medically_unfit: "border-red-500/30 bg-red-500/10 text-red-300",
  visa_stamped: "border-purple-500/30 bg-purple-500/10 text-purple-300",
  training_completed: "border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
  bmet_completed: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
  ticketed: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  flown: "border-teal-500/30 bg-teal-500/10 text-teal-300",
};

/* ============================================================
   MAIN COMPONENT
============================================================ */
export const StatusBreakdownPanel = () => {
  const { data, isLoading } = useGetStatusBreakdownQuery();
  const groups = data?.data?.groups ?? [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <motion.div
          key={group.field}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-xl"
        >
          {/* Group header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-br from-red-600/30 to-orange-600/20 p-1.5">
                <Layers className="h-3.5 w-3.5 text-red-300" />
              </span>
              <h3 className="text-sm font-semibold uppercase tracking-[0.1em] text-white/80">
                {group.label}
              </h3>
              <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/50">
                {group.total}
              </span>
            </div>
          </div>

          {/* Status cards grid */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {group.statuses.map((s) => {
              const tint =
                STATUS_TINT[s.value] ??
                "border-slate-500/30 bg-slate-500/10 text-slate-300";

              return (
                <motion.div key={s.value} variants={itemVariants}>
                  <Link
                    href={`/admin/dashboard/status/${group.field}/${s.value}`}
                    className="group block"
                  >
                    <div
                      className={`relative overflow-hidden rounded-xl border ${tint} px-3 py-2.5 transition-all duration-200 hover:scale-[1.02] hover:shadow-lg hover:shadow-black/30 cursor-pointer`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-[10px] font-medium uppercase tracking-wider opacity-80">
                            {s.label}
                          </p>
                          <p className="mt-0.5 text-lg font-bold leading-none text-white">
                            {s.count}
                          </p>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
};