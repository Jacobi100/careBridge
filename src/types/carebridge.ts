export type Role = 'nurse' | 'management' | 'emergency' | 'receiving' | 'patient';

export type NurseNavTab =
  | 'dashboard'
  | 'attention'
  | 'profile'
  | 'timeline'
  | 'voice'
  | 'referral';

export type PatientStatus = 'Attention' | 'Monitoring' | 'Stable';

export interface ObservationPoint {
  id: string;
  timestamp: string; // e.g., "2025-09-26 16:02"
  timeLabel: string; // e.g., "16:02"
  hoursFromStart: number; // for timeline plotting & span calculation
  spO2: number; // %
  rr: number; // /min
  hr: number; // bpm
  bpSystolic: number; // mmHg
  bpDiastolic: number; // mmHg
  temp: number; // °C
  oxygenSource: string; // e.g., "NRM 4L/min"
  mentalStatus?: string;
  reportedSymptom?: string;
  onset?: string;
  recordedBy: string;
  verificationStatus: 'Clinician-verified' | 'AI-drafted';
  isVoiceStructured?: boolean;
  originalTranscript?: string;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  timestamp: string;
  author: string;
  reviewStatus: 'AI Note Draft' | 'Approved Clinical Note';
  transcript: string;
  structuredFields: {
    temperature: string;
    pulse: string;
    respiratoryRate: string;
    spO2: string;
    bp: string;
    oxygenSource: string;
    mentalStatus: string;
    reportedSymptom: string;
    onset: string;
  };
  approvedAt?: string;
  approvedBy?: string;
}

export interface TrendAlert {
  id: string;
  patientId: string;
  severity: 'Attention' | 'Monitoring';
  flaggedAt: string;
  shortSummary: string; // e.g., "SpO₂ 91%, RR 29/min — 8h declining trend"
  dashboardHeadline: string;
  timelineHeadline: string;
  evidenceText: string;
  metricsChanged: {
    spO2From?: number;
    spO2To?: number;
    rrFrom?: number;
    rrTo?: number;
    bpFrom?: string;
    bpTo?: string;
    spanHours: number;
    startTime: string;
    endTime: string;
  };
}

export interface InvestigationItem {
  id: string;
  name: string;
  category: 'Imaging' | 'Laboratory' | 'Microbiology';
  orderedAt: string;
  reportedAt: string;
  status: 'Completed' | 'In Progress';
  summary: string;
  flagged: boolean;
}

export interface CarePlanItem {
  id: string;
  category: 'Medication' | 'Respiratory' | 'Monitoring' | 'Follow-up';
  title: string;
  schedule: string;
  instructions: string;
  completedToday: boolean;
}

export interface PatientSymptomReport {
  id: string;
  patientId: string;
  timestamp: string;
  painLevel: number; // 1-10
  breathingStatus: 'Comfortable' | 'Mildly Short of Breath' | 'Hard to Breathe';
  symptomNote: string;
  acknowledgedByNurse: boolean;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'Male' | 'Female';
  shortAgeSex: string;
  wardId: string;
  wardName: string;
  bed: number;
  admittedAt: string;
  status: PatientStatus;
  allergies: string[];
  diagnosis: string;
  medications: string[];
  observations: ObservationPoint[];
  clinicalNotes: ClinicalNote[];
  investigations: InvestigationItem[];
  carePlan: CarePlanItem[];
  patientReports: PatientSymptomReport[];
  staticStatusReason?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  dueTime: string;
  patientId: string;
  patientName: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export interface BedSlot {
  bedNumber: number;
  status: 'Occupied' | 'Available' | 'Reserved';
  patientId?: string;
  patientName?: string;
  acuity?: PatientStatus;
}

export interface Ward {
  id: string;
  hospitalId: string;
  name: string;
  floor: string;
  specialty: string;
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  beds: BedSlot[];
}

export interface CapacityLogEntry {
  id: string;
  timestamp: string;
  action: 'Admission' | 'Discharge' | 'Internal Transfer' | 'Incoming Referral Hold';
  wardName: string;
  patientName: string;
  bedNumber: number;
  deltaDescription: string;
}

export interface FacilityRequirementInput {
  highFlowOxygen: boolean;
  specialty: 'Thoracic Surgery' | 'Trauma Surgery' | 'Cardiology' | 'General Medicine';
  equipment: 'Chest Drain / Pleural Kit' | 'Mechanical Ventilator' | 'CT Imaging';
  icuBedRequired: boolean;
}

export interface FacilityCapability {
  id: string;
  name: string;
  unitName: string;
  distanceKm: number;
  etaMinutes: number;
  totalAvailableBeds: number;
  icuBedsAvailable: number;
  capabilities: {
    highFlowOxygen: { supported: boolean; detail: string };
    specialties: Record<string, { supported: boolean; detail: string }>;
    equipment: Record<string, { supported: boolean; detail: string }>;
    icuBed: { supported: boolean; detail: string };
  };
}

export type ReferralStatus =
  | 'Draft'
  | 'Submitted'
  | 'Under Review'
  | 'Information Requested'
  | 'Accepted'
  | 'Declined'
  | 'Transfer Pending'
  | 'En Route'
  | 'Arrived'
  | 'Admitted';

export interface DocumentRequestItem {
  id: string;
  documentType: string;
  category: 'Imaging' | 'Lab / ABG' | 'Medication Record' | 'Consent / Legal' | 'Nursing Flowsheet';
  requestedBy: string;
  requestedAt: string;
  status: 'Requested' | 'Approved' | 'Rejected';
  reviewedBy?: string;
  reviewedAt?: string;
  clinicalDataPreview: string; // Only visible to Receiving Hospital when status === 'Approved'
}

export interface ReferralTimelineEvent {
  id: string;
  status: ReferralStatus | 'Document Requested' | 'Document Approved';
  timestamp: string;
  actor: string;
  facility: string;
  note: string;
}

export interface Referral {
  id: string;
  patientId: string;
  patientName: string;
  patientAgeSex: string;
  referringFacility: string;
  referringWard: string;
  referringClinician: string;
  completingNurse: string;
  receivingFacilityId: string;
  receivingFacilityName: string;
  requiredService: string;
  urgency: 'Urgent' | 'Emergency — Immediate' | 'Routine';
  reasonForReferral: string;
  status: ReferralStatus;
  createdAt: string;
  updatedAt: string;
  declineReason?: string;
  assignedReceivingBed?: string;
  documentRequests: DocumentRequestItem[];
  history: ReferralTimelineEvent[];
}
