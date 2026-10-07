import { CandidateStatus } from "@/redux/api/candidates/candidateApi";

const COLORS: Record<string, string> = {
  registered: "bg-gray-100 text-gray-700 border-gray-200",
  selected: "bg-blue-100 text-blue-700 border-blue-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
  medically_fit: "bg-green-100 text-green-700 border-green-200",
  medically_unfit: "bg-red-100 text-red-700 border-red-200",
  visa_stamped: "bg-purple-100 text-purple-700 border-purple-200",
  training_completed: "bg-indigo-100 text-indigo-700 border-indigo-200",
  bmet_completed: "bg-cyan-100 text-cyan-700 border-cyan-200",
  ticketed: "bg-amber-100 text-amber-700 border-amber-200",
  flown: "bg-teal-100 text-teal-700 border-teal-200",
  flight_missed: "bg-orange-100 text-orange-700 border-orange-200",
  deployed: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export default function CandidateStatusBadge({
  status,
}: {
  status?: CandidateStatus;
}) {
  if (!status) return null;
  const cls = COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}
    >
      {status.replace(/_/g, " ").toUpperCase()}
    </span>
  );
}