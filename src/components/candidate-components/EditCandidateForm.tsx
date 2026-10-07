// @/components/candidate-components/EditCandidateForm.tsx
"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Save,
  Upload,
  FileText,
  User,
  Phone,
  CreditCard,
  Briefcase,
  Stethoscope,
  FileCheck,
  GraduationCap,
  ShieldCheck,
  Ticket,
  Rocket,
  Globe,
  StickyNote,
  FolderOpen,
  Plus,
  Trash2,
  ExternalLink,
  X,
  ChevronLeft,
  RefreshCw,
  AlertTriangle,
  Eye,
} from "lucide-react";

import {
  useGetCandidateByIdQuery,
  useUpdateCandidateMutation,
} from "@/redux/api/candidates/candidateApi";
import { useUploadDocumentMutation } from "@/redux/features/file/fileApi";


/* ============================================================
   TYPES
============================================================ */

interface FileValue {
  name: string;
  url: string;
  file?: File;
  isExisting?: boolean; // came from server
}

interface CandidateDocumentItem {
  name: string;
  type: string;
  url: string;
  uploadedAt: string;
  isNew?: boolean;
}

/* ============================================================
   ZOD SCHEMA
============================================================ */

const candidateSchema = z.object({
  /* ---------- Personal ---------- */
  firstName: z.string().min(1, "First name is required"),
  middleName: z.string().optional().nullable(),
  lastName: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  motherName: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.enum(["male", "female", "other"]).optional().nullable(),
  religion: z.string().optional().nullable(),
  maritalStatus: z
    .enum(["single", "married", "divorced", "widowed"])
    .optional()
    .nullable(),
  bloodGroup: z.string().optional().nullable(),

  /* ---------- NID ---------- */
  nidNumber: z.string().optional().nullable(),
  birthCertificateNumber: z.string().optional().nullable(),

  /* ---------- Contact ---------- */
  mobile: z.string().min(6, "Mobile is required"),
  alternateMobile: z.string().optional().nullable(),
  email: z
    .string()
    .email("Invalid email")
    .optional()
    .nullable()
    .or(z.literal("")),

  /* ---------- Address ---------- */
  address: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  upazila: z.string().optional().nullable(),
  division: z.string().optional().nullable(),
  postalCode: z.string().optional().nullable(),
  country: z.string().optional().nullable(),

  /* ---------- Passport ---------- */
  passportNumber: z.string().min(1, "Passport number is required"),
  oldPassportNumber: z.string().optional().nullable(),
  passportIssueDate: z.string().optional().nullable(),
  passportExpiryDate: z.string().optional().nullable(),
  passportIssuePlace: z.string().optional().nullable(),
  passportStatus: z
    .enum(["valid", "expired", "renewed", "lost", "damaged"])
    .optional(),

  /* ---------- Assignment ---------- */
  reference: z.string().optional().nullable(),
  trade: z.string().min(1, "Trade is required"),
  destination: z.string().optional().nullable(),

  /* ---------- Recruitment ---------- */
  interviewDate: z.string().optional().nullable(),
  cvStatus: z
    .enum(["not_sent", "sent", "shortlisted", "rejected"])
    .optional(),
  cvSentDate: z.string().optional().nullable(),
  selectionStatus: z
    .enum([
      "registered", "screening", "cv_preparing", "cv_sent", "shortlisted",
      "interview", "selected", "rejected", "cancelled", "not_willing",
      "duplicate", "on_hold",
    ])
    .optional(),

  /* ---------- Medical ---------- */
  medicalStatus: z
    .enum([
      "not_started", "appointment_booked", "report_pending",
      "fit", "unfit", "retest", "cancelled",
    ])
    .optional(),
  medicalCenter: z.string().optional().nullable(),
  medicalAppointmentDate: z.string().optional().nullable(),
  medicalResultDate: z.string().optional().nullable(),
  medicalExpiryDate: z.string().optional().nullable(),

  /* ---------- Visa ---------- */
  visaStatus: z
    .enum([
      "not_started", "applied", "approved", "stamped",
      "rejected", "expired", "cancelled",
    ])
    .optional(),
  visaNumber: z.string().optional().nullable(),
  visaApplicationNo: z.string().optional().nullable(),
  visaType: z.string().optional().nullable(),
  visaSubmissionDate: z.string().optional().nullable(),
  visaApprovalDate: z.string().optional().nullable(),
  visaStampingDate: z.string().optional().nullable(),
  visaExpiryDate: z.string().optional().nullable(),

  /* ---------- Country Processing ---------- */
  gamcaStatus: z.string().optional().nullable(),
  pccStatus: z.string().optional().nullable(),
  biometricStatus: z.string().optional().nullable(),
  mofaStatus: z.string().optional().nullable(),
  tasheerStatus: z.string().optional().nullable(),
  countryProcessingNotes: z.string().optional().nullable(),

  /* ---------- Training ---------- */
  trainingStatus: z
    .enum([
      "not_required", "not_started", "admission_pending", "admitted",
      "started", "completed", "dropped", "did_not_take_admission", "cancelled",
    ])
    .optional(),
  trainingCenter: z.string().optional().nullable(),
  trainingStartDate: z.string().optional().nullable(),
  trainingEndDate: z.string().optional().nullable(),

  /* ---------- BMET ---------- */
  bmetStatus: z
    .enum([
      "not_started", "document_pending", "submitted",
      "under_process", "completed", "rejected",
    ])
    .optional(),
  bmetSubmissionDate: z.string().optional().nullable(),
  bmetClearanceDate: z.string().optional().nullable(),
  bmetReference: z.string().optional().nullable(),

  /* ---------- Ticket & Flight ---------- */
  ticketStatus: z
    .enum([
      "not_ready", "ready_for_ticket", "ticket_requested", "ticket_received",
      "pta_pending", "flight_booked", "departed", "arrived",
      "flight_missed", "cancelled",
    ])
    .optional(),
  ptaStatus: z.enum(["not_sent", "requested", "sent"]).optional(),
  ticketNumber: z.string().optional().nullable(),
  ticketRequestDate: z.string().optional().nullable(),
  ticketReceivedDate: z.string().optional().nullable(),
  airline: z.string().optional().nullable(),
  pnr: z.string().optional().nullable(),
  flightNumber: z.string().optional().nullable(),
  flightRoute: z.string().optional().nullable(),
  flightDate: z.string().optional().nullable(),
  flightTime: z.string().optional().nullable(),
  flightStatus: z
    .enum(["not_booked", "booked", "done", "missed", "cancelled", "rescheduled"])
    .optional(),

  /* ---------- Deployment ---------- */
  departureDate: z.string().optional().nullable(),
  arrivalDate: z.string().optional().nullable(),
  clientReceivedDate: z.string().optional().nullable(),
  joiningDate: z.string().optional().nullable(),
  deploymentStatus: z
    .enum([
      "not_deployed", "ready", "in_transit", "deployed", "returned", "cancelled",
    ])
    .optional(),

  /* ---------- Overall ---------- */
  candidateStatus: z
    .enum([
      "registered", "selected", "cancelled", "medically_fit", "medically_unfit",
      "visa_stamped", "training_completed", "bmet_completed", "ticketed",
      "flown", "flight_missed", "deployed",
    ])
    .optional(),

  /* ---------- Meta ---------- */
  remarks: z.string().optional().nullable(),
  cancellationReason: z.string().optional().nullable(),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

/* ============================================================
   CONSTANTS
============================================================ */

const TRADES = [
  "HELPER", "MASON", "CARPENTER", "STEEL FIXER", "ELECTRICIAN",
  "PLUMBER", "WELDER", "PAINTER", "DRIVER", "CLEANER",
  "SECURITY GUARD", "COOK", "OTHER",
];

const COUNTRIES = [
  "Bangladesh", "Dubai/UAE", "Saudi Arabia (KSA)", "Qatar",
  "Kuwait", "Oman", "Malaysia", "Other",
];

const RELIGIONS = ["Islam", "Hindu", "Christian", "Buddhist", "Other"];

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DOCUMENT_TYPES = [
  "passport", "nid", "birth_certificate", "medical", "visa",
  "training", "bmet", "ticket", "photo", "cv",
  "police_clearance", "other",
];

const CV_STATUS_OPTIONS = ["not_sent", "sent", "shortlisted", "rejected"];
const SELECTION_STATUS_OPTIONS = [
  "registered", "screening", "cv_preparing", "cv_sent", "shortlisted",
  "interview", "selected", "rejected", "cancelled", "not_willing",
  "duplicate", "on_hold",
];
const MEDICAL_STATUS_OPTIONS = [
  "not_started", "appointment_booked", "report_pending",
  "fit", "unfit", "retest", "cancelled",
];
const VISA_STATUS_OPTIONS = [
  "not_started", "applied", "approved", "stamped",
  "rejected", "expired", "cancelled",
];
const TRAINING_STATUS_OPTIONS = [
  "not_required", "not_started", "admission_pending", "admitted",
  "started", "completed", "dropped", "did_not_take_admission", "cancelled",
];
const BMET_STATUS_OPTIONS = [
  "not_started", "document_pending", "submitted",
  "under_process", "completed", "rejected",
];
const TICKET_STATUS_OPTIONS = [
  "not_ready", "ready_for_ticket", "ticket_requested", "ticket_received",
  "pta_pending", "flight_booked", "departed", "arrived",
  "flight_missed", "cancelled",
];
const PTA_STATUS_OPTIONS = ["not_sent", "requested", "sent"];
const FLIGHT_STATUS_OPTIONS = [
  "not_booked", "booked", "done", "missed", "cancelled", "rescheduled",
];
const DEPLOYMENT_STATUS_OPTIONS = [
  "not_deployed", "ready", "in_transit", "deployed", "returned", "cancelled",
];
const CANDIDATE_STATUS_OPTIONS = [
  "registered", "selected", "cancelled", "medically_fit", "medically_unfit",
  "visa_stamped", "training_completed", "bmet_completed", "ticketed",
  "flown", "flight_missed", "deployed",
];

/* ============================================================
   STYLES
============================================================ */

const inputCls =
  "w-full px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-white placeholder:text-gray-500 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50";

const labelCls = "block text-sm font-medium text-gray-300";

/* ============================================================
   HELPERS
============================================================ */

function formatEnum(v: string) {
  return v.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function toDateInput(value: any): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

function parseDocuments(raw: any): CandidateDocumentItem[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

/* ============================================================
   SECTION CONFIG
============================================================ */

type SectionKey =
  | "personal"
  | "identity"
  | "contact"
  | "passport"
  | "assignment"
  | "medical"
  | "visa"
  | "training"
  | "bmet"
  | "ticket"
  | "deployment"
  | "documents"
  | "meta";

const SECTIONS: { key: SectionKey; label: string; icon: React.ReactNode }[] = [
  { key: "personal", label: "Personal", icon: <User className="h-4 w-4" /> },
  { key: "identity", label: "NID & Identity", icon: <FileCheck className="h-4 w-4" /> },
  { key: "contact", label: "Contact & Address", icon: <Phone className="h-4 w-4" /> },
  { key: "passport", label: "Passport", icon: <CreditCard className="h-4 w-4" /> },
  { key: "assignment", label: "Assignment", icon: <Briefcase className="h-4 w-4" /> },
  { key: "medical", label: "Medical", icon: <Stethoscope className="h-4 w-4" /> },
  { key: "visa", label: "Visa & Country", icon: <Globe className="h-4 w-4" /> },
  { key: "training", label: "Training", icon: <GraduationCap className="h-4 w-4" /> },
  { key: "bmet", label: "BMET", icon: <ShieldCheck className="h-4 w-4" /> },
  { key: "ticket", label: "Ticket & Flight", icon: <Ticket className="h-4 w-4" /> },
  { key: "deployment", label: "Deployment", icon: <Rocket className="h-4 w-4" /> },
  { key: "documents", label: "Documents", icon: <FolderOpen className="h-4 w-4" /> },
  { key: "meta", label: "Status & Remarks", icon: <StickyNote className="h-4 w-4" /> },
];

/* ============================================================
   ANIMATIONS
============================================================ */

const sectionVariants = {
  initial: { opacity: 0, x: 20, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -20, filter: "blur(4px)" },
};

/* ============================================================
   FILE UPLOAD FIELD
============================================================ */

function FileUploadField({
  label,
  value,
  onChange,
  accept = "image/*,application/pdf",
}: {
  label: string;
  value: FileValue | null;
  onChange: (v: FileValue | null) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isImage =
    value?.url && /\.(jpg|jpeg|png|webp|gif)$/i.test(value.url);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    onChange({ name: file.name, url, file });
    toast.success(`${file.name} selected`);
  };

  const handleClear = () => {
    if (value?.url?.startsWith("blob:")) URL.revokeObjectURL(value.url);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-2">
      <label className={labelCls}>{label}</label>
      <div className="flex items-start gap-2">
        <label className="flex-1 flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-400 hover:bg-gray-750 hover:border-gray-600 cursor-pointer transition-colors">
          <FileText className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">
            {value?.name || "Choose file to replace..."}
          </span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleFile}
            className="hidden"
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="px-3 py-2.5 text-xs font-medium rounded-lg border border-red-800 bg-red-900/20 text-red-300 hover:bg-red-900/30 transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      <AnimatePresence>
        {value && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="relative rounded-lg border border-gray-700 bg-gray-800/50 p-2">
              {isImage ? (
                <img
                  src={value.url}
                  alt={value.name}
                  className="w-full h-32 object-cover rounded-md"
                />
              ) : (
                <div className="flex items-center gap-3 p-3">
                  <FileText className="h-8 w-8 text-blue-400" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-white truncate">{value.name}</p>
                    <p className="text-xs text-gray-400">
                      {value.isExisting ? "Existing file" : "PDF Document"}
                    </p>
                  </div>
                  <a
                    href={value.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              )}

              {/* Preview actions */}
              <div className="flex items-center justify-between mt-2 px-1">
                <a
                  href={value.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 inline-flex items-center gap-1 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Open
                </a>
                <button
                  type="button"
                  onClick={handleClear}
                  className="text-xs text-red-400 inline-flex items-center gap-1 hover:underline"
                >
                  <X className="h-3 w-3" />
                  Remove
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function EditCandidateForm({
  candidateId,
}: {
  candidateId: string;
}) {
  const router = useRouter();
  const [updateCandidate, { isLoading: isUpdating }] = useUpdateCandidateMutation();
  const [uploadDocument] = useUploadDocumentMutation();

  const { data, isLoading, isError } = useGetCandidateByIdQuery(candidateId, {
    skip: !candidateId,
  });

  const candidate: any = data?.data;

  const [section, setSection] = useState<SectionKey>("personal");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  /* ---------- Single-file uploads ---------- */
  const [nidFrontImage, setNidFrontImage] = useState<FileValue | null>(null);
  const [nidBackImage, setNidBackImage] = useState<FileValue | null>(null);
  const [birthCertificateImage, setBirthCertificateImage] = useState<FileValue | null>(null);
  const [photo, setPhoto] = useState<FileValue | null>(null);
  const [passportDocument, setPassportDocument] = useState<FileValue | null>(null);
  const [cvDocument, setCvDocument] = useState<FileValue | null>(null);
  const [medicalDocument, setMedicalDocument] = useState<FileValue | null>(null);
  const [visaDocument, setVisaDocument] = useState<FileValue | null>(null);
  const [trainingCertificate, setTrainingCertificate] = useState<FileValue | null>(null);
  const [bmetDocument, setBmetDocument] = useState<FileValue | null>(null);
  const [flightDocument, setFlightDocument] = useState<FileValue | null>(null);

  /* ---------- Documents list ---------- */
  const [documents, setDocuments] = useState<CandidateDocumentItem[]>([]);

  /* ---------- Form ---------- */
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
  });

  /* ---------- Hydrate form when candidate loads ---------- */
  useEffect(() => {
    if (!candidate) return;

    reset({
      firstName: candidate.firstName ?? "",
      middleName: candidate.middleName ?? "",
      lastName: candidate.lastName ?? "",
      fatherName: candidate.fatherName ?? "",
      motherName: candidate.motherName ?? "",
      dateOfBirth: toDateInput(candidate.dateOfBirth),
      gender: candidate.gender ?? "male",
      religion: candidate.religion ?? "",
      maritalStatus: candidate.maritalStatus ?? "single",
      bloodGroup: candidate.bloodGroup ?? "",
      nidNumber: candidate.nidNumber ?? "",
      birthCertificateNumber: candidate.birthCertificateNumber ?? "",
      mobile: candidate.mobile ?? "",
      alternateMobile: candidate.alternateMobile ?? "",
      email: candidate.email ?? "",
      address: candidate.address ?? "",
      district: candidate.district ?? "",
      upazila: candidate.upazila ?? "",
      division: candidate.division ?? "",
      postalCode: candidate.postalCode ?? "",
      country: candidate.country ?? "",
      passportNumber: candidate.passportNumber ?? "",
      oldPassportNumber: candidate.oldPassportNumber ?? "",
      passportIssueDate: toDateInput(candidate.passportIssueDate),
      passportExpiryDate: toDateInput(candidate.passportExpiryDate),
      passportIssuePlace: candidate.passportIssuePlace ?? "",
      passportStatus: candidate.passportStatus ?? "valid",
      reference: candidate.reference ?? "",
      trade: candidate.trade ?? "",
      destination: candidate.destination ?? "",
      interviewDate: toDateInput(candidate.interviewDate),
      cvStatus: candidate.cvStatus ?? "not_sent",
      cvSentDate: toDateInput(candidate.cvSentDate),
      selectionStatus: candidate.selectionStatus ?? "registered",
      medicalStatus: candidate.medicalStatus ?? "not_started",
      medicalCenter: candidate.medicalCenter ?? "",
      medicalAppointmentDate: toDateInput(candidate.medicalAppointmentDate),
      medicalResultDate: toDateInput(candidate.medicalResultDate),
      medicalExpiryDate: toDateInput(candidate.medicalExpiryDate),
      visaStatus: candidate.visaStatus ?? "not_started",
      visaNumber: candidate.visaNumber ?? "",
      visaApplicationNo: candidate.visaApplicationNo ?? "",
      visaType: candidate.visaType ?? "",
      visaSubmissionDate: toDateInput(candidate.visaSubmissionDate),
      visaApprovalDate: toDateInput(candidate.visaApprovalDate),
      visaStampingDate: toDateInput(candidate.visaStampingDate),
      visaExpiryDate: toDateInput(candidate.visaExpiryDate),
      gamcaStatus: candidate.gamcaStatus ?? "",
      pccStatus: candidate.pccStatus ?? "",
      biometricStatus: candidate.biometricStatus ?? "",
      mofaStatus: candidate.mofaStatus ?? "",
      tasheerStatus: candidate.tasheerStatus ?? "",
      countryProcessingNotes: candidate.countryProcessingNotes ?? "",
      trainingStatus: candidate.trainingStatus ?? "not_required",
      trainingCenter: candidate.trainingCenter ?? "",
      trainingStartDate: toDateInput(candidate.trainingStartDate),
      trainingEndDate: toDateInput(candidate.trainingEndDate),
      bmetStatus: candidate.bmetStatus ?? "not_started",
      bmetSubmissionDate: toDateInput(candidate.bmetSubmissionDate),
      bmetClearanceDate: toDateInput(candidate.bmetClearanceDate),
      bmetReference: candidate.bmetReference ?? "",
      ticketStatus: candidate.ticketStatus ?? "not_ready",
      ptaStatus: candidate.ptaStatus ?? "not_sent",
      ticketNumber: candidate.ticketNumber ?? "",
      ticketRequestDate: toDateInput(candidate.ticketRequestDate),
      ticketReceivedDate: toDateInput(candidate.ticketReceivedDate),
      airline: candidate.airline ?? "",
      pnr: candidate.pnr ?? "",
      flightNumber: candidate.flightNumber ?? "",
      flightRoute: candidate.flightRoute ?? "",
      flightDate: toDateInput(candidate.flightDate),
      flightTime: candidate.flightTime ?? "",
      flightStatus: candidate.flightStatus ?? "not_booked",
      departureDate: toDateInput(candidate.departureDate),
      arrivalDate: toDateInput(candidate.arrivalDate),
      clientReceivedDate: toDateInput(candidate.clientReceivedDate),
      joiningDate: toDateInput(candidate.joiningDate),
      deploymentStatus: candidate.deploymentStatus ?? "not_deployed",
      candidateStatus: candidate.candidateStatus ?? "registered",
      remarks: candidate.remarks ?? "",
      cancellationReason: candidate.cancellationReason ?? "",
    });

    // Hydrate single-file values
    const setIfExists = (
      field: string | null | undefined,
      setter: (v: FileValue | null) => void
    ) => {
      if (field) {
        setter({
          name: field.split("/").pop() || "file",
          url: field,
          isExisting: true,
        });
      } else {
        setter(null);
      }
    };

    setIfExists(candidate.nidFrontImage, setNidFrontImage);
    setIfExists(candidate.nidBackImage, setNidBackImage);
    setIfExists(candidate.birthCertificateImage, setBirthCertificateImage);
    setIfExists(candidate.photo, setPhoto);
    setIfExists(candidate.passportDocument, setPassportDocument);
    setIfExists(candidate.cvDocument, setCvDocument);
    setIfExists(candidate.medicalDocument, setMedicalDocument);
    setIfExists(candidate.visaDocument, setVisaDocument);
    setIfExists(candidate.trainingCertificate, setTrainingCertificate);
    setIfExists(candidate.bmetDocument, setBmetDocument);
    setIfExists(candidate.flightDocument, setFlightDocument);

    // Hydrate documents list
    setDocuments(parseDocuments(candidate.documents));
  }, [candidate, reset]);

  /* ============================================================
     UPLOAD HELPERS
  ============================================================ */

  const uploadSingleFile = useCallback(
    async (fileValue: FileValue | null, label: string): Promise<string | null> => {
      if (!fileValue) return null;
      // Existing file — reuse URL
      if (fileValue.isExisting && !fileValue.file) return fileValue.url;

      // New file — upload it
      if (fileValue.file) {
        try {
          setUploadProgress(`Uploading ${label}...`);
          const formData = new FormData();
          formData.append("document", fileValue.file);
          const res = await uploadDocument(formData).unwrap();
          if (res.success && res.data?.path) return res.data.path;
          throw new Error(res.message || "Upload failed");
        } catch (err: any) {
          toast.error(`Failed to upload ${label}`);
          throw err;
        }
      }
      return null;
    },
    [uploadDocument]
  );

  const uploadAllFiles = useCallback(async () => {
    const fileMap: Array<[string, FileValue | null]> = [
      ["nidFrontImage", nidFrontImage],
      ["nidBackImage", nidBackImage],
      ["birthCertificateImage", birthCertificateImage],
      ["photo", photo],
      ["passportDocument", passportDocument],
      ["cvDocument", cvDocument],
      ["medicalDocument", medicalDocument],
      ["visaDocument", visaDocument],
      ["trainingCertificate", trainingCertificate],
      ["bmetDocument", bmetDocument],
      ["flightDocument", flightDocument],
    ];

    const results: Record<string, string | null> = {};
    for (const [key, fileValue] of fileMap) {
      results[key] = await uploadSingleFile(fileValue, key);
    }
    return results;
  }, [
    nidFrontImage, nidBackImage, birthCertificateImage, photo,
    passportDocument, cvDocument, medicalDocument, visaDocument,
    trainingCertificate, bmetDocument, flightDocument,
    uploadSingleFile,
  ]);

  /* ============================================================
     SUBMIT
  ============================================================ */

  const onSubmit = async (values: CandidateFormValues) => {
    setIsSubmitting(true);
    setUploadProgress("Preparing...");

    try {
      const uploadedFiles = await uploadAllFiles();

      setUploadProgress("Updating candidate...");

      const payload: any = {};
      Object.entries(values).forEach(([k, v]) => {
        payload[k] = v === "" ? null : v;
      });

      if (uploadedFiles.nidFrontImage !== undefined) payload.nidFrontImage = uploadedFiles.nidFrontImage;
      if (uploadedFiles.nidBackImage !== undefined) payload.nidBackImage = uploadedFiles.nidBackImage;
      if (uploadedFiles.birthCertificateImage !== undefined) payload.birthCertificateImage = uploadedFiles.birthCertificateImage;
      if (uploadedFiles.photo !== undefined) payload.photo = uploadedFiles.photo;
      if (uploadedFiles.passportDocument !== undefined) payload.passportDocument = uploadedFiles.passportDocument;
      if (uploadedFiles.cvDocument !== undefined) payload.cvDocument = uploadedFiles.cvDocument;
      if (uploadedFiles.medicalDocument !== undefined) payload.medicalDocument = uploadedFiles.medicalDocument;
      if (uploadedFiles.visaDocument !== undefined) payload.visaDocument = uploadedFiles.visaDocument;
      if (uploadedFiles.trainingCertificate !== undefined) payload.trainingCertificate = uploadedFiles.trainingCertificate;
      if (uploadedFiles.bmetDocument !== undefined) payload.bmetDocument = uploadedFiles.bmetDocument;
      if (uploadedFiles.flightDocument !== undefined) payload.flightDocument = uploadedFiles.flightDocument;

      // Documents list (strip client-only flags)
      payload.documents = documents.map(({ isNew, ...rest }) => rest);

      const res = await updateCandidate({
        id: candidateId,
        data: payload,
      }).unwrap();

      toast.success(res.message || "Candidate updated successfully!");
      router.push(`/admin/candidates/candidate-profile/${candidateId}`);
    } catch (err: any) {
      const msg =
        err?.data?.message ||
        err?.message ||
        "Failed to update candidate. Please try again.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
      setUploadProgress("");
    }
  };

  /* ============================================================
     LOADING / ERROR STATES
  ============================================================ */

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        <p className="text-sm text-gray-500">Loading candidate details...</p>
      </div>
    );
  }

  if (isError || !candidate) {
    return (
      <div className="text-center py-24">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-white">Candidate not found</h2>
        <p className="text-gray-400 mt-1">
          The candidate you are trying to edit does not exist.
        </p>
        <button
          onClick={() => router.push("/admin/candidates")}
          className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Candidates
        </button>
      </div>
    );
  }

  /* ============================================================
     SECTION RENDERER
  ============================================================ */

  const renderSection = () => {
    switch (section) {
      case "personal":
        return (
          <SectionCard title="Personal Information" description="Basic identity details.">
            <FormField label="First Name" required error={errors.firstName?.message}>
              <input {...register("firstName")} placeholder="MD AMIR" className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Middle Name">
              <input {...register("middleName")} placeholder="HOSSAIN" className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Last Name">
              <input {...register("lastName")} placeholder="SHEIKH" className={inputCls} autoComplete="off" />
            </FormField>

            <FormField label="Father Name">
              <input {...register("fatherName")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Mother Name">
              <input {...register("motherName")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Date of Birth">
              <input type="date" {...register("dateOfBirth")} className={inputCls} />
            </FormField>

            <FormField label="Gender">
              <Controller
                control={control}
                name="gender"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                )}
              />
            </FormField>

            <FormField label="Marital Status">
              <Controller
                control={control}
                name="maritalStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    <option value="single">Single</option>
                    <option value="married">Married</option>
                    <option value="divorced">Divorced</option>
                    <option value="widowed">Widowed</option>
                  </select>
                )}
              />
            </FormField>

            <FormField label="Religion">
              <Controller
                control={control}
                name="religion"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select religion</option>
                    {RELIGIONS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Blood Group">
              <Controller
                control={control}
                name="bloodGroup"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
          </SectionCard>
        );

      case "identity":
        return (
          <SectionCard
            title="NID & Identity"
            description="National ID, birth certificate, and candidate photo."
          >
            {/* ─── Row 1: NID + Birth Cert (2 text inputs side by side) ─── */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField label="NID Number">
                <input
                  {...register("nidNumber")}
                  className={`${inputCls} font-mono`}
                  autoComplete="off"
                />
              </FormField>
              <FormField label="Birth Certificate Number">
                <input
                  {...register("birthCertificateNumber")}
                  className={`${inputCls} font-mono`}
                  autoComplete="off"
                />
              </FormField>
            </div>

            {/* ─── Row 2: 4 file uploads, equal width ─── */}
            <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FileUploadField
                label="NID Front Image"
                value={nidFrontImage}
                onChange={setNidFrontImage}
              />
              <FileUploadField
                label="NID Back Image"
                value={nidBackImage}
                onChange={setNidBackImage}
              />
              <FileUploadField
                label="Birth Certificate Image"
                value={birthCertificateImage}
                onChange={setBirthCertificateImage}
              />
              <FileUploadField
                label="Candidate Photo"
                value={photo}
                onChange={setPhoto}
              />
            </div>
          </SectionCard>
        );

      case "contact":
        return (
          <SectionCard title="Contact & Address">
            <FormField label="Mobile" required error={errors.mobile?.message}>
              <input {...register("mobile")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Alternate Mobile">
              <input {...register("alternateMobile")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <input type="email" {...register("email")} className={inputCls} autoComplete="off" />
            </FormField>

            <FormField label="District">
              <input {...register("district")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Upazila">
              <input {...register("upazila")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Division">
              <input {...register("division")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Postal Code">
              <input {...register("postalCode")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Country">
              <Controller
                control={control}
                name="country"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <div className="md:col-span-3">
              <FormField label="Full Address">
                <textarea {...register("address")} rows={2} className={inputCls} />
              </FormField>
            </div>
          </SectionCard>
        );

      case "passport":
        return (
          <SectionCard
            title="Passport"
            description="Passport number must be unique across the system."
          >
            <FormField label="Passport Number" required error={errors.passportNumber?.message}>
              <input {...register("passportNumber")} className={`${inputCls} uppercase`} autoComplete="off" />
            </FormField>
            <FormField label="Old Passport Number">
              <input {...register("oldPassportNumber")} className={`${inputCls} uppercase`} autoComplete="off" />
            </FormField>
            <FormField label="Passport Status">
              <Controller
                control={control}
                name="passportStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    <option value="valid">Valid</option>
                    <option value="expired">Expired</option>
                    <option value="renewed">Renewed</option>
                    <option value="lost">Lost</option>
                    <option value="damaged">Damaged</option>
                  </select>
                )}
              />
            </FormField>

            <FormField label="Passport Issue Date">
              <input type="date" {...register("passportIssueDate")} className={inputCls} />
            </FormField>
            <FormField label="Passport Expiry Date">
              <input type="date" {...register("passportExpiryDate")} className={inputCls} />
            </FormField>
            <FormField label="Issue Place">
              <input {...register("passportIssuePlace")} className={inputCls} autoComplete="off" />
            </FormField>

            <div className="md:col-span-3">
              <FileUploadField
                label="Passport Document (Scan)"
                value={passportDocument}
                onChange={setPassportDocument}
              />
            </div>
          </SectionCard>
        );

      case "assignment":
        return (
          <SectionCard
            title="Assignment & Recruitment"
            description="Trade, reference agency, and recruitment pipeline."
          >
            <FormField label="Trade" required error={errors.trade?.message}>
              <Controller
                control={control}
                name="trade"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select trade</option>
                    {TRADES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Reference / Agency">
              <input {...register("reference")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Destination Country">
              <Controller
                control={control}
                name="destination"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select destination</option>
                    {COUNTRIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>

            <FormField label="Interview Date">
              <input type="date" {...register("interviewDate")} className={inputCls} />
            </FormField>
            <FormField label="CV Status">
              <Controller
                control={control}
                name="cvStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {CV_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="CV Sent Date">
              <input type="date" {...register("cvSentDate")} className={inputCls} />
            </FormField>

            <FormField label="Selection Status">
              <Controller
                control={control}
                name="selectionStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {SELECTION_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>

            <div className="md:col-span-3">
              <FileUploadField label="CV Document" value={cvDocument} onChange={setCvDocument} />
            </div>
          </SectionCard>
        );

      case "medical":
        return (
          <SectionCard title="Medical Information">
            <FormField label="Medical Status">
              <Controller
                control={control}
                name="medicalStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {MEDICAL_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Medical Center">
              <input {...register("medicalCenter")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Appointment Date">
              <input type="date" {...register("medicalAppointmentDate")} className={inputCls} />
            </FormField>
            <FormField label="Result Date">
              <input type="date" {...register("medicalResultDate")} className={inputCls} />
            </FormField>
            <FormField label="Medical Expiry Date">
              <input type="date" {...register("medicalExpiryDate")} className={inputCls} />
            </FormField>

            <div className="md:col-span-3">
              <FileUploadField
                label="Medical Document"
                value={medicalDocument}
                onChange={setMedicalDocument}
              />
            </div>
          </SectionCard>
        );

      case "visa":
        return (
          <SectionCard title="Visa & Country Processing">
            <FormField label="Visa Status">
              <Controller
                control={control}
                name="visaStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {VISA_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Visa Number">
              <input {...register("visaNumber")} className={`${inputCls} font-mono`} autoComplete="off" />
            </FormField>
            <FormField label="Visa Application No.">
              <input {...register("visaApplicationNo")} className={`${inputCls} font-mono`} autoComplete="off" />
            </FormField>
            <FormField label="Visa Type">
              <input {...register("visaType")} className={inputCls} autoComplete="off" />
            </FormField>

            <FormField label="Submission Date">
              <input type="date" {...register("visaSubmissionDate")} className={inputCls} />
            </FormField>
            <FormField label="Approval Date">
              <input type="date" {...register("visaApprovalDate")} className={inputCls} />
            </FormField>
            <FormField label="Stamping Date">
              <input type="date" {...register("visaStampingDate")} className={inputCls} />
            </FormField>
            <FormField label="Visa Expiry Date">
              <input type="date" {...register("visaExpiryDate")} className={inputCls} />
            </FormField>

            <FormField label="GAMCA Status">
              <input {...register("gamcaStatus")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="PCC Status">
              <input {...register("pccStatus")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Biometric Status">
              <input {...register("biometricStatus")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="MOFA Status">
              <input {...register("mofaStatus")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Tasheer Status">
              <input {...register("tasheerStatus")} className={inputCls} autoComplete="off" />
            </FormField>
            <div className="md:col-span-3">
              <FormField label="Country Processing Notes">
                <textarea {...register("countryProcessingNotes")} rows={2} className={inputCls} />
              </FormField>
            </div>

            <div className="md:col-span-3">
              <FileUploadField label="Visa Document" value={visaDocument} onChange={setVisaDocument} />
            </div>
          </SectionCard>
        );

      case "training":
        return (
          <SectionCard title="Training">
            <FormField label="Training Status">
              <Controller
                control={control}
                name="trainingStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {TRAINING_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Training Center">
              <input {...register("trainingCenter")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Start Date">
              <input type="date" {...register("trainingStartDate")} className={inputCls} />
            </FormField>
            <FormField label="End Date">
              <input type="date" {...register("trainingEndDate")} className={inputCls} />
            </FormField>

            <div className="md:col-span-3">
              <FileUploadField
                label="Training Certificate"
                value={trainingCertificate}
                onChange={setTrainingCertificate}
              />
            </div>
          </SectionCard>
        );

      case "bmet":
        return (
          <SectionCard title="BMET">
            <FormField label="BMET Status">
              <Controller
                control={control}
                name="bmetStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {BMET_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Submission Date">
              <input type="date" {...register("bmetSubmissionDate")} className={inputCls} />
            </FormField>
            <FormField label="Clearance Date">
              <input type="date" {...register("bmetClearanceDate")} className={inputCls} />
            </FormField>
            <FormField label="BMET Reference">
              <input {...register("bmetReference")} className={inputCls} autoComplete="off" />
            </FormField>

            <div className="md:col-span-3">
              <FileUploadField label="BMET Document" value={bmetDocument} onChange={setBmetDocument} />
            </div>
          </SectionCard>
        );

      case "ticket":
        return (
          <SectionCard title="Ticket & Flight">
            <FormField label="Ticket Status">
              <Controller
                control={control}
                name="ticketStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {TICKET_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="PTA Status">
              <Controller
                control={control}
                name="ptaStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {PTA_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Ticket Number">
              <input {...register("ticketNumber")} className={`${inputCls} font-mono`} autoComplete="off" />
            </FormField>
            <FormField label="Ticket Request Date">
              <input type="date" {...register("ticketRequestDate")} className={inputCls} />
            </FormField>
            <FormField label="Ticket Received Date">
              <input type="date" {...register("ticketReceivedDate")} className={inputCls} />
            </FormField>

            <FormField label="Airline">
              <input {...register("airline")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="PNR">
              <input {...register("pnr")} className={`${inputCls} font-mono uppercase`} autoComplete="off" />
            </FormField>
            <FormField label="Flight Number">
              <input {...register("flightNumber")} className={`${inputCls} font-mono uppercase`} autoComplete="off" />
            </FormField>
            <FormField label="Flight Route">
              <input {...register("flightRoute")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Flight Date">
              <input type="date" {...register("flightDate")} className={inputCls} />
            </FormField>
            <FormField label="Flight Time">
              <input {...register("flightTime")} className={inputCls} autoComplete="off" />
            </FormField>
            <FormField label="Flight Status">
              <Controller
                control={control}
                name="flightStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {FLIGHT_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>

            <div className="md:col-span-3">
              <FileUploadField label="Flight Document" value={flightDocument} onChange={setFlightDocument} />
            </div>
          </SectionCard>
        );

      case "deployment":
        return (
          <SectionCard title="Deployment">
            <FormField label="Deployment Status">
              <Controller
                control={control}
                name="deploymentStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {DEPLOYMENT_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>
            <FormField label="Departure Date">
              <input type="date" {...register("departureDate")} className={inputCls} />
            </FormField>
            <FormField label="Arrival Date">
              <input type="date" {...register("arrivalDate")} className={inputCls} />
            </FormField>
            <FormField label="Client Received Date">
              <input type="date" {...register("clientReceivedDate")} className={inputCls} />
            </FormField>
            <FormField label="Joining Date">
              <input type="date" {...register("joiningDate")} className={inputCls} />
            </FormField>
          </SectionCard>
        );

      case "documents":
        return (
          <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-800 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FolderOpen className="h-5 w-5" />
                  Documents ({documents.length})
                </h3>
                <p className="mt-1 text-sm text-gray-400">
                  Manage any number of documents — passport copy, medical report, police clearance, etc.
                </p>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {documents.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-800 rounded-lg">
                  <FileText className="h-10 w-10 mx-auto text-gray-600 mb-3" />
                  <p className="text-sm text-gray-500">
                    No documents yet. Click{" "}
                    <span className="text-white font-medium">"Add Document"</span>{" "}
                    below to add one.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <AnimatePresence>
                    {documents.map((doc, i) => (
                      <motion.div
                        key={`${doc.url}-${i}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="rounded-lg border border-gray-800 bg-gray-800/50 p-3 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {doc.name}
                              </p>
                              <p className="text-xs text-gray-400 uppercase">
                                {formatEnum(doc.type)}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(doc.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              setDocuments((prev) =>
                                prev.filter((_, idx) => idx !== i)
                              )
                            }
                            className="p-1 rounded text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors flex-shrink-0"
                            title="Remove"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-400 inline-flex items-center gap-1 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Open
                        </a>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}

              <AddDocumentInline
                onAdd={(doc) => {
                  setDocuments((prev) => [...prev, doc]);
                  toast.success("Document added to list!");
                }}
                uploadDocument={uploadDocument}
              />
            </div>
          </div>
        );

      case "meta":
        return (
          <SectionCard title="Overall Status & Remarks">
            <FormField label="Candidate Status">
              <Controller
                control={control}
                name="candidateStatus"
                render={({ field }) => (
                  <select value={field.value ?? ""} onChange={field.onChange} className={inputCls}>
                    <option value="">Select</option>
                    {CANDIDATE_STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>{formatEnum(o)}</option>
                    ))}
                  </select>
                )}
              />
            </FormField>

            <div className="md:col-span-3">
              <FormField label="Remarks">
                <textarea {...register("remarks")} rows={3} className={inputCls} />
              </FormField>
            </div>

            <div className="md:col-span-3">
              <FormField label="Cancellation Reason">
                <textarea {...register("cancellationReason")} rows={2} className={inputCls} />
              </FormField>
            </div>
          </SectionCard>
        );
    }
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="w-full text-white">
      {/* Upload overlay */}
      <AnimatePresence>
        {(isSubmitting || uploadProgress) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-900 border border-gray-700 rounded-xl p-8 shadow-2xl flex flex-col items-center gap-4 min-w-[300px]"
            >
              <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
              <p className="text-sm text-gray-300 font-medium">
                {uploadProgress || "Processing..."}
              </p>
              <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-600 rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-gray-700 bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Go back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Edit Candidate
            </h1>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              {candidate.candidateCode} — {candidate.fullName}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              router.push(`/admin/candidates/candidate-profile/${candidateId}`)
            }
            className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
          >
            <Eye className="h-4 w-4" />
            View Profile
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section tabs */}
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1 p-1 rounded-lg bg-gray-900 border border-gray-800 min-w-full">
            {SECTIONS.map((s) => (
              <button
                key={s.key}
                type="button"
                onClick={() => setSection(s.key)}
                className={`inline-flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${section === s.key
                    ? "bg-blue-600 text-white shadow"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-800"
                  }`}
              >
                {s.icon}
                {s.label}
                {s.key === "documents" && documents.length > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold rounded-full bg-blue-500 text-white">
                    {documents.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Active section */}
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            variants={sectionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {renderSection()}
          </motion.div>
        </AnimatePresence>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 sticky bottom-0 backdrop-blur py-4 border-t border-gray-800 -mx-4 px-4">
          <button
            type="button"
            onClick={() => router.back()}
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-900/30"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ============================================================
   INLINE ADD DOCUMENT
============================================================ */

function AddDocumentInline({
  onAdd,
  uploadDocument,
}: {
  onAdd: (doc: CandidateDocumentItem) => void;
  uploadDocument: any;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState("other");
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setUrl(URL.createObjectURL(f));
    if (!name) setName(f.name);
    toast.success(`${f.name} attached`);
  };

  const handleAdd = async () => {
    if (!name.trim()) {
      toast.error("Document name is required.");
      return;
    }
    if (!file && !url.trim()) {
      toast.error("Please attach a file or paste a URL.");
      return;
    }

    let finalUrl = url.trim();
    if (file) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("document", file);
        const res = await uploadDocument(formData).unwrap();
        if (res.success && res.data?.path) {
          finalUrl = res.data.path;
        } else {
          throw new Error(res.message || "Upload failed");
        }
      } catch (err: any) {
        toast.error(err?.data?.message || "Failed to upload document");
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    onAdd({
      name: name.trim(),
      type,
      url: finalUrl,
      uploadedAt: new Date().toISOString(),
      isNew: true,
    });
    setName("");
    setType("other");
    setUrl("");
    setFile(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4">
      <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add a Document
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="space-y-1.5">
          <label className={labelCls}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Passport Scan"
            className={inputCls}
          />
        </div>
        <div className="space-y-1.5">
          <label className={labelCls}>Type</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputCls}
          >
            {DOCUMENT_TYPES.map((t) => (
              <option key={t} value={t}>{formatEnum(t)}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5 md:col-span-2">
          <label className={labelCls}>File or URL</label>
          <div className="flex gap-2">
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://... or choose a file →"
              className={`${inputCls} flex-1`}
            />
            <label className="inline-flex items-center gap-2 px-3 py-2.5 text-xs font-medium rounded-lg border border-gray-700 bg-gray-800 text-gray-300 hover:bg-gray-700 cursor-pointer whitespace-nowrap">
              <Upload className="h-3.5 w-3.5" />
              File
              <input
                ref={inputRef}
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFilePick}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end mt-3">
        <button
          type="button"
          onClick={handleAdd}
          disabled={uploading}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Plus className="h-3.5 w-3.5" />
              Add to list
            </>
          )}
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL HELPERS
============================================================ */

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-800">
        <h3 className="text-base font-semibold text-white">{title}</h3>
        {description && (
          <p className="mt-1 text-sm text-gray-400">{description}</p>
        )}
      </div>
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {children}
      </div>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className={labelCls}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}