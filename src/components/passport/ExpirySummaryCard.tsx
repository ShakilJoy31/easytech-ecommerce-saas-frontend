"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

type Color = "slate" | "red" | "orange" | "amber" | "emerald";

const COLOR_STYLES: Record<
  Color,
  { bg: string; border: string; iconBg: string; iconText: string; text: string; ring: string }
> = {
  slate: {
    bg: "bg-slate-900/60",
    border: "border-slate-700/60",
    iconBg: "bg-slate-500/15",
    iconText: "text-slate-300",
    text: "text-slate-100",
    ring: "ring-slate-500/40",
  },
  red: {
    bg: "bg-red-950/30",
    border: "border-red-800/60",
    iconBg: "bg-red-500/15",
    iconText: "text-red-300",
    text: "text-red-100",
    ring: "ring-red-500/50",
  },
  orange: {
    bg: "bg-orange-950/30",
    border: "border-orange-800/60",
    iconBg: "bg-orange-500/15",
    iconText: "text-orange-300",
    text: "text-orange-100",
    ring: "ring-orange-500/50",
  },
  amber: {
    bg: "bg-amber-950/30",
    border: "border-amber-800/60",
    iconBg: "bg-amber-500/15",
    iconText: "text-amber-300",
    text: "text-amber-100",
    ring: "ring-amber-500/50",
  },
  emerald: {
    bg: "bg-emerald-950/30",
    border: "border-emerald-800/60",
    iconBg: "bg-emerald-500/15",
    iconText: "text-emerald-300",
    text: "text-emerald-100",
    ring: "ring-emerald-500/50",
  },
};

interface Props {
  icon: LucideIcon;
  label: string;
  value: number;
  color: Color;
  active: boolean;
  onClick: () => void;
}

const ExpirySummaryCard = ({
  icon: Icon,
  label,
  value,
  color,
  active,
  onClick,
}: Props) => {
  const styles = COLOR_STYLES[color];

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`
        text-left rounded-2xl border p-4 transition-all
        ${styles.bg} ${styles.border}
        hover:shadow-lg hover:shadow-black/20
        ${active ? `ring-2 ${styles.ring} shadow-lg` : ""}
      `}
    >
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-lg ${styles.iconBg}`}>
          <Icon className={`h-5 w-5 ${styles.iconText}`} />
        </div>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
          {label}
        </p>
        <p className={`text-2xl md:text-3xl font-bold mt-1 ${styles.text}`}>
          {value}
        </p>
      </div>
    </motion.button>
  );
};

export default ExpirySummaryCard;