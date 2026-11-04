import {
  Patient,
  TaskItem,
  Ward,
  FacilityCapability,
  Referral,
  TrendAlert,
  FacilityRequirementInput,
  CapacityLogEntry,
} from '../types/carebridge';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'PT-2847',
    name: 'Marcus Osei',
    age: 34,
    sex: 'Male',
    shortAgeSex: '34M',
    wardId: 'ward-b',
    wardName: 'Medical Ward B',
    bed: 7,
    admittedAt: '2025-09-26 09:14',
    status: 'Attention',
    allergies: ['Penicillin', 'NSAIDs'],
    diagnosis: 'Multiple rib fractures (3rd–6th right), right pneumothorax, pulmonary contusion',
    medications: [
      'Morphine 10 mg IV',
      'Enoxaparin 40 mg SC',
      'Paracetamol 1 g IV',
      'Oxygen therapy 4 L/min',
    ],
    observations: [
      {
        id: 'obs-m-1',
        timestamp: '2025-09-26 08:15',
        timeLabel: '08:15',
        hoursFromStart: 0,
        spO2: 98,
        rr: 20,
        hr: 88,
        bpSystolic: 122,
        bpDiastolic: 78,
        temp: 37.1,
        oxygenSource: 'Room air',
        recordedBy: 'Nurse B. Asante',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-2',
        timestamp: '2025-09-26 09:00',
        timeLabel: '09:00',
        hoursFromStart: 1,
        spO2: 98,
        rr: 20,
        hr: 89,
        bpSystolic: 120,
        bpDiastolic: 76,
        temp: 37.2,
        oxygenSource: 'Room air',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-3',
        timestamp: '2025-09-26 10:00',
        timeLabel: '10:00',
        hoursFromStart: 2,
        spO2: 97,
        rr: 21,
        hr: 91,
        bpSystolic: 119,
        bpDiastolic: 76,
        temp: 37.3,
        oxygenSource: '2L Nasal Cannula',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-4',
        timestamp: '2025-09-26 11:00',
        timeLabel: '11:00',
        hoursFromStart: 3,
        spO2: 96,
        rr: 22,
        hr: 93,
        bpSystolic: 117,
        bpDiastolic: 75,
        temp: 37.5,
        oxygenSource: '2L Nasal Cannula',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-5',
        timestamp: '2025-09-26 12:00',
        timeLabel: '12:00',
        hoursFromStart: 4,
        spO2: 95,
        rr: 23,
        hr: 94,
        bpSystolic: 116,
        bpDiastolic: 74,
        temp: 37.6,
        oxygenSource: 'NRM 4L/min',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-6',
        timestamp: '2025-09-26 13:00',
        timeLabel: '13:00',
        hoursFromStart: 5,
        spO2: 94,
        rr: 25,
        hr: 96,
        bpSystolic: 115,
        bpDiastolic: 73,
        temp: 37.7,
        oxygenSource: 'NRM 4L/min',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-7',
        timestamp: '2025-09-26 14:00',
        timeLabel: '14:00',
        hoursFromStart: 6,
        spO2: 93,
        rr: 26,
        hr: 98,
        bpSystolic: 113,
        bpDiastolic: 72,
        temp: 37.8,
        oxygenSource: 'NRM 4L/min',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-8',
        timestamp: '2025-09-26 15:00',
        timeLabel: '15:00',
        hoursFromStart: 7,
        spO2: 92,
        rr: 28,
        hr: 101,
        bpSystolic: 111,
        bpDiastolic: 70,
        temp: 38.0,
        oxygenSource: 'NRM 4L/min',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-m-9',
        timestamp: '2025-09-26 16:02',
        timeLabel: '16:02',
        hoursFromStart: 8,
        spO2: 91,
        rr: 29,
        hr: 103,
        bpSystolic: 110,
        bpDiastolic: 72,
        temp: 38.1,
        oxygenSource: 'NRM 4L/min',
        mentalStatus: 'Anxious, alert and oriented',
        reportedSymptom: 'Increased chest pain, worse on inspiration',
        onset: '~30 minutes ago',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'AI-drafted',
        isVoiceStructured: true,
        originalTranscript:
          'Temperature 37.8, pulse 98, respiratory rate 26, oxygen sat 93 on 4 liters via non-rebreather mask. Patient appears anxious, complaining of increased chest pain, especially on inspiration. Onset approximately 30 minutes ago. Breath sounds reduced on the right side. Patient is alert and oriented, responding to questions appropriately.',
      },
    ],
    clinicalNotes: [
      {
        id: 'note-1',
        patientId: 'PT-2847',
        timestamp: '2025-09-26 12:05',
        author: 'Sister A. Kumi',
        reviewStatus: 'Approved Clinical Note',
        transcript:
          'Midday assessment: Patient resting in bed at 45 degrees. Right-sided chest wall tenderness over ribs 3 to 6. Escalated oxygen from 2L nasal cannula to 4L/min non-rebreather mask due to mild drop in SpO₂ to 95%. IV analgesia administered with moderate relief.',
        structuredFields: {
          temperature: '37.6°C',
          pulse: '94 bpm',
          respiratoryRate: '23 /min',
          spO2: '95%',
          bp: '116/74',
          oxygenSource: 'NRM 4L/min',
          mentalStatus: 'Alert and oriented x3',
          reportedSymptom: 'Right lateral pleuritic chest wall pain',
          onset: 'Since admission (09:14)',
        },
        approvedAt: '2025-09-26 12:08',
        approvedBy: 'Sister A. Kumi',
      },
    ],
    investigations: [
      {
        id: 'inv-1',
        name: 'Portable Chest X-Ray (AP Erect) & CT Thorax',
        category: 'Imaging',
        orderedAt: '2025-09-26 09:30',
        reportedAt: '2025-09-26 11:15',
        status: 'Completed',
        summary:
          'Displaced fractures of right 3rd–6th ribs laterally. Moderate right apical-lateral pneumothorax (~25% volume) with adjacent right middle/lower lobe pulmonary contusion. No mediastinal shift.',
        flagged: true,
      },
      {
        id: 'inv-2',
        name: 'Arterial Blood Gas (ABG) on 4L/min O₂',
        category: 'Laboratory',
        orderedAt: '2025-09-26 14:30',
        reportedAt: '2025-09-26 14:55',
        status: 'Completed',
        summary:
          'pH 7.36, PaO₂ 63 mmHg (low), PaCO₂ 34 mmHg, HCO₃ 22 mmol/L, Lactate 1.9 mmol/L. Mild hypoxaemia with respiratory alkalosis secondary to tachypnoea.',
        flagged: true,
      },
      {
        id: 'inv-3',
        name: 'Full Blood Count & Coagulation Profile',
        category: 'Laboratory',
        orderedAt: '2025-09-26 09:20',
        reportedAt: '2025-09-26 10:10',
        status: 'Completed',
        summary: 'Hb 13.4 g/dL, WBC 11.8 x10⁹/L, Platelets 245 x10⁹/L, INR 1.0.',
        flagged: false,
      },
    ],
    carePlan: [
      {
        id: 'cp-1',
        category: 'Medication',
        title: 'Paracetamol 1g IV / Oral Analgesia',
        schedule: 'Every 6 hours (Next due: 18:00)',
        instructions: 'Scheduled multimodal analgesia to support deep breathing and coughing.',
        completedToday: true,
      },
      {
        id: 'cp-2',
        category: 'Medication',
        title: 'Morphine 10mg IV Breakthrough Protocol',
        schedule: '16:00 Scheduled / PRN severe pleuritic pain',
        instructions: 'Monitor respiratory rate and sedation score before and 15 mins after administration.',
        completedToday: false,
      },
      {
        id: 'cp-3',
        category: 'Respiratory',
        title: 'Target SpO₂ ≥ 94% & Incentive Spirometry',
        schedule: 'Hourly respiratory assessment',
        instructions: 'Maintain upright posture (45°). Notify surgical team immediately if SpO₂ < 92% or RR > 26/min.',
        completedToday: true,
      },
      {
        id: 'cp-4',
        category: 'Follow-up',
        title: 'Thoracic Surgery Transfer & Pleural Assessment',
        schedule: 'Coordinated via CareBridge Referral',
        instructions: 'Transfer to City General Hospital Thoracic Surgery Unit for intercostal drain & specialist observation.',
        completedToday: false,
      },
    ],
    patientReports: [
      {
        id: 'pr-1',
        patientId: 'PT-2847',
        timestamp: '2025-09-26 15:40',
        painLevel: 7,
        breathingStatus: 'Hard to Breathe',
        symptomNote: 'Sharp pain on my right side whenever I try to take a deep breath in.',
        acknowledgedByNurse: true,
      },
    ],
  },
  {
    id: 'PT-2831',
    name: 'Amara Diallo',
    age: 67,
    sex: 'Female',
    shortAgeSex: '67F',
    wardId: 'ward-b',
    wardName: 'Medical Ward B',
    bed: 3,
    admittedAt: '2025-09-24 14:20',
    status: 'Stable',
    allergies: ['Sulfa drugs'],
    diagnosis: 'Community-acquired pneumonia (right lower lobe), responding to IV antibiotics',
    medications: ['Ceftriaxone 2g IV OD', 'Azithromycin 500mg PO OD', 'Normal Saline 80mL/hr'],
    staticStatusReason: '—',
    observations: [
      {
        id: 'obs-a-1',
        timestamp: '2025-09-26 08:00',
        timeLabel: '08:00',
        hoursFromStart: 0,
        spO2: 97,
        rr: 18,
        hr: 76,
        bpSystolic: 128,
        bpDiastolic: 76,
        temp: 36.8,
        oxygenSource: 'Room air',
        recordedBy: 'Nurse B. Asante',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-a-2',
        timestamp: '2025-09-26 12:00',
        timeLabel: '12:00',
        hoursFromStart: 4,
        spO2: 98,
        rr: 17,
        hr: 74,
        bpSystolic: 126,
        bpDiastolic: 74,
        temp: 36.7,
        oxygenSource: 'Room air',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-a-3',
        timestamp: '2025-09-26 15:30',
        timeLabel: '15:30',
        hoursFromStart: 7.5,
        spO2: 98,
        rr: 17,
        hr: 75,
        bpSystolic: 124,
        bpDiastolic: 74,
        temp: 36.7,
        oxygenSource: 'Room air',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
    ],
    clinicalNotes: [],
    investigations: [],
    carePlan: [],
    patientReports: [],
  },
  {
    id: 'PT-2856',
    name: 'James Thornton',
    age: 52,
    sex: 'Male',
    shortAgeSex: '52M',
    wardId: 'ward-b',
    wardName: 'Medical Ward B',
    bed: 12,
    admittedAt: '2025-09-25 18:45',
    status: 'Monitoring',
    allergies: ['None known'],
    diagnosis: 'Post-operative day 1 laparoscopic cholecystectomy — mild orthostatic hypotension',
    medications: ['Ringer Lactate 125mL/hr IV', 'Ondansetron 4mg IV PRN', 'Paracetamol 1g IV Q6H'],
    staticStatusReason: 'BP trending — 110/68 at 15:00, down from 128/80 at 08:00',
    observations: [
      {
        id: 'obs-j-1',
        timestamp: '2025-09-26 08:00',
        timeLabel: '08:00',
        hoursFromStart: 0,
        spO2: 97,
        rr: 16,
        hr: 82,
        bpSystolic: 128,
        bpDiastolic: 80,
        temp: 36.9,
        oxygenSource: 'Room air',
        recordedBy: 'Nurse B. Asante',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-j-2',
        timestamp: '2025-09-26 12:00',
        timeLabel: '12:00',
        hoursFromStart: 4,
        spO2: 97,
        rr: 17,
        hr: 88,
        bpSystolic: 118,
        bpDiastolic: 74,
        temp: 37.0,
        oxygenSource: 'Room air',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-j-3',
        timestamp: '2025-09-26 15:00',
        timeLabel: '15:00',
        hoursFromStart: 7,
        spO2: 96,
        rr: 18,
        hr: 92,
        bpSystolic: 110,
        bpDiastolic: 68,
        temp: 37.1,
        oxygenSource: 'Room air',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
    ],
    clinicalNotes: [],
    investigations: [],
    carePlan: [],
    patientReports: [],
  },
  {
    id: 'PT-2819',
    name: 'Priya Nair',
    age: 29,
    sex: 'Female',
    shortAgeSex: '29F',
    wardId: 'ward-b',
    wardName: 'Medical Ward B',
    bed: 5,
    admittedAt: '2025-09-24 21:10',
    status: 'Stable',
    allergies: ['Latex'],
    diagnosis: 'Acute uncomplicated pyelonephritis — transitioning to oral therapy for discharge',
    medications: ['Ciprofloxacin 500mg PO BD', 'Paracetamol 1g PO Q6H PRN'],
    staticStatusReason: '—',
    observations: [
      {
        id: 'obs-p-1',
        timestamp: '2025-09-26 08:00',
        timeLabel: '08:00',
        hoursFromStart: 0,
        spO2: 99,
        rr: 15,
        hr: 72,
        bpSystolic: 118,
        bpDiastolic: 74,
        temp: 36.6,
        oxygenSource: 'Room air',
        recordedBy: 'Nurse B. Asante',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-p-2',
        timestamp: '2025-09-26 14:00',
        timeLabel: '14:00',
        hoursFromStart: 6,
        spO2: 99,
        rr: 15,
        hr: 70,
        bpSystolic: 116,
        bpDiastolic: 72,
        temp: 36.6,
        oxygenSource: 'Room air',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
    ],
    clinicalNotes: [],
    investigations: [],
    carePlan: [],
    patientReports: [],
  },
  {
    id: 'PT-2860',
    name: 'Kwame Mensah',
    age: 61,
    sex: 'Male',
    shortAgeSex: '61M',
    wardId: 'ward-b',
    wardName: 'Medical Ward B',
    bed: 9,
    admittedAt: '2025-09-25 11:30',
    status: 'Stable',
    allergies: ['Aspirin'],
    diagnosis: 'Mild infective COPD exacerbation — stable on low-flow nasal cannula',
    medications: ['Salbutamol nebuliser Q6H', 'Prednisolone 40mg PO OD', 'Amoxicillin-Clavulanate 625mg TDS'],
    staticStatusReason: '—',
    observations: [
      {
        id: 'obs-k-1',
        timestamp: '2025-09-26 08:00',
        timeLabel: '08:00',
        hoursFromStart: 0,
        spO2: 94,
        rr: 20,
        hr: 80,
        bpSystolic: 132,
        bpDiastolic: 82,
        temp: 36.9,
        oxygenSource: '2L Nasal Cannula',
        recordedBy: 'Nurse B. Asante',
        verificationStatus: 'Clinician-verified',
      },
      {
        id: 'obs-k-2',
        timestamp: '2025-09-26 14:30',
        timeLabel: '14:30',
        hoursFromStart: 6.5,
        spO2: 95,
        rr: 19,
        hr: 78,
        bpSystolic: 130,
        bpDiastolic: 80,
        temp: 36.8,
        oxygenSource: '2L Nasal Cannula',
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
      },
    ],
    clinicalNotes: [],
    investigations: [],
    carePlan: [],
    patientReports: [],
  },
];

/**
 * Evaluates a patient's observation sequence to detect clinically meaningful trends
 * and always pairs any generated flag with concrete numeric and temporal evidence.
 */
export function evaluatePatientTrend(patient: Patient): TrendAlert | null {
  const obs = patient.observations;
  if (!obs || obs.length < 2) return null;

  const first = obs[0];
  const latest = obs[obs.length - 1];

  // Check recent window (e.g., last 4h or full shift window)
  const spO2Drop = first.spO2 - latest.spO2;
  const rrRise = latest.rr - first.rr;
  const rawSpan = Math.max(1, Math.round(latest.hoursFromStart - first.hoursFromStart));

  // Condition 1: Respiratory compromise pattern (SpO2 drops meaningfully while RR rises)
  if (spO2Drop >= 4 && rrRise >= 4) {
    return {
      id: `trend-${patient.id}`,
      patientId: patient.id,
      severity: 'Attention',
      flaggedAt: '15:58',
      shortSummary: `SpO₂ ${latest.spO2}%, RR ${latest.rr}/min — ${rawSpan}h declining trend`,
      dashboardHeadline: `${patient.name} (${patient.id}, Bed ${patient.bed}) may require assessment — oxygen saturation and respiratory rate trending in opposite directions over the past ${rawSpan} hours.`,
      timelineHeadline:
        'Clinically significant trend identified: SpO₂ and respiratory rate are trending in opposite directions, with both crossing threshold after 14:00.',
      evidenceText: `SpO₂ decreased from ${first.spO2}% → ${latest.spO2}% over ${rawSpan} hours (${first.timeLabel.slice(0, 2)}:00–${latest.timeLabel.slice(0, 2)}:00) while respiratory rate rose from ${first.rr} → ${latest.rr} /min over the same period. Current oxygen delivery: ${latest.oxygenSource}. Pattern consistent with progressive respiratory compromise.`,
      metricsChanged: {
        spO2From: first.spO2,
        spO2To: latest.spO2,
        rrFrom: first.rr,
        rrTo: latest.rr,
        spanHours: rawSpan,
        startTime: first.timeLabel,
        endTime: latest.timeLabel,
      },
    };
  }

  // Also check if the last two observations show a sharp 4-hour drop (e.g., 98% -> 91%, RR 20 -> 29)
  const prev = obs[obs.length - 2];
  const recentSpO2Drop = prev.spO2 - latest.spO2;
  const recentRrRise = latest.rr - prev.rr;
  const recentSpan = Math.max(1, Math.round(latest.hoursFromStart - prev.hoursFromStart));

  if (recentSpO2Drop >= 4 && recentRrRise >= 4) {
    return {
      id: `trend-${patient.id}`,
      patientId: patient.id,
      severity: 'Attention',
      flaggedAt: latest.timeLabel,
      shortSummary: `SpO₂ ${latest.spO2}%, RR ${latest.rr}/min — ${recentSpan}h declining trend`,
      dashboardHeadline: `${patient.name} (${patient.id}, Bed ${patient.bed}) may require assessment — oxygen saturation and respiratory rate trending in opposite directions over the past ${recentSpan} hours.`,
      timelineHeadline: `Clinically significant trend identified: SpO₂ and respiratory rate are trending in opposite directions over the last ${recentSpan} hours.`,
      evidenceText: `SpO₂ decreased from ${prev.spO2}% → ${latest.spO2}% over ${recentSpan} hours (${prev.timeLabel}–${latest.timeLabel}) while respiratory rate rose from ${prev.rr} → ${latest.rr} /min over the same period. Current oxygen delivery: ${latest.oxygenSource}. Pattern consistent with progressive respiratory compromise.`,
      metricsChanged: {
        spO2From: prev.spO2,
        spO2To: latest.spO2,
        rrFrom: prev.rr,
        rrTo: latest.rr,
        spanHours: recentSpan,
        startTime: prev.timeLabel,
        endTime: latest.timeLabel,
      },
    };
  }

  // Condition 2: Systolic BP downward trend >= 15 mmHg
  const sysDrop = first.bpSystolic - latest.bpSystolic;
  if (sysDrop >= 15) {
    return {
      id: `trend-${patient.id}`,
      patientId: patient.id,
      severity: 'Monitoring',
      flaggedAt: '15:05',
      shortSummary: `Systolic BP trending down — ${latest.bpSystolic}/${latest.bpDiastolic} at ${latest.timeLabel} vs ${first.bpSystolic}/${first.bpDiastolic} at ${first.timeLabel}`,
      dashboardHeadline: `BP trending — ${latest.bpSystolic}/${latest.bpDiastolic} at ${latest.timeLabel}, down from ${first.bpSystolic}/${first.bpDiastolic} at ${first.timeLabel}`,
      timelineHeadline: `Systolic blood pressure trending downward over ${rawSpan} hours.`,
      evidenceText: `Systolic blood pressure fell from ${first.bpSystolic} mmHg (${first.timeLabel}) to ${latest.bpSystolic} mmHg (${latest.timeLabel}). Diastolic from ${first.bpDiastolic} to ${latest.bpDiastolic} mmHg. Post-operative day 1.`,
      metricsChanged: {
        bpFrom: `${first.bpSystolic}/${first.bpDiastolic}`,
        bpTo: `${latest.bpSystolic}/${latest.bpDiastolic}`,
        spanHours: rawSpan,
        startTime: first.timeLabel,
        endTime: latest.timeLabel,
      },
    };
  }

  return null;
}

export const INITIAL_TASKS: TaskItem[] = [
  {
    id: 'task-1',
    title: 'Administer Morphine 10mg IV',
    dueTime: '16:00',
    patientId: 'PT-2847',
    patientName: 'Marcus Osei',
    status: 'Pending',
  },
  {
    id: 'task-2',
    title: 'Post-procedure vitals check',
    dueTime: '16:30',
    patientId: 'PT-2856',
    patientName: 'James Thornton',
    status: 'Pending',
  },
  {
    id: 'task-3',
    title: 'Nursing handover notes',
    dueTime: '18:00',
    patientId: 'PT-2847',
    patientName: 'Marcus Osei',
    status: 'Pending',
  },
  {
    id: 'task-4',
    title: 'Blood culture results review',
    dueTime: '17:00',
    patientId: 'PT-2847',
    patientName: 'Marcus Osei',
    status: 'In Progress',
  },
  {
    id: 'task-5',
    title: 'IV site inspection',
    dueTime: '15:30',
    patientId: 'PT-2831',
    patientName: 'Amara Diallo',
    status: 'Completed',
  },
];

export const INITIAL_WARDS: Ward[] = [
  {
    id: 'ward-b',
    hospitalId: 'hosp-st-marys',
    name: 'Medical Ward B',
    floor: 'Level 2 · East Wing',
    specialty: 'General & Respiratory Medicine',
    totalBeds: 14,
    occupiedBeds: 11,
    availableBeds: 3,
    beds: [
      { bedNumber: 1, status: 'Occupied', patientId: 'PT-2801', patientName: 'E. Boateng', acuity: 'Stable' },
      { bedNumber: 2, status: 'Occupied', patientId: 'PT-2804', patientName: 'S.Mensah', acuity: 'Stable' },
      { bedNumber: 3, status: 'Occupied', patientId: 'PT-2831', patientName: 'Amara Diallo', acuity: 'Stable' },
      { bedNumber: 4, status: 'Available' },
      { bedNumber: 5, status: 'Occupied', patientId: 'PT-2819', patientName: 'Priya Nair', acuity: 'Stable' },
      { bedNumber: 6, status: 'Occupied', patientId: 'PT-2822', patientName: 'K. Owusu', acuity: 'Stable' },
      { bedNumber: 7, status: 'Occupied', patientId: 'PT-2847', patientName: 'Marcus Osei', acuity: 'Attention' },
      { bedNumber: 8, status: 'Available' },
      { bedNumber: 9, status: 'Occupied', patientId: 'PT-2860', patientName: 'Kwame Mensah', acuity: 'Stable' },
      { bedNumber: 10, status: 'Occupied', patientId: 'PT-2862', patientName: 'H. Danquah', acuity: 'Stable' },
      { bedNumber: 11, status: 'Occupied', patientId: 'PT-2865', patientName: 'R. Tetteh', acuity: 'Stable' },
      { bedNumber: 12, status: 'Occupied', patientId: 'PT-2856', patientName: 'James Thornton', acuity: 'Monitoring' },
      { bedNumber: 13, status: 'Occupied', patientId: 'PT-2870', patientName: 'M. Boadu', acuity: 'Stable' },
      { bedNumber: 14, status: 'Available' },
    ],
  },
  {
    id: 'ward-surgical',
    hospitalId: 'hosp-st-marys',
    name: 'General Surgical & Trauma Ward',
    floor: 'Level 3 · North Wing',
    specialty: 'General Surgery & Orthopaedics',
    totalBeds: 12,
    occupiedBeds: 10,
    availableBeds: 2,
    beds: Array.from({ length: 12 }, (_, idx) => ({
      bedNumber: idx + 1,
      status: idx < 10 ? 'Occupied' : 'Available',
      patientName: idx < 10 ? `Surgical Pt #${idx + 1}` : undefined,
      acuity: idx === 2 ? 'Monitoring' : 'Stable',
    })),
  },
  {
    id: 'ward-icu',
    hospitalId: 'hosp-st-marys',
    name: 'High-Dependency & ICU',
    floor: 'Level 4 · Critical Care',
    specialty: 'Intensive Care (No Thoracic Surgery Cover)',
    totalBeds: 6,
    occupiedBeds: 6,
    availableBeds: 0,
    beds: Array.from({ length: 6 }, (_, idx) => ({
      bedNumber: idx + 1,
      status: 'Occupied',
      patientName: `ICU Pt #${idx + 1}`,
      acuity: 'Attention',
    })),
  },
  {
    id: 'ward-ed',
    hospitalId: 'hosp-st-marys',
    name: 'Emergency Observation Unit',
    floor: 'Ground Floor · Acute Bay',
    specialty: 'Emergency Triage & Short Stay',
    totalBeds: 8,
    occupiedBeds: 5,
    availableBeds: 3,
    beds: Array.from({ length: 8 }, (_, idx) => ({
      bedNumber: idx + 1,
      status: idx < 5 ? 'Occupied' : 'Available',
      patientName: idx < 5 ? `Acute Bay Pt #${idx + 1}` : undefined,
      acuity: idx === 0 ? 'Attention' : 'Stable',
    })),
  },
];

export const INITIAL_CAPACITY_LOGS: CapacityLogEntry[] = [
  {
    id: 'clog-1',
    timestamp: '15:12',
    action: 'Discharge',
    wardName: 'Medical Ward B',
    patientName: 'Grace Addo (PT-2799)',
    bedNumber: 8,
    deltaDescription: 'Medical Ward B available beds increased from 2 → 3 (11/14 occupied)',
  },
  {
    id: 'clog-2',
    timestamp: '13:45',
    action: 'Admission',
    wardName: 'Emergency Observation Unit',
    patientName: 'Samuel Darko (PT-2881)',
    bedNumber: 5,
    deltaDescription: 'Emergency Observation available beds decreased from 4 → 3 (5/8 occupied)',
  },
  {
    id: 'clog-3',
    timestamp: '09:14',
    action: 'Admission',
    wardName: 'Medical Ward B',
    patientName: 'Marcus Osei (PT-2847)',
    bedNumber: 7,
    deltaDescription: 'Admitted from ED Triage to Medical Ward B Bed 7',
  },
];

export const REGIONAL_FACILITIES: FacilityCapability[] = [
  {
    id: 'fac-city-general',
    name: 'City General Hospital',
    unitName: 'Thoracic Surgery & Level-1 Trauma Unit',
    distanceKm: 4.2,
    etaMinutes: 9,
    totalAvailableBeds: 5,
    icuBedsAvailable: 2,
    capabilities: {
      highFlowOxygen: {
        supported: true,
        detail: 'Central piped O₂, HFNC & mechanical ventilation bays active',
      },
      specialties: {
        'Thoracic Surgery': {
          supported: true,
          detail: '24/7 On-call Thoracic Surgery consultant & theatre team on site (Dr. K. Mensah)',
        },
        'Trauma Surgery': {
          supported: true,
          detail: 'Level-1 Trauma team available immediately',
        },
        Cardiology: {
          supported: true,
          detail: 'Interventional cardiology & CCU on site',
        },
        'General Medicine': {
          supported: true,
          detail: 'Acute medical receiving unit open',
        },
      },
      equipment: {
        'Chest Drain / Pleural Kit': {
          supported: true,
          detail: 'Underwater seal thoracic drainage, suction & VATS equipment ready',
        },
        'Mechanical Ventilator': {
          supported: true,
          detail: '4 invasive/non-invasive ventilators available',
        },
        'CT Imaging': {
          supported: true,
          detail: '64-slice CT angiography operational 24/7',
        },
      },
      icuBed: {
        supported: true,
        detail: '2 Cardiothoracic HDU / ICU beds unoccupied and staffed',
      },
    },
  },
  {
    id: 'fac-st-marys',
    name: "St. Mary's General Hospital",
    unitName: 'General Medical & Surgical Unit',
    distanceKm: 1.8,
    etaMinutes: 5,
    totalAvailableBeds: 5,
    icuBedsAvailable: 0,
    capabilities: {
      highFlowOxygen: {
        supported: true,
        detail: 'Wall oxygen up to 15L/min via non-rebreather mask',
      },
      specialties: {
        'Thoracic Surgery': {
          supported: false,
          detail: 'No thoracic surgeon on staff — general surgical cover only',
        },
        'Trauma Surgery': {
          supported: true,
          detail: 'General trauma stabilization available; no cardiothoracic bypass',
        },
        Cardiology: {
          supported: false,
          detail: 'Outpatient cardiology clinic only; no cath lab',
        },
        'General Medicine': {
          supported: true,
          detail: 'Medical Ward B has 3 available beds',
        },
      },
      equipment: {
        'Chest Drain / Pleural Kit': {
          supported: true,
          detail: 'Emergency intercostal tube kit available; no thoracic suction monitoring bay',
        },
        'Mechanical Ventilator': {
          supported: false,
          detail: 'All 6 ICU ventilators currently in use (6/6 occupied)',
        },
        'CT Imaging': {
          supported: true,
          detail: 'Diagnostic CT thorax available',
        },
      },
      icuBed: {
        supported: false,
        detail: '0 ICU/HDU beds available — unit at 100% occupancy (6/6 beds full)',
      },
    },
  },
  {
    id: 'fac-westside',
    name: 'Westside Community Hospital',
    unitName: 'District Acute Medical Unit',
    distanceKm: 6.5,
    etaMinutes: 14,
    totalAvailableBeds: 8,
    icuBedsAvailable: 0,
    capabilities: {
      highFlowOxygen: {
        supported: true,
        detail: 'Cylinder oxygen delivery up to 10L/min',
      },
      specialties: {
        'Thoracic Surgery': {
          supported: false,
          detail: 'No surgical subspecialties on site',
        },
        'Trauma Surgery': {
          supported: false,
          detail: 'Minor injuries unit only — no major trauma theatre',
        },
        Cardiology: {
          supported: false,
          detail: 'ECG monitoring only',
        },
        'General Medicine': {
          supported: true,
          detail: '8 acute medical beds available',
        },
      },
      equipment: {
        'Chest Drain / Pleural Kit': {
          supported: false,
          detail: 'Needle thoracocentesis only; no formal pleural drainage capability',
        },
        'Mechanical Ventilator': {
          supported: false,
          detail: 'Transport bag-valve-mask only',
        },
        'CT Imaging': {
          supported: false,
          detail: 'Plain X-ray only; CT scanner unavailable',
        },
      },
      icuBed: {
        supported: false,
        detail: 'No ICU or High-Dependency Unit at this facility',
      },
    },
  },
];

export interface RequirementChecklistRow {
  requirementLabel: string;
  required: boolean;
  met: boolean;
  explanation: string;
}

export function evaluateFacilityChecklist(
  req: FacilityRequirementInput,
  facility: FacilityCapability
): {
  rows: RequirementChecklistRow[];
  allRequiredMet: boolean;
  metCount: number;
  requiredCount: number;
  recommendationSummary: string;
} {
  const rows: RequirementChecklistRow[] = [];

  // 1. Oxygen
  if (req.highFlowOxygen) {
    rows.push({
      requirementLabel: 'High-Flow Oxygen Delivery',
      required: true,
      met: facility.capabilities.highFlowOxygen.supported,
      explanation: facility.capabilities.highFlowOxygen.detail,
    });
  }

  // 2. Specialty
  const specCap = facility.capabilities.specialties[req.specialty] || {
    supported: false,
    detail: `${req.specialty} not available at this facility`,
  };
  rows.push({
    requirementLabel: `Specialty: ${req.specialty}`,
    required: true,
    met: specCap.supported,
    explanation: specCap.detail,
  });

  // 3. Equipment
  const eqCap = facility.capabilities.equipment[req.equipment] || {
    supported: false,
    detail: `${req.equipment} unavailable`,
  };
  rows.push({
    requirementLabel: `Equipment: ${req.equipment}`,
    required: true,
    met: eqCap.supported,
    explanation: eqCap.detail,
  });

  // 4. ICU / HDU Bed
  if (req.icuBedRequired) {
    rows.push({
      requirementLabel: 'ICU / High-Dependency Bed Availability',
      required: true,
      met: facility.capabilities.icuBed.supported,
      explanation: facility.capabilities.icuBed.detail,
    });
  }

  const requiredRows = rows.filter((r) => r.required);
  const metRows = requiredRows.filter((r) => r.met);
  const unmetRows = requiredRows.filter((r) => !r.met);
  const allRequiredMet = unmetRows.length === 0;

  const recommendationSummary = allRequiredMet
    ? `Meets all ${requiredRows.length} clinical requirements (${facility.distanceKm} km · ${facility.etaMinutes} min ETA).`
    : `Missing ${unmetRows.map((u) => u.requirementLabel).join(' & ')}.`;

  return {
    rows,
    allRequiredMet,
    metCount: metRows.length,
    requiredCount: requiredRows.length,
    recommendationSummary,
  };
}

export const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'REF-2025-089',
    patientId: 'PT-2847',
    patientName: 'Marcus Osei',
    patientAgeSex: '34 · Male',
    referringFacility: "St. Mary's General Hospital",
    referringWard: 'Medical Ward B',
    referringClinician: 'Dr. E. Asamoah',
    completingNurse: 'Sister A. Kumi',
    receivingFacilityId: 'fac-city-general',
    receivingFacilityName: 'City General Hospital — Thoracic Surgery Unit',
    requiredService: 'Thoracic Surgery',
    urgency: 'Urgent',
    reasonForReferral:
      'Requirement for thoracic surgery consultation — ongoing respiratory compromise secondary to right pneumothorax and pulmonary contusion not manageable at current facility.',
    status: 'Draft',
    createdAt: '2025-09-26 16:04',
    updatedAt: '2025-09-26 16:04',
    assignedReceivingBed: 'Thoracic HDU Bed 4',
    documentRequests: [
      {
        id: 'doc-req-1',
        documentType: 'Portable Chest X-Ray & CT Thorax DICOM Summary',
        category: 'Imaging',
        requestedBy: 'Dr. K. Mensah (Thoracic Surgery, City General)',
        requestedAt: '16:06',
        status: 'Approved',
        reviewedBy: 'Sister A. Kumi',
        reviewedAt: '16:07',
        clinicalDataPreview:
          'CT Thorax (2025-09-26 11:15): Displaced fractures of right 3rd–6th ribs laterally. Moderate right apical-lateral pneumothorax (~25% hemithorax volume) with right middle/lower lobe pulmonary contusion. No tension physiology on scan, but progressive clinical desaturation.',
      },
      {
        id: 'doc-req-2',
        documentType: 'Serial Arterial Blood Gas (ABG) & Lactate Log',
        category: 'Lab / ABG',
        requestedBy: 'Dr. K. Mensah (Thoracic Surgery, City General)',
        requestedAt: '16:08',
        status: 'Requested',
        clinicalDataPreview:
          'ABG (14:55 on 4L/min NRM): pH 7.36 | PaO₂ 63 mmHg | PaCO₂ 34 mmHg | HCO₃ 22 mmol/L | Base Excess -2.1 | Lactate 1.9 mmol/L | SaO₂ 92%.',
      },
      {
        id: 'doc-req-3',
        documentType: 'Controlled Opioid Analgesia (Morphine) Administration Record',
        category: 'Medication Record',
        requestedBy: 'Sister D. Boateng (Receiving HDU Nurse, City General)',
        requestedAt: '16:09',
        status: 'Requested',
        clinicalDataPreview:
          'Morphine Sulfate IV Record: 09:45 — 5mg IV given (Dr. Asamoah); 12:15 — 5mg IV given (Sister Kumi); 16:00 — 10mg IV scheduled dose pending transfer decision. Total cumulative dose today: 10mg IV.',
      },
    ],
    history: [
      {
        id: 'hist-1',
        status: 'Draft',
        timestamp: '16:04',
        actor: 'Sister A. Kumi',
        facility: "St. Mary's General Hospital",
        note: 'Referral draft initialized with auto-pulled clinical summary, allergies, and 8-hour SpO₂/RR trend evidence.',
      },
    ],
  },
];
