"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmVariant = "danger" | "warning" | "info";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  /** If true, renders a text input inside the modal for a reason/note */
  withInput?: boolean;
  inputValue?: string;
  onInputChange?: (v: string) => void;
  inputPlaceholder?: string;
  inputLabel?: string;
}

const VARIANT_STYLES: Record<
  ConfirmVariant,
  {
    iconBg: string;
    iconColor: string;
    button: string;
    ring: string;
    Icon: React.ElementType;
  }
> = {
  danger: {
    iconBg: "bg-red-500/10 border-red-500/20",
    iconColor: "text-red-400",
    button:
      "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white shadow-lg shadow-red-900/40",
    ring: "focus:ring-red-500/30 focus:border-red-500",
    Icon: AlertTriangle,
  },
  warning: {
    iconBg: "bg-amber-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
    button:
      "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-900/40",
    ring: "focus:ring-amber-500/30 focus:border-amber-500",
    Icon: AlertTriangle,
  },
  info: {
    iconBg: "bg-blue-500/10 border-blue-500/20",
    iconColor: "text-blue-400",
    button:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white shadow-lg shadow-blue-900/40",
    ring: "focus:ring-blue-500/30 focus:border-blue-500",
    Icon: AlertTriangle,
  },
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
  withInput = false,
  inputValue = "",
  onInputChange,
  inputPlaceholder = "Enter reason...",
  inputLabel,
}: ConfirmModalProps) => {
  const styles = VARIANT_STYLES[variant];
  const Icon = styles.Icon;

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, isLoading, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="confirm-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={() => !isLoading && onClose()}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
        >
          <motion.div
            key="confirm-modal-card"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed z-10"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="p-6">
              {/* Icon */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
                className={cn(
                  "mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border",
                  styles.iconBg
                )}
              >
                <Icon className={cn("h-7 w-7", styles.iconColor)} />
              </motion.div>

              {/* Title */}
              <h3 className="text-center text-lg font-semibold text-white">
                {title}
              </h3>

              {/* Description */}
              {description && (
                <p className="mt-2 text-center text-sm text-gray-400 leading-relaxed">
                  {description}
                </p>
              )}

              {/* Optional input */}
              {withInput && (
                <div className="mt-5">
                  {inputLabel && (
                    <label className="block text-xs font-medium text-gray-400 mb-1.5">
                      {inputLabel}
                    </label>
                  )}
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => onInputChange?.(e.target.value)}
                    placeholder={inputPlaceholder}
                    autoFocus
                    className={cn(
                      "w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 outline-none transition focus:ring-2",
                      styles.ring
                    )}
                  />
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-2 sm:order-1"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={cn(
                    "flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2",
                    styles.button
                  )}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;