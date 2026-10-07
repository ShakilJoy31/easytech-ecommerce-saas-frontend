/**
 * Single source of truth for the home page content.
 * Numbers come from the "ALEC 2026" recruitment dashboard sheet (snapshot).
 * Replace SNAPSHOT with a real API call once the dashboard endpoint exists.
 */

export const SNAPSHOT = {
  label: 'ALEC 2026 recruitment dashboard',
  totalCandidates: 6404,
  cvsSent: 6059,
  selected: 5664,
  cancelled: 740,
  medicallyFit: 5917,
  medicallyUnfit: 486,
  visaStamped: 4405,
  trainingCompleted: 5516,
  didNotTakeAdmission: 801,
  ticketReceivedYetToFly: 329,
  ptaNotSent: 55,
  flightMissed: 38,
  flown: 3883
};

export const TRADE_SUMMARY = [
  { trade: 'Helper', selected: 3303, visa: 2836, flown: 2499 },
  { trade: 'Mason', selected: 1012, visa: 551, flown: 544 },
  { trade: 'Carpenter', selected: 507, visa: 383, flown: 338 },
  { trade: 'Steel Fixer', selected: 428, visa: 335, flown: 260 },
  { trade: 'Electrician', selected: 140, visa: 76, flown: 74 },
  { trade: 'First Responder', selected: 58, visa: 46, flown: 45 },
  { trade: 'Pipe Fitter', selected: 56, visa: 15, flown: 15 },
  { trade: 'Chainman', selected: 87, visa: 76, flown: 73 }
];

export type Stage = {
  id: string;
  name: string;
  team: string;
  summary: string;
  statuses: string[];
};

export const LIFECYCLE: Stage[] = [
  {
    id: 'recruitment',
    name: 'Recruitment',
    team: 'Recruitment team',
    summary:
      'Candidates are registered, screened and their CVs prepared and sent to the client. Duplicates are caught by passport number.',
    statuses: ['Registered', 'Screening', 'CV sent', 'Shortlisted']
  },
  {
    id: 'selection',
    name: 'Interview & selection',
    team: 'Recruitment team',
    summary:
      'Interview results are recorded against the specific job order and batch the candidate is assigned to.',
    statuses: ['Pending', 'Selected', 'Rejected', 'Rescheduled', 'No show']
  },
  {
    id: 'documents',
    name: 'Documents',
    team: 'Recruitment & processing',
    summary:
      'A per-country checklist tracks what is required, uploaded and verified, and warns before passports or visas expire.',
    statuses: ['Required', 'Uploaded', 'Verified', 'Expiring']
  },
  {
    id: 'medical',
    name: 'Medical',
    team: 'Medical team',
    summary:
      'Appointments, results and reports in one queue, with a retest path and a flag for reports that are overdue.',
    statuses: ['Appointment booked', 'Report pending', 'Fit', 'Unfit', 'Retest']
  },
  {
    id: 'country',
    name: 'Country processing',
    team: 'Processing team',
    summary:
      'Country-specific steps such as GAMCA, PCC, biometrics, MOFA and Tasheer run as configurable workflow steps, not fixed columns.',
    statuses: ['Not started', 'In progress', 'Completed', 'Rejected']
  },
  {
    id: 'visa',
    name: 'Visa',
    team: 'Visa team',
    summary:
      'Application, approval, stamping and expiry dates sit next to the visa document so nothing lives in a chat thread.',
    statuses: ['Applied', 'Approved', 'Stamped', 'Expired']
  },
  {
    id: 'training',
    name: 'Training',
    team: 'Training team',
    summary:
      'Admission, progress and completion are tracked, including candidates who dropped out or never took admission.',
    statuses: ['Admission pending', 'Admitted', 'Started', 'Completed', 'Dropped']
  },
  {
    id: 'bmet',
    name: 'BMET',
    team: 'BMET team',
    summary:
      'Submission, processing and clearance with the missing documents listed so the team knows what to chase.',
    statuses: ['Document pending', 'Submitted', 'Under process', 'Completed', 'Rejected']
  },
  {
    id: 'travel',
    name: 'Ticket & travel',
    team: 'Travel team',
    summary:
      'Ticket requests, PTA, PNR and flight bookings. A missed flight automatically becomes an issue with an owner.',
    statuses: ['Ready for ticket', 'Ticket received', 'PTA pending', 'Flight booked', 'Missed']
  },
  {
    id: 'deployment',
    name: 'Deployment',
    team: 'Operations',
    summary:
      'Departure, arrival, client receipt and joining date close the loop so the client can confirm every worker.',
    statuses: ['Departed', 'Arrived', 'Client received', 'Joined']
  }
];

export const SCENARIOS = [
  {
    id: 'clear',
    label: 'Everything done',
    parts: [
      ['Medical', 'Fit', 'ok'],
      ['Visa', 'Stamped', 'ok'],
      ['Training', 'Completed', 'ok'],
      ['BMET', 'Completed', 'ok'],
      ['Ticket', 'Received', 'ok'],
      ['Flight', 'Booked', 'ok']
    ],
    overall: 'Ready · Flight booked',
    tone: 'ok'
  },
  {
    id: 'bmet',
    label: 'BMET still pending',
    parts: [
      ['Medical', 'Fit', 'ok'],
      ['Visa', 'Stamped', 'ok'],
      ['Training', 'Completed', 'ok'],
      ['BMET', 'Pending', 'wait'],
      ['Ticket', 'Not ready', 'idle'],
      ['Flight', 'Not booked', 'idle']
    ],
    overall: 'Waiting for BMET',
    tone: 'wait'
  },
  {
    id: 'missed',
    label: 'Flight missed',
    parts: [
      ['Medical', 'Fit', 'ok'],
      ['Visa', 'Stamped', 'ok'],
      ['Training', 'Completed', 'ok'],
      ['BMET', 'Completed', 'ok'],
      ['Ticket', 'Received', 'ok'],
      ['Flight', 'Missed', 'bad']
    ],
    overall: 'Flight missed · Action required',
    tone: 'bad'
  }
] as const;

export const CANDIDATE_360 = [
  'Personal information',
  'Passport',
  'Client, agency, job order, batch, trade',
  'Recruitment, CV, interview, selection',
  'Documents and checklist',
  'Medical',
  'Country processing',
  'Visa',
  'Training',
  'BMET',
  'Ticket, PTA, flight',
  'Deployment',
  'Open issues',
  'Assigned tasks',
  'Full status history'
];

export const COUNTRY_FLOWS = [
  {
    country: 'United Arab Emirates',
    steps: ['Medical', 'Visa', 'Training', 'BMET', 'Ticket', 'Flight']
  },
  {
    country: 'Saudi Arabia',
    steps: [
      'GAMCA',
      'PCC',
      'Biometric',
      'Training',
      'MOFA',
      'Tasheer',
      'Visa',
      'BMET',
      'Ticket',
      'Flight'
    ]
  }
];

export const MODULE_GROUPS = [
  {
    title: 'Demand',
    blurb: 'What the client needs and who supplies it.',
    items: ['Clients', 'Agencies & references', 'Job orders', 'Recruitment batches']
  },
  {
    title: 'People',
    blurb: 'Everything about the candidate.',
    items: ['Candidates', 'Recruitment & selection', 'Documents']
  },
  {
    title: 'Processing',
    blurb: 'The steps between selection and departure.',
    items: [
      'Medical',
      'Country processing',
      'Visa',
      'Training',
      'BMET',
      'Ticket & travel',
      'Deployment'
    ]
  },
  {
    title: 'Control',
    blurb: 'Keeping the work moving.',
    items: ['Dashboard', 'Issues', 'Tasks', 'Notifications', 'Reports']
  },
  {
    title: 'Admin',
    blurb: 'Who can do what, and the proof.',
    items: ['Users & permissions', 'Settings', 'Audit log']
  }
];

export const ROLES = [
  ['Super Admin', 'Full system, configuration, users, workflows and audit'],
  ['Managing Director', 'Dashboards, reports, deployment and issues'],
  ['Recruitment Manager', 'Candidates, agencies, clients, job orders and batches'],
  ['Recruitment Executive', 'Assigned candidates, CVs, screening and interviews'],
  ['Medical team', 'Medical queue, appointments and results'],
  ['Visa team', 'Visa queue, records and documents'],
  ['Training team', 'Admission, completion and certificates'],
  ['BMET team', 'Submission, clearance and documents'],
  ['Travel team', 'Ticket requests, PTA, tickets and flights'],
  ['Viewer', 'Read-only dashboards, reports and candidate search']
];

export const BEFORE_AFTER = [
  {
    before: 'Status is typed by hand into one long sheet, then re-counted in pivot tables.',
    after: 'Overall status is calculated from medical, visa, training, BMET and ticket records.'
  },
  {
    before: 'Each country adds new columns to the sheet.',
    after: 'Country steps are configured as workflow, so UAE and KSA can differ without code changes.'
  },
  {
    before: 'A missed flight or unfit report is noticed when someone scrolls past it.',
    after: 'It becomes an issue with a priority, an owner and a due date.'
  },
  {
    before: 'Passport and visa expiry live in separate files.',
    after: 'Alerts fire before expiry and before a candidate stalls in a stage.'
  },
  {
    before: 'Nobody can say who changed a status last week.',
    after: 'Every important action is written to an immutable audit log.'
  }
];