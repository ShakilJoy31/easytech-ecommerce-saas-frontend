import { generateDynamicMetadata } from "@/metadata/generateMetadata";
import { notFound } from "next/navigation";
import {
  DASHBOARD_CARD_META,
} from "@/utils/dashboardCardFilters";
import { DashboardCardKey } from "@/redux/api/candidates/candidateApi";
import DashboardCandidatesTable from "@/components/candidate-components/DashboardCandidatesTable";

export async function generateMetadata({ params }: { params: { key: string } }) {
  const meta = DASHBOARD_CARD_META[params.key as DashboardCardKey];
  return generateDynamicMetadata({
    title: `${meta?.label ?? "Candidates"} | ALEC Manpower ERP`,
    description: meta?.description ?? "Filtered candidate list",
  });
}

const VALID_KEYS = Object.keys(DASHBOARD_CARD_META);

export default function StatCandidatesPage({
  params,
}: {
  params: { key: string };
}) {
  const key = params.key as DashboardCardKey;
  if (!VALID_KEYS.includes(key)) notFound();

  const meta = DASHBOARD_CARD_META[key];

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <DashboardCandidatesTable
        title={`${meta.label}`}
        description={meta.description}
        baseFilters={meta.filters}
        accent={meta.accent}
      />
    </div>
  );
}