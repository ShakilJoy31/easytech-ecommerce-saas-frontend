import { GetCandidatesParams, DashboardCardKey } from "@/redux/api/candidates/candidateApi";

export interface CardMeta {
  label: string;
  description: string;
  filters: GetCandidatesParams;
  accent: string;    // tailwind gradient
  iconColor: string;
}

export const DASHBOARD_CARD_META: Record<DashboardCardKey, CardMeta> = {
  total: {
    label: "Total Candidates",
    description: "All active candidates in the system",
    filters: {},
    accent: "from-blue-600 to-indigo-600",
    iconColor: "text-blue-300",
  },
  approved: {
    label: "Approved",
    description: "Candidates selected/approved by clients",
    filters: { candidateStatus: "selected" },
    accent: "from-emerald-600 to-green-600",
    iconColor: "text-emerald-300",
  },
  medicalFit: {
    label: "Medical Fit",
    description: "Candidates cleared in medical exam",
    filters: { medicalStatus: "fit" },
    accent: "from-teal-600 to-emerald-600",
    iconColor: "text-teal-300",
  },
  medicalUnfit: {
    label: "Medical Unfit",
    description: "Candidates failed medical exam",
    filters: { medicalStatus: "unfit" },
    accent: "from-red-600 to-rose-600",
    iconColor: "text-red-300",
  },
  visaStamped: {
    label: "Visa Stamped",
    description: "Candidates with stamped visa",
    filters: { visaStatus: "stamped" },
    accent: "from-purple-600 to-fuchsia-600",
    iconColor: "text-purple-300",
  },
  trainingCompleted: {
    label: "Training Completed",
    description: "Candidates who finished training",
    filters: { trainingStatus: "completed" },
    accent: "from-indigo-600 to-blue-600",
    iconColor: "text-indigo-300",
  },
  bmetCompleted: {
    label: "BMET Completed",
    description: "Candidates with BMET clearance",
    filters: { bmetStatus: "completed" },
    accent: "from-cyan-600 to-sky-600",
    iconColor: "text-cyan-300",
  },
  ticketed: {
    label: "Ticketed",
    description: "Candidates with issued tickets",
    filters: { ticketStatus: "ticket_received" },
    accent: "from-amber-600 to-yellow-600",
    iconColor: "text-amber-300",
  },
  flown: {
    label: "Flown",
    description: "Candidates who have departed",
    filters: { ticketStatus: "departed" },
    accent: "from-teal-600 to-cyan-600",
    iconColor: "text-teal-300",
  },
  flightMissed: {
    label: "Flight Missed",
    description: "Candidates who missed their flight",
    filters: { ticketStatus: "flight_missed" },
    accent: "from-orange-600 to-red-600",
    iconColor: "text-orange-300",
  },
  deployed: {
    label: "Deployed",
    description: "Candidates successfully deployed to worksite",
    filters: { candidateStatus: "deployed" },
    accent: "from-emerald-600 to-teal-600",
    iconColor: "text-emerald-300",
  },
  cancelled: {
    label: "Cancelled",
    description: "Cancelled candidates",
    filters: { isCancelled: true },
    accent: "from-red-600 to-orange-600",
    iconColor: "text-red-300",
  },
  registered: {
    label: "Registered",
    description: "Newly registered candidates",
    filters: { candidateStatus: "registered" },
    accent: "from-gray-600 to-slate-600",
    iconColor: "text-gray-300",
  },
};