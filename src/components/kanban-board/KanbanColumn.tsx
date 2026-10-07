"use client";

import { useMemo, useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { motion } from "framer-motion";
import { Loader2, Search, X } from "lucide-react";
import { KanbanColumn, KanbanStage } from "@/redux/api/candidates/candidateApi";
import { STAGE_META } from "@/lib/stageConfig";
import CandidateCard from "./CandidateCard";

interface Props {
  column: KanbanColumn;
  isDragging: boolean;
  onLoadMore?: () => void;
  isLoadingMore?: boolean;
}

/** How close (px) to the bottom before the next page is requested */
const LOAD_MORE_THRESHOLD = 150;

const KanbanColumnComponent = ({
  column,
  isDragging,
  onLoadMore,
  isLoadingMore = false,
}: Props) => {
  const meta = STAGE_META[column.stage as KanbanStage];
  const Icon = meta.icon;

  const [query, setQuery] = useState("");

  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.stage}`,
    data: { stage: column.stage },
  });

  const q = query.trim().toLowerCase();
  const isSearching = q.length > 0;

  // Filter only this column's candidates
  const filteredCandidates = useMemo(() => {
    if (!q) return column.candidates;
    return column.candidates.filter((c: any) =>
      [
        c.fullName,
        c.firstName,
        c.lastName,
        c.candidateCode,
        c.passportNumber,
        c.nidNumber,
        c.mobile,
        c.trade,
        c.country,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [column.candidates, q]);

  // Load the next page when the user scrolls near the bottom of the column
  const handleBodyScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!onLoadMore || isLoadingMore || !column.hasMore || isSearching) return;

    const el = e.currentTarget;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;

    if (distanceFromBottom <= LOAD_MORE_THRESHOLD) {
      onLoadMore();
    }
  };

  const remaining = Math.max(0, column.total - column.candidates.length);

  return (
    <motion.div
      layout
      ref={setNodeRef}
      className={`
        flex flex-col w-[300px] shrink-0 h-full rounded-2xl border
        ${meta.bg} ${meta.border}
        transition-all duration-300 backdrop-blur-sm
        ${isOver ? "ring-2 ring-blue-400/60 shadow-lg shadow-blue-500/30" : ""}
        ${meta.glow} hover:shadow-xl
      `}
      animate={{ scale: isOver ? 1.01 : 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {/* Header — compact */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/5 shrink-0">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${meta.accent}`}>
            <Icon className={`h-4 w-4 ${meta.color}`} />
          </div>
          <div>
            <h3 className={`text-sm font-semibold leading-tight ${meta.color}`}>
              {meta.label}
            </h3>
            <p className="text-[10px] text-slate-400">
              {isSearching
                ? `${filteredCandidates.length} of ${column.candidates.length} shown`
                : `${column.total} candidate${column.total !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>

        <span
          className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${meta.accent}`}
        >
          {column.total}
        </span>
      </div>

      {/* Column search */}
      <div className="px-2 pt-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setQuery("");
            }}
            placeholder={`Search in ${meta.label}…`}
            className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg bg-gray-900/70 border border-white/10 text-white placeholder:text-slate-500 outline-none transition focus:border-blue-500/70 focus:ring-2 focus:ring-blue-500/20"
          />
          {isSearching && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear column search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Body — flex-1 + min-h-0 + overflow-y-auto (takes all remaining height) */}
      <div
        onScroll={handleBodyScroll}
        className="flex-1 min-h-0 overflow-y-auto p-2 space-y-2 kanban-scroll"
      >
        <SortableContext
          items={filteredCandidates.map((c) => c.id!)}
          strategy={verticalListSortingStrategy}
        >
          {column.candidates.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 text-center text-xs text-slate-500 border-2 border-dashed border-slate-700/50 rounded-lg">
              <span>Drop candidates here</span>
            </div>
          )}

          {column.candidates.length > 0 && filteredCandidates.length === 0 && (
            <div className="flex flex-col items-center justify-center h-24 text-center text-xs text-slate-500 border border-dashed border-slate-700/50 rounded-lg">
              <span>No matching candidates</span>
            </div>
          )}

          {filteredCandidates.map((candidate) => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              isDragging={isDragging}
            />
          ))}
        </SortableContext>

        {column.hasMore && !isSearching && (
          <button
            type="button"
            onClick={() => onLoadMore?.()}
            disabled={isLoadingMore}
            className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-blue-300 py-2 rounded-lg hover:bg-white/5 transition disabled:cursor-wait"
          >
            {isLoadingMore ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Loading…
              </>
            ) : (
              <>+ {remaining} more…</>
            )}
          </button>
        )}

        {column.hasMore && isSearching && (
          <p className="text-[10px] text-center text-slate-500 py-1">
            Searching loaded candidates only
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default KanbanColumnComponent;