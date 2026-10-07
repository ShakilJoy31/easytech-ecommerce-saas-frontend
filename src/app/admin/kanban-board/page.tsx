import { generateDynamicMetadata } from "@/metadata/generateMetadata";
import Link from "next/link";
import { ChevronLeft, LayoutGrid } from "lucide-react";
import KanbanBoard from "@/components/kanban-board/KanbanBoard";

export async function generateMetadata() {
  return generateDynamicMetadata({
    title: "Recruitment Kanban | ALEC Manpower ERP",
    description:
      "Drag-and-drop kanban board to visualize candidate pipeline from registration to deployment.",
    keywords: ["kanban", "recruitment", "pipeline", "manpower", "ALEC", "ERP"],
  });
}

const KanbanPage = () => {
  return (
    // 👇 THE KEY: bg-gray-900 forces the dark canvas, min-w-0 keeps it inside the flex layout
    <div className="w-full min-w-0 max-w-full bg-gray-900 text-white">
      {/* Full screen height on desktop (no top bar), minus the mobile header on small screens */}
      <div className="p-3 md:p-4 space-y-3 h-[calc(100dvh-4rem)] md:h-screen min-w-0 flex flex-col">
        {/* Header — compact single row */}
        <div className="flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <span className="p-1.5 rounded-xl bg-gradient-to-br from-blue-500/30 to-violet-500/30 border border-blue-400/30">
              <LayoutGrid className="h-5 w-5 text-blue-300" />
            </span>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white leading-tight">
                Recruitment Pipeline
              </h1>
              <p className="text-xs text-slate-400 hidden sm:block">
                Drag candidates between stages to update their recruitment status.
              </p>
            </div>
          </div>

          <Link
            href="/admin/candidates"
            className="inline-flex items-center text-sm text-slate-400 hover:text-blue-400 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Candidates
          </Link>
        </div>

        {/* Board — flex-1 + min-h-0 + min-w-0 is CRITICAL for inner scroll */}
        <div className="flex-1 min-h-0 min-w-0">
          <KanbanBoard />
        </div>
      </div>
    </div>
  );
};

export default KanbanPage;