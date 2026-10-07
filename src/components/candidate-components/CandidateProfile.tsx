"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  User,
  FileText,
  CreditCard,
  Stethoscope,
  Briefcase,
  GraduationCap,
  ShieldCheck,
  Ticket,
  Rocket,
  AlertTriangle,
  Loader2,
  Pencil,
  RefreshCw,
} from "lucide-react";

import { useGetCandidateByIdQuery } from "@/redux/api/candidates/candidateApi";
import CandidateHeader from "./CandidateHeader";
import StatusUpdateDialog from "./StatusUpdateDialog";


/* ============================================================
   SMALL HELPERS
============================================================ */

/**
 * Format any value for display. Handles null/undefined/empty/Date.
 */
function formatValue(value: any): string {
  if (value === null || value === undefined || value === "") return "—";
  if (value instanceof Date) return value.toLocaleDateString();
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    if (value.length === 0) return "—";
    return value.map((v) => formatValue(v)).join(", ");
  }
  if (typeof value === "object") {
    // Try common name fields
    if (value.name) return value.name;
    if (value.fullName) return value.fullName;
    if (value.title) return value.title;
    return JSON.stringify(value);
  }
  return String(value);
}

/**
 * Format a date string into a readable format.
 */
function formatDate(value: any): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

/**
 * Format ISO date/datetime for display.
 */
function formatDateTime(value: any): string {
  if (!value) return "—";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return String(value);
  }
}

/* ============================================================
   FIELD + SECTION COMPONENTS
============================================================ */

function Field({
  label,
  value,
  mono,
  fullWidth,
}: {
  label: string;
  value: any;
  mono?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1.5 text-sm text-white break-words ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {formatValue(value)}
      </p>
    </div>
  );
}

function DateField({
  label,
  value,
  fullWidth,
}: {
  label: string;
  value: any;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "col-span-full" : ""}>
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <p className="mt-1.5 text-sm text-white">{formatDate(value)}</p>
    </div>
  );
}

function StatusBadge({
  label,
  value,
  colorMap,
}: {
  label: string;
  value: any;
  colorMap?: Record<string, string>;
}) {
  const key = String(value ?? "").toLowerCase().replace(/\s+/g, "_");
  const color =
    colorMap?.[key] ||
    "bg-gray-800 text-gray-300 border-gray-700";

  return (
    <div>
      <p className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
        {label}
      </p>
      <span
        className={`mt-1.5 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${color}`}
      >
        {value ? String(value).replace(/_/g, " ").toUpperCase() : "—"}
      </span>
    </div>
  );
}

function Section({
  title,
  icon,
  children,
  accent = "default",
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accent?: "default" | "blue" | "green" | "amber" | "purple" | "red" | "cyan";
}) {
  const accentMap: Record<string, string> = {
    default: "from-gray-600/40 to-gray-700/20 text-gray-200",
    blue: "from-blue-600/40 to-blue-700/20 text-blue-200",
    green: "from-emerald-600/40 to-emerald-700/20 text-emerald-200",
    amber: "from-amber-500/40 to-amber-700/20 text-amber-200",
    purple: "from-purple-600/40 to-purple-700/20 text-purple-200",
    red: "from-red-600/40 to-red-700/20 text-red-200",
    cyan: "from-cyan-600/40 to-cyan-700/20 text-cyan-200",
  };

  return (
    <section className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-800/30">
        <div
          className={`rounded-lg p-2 bg-gradient-to-br border border-white/5 ${accentMap[accent]}`}
        >
          {icon}
        </div>
        <h3 className="text-base font-semibold text-white">{title}</h3>
      </div>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        {children}
      </div>
    </section>
  );
}

/* ============================================================
   STATUS COLOR MAPS
============================================================ */

const CANDIDATE_STATUS_COLORS: Record<string, string> = {
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

const PASSPORT_STATUS_COLORS: Record<string, string> = {
  valid: "bg-green-900/30 text-green-300 border-green-800",
  expired: "bg-red-900/30 text-red-300 border-red-800",
  renewed: "bg-blue-900/30 text-blue-300 border-blue-800",
  lost: "bg-red-900/30 text-red-300 border-red-800",
  damaged: "bg-amber-900/30 text-amber-300 border-amber-800",
};

/* ============================================================
   COMPONENT
============================================================ */

export default function CandidateProfile({
  candidateId,
}: {
  candidateId: string;
}) {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetCandidateByIdQuery(candidateId, { skip: !candidateId });

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  /* ---------- Loading ---------- */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  /* ---------- Error ---------- */
  if (isError || !data?.data) {
    return (
      <div className="text-center py-24">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-white">
          Candidate not found
        </h2>
        <p className="text-gray-400 mt-1">
          The candidate you are looking for does not exist.
        </p>
        <Link
          href="/admin/candidates"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Candidates
        </Link>
      </div>
    );
  }

  const c = data.data as any; // candidate object — loose typing for flexible fields

  return (
    <div className="space-y-6 text-white">
      {/* ---------- Back link + Actions ---------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/admin/candidates"
          className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Candidates
        </Link>

        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh
        </button>
      </div>

      {/* ---------- Header card ---------- */}
      <CandidateHeader
        candidate={c}
        onEdit={() => setEditDialogOpen(true)}
        onUpdateStatus={() => setStatusDialogOpen(true)}
      />

      {/* ============================================================
          PERSONAL INFORMATION
      ============================================================ */}
      <Section
        title="Personal Information"
        icon={<User className="h-5 w-5" />}
        accent="blue"
      >
        <Field label="Candidate Code" value={c.candidateCode} mono />
        <Field label="Full Name" value={c.fullName} />
        <Field label="First Name" value={c.firstName} />
        <Field label="Middle Name" value={c.middleName} />
        <Field label="Last Name" value={c.lastName} />
        <Field label="Father Name" value={c.fatherName} />
        <Field label="Mother Name" value={c.motherName} />
        <DateField label="Date of Birth" value={c.dateOfBirth} />
        <Field label="Gender" value={c.gender} />
        <Field label="Marital Status" value={c.maritalStatus} />
        <Field label="Religion" value={c.religion} />
        <Field label="Blood Group" value={c.bloodGroup} />
        <Field label="Nationality" value={c.nationality} />
        <Field label="NID Number" value={c.nidNumber} mono />
      </Section>

      {/* ============================================================
          CONTACT & ADDRESS
      ============================================================ */}
      <Section
        title="Contact & Address"
        icon={<User className="h-5 w-5" />}
        accent="cyan"
      >
        <Field label="Mobile" value={c.mobile} mono />
        <Field label="Alternate Mobile" value={c.alternateMobile} mono />
        <Field label="WhatsApp" value={c.whatsappNumber} mono />
        <Field label="Email" value={c.email} fullWidth />
        <Field label="Present Address" value={c.presentAddress} fullWidth />
        <Field label="Permanent Address" value={c.permanentAddress} fullWidth />
        <Field label="Village" value={c.village} />
        <Field label="Post Office" value={c.postOffice} />
        <Field label="Postal Code" value={c.postalCode} />
        <Field label="Upazila" value={c.upazila} />
        <Field label="District" value={c.district} />
        <Field label="Division" value={c.division} />
        <Field label="Country" value={c.country} />
      </Section>

      {/* ============================================================
          PASSPORT
      ============================================================ */}
      <Section
        title="Passport Information"
        icon={<CreditCard className="h-5 w-5" />}
        accent="purple"
      >
        <Field label="Passport Number" value={c.passportNumber} mono />
        <Field label="Old Passport Number" value={c.oldPassportNumber} mono />
        <StatusBadge
          label="Passport Status"
          value={c.passportStatus}
          colorMap={PASSPORT_STATUS_COLORS}
        />
        <DateField label="Issue Date" value={c.passportIssueDate} />
        <DateField label="Expiry Date" value={c.passportExpiryDate} />
        <Field label="Issue Place" value={c.passportIssuePlace} />
        <Field label="Passport Type" value={c.passportType} />
        <Field label="MRP / Handwritten" value={c.passportCategory} />
      </Section>

      {/* ============================================================
          MEDICAL
      ============================================================ */}
      <Section
        title="Medical Information"
        icon={<Stethoscope className="h-5 w-5" />}
        accent="green"
      >
        <Field label="Medical Status" value={c.medicalStatus} />
        <Field label="Medical Center" value={c.medicalCenter} />
        <DateField label="Medical Date" value={c.medicalDate} />
        <DateField label="Medical Expiry" value={c.medicalExpiryDate} />
        <Field label="Medical Report No" value={c.medicalReportNumber} mono />
        <Field label="Medical Remarks" value={c.medicalRemarks} fullWidth />
        <Field label="Vaccination Status" value={c.vaccinationStatus} />
        <Field label="Vaccine Type" value={c.vaccineType} />
      </Section>

      {/* ============================================================
          VISA
      ============================================================ */}
      <Section
        title="Visa Information"
        icon={<FileText className="h-5 w-5" />}
        accent="amber"
      >
        <Field label="Visa Status" value={c.visaStatus} />
        <Field label="Visa Number" value={c.visaNumber} mono />
        <Field label="Visa Type" value={c.visaType} />
        <Field label="Country" value={c.visaCountry} />
        <Field label="Sponsor / Employer" value={c.employerName} />
        <DateField label="Visa Issue Date" value={c.visaIssueDate} />
        <DateField label="Visa Expiry Date" value={c.visaExpiryDate} />
        <Field label="Visa Remarks" value={c.visaRemarks} fullWidth />
      </Section>

      {/* ============================================================
          TRAINING
      ============================================================ */}
      <Section
        title="Training Information"
        icon={<GraduationCap className="h-5 w-5" />}
        accent="blue"
      >
        <Field label="Training Status" value={c.trainingStatus} />
        <Field label="Training Center" value={c.trainingCenter} />
        <Field label="Trade" value={c.trade} />
        <DateField label="Training Start Date" value={c.trainingStartDate} />
        <DateField label="Training End Date" value={c.trainingEndDate} />
        <Field label="Training Certificate No" value={c.trainingCertificateNumber} mono />
        <Field label="Training Remarks" value={c.trainingRemarks} fullWidth />
      </Section>

      {/* ============================================================
          BMET
      ============================================================ */}
      <Section
        title="BMET Information"
        icon={<ShieldCheck className="h-5 w-5" />}
        accent="cyan"
      >
        <Field label="BMET Status" value={c.bmetStatus} />
        <Field label="BMET Registration No" value={c.bmetRegistrationNumber} mono />
        <DateField label="BMET Registration Date" value={c.bmetRegistrationDate} />
        <Field label="BMET Clearance" value={c.bmetClearance} />
        <Field label="BMET Remarks" value={c.bmetRemarks} fullWidth />
      </Section>

      {/* ============================================================
          TICKET & FLIGHT
      ============================================================ */}
      <Section
        title="Ticket & Flight"
        icon={<Ticket className="h-5 w-5" />}
        accent="amber"
      >
        <Field label="Ticket Status" value={c.ticketStatus} />
        <Field label="Airline" value={c.airline} />
        <Field label="Flight Number" value={c.flightNumber} mono />
        <Field label="Ticket Number" value={c.ticketNumber} mono />
        <Field label="PNR" value={c.pnrNumber} mono />
        <Field label="Departure Airport" value={c.departureAirport} />
        <Field label="Arrival Airport" value={c.arrivalAirport} />
        <DateField label="Departure Date" value={c.departureDate} />
        <DateField label="Arrival Date" value={c.arrivalDate} />
        <Field label="Ticket Remarks" value={c.ticketRemarks} fullWidth />
      </Section>

      {/* ============================================================
          DEPLOYMENT
      ============================================================ */}
      <Section
        title="Deployment Information"
        icon={<Rocket className="h-5 w-5" />}
        accent="green"
      >
        <Field label="Deployment Status" value={c.deploymentStatus} />
        <Field label="Employer" value={c.employerName} />
        <Field label="Job Title" value={c.jobTitle} />
        <Field label="Salary" value={c.salary} />
        <Field label="Contract Duration" value={c.contractDuration} />
        <DateField label="Deployment Date" value={c.deploymentDate} />
        <DateField label="Joining Date" value={c.joiningDate} />
        <Field label="Deployment Remarks" value={c.deploymentRemarks} fullWidth />
      </Section>

      {/* ============================================================
          ASSIGNMENT / META
      ============================================================ */}
      <Section
        title="Assignment & Meta"
        icon={<Briefcase className="h-5 w-5" />}
        accent="purple"
      >
        <Field label="Trade" value={c.trade} />
        <Field label="Reference / Agency" value={c.reference} />
        <StatusBadge
          label="Candidate Status"
          value={c.candidateStatus}
          colorMap={CANDIDATE_STATUS_COLORS}
        />
        <Field label="Selection Status" value={c.selectionStatus} />
        <Field label="CV Status" value={c.cvStatus} />
        <DateField label="CV Sent Date" value={c.cvSentDate} />
        <DateField label="Interview Date" value={c.interviewDate} />
        <Field label="Remarks" value={c.remarks} fullWidth />
        <Field label="Created At" value={formatDateTime(c.createdAt)} />
        <Field label="Updated At" value={formatDateTime(c.updatedAt)} />
      </Section>

      {/* ============================================================
          DIALOGS
      ============================================================ */}
      <StatusUpdateDialog
        open={statusDialogOpen}
        onOpenChange={setStatusDialogOpen}
        candidate={c}
        onSuccess={refetch}
      />

    </div>
  );
}