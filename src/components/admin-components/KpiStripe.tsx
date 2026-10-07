"use client";

import Link from "next/link";
import {
  Users,
  ShieldCheck,
  HeartPulse,
  HeartCrack,
  FileCheck,
  GraduationCap,
  BadgeCheck,
  Ticket,
  Plane,
  Briefcase,
  XCircle,
  UserPlus,
  TrendingUp,
} from "lucide-react";
import { motion, type Variants } from "framer-motion";

import { useGetDashboardStatsQuery } from "@/redux/api/candidates/candidateApi";
import { DASHBOARD_CARD_META } from "@/utils/dashboardCardFilters";
import { useEffect, useState } from "react";

/* ---------- Icon map ---------- */
const ICON_MAP: Record<string, any> = {
  users: Users,
  "shield-check": ShieldCheck,
  "heart-pulse": HeartPulse,
  "heart-crack": HeartCrack,
  "file-check": FileCheck,
  "graduation-cap": GraduationCap,
  "badge-check": BadgeCheck,
  ticket: Ticket,
  plane: Plane,
  "plane-off": Plane,
  briefcase: Briefcase,
  "x-circle": XCircle,
  "user-plus": UserPlus,
};

const GRADIENT_MAP: Record<string, string> = {
  blue: "from-blue-600/30 to-indigo-600/20",
  green: "from-emerald-600/30 to-green-600/20",
  emerald: "from-emerald-600/30 to-teal-600/20",
  red: "from-red-600/30 to-rose-600/20",
  purple: "from-purple-600/30 to-fuchsia-600/20",
  indigo: "from-indigo-600/30 to-blue-600/20",
  cyan: "from-cyan-600/30 to-sky-600/20",
  amber: "from-amber-600/30 to-yellow-600/20",
  teal: "from-teal-600/30 to-cyan-600/20",
  orange: "from-orange-600/30 to-red-600/20",
  gray: "from-gray-600/30 to-slate-600/20",
};

/* ============================================================
   MOTION VARIANTS  (typed explicitly as Variants)
============================================================ */

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 110, damping: 18 },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.05 },
  },
};

/* ============================================================
   COUNT-UP
============================================================ */

const CountUp = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 900;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{display.toLocaleString("en-US")}</>;
};

/* ============================================================
   KPI STRIP — clickable cards
============================================================ */

const ORDER: (keyof typeof DASHBOARD_CARD_META)[] = [
  "total",
  "approved",
  "medicalFit",
  "medicalUnfit",
  "visaStamped",
  "trainingCompleted",
  "bmetCompleted",
  "ticketed",
  "flown",
  "flightMissed",
  "deployed",
  "cancelled",
];

export const KpiStrip = () => {
  const { data, isLoading } = useGetDashboardStatsQuery();
  const cards = data?.data?.cards;

  if (isLoading || !cards) {
    return (
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl border border-white/10 bg-white/[0.04] animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4 md:gap-4"
    >
      {ORDER.map((key) => {
        const card = cards[key];
        if (!card) return null;
        const Icon = ICON_MAP[card.icon] ?? Users;

        return (
          <motion.div key={key} variants={fadeUp}>
            <Link href={`/admin/dashboard/stat/${key}`} className="block group">
              <motion.div
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition-colors hover:border-red-500/40 cursor-pointer"
              >
                <div
                  className={`absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br ${
                    GRADIENT_MAP[card.color] ?? "from-red-600/10"
                  } blur-2xl`}
                />
                <div className="relative flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-white/50">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      <CountUp value={card.value} />
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                      <TrendingUp className="h-3 w-3" />
                      View list
                    </p>
                  </div>
                  <div
                    className={`rounded-xl bg-gradient-to-br ${
                      GRADIENT_MAP[card.color] ?? ""
                    } p-2`}
                  >
                    <Icon className="h-4 w-4 text-white/80" />
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
};



