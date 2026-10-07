"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Loader2, Search, RefreshCw } from "lucide-react";

import {
  candidateApi,
  useGetKanbanBoardQuery,
  useMoveCandidateStageMutation,
  Candidate,
  KanbanStage,
  KanbanColumn,
} from "@/redux/api/candidates/candidateApi";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { STAGE_META } from "@/lib/stageConfig";
import KanbanColumnComponent from "./KanbanColumn";
import CandidateCard from "./CandidateCard";

/** This column is always visible, whatever the stage filter says */
const ALWAYS_VISIBLE_STAGE: KanbanStage = "registered";

/** Candidates per page (initial board load + every "load more") */
const PAGE_SIZE = 15;

const KanbanBoard = () => {
  const dispatch = useDispatch<any>();

  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

  /* ---------- Extra candidates loaded by scrolling (per stage) ---------- */
  const [extraByStage, setExtraByStage] = useState<
    Partial<Record<KanbanStage, Candidate[]>>
  >({});
  const [loadingStages, setLoadingStages] = useState<
    Partial<Record<KanbanStage, boolean>>
  >({});
  const loadingRef = useRef<Set<string>>(new Set());
  // bumped on reset so late responses from an old search/reload are ignored
  const generationRef = useRef(0);

  const resetExtras = () => {
    generationRef.current += 1;
    loadingRef.current.clear();
    setExtraByStage({});
    setLoadingStages({});
  };

  /* ---------- Horizontal scroll (bottom bar + synced top bar) ---------- */
  const scrollRef = useRef<HTMLDivElement>(null);
  const topScrollRef = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const [contentWidth, setContentWidth] = useState(0);

  const { data, isLoading, isFetching, refetch } = useGetKanbanBoardQuery({
    search,
    limit: PAGE_SIZE,
  });

  const [moveStage] = useMoveCandidateStageMutation();

  // New search -> start over from the first page of every column
  useEffect(() => {
    resetExtras();
  }, [search]);

  /**
   * Board columns = first page from the board query
   *               + extra pages loaded by scrolling (de-duplicated).
   */
  const mergedColumns: KanbanColumn[] = useMemo(() => {
    const raw: KanbanColumn[] = data?.data?.columns ?? [];

    return raw.map((col) => {
      const extras = extraByStage[col.stage];
      if (!extras || extras.length === 0) return col;

      const baseIds = new Set(col.candidates.map((c) => c.id));
      const unique = extras.filter((c) => !baseIds.has(c.id));
      const candidates = [...col.candidates, ...unique];

      return {
        ...col,
        candidates,
        hasMore: candidates.length < col.total,
      };
    });
  }, [data, extraByStage]);

  /**
   * Stage filter: keeps only the columns whose stage name matches what is typed,
   * plus the "registered" column which is always shown.
   * e.g. typing "selected" -> Registered + Selected.
   */
  const columns: KanbanColumn[] = useMemo(() => {
    const q = stageFilter.trim().toLowerCase();

    if (!q) return mergedColumns;

    return mergedColumns.filter((col) => {
      if (col.stage === ALWAYS_VISIBLE_STAGE) return true;

      const label = STAGE_META[col.stage as KanbanStage]?.label ?? "";
      const key = String(col.stage).replace(/_/g, " ");

      return (
        label.toLowerCase().includes(q) || key.toLowerCase().includes(q)
      );
    });
  }, [mergedColumns, stageFilter]);

  /* ---------- Load next page for one column ---------- */
  const loadMore = async (stage: KanbanStage) => {
    const col = mergedColumns.find((c) => c.stage === stage);
    if (!col) return;
    if (loadingRef.current.has(stage)) return;
    if (col.candidates.length >= col.total) return;

    loadingRef.current.add(stage);
    setLoadingStages((prev) => ({ ...prev, [stage]: true }));
    const generation = generationRef.current;

    // Page that starts at or just before the first not-yet-loaded candidate.
    // Slight overlap is removed by the de-dupe below, so nothing is skipped
    // even if candidates were moved out of this column meanwhile.
    const page = Math.floor(col.candidates.length / PAGE_SIZE) + 1;

    const sub = dispatch(
      candidateApi.endpoints.getKanbanColumn.initiate(
        { stage, page, limit: PAGE_SIZE, search },
        { forceRefetch: true }
      )
    );

    try {
      const res = await sub.unwrap();
      if (generation !== generationRef.current) return;

      const incoming: Candidate[] = res?.data ?? [];

      setExtraByStage((prev) => {
        const existing = prev[stage] ?? [];
        const seen = new Set(existing.map((c) => c.id));
        const fresh = incoming.filter((c) => !seen.has(c.id));
        return { ...prev, [stage]: [...existing, ...fresh] };
      });
    } catch (err: any) {
      if (generation === generationRef.current) {
        toast.error(err?.data?.message || "Failed to load more candidates");
      }
    } finally {
      sub.unsubscribe();
      if (generation === generationRef.current) {
        loadingRef.current.delete(stage);
        setLoadingStages((prev) => ({ ...prev, [stage]: false }));
      }
    }
  };

  // Keep the top scrollbar's inner width equal to the real board width
  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    const update = () => setContentWidth(row.scrollWidth);
    update();

    const ro = new ResizeObserver(update);
    ro.observe(row);
    return () => ro.disconnect();
  }, [isLoading, columns.length, stageFilter, search]);

  const syncFromTop = () => {
    if (scrollRef.current && topScrollRef.current) {
      scrollRef.current.scrollLeft = topScrollRef.current.scrollLeft;
    }
  };

  const syncFromBoard = () => {
    if (scrollRef.current && topScrollRef.current) {
      topScrollRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const findColumnByCandidateId = (id: number) =>
    columns.find((col) => col.candidates.some((c) => c.id === id));

  const handleDragStart = (e: DragStartEvent) => {
    const id = Number(e.active.id);
    const col = findColumnByCandidateId(id);
    const cand = col?.candidates.find((c) => c.id === id) ?? null;
    setActiveCandidate(cand);
  };

  const handleDragEnd = async (e: DragEndEvent) => {
    setActiveCandidate(null);
    const { active, over } = e;
    if (!over) return;

    const activeId = Number(active.id);
    const sourceCol = findColumnByCandidateId(activeId);
    if (!sourceCol) return;

    let targetStage: KanbanStage | null = null;
    const overId = over.id.toString();

    if (overId.startsWith("column-")) {
      targetStage = overId.replace("column-", "") as KanbanStage;
    } else {
      const overCol = findColumnByCandidateId(Number(over.id));
      if (overCol) targetStage = overCol.stage;
    }

    if (!targetStage || targetStage === sourceCol.stage) return;

    // If the card came from a scrolled-in page, take it out of that list now
    const sourceStage = sourceCol.stage;
    const movedExtra = extraByStage[sourceStage]?.find((c) => c.id === activeId);
    if (movedExtra) {
      setExtraByStage((prev) => ({
        ...prev,
        [sourceStage]: (prev[sourceStage] ?? []).filter((c) => c.id !== activeId),
      }));
    }

    try {
      await moveStage({
        id: activeId,
        fromStage: sourceCol.stage,
        toStage: targetStage,
      }).unwrap();

      toast.success(`Moved to ${STAGE_META[targetStage].label}`);
    } catch (err: any) {
      // Put the card back if the move failed
      if (movedExtra) {
        setExtraByStage((prev) => {
          const list = prev[sourceStage] ?? [];
          if (list.some((c) => c.id === activeId)) return prev;
          return { ...prev, [sourceStage]: [movedExtra, ...list] };
        });
      }
      toast.error(err?.data?.message || "Failed to move candidate");
    }
  };

  return (
    // 👇 h-full + min-w-0 + max-w-full keeps the board inside the page width
    <div className="h-full w-full min-w-0 max-w-full flex flex-col gap-2 overflow-hidden">
      {/* Toolbar — compact so columns get more height */}
      <div className="flex flex-col md:flex-row gap-2 md:items-center md:justify-between shrink-0">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search name, passport, code…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-800 border-gray-700 text-white placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Stage filter — shows only matching columns (Registered always stays) */}
          <Input
            placeholder="Filter stage…"
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="w-40 bg-gray-800 border-gray-700 text-white placeholder:text-slate-500"
          />

          {/* Reload — bg-gray-900 / text-white + hover */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              resetExtras();
              refetch();
            }}
            title="Reload"
            className="bg-gray-900 border-gray-700 text-white hover:bg-gray-800 hover:text-white hover:border-gray-600 transition-colors"
          >
            <RefreshCw
              className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </div>

      {/* Board */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* 👇 Slim TOP scrollbar — always visible, synced with the board */}
          <div
            ref={topScrollRef}
            onScroll={syncFromTop}
            className="shrink-0 w-full min-w-0 overflow-x-auto overflow-y-hidden kanban-board-scroll"
          >
            <div style={{ width: contentWidth, height: 1 }} />
          </div>

          {/* 👇 THE SCROLL CONTAINER — flex-1 fills remaining height */}
          <div
            ref={scrollRef}
            onScroll={syncFromBoard}
            className="flex-1 min-h-0 min-w-0 w-full overflow-x-auto overflow-y-hidden pb-2 kanban-board-scroll"
          >
            <div ref={rowRef} className="flex gap-4 h-full min-w-max px-1">
              {columns.map((col) => (
                <KanbanColumnComponent
                  key={col.stage}
                  column={col}
                  isDragging={!!activeCandidate}
                  onLoadMore={() => loadMore(col.stage)}
                  isLoadingMore={!!loadingStages[col.stage]}
                />
              ))}
            </div>
          </div>

          <DragOverlay
            dropAnimation={{
              duration: 220,
              easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
            }}
          >
            <AnimatePresence>
              {activeCandidate && (
                <motion.div
                  initial={{ scale: 1, rotate: 0 }}
                  animate={{ scale: 1.04, rotate: 2 }}
                  exit={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="cursor-grabbing"
                >
                  <CandidateCard candidate={activeCandidate} isOverlay />
                </motion.div>
              )}
            </AnimatePresence>
          </DragOverlay>
        </DndContext>
      )}
    </div>
  );
};

export default KanbanBoard;