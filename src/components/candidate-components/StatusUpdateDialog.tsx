"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  useUpdateCandidateStatusMutation,
  Candidate,
} from "@/redux/api/candidates/candidateApi";
import { cn } from "@/lib/utils";

/* ============================================================
   STATUS OPTIONS
============================================================ */

const STATUS_OPTIONS = [
  { value: "registered", label: "Registered", color: "gray" },
  { value: "selected", label: "Selected", color: "blue" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "medically_fit", label: "Medically Fit", color: "green" },
  { value: "medically_unfit", label: "Medically Unfit", color: "red" },
  { value: "visa_stamped", label: "Visa Stamped", color: "purple" },
  { value: "training_completed", label: "Training Completed", color: "indigo" },
  { value: "bmet_completed", label: "BMET Completed", color: "cyan" },
  { value: "ticketed", label: "Ticketed", color: "amber" },
  { value: "flown", label: "Flown", color: "teal" },
  { value: "flight_missed", label: "Flight Missed", color: "orange" },
  { value: "deployed", label: "Deployed", color: "emerald" },
] as const;

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
   PROPS
============================================================ */

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate;
  onSuccess?: () => void;
}

/* ============================================================
   COMPONENT
============================================================ */

export default function StatusUpdateDialog({
  open,
  onOpenChange,
  candidate,
  onSuccess,
}: StatusUpdateDialogProps) {
  const [newStatus, setNewStatus] = useState<
    (typeof STATUS_OPTIONS)[number]["value"] | ""
  >("");
  const [remarks, setRemarks] = useState<string>("");

  const [updateStatus, { isLoading }] = useUpdateCandidateStatusMutation();

  /* ---------- Sync initial status when opening ---------- */
  useEffect(() => {
    if (open) {
      setNewStatus(candidate.candidateStatus || "");
      setRemarks("");
    }
  }, [open, candidate.candidateStatus]);

  /* ---------- Escape key + scroll lock ---------- */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, isLoading, onOpenChange]);

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    if (!newStatus) {
      toast.error("Please select a status.");
      return;
    }

    if (newStatus === candidate.candidateStatus && !remarks.trim()) {
      toast.error("Choose a different status or add a remark.");
      return;
    }

    try {
      const res = await updateStatus({
        id: candidate.id!,
        candidateStatus: newStatus,
        remarks: remarks.trim() || undefined,
      }).unwrap();

      toast.success(res?.message || "Status updated successfully!");
      onOpenChange(false);
      onSuccess?.();
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to update status. Please try again.";
      toast.error(msg);
    }
  };

  const hasChanged = newStatus !== candidate.candidateStatus || remarks.trim();

  const currentStatusColor =
    STATUS_COLORS[candidate.candidateStatus ?? "registered"] ||
    "bg-gray-800 text-gray-300 border-gray-700";

  const newStatusColor =
    STATUS_COLORS[newStatus] || "bg-gray-800 text-gray-300 border-gray-700";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="status-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => !isLoading && onOpenChange(false)}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            key="status-card"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
          >
            {/* ---------- Header ---------- */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-800/30">
              <div className="flex items-center gap-3">
                <div className="rounded-lg p-2 bg-gradient-to-br from-blue-600/40 to-blue-700/20 border border-white/5">
                  <RefreshCw className="h-5 w-5 text-blue-200" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">
                    Update Candidate Status
                  </h3>
                  <p className="text-xs text-gray-400">
                    {candidate.fullName} — {candidate.candidateCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => !isLoading && onOpenChange(false)}
                disabled={isLoading}
                className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-40"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* ---------- Body ---------- */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              {/* Current status */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Current Status
                </label>
                <span
                  className={cn(
                    "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border",
                    currentStatusColor
                  )}
                >
                  {(candidate.candidateStatus ?? "unknown")
                    .replace(/_/g, " ")
                    .toUpperCase()}
                </span>
              </div>

              {/* Status grid */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  New Status <span className="text-red-400">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const isSelected = newStatus === opt.value;
                    const isCurrent = candidate.candidateStatus === opt.value;
                    return (
                      <motion.button
                        key={opt.value}
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setNewStatus(opt.value)}
                        className={cn(
                          "relative flex items-center justify-center px-3 py-2.5 text-xs font-medium rounded-lg border transition-all",
                          isSelected
                            ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40"
                            : "bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700 hover:border-gray-600"
                        )}
                      >
                        <span className="truncate">{opt.label}</span>
                        {isCurrent && !isSelected && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-400" />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Remarks */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                  Remarks / Note
                </label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add any additional context for this status change..."
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Change preview */}
              <AnimatePresence>
                {newStatus && newStatus !== candidate.candidateStatus && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="rounded-lg border border-blue-800/40 bg-blue-900/10 p-3 flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-gray-400">Change:</span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          currentStatusColor
                        )}
                      >
                        {(candidate.candidateStatus ?? "unknown")
                          .replace(/_/g, " ")
                          .toUpperCase()}
                      </span>
                      <span className="text-blue-400 text-sm">→</span>
                      <span
                        className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border",
                          newStatusColor
                        )}
                      >
                        {newStatus.replace(/_/g, " ").toUpperCase()}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Warning if cancelled */}
              {newStatus === "cancelled" && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-2 rounded-lg border border-amber-800/40 bg-amber-900/10 p-3 text-xs text-amber-300"
                >
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Marking as cancelled will set this candidate as inactive.
                  </span>
                </motion.div>
              )}
            </div>

            {/* ---------- Footer ---------- */}
            <div className="flex flex-col sm:flex-row gap-2.5 px-6 py-4 border-t border-gray-800 bg-gray-800/20">
              <button
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading || !hasChanged}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-900/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Update Status
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}