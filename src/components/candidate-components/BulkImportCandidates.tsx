"use client";

import { useRef, useState } from "react";
import * as XLSX from "xlsx";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Download,
  FileSpreadsheet,
  Loader2,
  Upload,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

import {
  useBulkImportCandidatesMutation,
  BulkImportResult,
} from "@/redux/api/candidates/candidateApi";

/* ============================================================
   TEMPLATE COLUMNS  — 👈 ALL FIELDS INCLUDED
============================================================ */

const TEMPLATE_HEADERS = [
  /* ---------- Personal ---------- */
  "firstName",
  "middleName",
  "lastName",
  "fatherName",
  "motherName",
  "dateOfBirth",
  "gender",
  "religion",
  "maritalStatus",
  "bloodGroup",

  /* ---------- NID & Identity ---------- */
  "nidNumber",
  "birthCertificateNumber",

  /* ---------- Contact ---------- */
  "mobile",
  "alternateMobile",
  "email",

  /* ---------- Address ---------- */
  "address",
  "district",
  "upazila",
  "division",
  "postalCode",
  "country",

  /* ---------- Passport ---------- */
  "passportNumber",
  "oldPassportNumber",
  "passportIssueDate",
  "passportExpiryDate",
  "passportIssuePlace",
  "passportStatus",

  /* ---------- Assignment ---------- */
  "reference",
  "trade",
  "destination",

  /* ---------- Recruitment ---------- */
  "interviewDate",
  "cvStatus",
  "cvSentDate",
  "selectionStatus",

  /* ---------- Medical ---------- */
  "medicalStatus",
  "medicalCenter",
  "medicalAppointmentDate",
  "medicalResultDate",
  "medicalExpiryDate",

  /* ---------- Visa ---------- */
  "visaStatus",
  "visaNumber",
  "visaApplicationNo",
  "visaType",
  "visaSubmissionDate",
  "visaApprovalDate",
  "visaStampingDate",
  "visaExpiryDate",

  /* ---------- Country Processing ---------- */
  "gamcaStatus",
  "pccStatus",
  "biometricStatus",
  "mofaStatus",
  "tasheerStatus",
  "countryProcessingNotes",

  /* ---------- Training ---------- */
  "trainingStatus",
  "trainingCenter",
  "trainingStartDate",
  "trainingEndDate",

  /* ---------- BMET ---------- */
  "bmetStatus",
  "bmetSubmissionDate",
  "bmetClearanceDate",
  "bmetReference",

  /* ---------- Ticket & Flight ---------- */
  "ticketStatus",
  "ptaStatus",
  "ticketNumber",
  "ticketRequestDate",
  "ticketReceivedDate",
  "airline",
  "pnr",
  "flightNumber",
  "flightRoute",
  "flightDate",
  "flightTime",
  "flightStatus",

  /* ---------- Deployment ---------- */
  "departureDate",
  "arrivalDate",
  "clientReceivedDate",
  "joiningDate",
  "deploymentStatus",

  /* ---------- Overall ---------- */
  "candidateStatus",

  /* ---------- Meta ---------- */
  "remarks",
  "cancellationReason",
];

const REQUIRED_HEADERS = ["firstName", "mobile", "passportNumber", "trade"];

/* ============================================================
   COLUMN GROUPS (for UI documentation)
============================================================ */

const COLUMN_GROUPS: { group: string; columns: string[] }[] = [
  {
    group: "Personal",
    columns: [
      "firstName", "middleName", "lastName", "fatherName", "motherName",
      "dateOfBirth", "gender", "religion", "maritalStatus", "bloodGroup",
    ],
  },
  {
    group: "NID & Identity",
    columns: ["nidNumber", "birthCertificateNumber"],
  },
  {
    group: "Contact & Address",
    columns: [
      "mobile", "alternateMobile", "email", "address", "district",
      "upazila", "division", "postalCode", "country",
    ],
  },
  {
    group: "Passport",
    columns: [
      "passportNumber", "oldPassportNumber", "passportIssueDate",
      "passportExpiryDate", "passportIssuePlace", "passportStatus",
    ],
  },
  {
    group: "Assignment & Recruitment",
    columns: [
      "reference", "trade", "destination", "interviewDate",
      "cvStatus", "cvSentDate", "selectionStatus",
    ],
  },
  {
    group: "Medical",
    columns: [
      "medicalStatus", "medicalCenter", "medicalAppointmentDate",
      "medicalResultDate", "medicalExpiryDate",
    ],
  },
  {
    group: "Visa & Country",
    columns: [
      "visaStatus", "visaNumber", "visaApplicationNo", "visaType",
      "visaSubmissionDate", "visaApprovalDate", "visaStampingDate",
      "visaExpiryDate", "gamcaStatus", "pccStatus", "biometricStatus",
      "mofaStatus", "tasheerStatus", "countryProcessingNotes",
    ],
  },
  {
    group: "Training",
    columns: [
      "trainingStatus", "trainingCenter", "trainingStartDate", "trainingEndDate",
    ],
  },
  {
    group: "BMET",
    columns: [
      "bmetStatus", "bmetSubmissionDate", "bmetClearanceDate", "bmetReference",
    ],
  },
  {
    group: "Ticket & Flight",
    columns: [
      "ticketStatus", "ptaStatus", "ticketNumber", "ticketRequestDate",
      "ticketReceivedDate", "airline", "pnr", "flightNumber",
      "flightRoute", "flightDate", "flightTime", "flightStatus",
    ],
  },
  {
    group: "Deployment",
    columns: [
      "departureDate", "arrivalDate", "clientReceivedDate",
      "joiningDate", "deploymentStatus",
    ],
  },
  {
    group: "Status & Meta",
    columns: ["candidateStatus", "remarks", "cancellationReason"],
  },
];

/* ============================================================
   SAMPLE ROW (aligned with headers)
============================================================ */

const SAMPLE_ROW = [
  /* Personal */
  "MD AMIR", "HOSSAIN", "SHEIKH", "ABDUL KARIM", "RAHIMA BEGUM",
  "1995-05-12", "male", "Islam", "married", "B+",
  /* NID */
  "1234567890123", "1234567890",
  /* Contact */
  "01712345678", "", "amir@example.com",
  /* Address */
  "Village - Savar", "Dhaka", "Savar", "Dhaka", "1340", "Bangladesh",
  /* Passport */
  "A15785092", "", "2020-01-15", "2030-01-14", "DHAKA", "valid",
  /* Assignment */
  "SHAHIN RC", "HELPER", "Dubai/UAE",
  /* Recruitment */
  "2026-01-20", "sent", "2026-01-10", "selected",
  /* Medical */
  "fit", "IOM Dhaka", "2026-01-15", "2026-01-20", "2026-07-20",
  /* Visa */
  "approved", "V123456", "APP-2026-001", "Employment",
  "2026-01-25", "2026-02-05", "2026-02-10", "2027-02-09",
  /* Country Processing */
  "fit", "clear", "done", "approved", "approved", "All good",
  /* Training */
  "completed", "BMET Training Center", "2026-01-01", "2026-02-01",
  /* BMET */
  "completed", "2026-02-05", "2026-02-15", "BMET-REF-001",
  /* Ticket & Flight */
  "flight_booked", "sent", "TKT-9876543", "2026-02-20", "2026-02-22",
  "Biman Bangladesh", "PNR12345", "BG-401", "DAC → DXB",
  "2026-03-01", "14:30", "booked",
  /* Deployment */
  "2026-03-01", "2026-03-01", "2026-03-02", "2026-03-05", "deployed",
  /* Overall */
  "deployed",
  /* Meta */
  "Sample row — replace with real data", "",
];

/* ============================================================
   COMPONENT
============================================================ */

export default function BulkImportCandidates() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const [showColumns, setShowColumns] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const [bulkImport, { isLoading }] = useBulkImportCandidatesMutation();

  /* ---------- Download template ---------- */
  const handleDownloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, SAMPLE_ROW]);

    // Auto-size columns based on content
    const colWidths = TEMPLATE_HEADERS.map((h, i) => {
      const sampleVal = SAMPLE_ROW[i] ?? "";
      const maxLen = Math.max(h.length, String(sampleVal).length);
      return { wch: Math.min(Math.max(maxLen + 2, 12), 30) };
    });
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Candidates");

    // Add a second sheet with documentation
    const docRows: any[][] = [
      ["Column", "Group", "Required", "Description / Allowed Values"],
      ["-----", "-----", "-----", "-----"],
    ];

    const fieldDocs: Record<string, { desc: string; required?: boolean }> = {
      firstName: { desc: "Candidate's first name", required: true },
      middleName: { desc: "Middle name (optional)" },
      lastName: { desc: "Last name (optional)" },
      fatherName: { desc: "Father's full name" },
      motherName: { desc: "Mother's full name" },
      dateOfBirth: { desc: "Format: YYYY-MM-DD" },
      gender: { desc: "male | female | other" },
      religion: { desc: "Islam | Hindu | Christian | Buddhist | Other" },
      maritalStatus: { desc: "single | married | divorced | widowed" },
      bloodGroup: { desc: "A+ | A- | B+ | B- | AB+ | AB- | O+ | O-" },
      nidNumber: { desc: "National ID number" },
      birthCertificateNumber: { desc: "Birth certificate number" },
      mobile: { desc: "Primary mobile number", required: true },
      alternateMobile: { desc: "Alternate mobile number" },
      email: { desc: "Valid email address" },
      address: { desc: "Full postal address" },
      district: { desc: "District name" },
      upazila: { desc: "Upazila name" },
      division: { desc: "Division name" },
      postalCode: { desc: "Postal code" },
      country: { desc: "Country name" },
      passportNumber: { desc: "Unique passport number", required: true },
      oldPassportNumber: { desc: "Old passport number (if renewed)" },
      passportIssueDate: { desc: "Format: YYYY-MM-DD" },
      passportExpiryDate: { desc: "Format: YYYY-MM-DD" },
      passportIssuePlace: { desc: "Place of issue" },
      passportStatus: { desc: "valid | expired | renewed | lost | damaged" },
      reference: { desc: "Reference agency / agent" },
      trade: { desc: "HELPER | MASON | CARPENTER | STEEL FIXER | ELECTRICIAN | PLUMBER | WELDER | PAINTER | DRIVER | CLEANER | SECURITY GUARD | COOK | OTHER", required: true },
      destination: { desc: "Destination country" },
      interviewDate: { desc: "Format: YYYY-MM-DD" },
      cvStatus: { desc: "not_sent | sent | shortlisted | rejected" },
      cvSentDate: { desc: "Format: YYYY-MM-DD" },
      selectionStatus: { desc: "registered | screening | cv_preparing | cv_sent | shortlisted | interview | selected | rejected | cancelled | not_willing | duplicate | on_hold" },
      medicalStatus: { desc: "not_started | appointment_booked | report_pending | fit | unfit | retest | cancelled" },
      medicalCenter: { desc: "Medical center name" },
      medicalAppointmentDate: { desc: "Format: YYYY-MM-DD" },
      medicalResultDate: { desc: "Format: YYYY-MM-DD" },
      medicalExpiryDate: { desc: "Format: YYYY-MM-DD" },
      visaStatus: { desc: "not_started | applied | approved | stamped | rejected | expired | cancelled" },
      visaNumber: { desc: "Visa number" },
      visaApplicationNo: { desc: "Visa application number" },
      visaType: { desc: "e.g. Employment" },
      visaSubmissionDate: { desc: "Format: YYYY-MM-DD" },
      visaApprovalDate: { desc: "Format: YYYY-MM-DD" },
      visaStampingDate: { desc: "Format: YYYY-MM-DD" },
      visaExpiryDate: { desc: "Format: YYYY-MM-DD" },
      gamcaStatus: { desc: "GAMCA status (free text)" },
      pccStatus: { desc: "Police clearance status" },
      biometricStatus: { desc: "Biometric status" },
      mofaStatus: { desc: "MOFA status" },
      tasheerStatus: { desc: "Tasheer status" },
      countryProcessingNotes: { desc: "Notes on country processing" },
      trainingStatus: { desc: "not_required | not_started | admission_pending | admitted | started | completed | dropped | did_not_take_admission | cancelled" },
      trainingCenter: { desc: "Training center name" },
      trainingStartDate: { desc: "Format: YYYY-MM-DD" },
      trainingEndDate: { desc: "Format: YYYY-MM-DD" },
      bmetStatus: { desc: "not_started | document_pending | submitted | under_process | completed | rejected" },
      bmetSubmissionDate: { desc: "Format: YYYY-MM-DD" },
      bmetClearanceDate: { desc: "Format: YYYY-MM-DD" },
      bmetReference: { desc: "BMET reference number" },
      ticketStatus: { desc: "not_ready | ready_for_ticket | ticket_requested | ticket_received | pta_pending | flight_booked | departed | arrived | flight_missed | cancelled" },
      ptaStatus: { desc: "not_sent | requested | sent" },
      ticketNumber: { desc: "Ticket number" },
      ticketRequestDate: { desc: "Format: YYYY-MM-DD" },
      ticketReceivedDate: { desc: "Format: YYYY-MM-DD" },
      airline: { desc: "Airline name" },
      pnr: { desc: "PNR code" },
      flightNumber: { desc: "Flight number" },
      flightRoute: { desc: "e.g. DAC → DXB" },
      flightDate: { desc: "Format: YYYY-MM-DD" },
      flightTime: { desc: "e.g. 14:30" },
      flightStatus: { desc: "not_booked | booked | done | missed | cancelled | rescheduled" },
      departureDate: { desc: "Format: YYYY-MM-DD" },
      arrivalDate: { desc: "Format: YYYY-MM-DD" },
      clientReceivedDate: { desc: "Format: YYYY-MM-DD" },
      joiningDate: { desc: "Format: YYYY-MM-DD" },
      deploymentStatus: { desc: "not_deployed | ready | in_transit | deployed | returned | cancelled" },
      candidateStatus: { desc: "registered | selected | cancelled | medically_fit | medically_unfit | visa_stamped | training_completed | bmet_completed | ticketed | flown | flight_missed | deployed" },
      remarks: { desc: "Any additional notes" },
      cancellationReason: { desc: "Reason if cancelled" },
    };

    COLUMN_GROUPS.forEach(({ group, columns }) => {
      columns.forEach((col) => {
        const doc = fieldDocs[col] || { desc: "" };
        docRows.push([col, group, doc.required ? "YES" : "", doc.desc]);
      });
    });

    const docWs = XLSX.utils.aoa_to_sheet(docRows);
    docWs["!cols"] = [{ wch: 28 }, { wch: 24 }, { wch: 10 }, { wch: 70 }];
    XLSX.utils.book_append_sheet(wb, docWs, "Column Reference");

    XLSX.writeFile(wb, "candidate-import-template.xlsx");
    toast.success("Template downloaded with documentation!");
  };

  /* ---------- Process file ---------- */
  const processFile = async (file: File) => {
    setFileName(file.name);
    setResult(null);

    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: "array", cellDates: true });
      const wsName = wb.SheetNames[0];
      const ws = wb.Sheets[wsName];
      const rows: any[] = XLSX.utils.sheet_to_json(ws, {
        defval: "",
        raw: false,
      });

      if (rows.length === 0) {
        toast.error("The file is empty.");
        return;
      }

      // Validate headers
      const headers = Object.keys(rows[0]);
      const missing = REQUIRED_HEADERS.filter((h) => !headers.includes(h));
      if (missing.length > 0) {
        toast.error(`Missing required columns: ${missing.join(", ")}`);
        return;
      }

      // Normalize dates (YYYY-MM-DD)
      const normalized = rows.map((r) => {
        const out: any = {};
        Object.keys(r).forEach((k) => {
          const v = r[k];
          if (v instanceof Date) {
            out[k] = v.toISOString().split("T")[0];
          } else {
            out[k] = typeof v === "string" ? v.trim() : v;
          }
        });
        return out;
      });

      setParsedRows(normalized);
      toast.success(`${normalized.length} rows loaded. Ready to import.`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to read the Excel file.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  /* ---------- Drag & drop ---------- */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processFile(file);
  };

  /* ---------- Submit import ---------- */
  const handleImport = async () => {
    if (parsedRows.length === 0) {
      toast.error("Please select a file first.");
      return;
    }

    try {
      const res = await bulkImport({ candidates: parsedRows }).unwrap();
      setResult(res.data);
      toast.success(res.message);
    } catch (err: any) {
      toast.error(err?.data?.message || "Import failed.");
    }
  };

  /* ---------- Reset ---------- */
  const handleReset = () => {
    setFileName("");
    setParsedRows([]);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6 text-white">
      {/* ======================== Step 1 ======================== */}
      <SectionCard
        title="Step 1 — Download Template"
        description="Use our Excel template so all required columns are correctly named."
        icon={<Download className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              Download Excel Template
            </button>

            <div className="text-xs text-gray-400 flex flex-wrap items-center gap-1">
              <span>Required:</span>
              {REQUIRED_HEADERS.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border border-blue-800 bg-blue-900/30 text-blue-300"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Columns viewer */}
          <div className="rounded-lg border border-gray-800 bg-gray-900/50 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowColumns((v) => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
            >
              <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-300">
                <Info className="h-4 w-4 text-blue-400" />
                View all {TEMPLATE_HEADERS.length} supported columns
                <span className="text-xs text-gray-500 font-normal">
                  (grouped by section)
                </span>
              </span>
              {showColumns ? (
                <ChevronUp className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </button>

            <AnimatePresence initial={false}>
              {showColumns && (
                <motion.div
                  key="columns"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 grid grid-cols-1 md:grid-cols-2 gap-3 border-t border-gray-800 pt-4">
                    {COLUMN_GROUPS.map(({ group, columns }) => (
                      <div
                        key={group}
                        className="rounded-lg border border-gray-800 bg-gray-900 p-3"
                      >
                        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">
                          {group}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {columns.map((c) => (
                            <span
                              key={c}
                              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono border ${
                                REQUIRED_HEADERS.includes(c)
                                  ? "border-blue-800 bg-blue-900/30 text-blue-300"
                                  : "border-gray-700 bg-gray-800 text-gray-400"
                              }`}
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </SectionCard>

      {/* ======================== Step 2 ======================== */}
      <SectionCard
        title="Step 2 — Upload Filled File"
        description="Supported formats: .xlsx, .xls, .csv"
        icon={<Upload className="h-5 w-5" />}
      >
        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileChange}
            className="hidden"
          />

          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-900/10"
                : "border-gray-700 hover:border-blue-500/50 hover:bg-gray-800/50"
            }`}
          >
            <FileSpreadsheet className="h-10 w-10 mx-auto text-gray-500 mb-3" />
            {fileName ? (
              <p className="font-medium text-white">{fileName}</p>
            ) : (
              <p className="text-gray-400">
                Click to choose a file or drag &amp; drop
              </p>
            )}
            {parsedRows.length > 0 && (
              <p className="text-sm text-green-400 mt-2">
                {parsedRows.length} rows ready to import
              </p>
            )}
          </div>

          {/* Preview */}
          <AnimatePresence>
            {parsedRows.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="border border-gray-800 rounded-lg max-h-64 overflow-auto"
              >
                <table className="w-full text-sm">
                  <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wide sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">#</th>
                      <th className="text-left px-4 py-3 font-medium">First Name</th>
                      <th className="text-left px-4 py-3 font-medium">Mobile</th>
                      <th className="text-left px-4 py-3 font-medium">Passport</th>
                      <th className="text-left px-4 py-3 font-medium">NID</th>
                      <th className="text-left px-4 py-3 font-medium">Trade</th>
                      <th className="text-left px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {parsedRows.slice(0, 10).map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-gray-300">{i + 1}</td>
                        <td className="px-4 py-3 text-white">
                          {row.firstName || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {row.mobile || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">
                          {row.passportNumber || "-"}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-gray-300">
                          {row.nidNumber || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {row.trade || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {row.candidateStatus || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {parsedRows.length > 10 && (
                  <p className="text-xs text-gray-500 p-2 text-center border-t border-gray-800">
                    Showing first 10 of {parsedRows.length} rows
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex gap-3">
            <button
              onClick={handleImport}
              disabled={isLoading || parsedRows.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Import {parsedRows.length > 0 && `(${parsedRows.length})`}
                </>
              )}
            </button>
            {parsedRows.length > 0 && (
              <button
                onClick={handleReset}
                disabled={isLoading}
                className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </SectionCard>

      {/* ======================== Step 3 ======================== */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <SectionCard
              title="Step 3 — Import Results"
              icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
            >
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <SummaryCard
                    icon={<CheckCircle2 className="h-5 w-5 text-green-400" />}
                    label="Inserted"
                    value={result.insertedCount}
                    color="green"
                  />
                  <SummaryCard
                    icon={<AlertTriangle className="h-5 w-5 text-yellow-400" />}
                    label="Duplicates Skipped"
                    value={result.duplicateCount}
                    color="yellow"
                  />
                  <SummaryCard
                    icon={<XCircle className="h-5 w-5 text-red-400" />}
                    label="Failed"
                    value={result.failedCount}
                    color="red"
                  />
                </div>

                {/* Duplicates */}
                {result.duplicates.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                      <AlertTriangle className="h-4 w-4 text-yellow-400" />
                      Duplicate Passports
                    </h4>
                    <div className="border border-gray-800 rounded-lg max-h-48 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wide sticky top-0">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium">Row</th>
                            <th className="text-left px-4 py-3 font-medium">Passport</th>
                            <th className="text-left px-4 py-3 font-medium">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {result.duplicates.map((d, i) => (
                            <tr
                              key={i}
                              className="hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-300">{d.row}</td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-300">
                                {d.passportNumber}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-400">
                                {d.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Failed */}
                {result.failed.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-white">
                      <XCircle className="h-4 w-4 text-red-400" />
                      Failed Rows
                    </h4>
                    <div className="border border-gray-800 rounded-lg max-h-48 overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-800/50 text-gray-400 text-xs uppercase tracking-wide sticky top-0">
                          <tr>
                            <th className="text-left px-4 py-3 font-medium">Row</th>
                            <th className="text-left px-4 py-3 font-medium">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                          {result.failed.map((f, i) => (
                            <tr
                              key={i}
                              className="hover:bg-gray-800/50 transition-colors"
                            >
                              <td className="px-4 py-3 text-gray-300">{f.row}</td>
                              <td className="px-4 py-3 text-sm text-gray-400">
                                {f.reason}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleReset}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  Import Another File
                </button>
              </div>
            </SectionCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   HELPER COMPONENTS
============================================================ */

function SectionCard({
  title,
  description,
  icon,
  children,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-800">
        <h3 className="text-base font-semibold text-white flex items-center gap-2">
          {icon}
          {title}
        </h3>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "green" | "yellow" | "red";
}) {
  const bg = {
    green: "bg-green-900/20 border-green-800",
    yellow: "bg-yellow-900/20 border-yellow-800",
    red: "bg-red-900/20 border-red-800",
  }[color];

  const textColor = {
    green: "text-green-300",
    yellow: "text-yellow-300",
    red: "text-red-300",
  }[color];

  return (
    <div className={`rounded-lg border p-4 ${bg}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-gray-400">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${textColor}`}>{value}</p>
    </div>
  );
}