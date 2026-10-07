// redux/api/candidates/candidateApi.ts
import { apiSlice } from "@/redux/api/apiSlice";

/* ============================================================
   TYPES
============================================================ */

export type Gender = "male" | "female" | "other";
export type MaritalStatus = "single" | "married" | "divorced" | "widowed";
export type PassportStatus = "valid" | "expired" | "renewed" | "lost" | "damaged";

export type CVStatus = "not_sent" | "sent" | "shortlisted" | "rejected";

export type SelectionStatus =
  | "registered"
  | "screening"
  | "cv_preparing"
  | "cv_sent"
  | "shortlisted"
  | "interview"
  | "selected"
  | "rejected"
  | "cancelled"
  | "not_willing"
  | "duplicate"
  | "on_hold";

export type MedicalStatus =
  | "not_started"
  | "appointment_booked"
  | "report_pending"
  | "fit"
  | "unfit"
  | "retest"
  | "cancelled";

export type VisaStatus =
  | "not_started"
  | "applied"
  | "approved"
  | "stamped"
  | "rejected"
  | "expired"
  | "cancelled";

export type TrainingStatus =
  | "not_required"
  | "not_started"
  | "admission_pending"
  | "admitted"
  | "started"
  | "completed"
  | "dropped"
  | "did_not_take_admission"
  | "cancelled";

export type BmetStatus =
  | "not_started"
  | "document_pending"
  | "submitted"
  | "under_process"
  | "completed"
  | "rejected";

export type TicketStatus =
  | "not_ready"
  | "ready_for_ticket"
  | "ticket_requested"
  | "ticket_received"
  | "pta_pending"
  | "flight_booked"
  | "departed"
  | "arrived"
  | "flight_missed"
  | "cancelled";

export type PtaStatus = "not_sent" | "requested" | "sent";

export type FlightStatus =
  | "not_booked"
  | "booked"
  | "done"
  | "missed"
  | "cancelled"
  | "rescheduled";

export type DeploymentStatus =
  | "not_deployed"
  | "ready"
  | "in_transit"
  | "deployed"
  | "returned"
  | "cancelled";

export type CandidateStatus =
  | "registered"
  | "selected"
  | "cancelled"
  | "medically_fit"
  | "medically_unfit"
  | "visa_stamped"
  | "training_completed"
  | "bmet_completed"
  | "ticketed"
  | "flown"
  | "flight_missed"
  | "deployed";

export interface CandidateDocument {
  name: string;
  url: string;
  type?: string | null;
  uploadedAt?: string | null;
}

export interface Candidate {
  id?: number;
  candidateCode?: string;
  sl?: number | null;

  // Personal
  firstName: string;
  middleName?: string | null;
  lastName?: string | null;
  fullName?: string;
  fatherName?: string | null;
  motherName?: string | null;
  dateOfBirth?: string | null;
  gender?: Gender | null;
  religion?: string | null;
  maritalStatus?: MaritalStatus | null;
  bloodGroup?: string | null;

  // NID & Identity
  nidNumber?: string | null;
  nidFrontImage?: string | null;
  nidBackImage?: string | null;
  birthCertificateNumber?: string | null;
  birthCertificateImage?: string | null;

  // Contact
  mobile: string;
  alternateMobile?: string | null;
  email?: string | null;

  // Address
  address?: string | null;
  district?: string | null;
  upazila?: string | null;
  division?: string | null;
  postalCode?: string | null;
  country?: string | null;

  // Photo
  photo?: string | null;

  // Passport
  passportNumber: string;
  oldPassportNumber?: string | null;
  passportIssueDate?: string | null;
  passportExpiryDate?: string | null;
  passportIssuePlace?: string | null;
  passportStatus?: PassportStatus;
  passportDocument?: string | null;

  // Assignment
  reference?: string | null;
  agencyId?: number | null;
  clientId?: number | null;
  jobOrderId?: number | null;
  batchId?: number | null;
  trade: string;

  // Recruitment
  interviewDate?: string | null;
  cvStatus?: CVStatus;
  cvSentDate?: string | null;
  cvDocument?: string | null;
  selectionStatus?: SelectionStatus;

  // Medical
  medicalStatus?: MedicalStatus;
  medicalCenter?: string | null;
  medicalAppointmentDate?: string | null;
  medicalResultDate?: string | null;
  medicalExpiryDate?: string | null;
  medicalDocument?: string | null;

  // Visa
  visaStatus?: VisaStatus;
  visaNumber?: string | null;
  visaApplicationNo?: string | null;
  visaType?: string | null;
  visaSubmissionDate?: string | null;
  visaApprovalDate?: string | null;
  visaStampingDate?: string | null;
  visaExpiryDate?: string | null;
  visaDocument?: string | null;

  // Country processing
  gamcaStatus?: string | null;
  pccStatus?: string | null;
  biometricStatus?: string | null;
  mofaStatus?: string | null;
  tasheerStatus?: string | null;
  countryProcessingNotes?: string | null;

  // Training
  trainingStatus?: TrainingStatus;
  trainingCenter?: string | null;
  trainingStartDate?: string | null;
  trainingEndDate?: string | null;
  trainingCertificate?: string | null;

  // BMET
  bmetStatus?: BmetStatus;
  bmetSubmissionDate?: string | null;
  bmetClearanceDate?: string | null;
  bmetReference?: string | null;
  bmetDocument?: string | null;

  // Ticket & Flight
  ticketStatus?: TicketStatus;
  ptaStatus?: PtaStatus;
  ticketNumber?: string | null;
  ticketRequestDate?: string | null;
  ticketReceivedDate?: string | null;
  airline?: string | null;
  pnr?: string | null;
  flightNumber?: string | null;
  flightRoute?: string | null;
  flightDate?: string | null;
  flightTime?: string | null;
  flightStatus?: FlightStatus;
  flightDocument?: string | null;

  // Deployment
  departureDate?: string | null;
  arrivalDate?: string | null;
  clientReceivedDate?: string | null;
  joiningDate?: string | null;
  destination?: string | null;
  deploymentStatus?: DeploymentStatus;

  // Documents
  documents?: CandidateDocument[] | null;

  // Overall
  candidateStatus?: CandidateStatus;

  // Meta
  remarks?: string | null;
  cancellationReason?: string | null;
  isCancelled?: boolean;
  createdBy?: number | null;
  updatedBy?: number | null;

  createdAt?: string;
  updatedAt?: string;
}

export interface CandidatePagination {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  itemsPerPage: number;
}

export interface GetCandidatesParams {
  page?: number;
  limit?: number;
  search?: string;
  trade?: string;
  candidateStatus?: string;
  visaStatus?: string;
  medicalStatus?: string;
  trainingStatus?: string;
  bmetStatus?: string;
  ticketStatus?: string;
  passportStatus?: string;
  cvStatus?: string;
  selectionStatus?: string;
  ptaStatus?: string;
  flightStatus?: string;
  deploymentStatus?: string;
  country?: string;
  reference?: string;
  isCancelled?: boolean;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}


export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  warning?: string | null;
  pagination?: CandidatePagination;
}

export interface BulkImportResult {
  insertedCount: number;
  duplicateCount: number;
  failedCount: number;
  duplicates: { row: number; passportNumber: string; reason: string }[];
  failed: { row: number; reason: string; data: any }[];
}

export interface CandidateStats {
  total: number;
  selected: number;
  cancelled: number;
  medicalFit: number;
  medicalUnfit: number;
  visaStamped: number;
  trainingCompleted: number;
  bmetCompleted: number;
  ticketed: number;
  flown: number;
  flightMissed: number;
  deployed: number;
  byTrade: { trade: string; count: string }[];
  byCountry: { country: string; count: string }[];
  byCandidateStatus: { candidateStatus: string; count: string }[];
}

/* ---------- PASSPORT EXPIRY ---------- */

export interface PassportExpiryCandidate {
  id: number;
  candidateCode: string;
  fullName: string;
  passportNumber: string;
  passportExpiryDate: string;
  mobile: string;
  trade: string;
  candidateStatus: string;
  isCancelled: boolean;
  country?: string | null;
  photo?: string | null;
  daysUntilExpiry: number;
  urgency: "expired" | "critical" | "warning" | "safe";
}

export interface PassportExpirySummary {
  total: number;
  expired: number;
  critical: number;
  warning: number;
}

export interface PassportExpiryResponse
  extends ApiResponse<PassportExpiryCandidate[]> {
  summary: PassportExpirySummary;
}

/* ============================================================
   KANBAN TYPES
============================================================ */

export type KanbanStage =
  | "registered"
  | "selected"
  | "medically_fit"
  | "visa_stamped"
  | "training_completed"
  | "bmet_completed"
  | "ticketed"
  | "flown"
  | "deployed"
  | "flight_missed"
  | "medically_unfit"
  | "cancelled";

export interface KanbanColumn {
  stage: KanbanStage;
  total: number;
  candidates: Candidate[];
  hasMore: boolean;
}

export interface KanbanBoardData {
  columns: KanbanColumn[];
  stages: KanbanStage[];
}

/* ============================================================
   DASHBOARD STATS TYPES
============================================================ */

export interface DashboardCard {
  label: string;
  value: number;
  icon: string;
  color: string;
}

export interface DashboardStats {
  cards: {
    total: DashboardCard;
    approved: DashboardCard;
    medicalFit: DashboardCard;
    medicalUnfit: DashboardCard;
    visaStamped: DashboardCard;
    trainingCompleted: DashboardCard;
    bmetCompleted: DashboardCard;
    ticketed: DashboardCard;
    flown: DashboardCard;
    flightMissed: DashboardCard;
    deployed: DashboardCard;
    cancelled: DashboardCard;
    registered: DashboardCard;
  };
  byTrade: { trade: string; count: string }[];
  byCountry: { country: string; count: string }[];
  byCandidateStatus: { candidateStatus: string; count: string }[];
}

export type DashboardCardKey =
  | "total"
  | "approved"
  | "medicalFit"
  | "medicalUnfit"
  | "visaStamped"
  | "trainingCompleted"
  | "bmetCompleted"
  | "ticketed"
  | "flown"
  | "flightMissed"
  | "deployed"
  | "cancelled"
  | "registered";


  export interface StatusBreakdownItem {
  value: string;
  label: string;
  count: number;
}

export interface StatusBreakdownGroup {
  field: string;
  label: string;
  total: number;
  statuses: StatusBreakdownItem[];
}

export interface StatusBreakdownData {
  groups: StatusBreakdownGroup[];
}


export interface PassportExpiryParams {
  days?: number;
  page?: number;
  limit?: number;
}

/* ============================================================
   API SLICE
============================================================ */

export const candidateApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ---- CREATE ----
    createCandidate: builder.mutation<ApiResponse<Candidate>, Partial<Candidate>>({
      query: (data) => ({
        url: "/candidates/create-candidate",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Candidates"],
    }),

    // ---- GET ALL ----
    getAllCandidates: builder.query<ApiResponse<Candidate[]>, GetCandidatesParams>({
      query: (params) => ({
        url: "/candidates/get-candidates",
        method: "GET",
        params,
      }),
      providesTags: ["Candidates"],
    }),

    // ---- GET BY ID ----
    getCandidateById: builder.query<ApiResponse<Candidate>, string | number>({
      query: (id) => ({
        url: `/candidates/get-candidate/${id}`,
        method: "GET",
      }),
      providesTags: (_res, _err, id) => [{ type: "Candidate", id }],
    }),

    // ---- UPDATE ----
    updateCandidate: builder.mutation<
      ApiResponse<Candidate>,
      { id: string | number; data: Partial<Candidate> }
    >({
      query: ({ id, data }) => ({
        url: `/candidates/update-candidate/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        "Candidates",
        { type: "Candidate", id },
      ],
    }),

    // ---- UPDATE STATUS ----
    updateCandidateStatus: builder.mutation<
      ApiResponse<Candidate>,
      { id: string | number; candidateStatus: CandidateStatus; remarks?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/candidates/update-candidate-status/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Candidates"],
    }),

    // ---- CANCEL ----
    cancelCandidate: builder.mutation<
      ApiResponse<Candidate>,
      { id: string | number; cancellationReason?: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/candidates/cancel-candidate/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Candidates"],
    }),

    // ---- DELETE ----
    deleteCandidate: builder.mutation<ApiResponse<null>, string | number>({
      query: (id) => ({
        url: `/candidates/delete-candidate/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Candidates"],
    }),

    // ---- STATS ----
    getCandidateStats: builder.query<ApiResponse<CandidateStats>, void>({
      query: () => ({
        url: "/candidates/stats",
        method: "GET",
      }),
      providesTags: ["CandidateStats"],
    }),

// ---- PASSPORT EXPIRY ----
getPassportExpiryList: builder.query<PassportExpiryResponse, PassportExpiryParams>({
  query: ({ days = 90, page = 1, limit = 10 } = {}) => ({
    url: "/candidates/passport-expiry",
    method: "GET",
    params: { days, page, limit },
  }),
  providesTags: ["PassportExpiry"],
}),

    // ---- BULK IMPORT ----
    bulkImportCandidates: builder.mutation<
      ApiResponse<BulkImportResult>,
      { candidates: Partial<Candidate>[] }
    >({
      query: (data) => ({
        url: "/candidates/bulk-import",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Candidates"],
    }),

    /* ============ KANBAN ============ */

    getKanbanBoard: builder.query<
      ApiResponse<KanbanBoardData>,
      {
        search?: string;
        trade?: string;
        country?: string;
        reference?: string;
        batchId?: string;
        limit?: number;
      }
    >({
      query: (params) => ({
        url: "/candidates/kanban-board",
        method: "GET",
        params,
      }),
      providesTags: ["KanbanBoard"],
    }),

    getKanbanColumn: builder.query<
      ApiResponse<Candidate[]>,
      {
        stage: KanbanStage;
        page?: number;
        limit?: number;
        search?: string;
        trade?: string;
        country?: string;
      }
    >({
      query: ({ stage, ...params }) => ({
        url: `/candidates/kanban-column/${stage}`,
        method: "GET",
        params,
      }),
      providesTags: ["KanbanBoard"],
    }),

    moveCandidateStage: builder.mutation<
      ApiResponse<Candidate> & { transition: { from: string; to: string } },
      {
        id: string | number;
        toStage: KanbanStage;
        fromStage?: KanbanStage;
        remarks?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/candidates/move-stage/${id}`,
        method: "PUT",
        body,
      }),
      // Optimistic update: instantly move card between columns
      async onQueryStarted(
        { id, toStage, fromStage },
        { dispatch, queryFulfilled, getState }
      ) {
        const patches: any[] = [];
        const state: any = getState();
        const queries = state.api?.queries || {};

        Object.keys(queries).forEach((key) => {
          if (key.includes("getKanbanBoard")) {
            const patch = dispatch(
              candidateApi.util.updateQueryData(
                "getKanbanBoard",
                queries[key].originalArgs,
                (draft) => {
                  let moved: Candidate | null = null;

                  // Remove from source column
                  draft.data.columns = draft.data.columns.map((col) => {
                    const filtered = col.candidates.filter((c) => {
                      if (c.id === id) {
                        moved = c;
                        return false;
                      }
                      return true;
                    });
                    const diff = col.candidates.length - filtered.length;
                    return { ...col, candidates: filtered, total: col.total - diff };
                  });

                  // Add to destination column (top)
                  if (moved) {
                    draft.data.columns = draft.data.columns.map((col) =>
                      col.stage === toStage
                        ? {
                            ...col,
                            candidates: [
                              { ...moved!, candidateStatus: toStage },
                              ...col.candidates,
                            ],
                            total: col.total + 1,
                          }
                        : col
                    );
                  }
                }
              )
            );
            patches.push(patch);
          }
        });

        try {
          await queryFulfilled;
        } catch {
          patches.forEach((p) => p.undo());
        }
      },
      invalidatesTags: ["KanbanBoard", "Candidates", "CandidateStats"],
    }),

    /* ============ DASHBOARD STATS ============ */

    getDashboardStats: builder.query<ApiResponse<DashboardStats>, void>({
      query: () => ({
        url: "/candidates/dashboard-stats",
        method: "GET",
      }),
      providesTags: ["CandidateStats"],
    }),

    getStatusBreakdown: builder.query<ApiResponse<StatusBreakdownData>, void>({
  query: () => ({
    url: "/candidates/status-breakdown",
    method: "GET",
  }),
  providesTags: ["CandidateStats"],
}),

  }),
});

export const {
  useCreateCandidateMutation,
  useGetAllCandidatesQuery,
  useGetCandidateByIdQuery,
  useUpdateCandidateMutation,
  useUpdateCandidateStatusMutation,
  useCancelCandidateMutation,
  useDeleteCandidateMutation,
  useGetCandidateStatsQuery,
  useGetPassportExpiryListQuery,
  useBulkImportCandidatesMutation,

  useGetKanbanBoardQuery,
  useGetKanbanColumnQuery,
  useMoveCandidateStageMutation,

  useGetDashboardStatsQuery,

  useGetStatusBreakdownQuery
} = candidateApi;