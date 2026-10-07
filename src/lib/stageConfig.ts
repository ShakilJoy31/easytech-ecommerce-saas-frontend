import { KanbanStage } from "@/redux/api/candidates/candidateApi";
import {
  UserPlus, CheckCircle2, HeartPulse, Stamp, GraduationCap,
  FileCheck2, Ticket, PlaneTakeoff, Building2, HeartCrack, XCircle,
  Plane
} from "lucide-react";

export interface StageMeta {
  label: string;
  icon: any;
  color: string;        // tailwind text color
  bg: string;           // column bg
  border: string;       // border
  glow: string;         // hover glow
  accent: string;       // header pill
}

export const STAGE_META: Record<KanbanStage, StageMeta> = {
  registered: {
    label: "Registered",
    icon: UserPlus,
    color: "text-slate-300",
    bg: "bg-slate-900/40",
    border: "border-slate-700/60",
    glow: "hover:shadow-slate-500/20",
    accent: "bg-slate-500/20 text-slate-200",
  },
  selected: {
    label: "Selected",
    icon: CheckCircle2,
    color: "text-blue-300",
    bg: "bg-blue-950/30",
    border: "border-blue-800/60",
    glow: "hover:shadow-blue-500/30",
    accent: "bg-blue-500/20 text-blue-200",
  },
  medically_fit: {
    label: "Medically Fit",
    icon: HeartPulse,
    color: "text-emerald-300",
    bg: "bg-emerald-950/30",
    border: "border-emerald-800/60",
    glow: "hover:shadow-emerald-500/30",
    accent: "bg-emerald-500/20 text-emerald-200",
  },
  visa_stamped: {
    label: "Visa Stamped",
    icon: Stamp,
    color: "text-violet-300",
    bg: "bg-violet-950/30",
    border: "border-violet-800/60",
    glow: "hover:shadow-violet-500/30",
    accent: "bg-violet-500/20 text-violet-200",
  },
  training_completed: {
    label: "Training Done",
    icon: GraduationCap,
    color: "text-amber-300",
    bg: "bg-amber-950/30",
    border: "border-amber-800/60",
    glow: "hover:shadow-amber-500/30",
    accent: "bg-amber-500/20 text-amber-200",
  },
  bmet_completed: {
    label: "BMET Cleared",
    icon: FileCheck2,
    color: "text-teal-300",
    bg: "bg-teal-950/30",
    border: "border-teal-800/60",
    glow: "hover:shadow-teal-500/30",
    accent: "bg-teal-500/20 text-teal-200",
  },
  ticketed: {
    label: "Ticketed",
    icon: Ticket,
    color: "text-cyan-300",
    bg: "bg-cyan-950/30",
    border: "border-cyan-800/60",
    glow: "hover:shadow-cyan-500/30",
    accent: "bg-cyan-500/20 text-cyan-200",
  },
  flown: {
    label: "Flown",
    icon: PlaneTakeoff,
    color: "text-sky-300",
    bg: "bg-sky-950/30",
    border: "border-sky-800/60",
    glow: "hover:shadow-sky-500/30",
    accent: "bg-sky-500/20 text-sky-200",
  },
  deployed: {
    label: "Deployed",
    icon: Building2,
    color: "text-green-300",
    bg: "bg-green-950/30",
    border: "border-green-800/60",
    glow: "hover:shadow-green-500/30",
    accent: "bg-green-500/20 text-green-200",
  },
  flight_missed: {
    label: "Flight Missed",
    icon: Plane,
    color: "text-orange-300",
    bg: "bg-orange-950/30",
    border: "border-orange-800/60",
    glow: "hover:shadow-orange-500/30",
    accent: "bg-orange-500/20 text-orange-200",
  },
  medically_unfit: {
    label: "Medically Unfit",
    icon: HeartCrack,
    color: "text-rose-300",
    bg: "bg-rose-950/30",
    border: "border-rose-800/60",
    glow: "hover:shadow-rose-500/30",
    accent: "bg-rose-500/20 text-rose-200",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "text-red-300",
    bg: "bg-red-950/30",
    border: "border-red-800/60",
    glow: "hover:shadow-red-500/30",
    accent: "bg-red-500/20 text-red-200",
  },
};