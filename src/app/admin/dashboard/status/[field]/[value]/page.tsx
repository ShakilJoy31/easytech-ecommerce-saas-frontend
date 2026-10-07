import { generateDynamicMetadata } from "@/metadata/generateMetadata";
import { notFound } from "next/navigation";
import DashboardCandidatesTable from "@/components/candidate-components/DashboardCandidatesTable";
import { STATUS_FIELD_META } from "@/utils/statusFieldMeta";

export async function generateMetadata({
  params,
}: {
  params: { field: string; value: string };
}) {
  const meta = STATUS_FIELD_META[params.field];
  const statusLabel = meta?.statuses.find(
    (s) => s.value === params.value
  )?.label;

  return generateDynamicMetadata({
    title: `${statusLabel ?? params.value} — ${
      meta?.label ?? "Status"
    } | ALEC Manpower ERP`,
    description:
      meta?.description ?? "Filtered candidate list by status",
  });
}

export default function StatusDetailPage({
  params,
}: {
  params: { field: string; value: string };
}) {
  const meta = STATUS_FIELD_META[params.field];
  if (!meta) notFound();

  const statusMeta = meta.statuses.find((s) => s.value === params.value);
  if (!statusMeta) notFound();

  // Build locked filters — the backend expects the field name as a query param
  const baseFilters = { [params.field]: params.value };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <DashboardCandidatesTable
        title={`${meta.label}: ${statusMeta.label}`}
        description={meta.description}
        baseFilters={baseFilters as any}
        accent="from-red-600 to-orange-600"
      />
    </div>
  );
}