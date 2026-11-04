/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  LayoutGrid,
  AlertTriangle,
  User,
  Activity,
  Mic,
  Send,
  Zap,
  Home,
  Heart,
  LogOut,
  HelpCircle,
  X,
  Menu,
} from 'lucide-react';
import {
  Role,
  NurseNavTab,
  Patient,
  TaskItem,
  Ward,
  CapacityLogEntry,
  Referral,
  ObservationPoint,
  ClinicalNote,
  ReferralStatus,
  DocumentRequestItem,
  PatientSymptomReport,
} from './types/carebridge';
import {
  INITIAL_PATIENTS,
  INITIAL_TASKS,
  INITIAL_WARDS,
  INITIAL_CAPACITY_LOGS,
  INITIAL_REFERRALS,
  evaluatePatientTrend,
} from './data/mockData';
import { CareBridgeLogo } from './components/BrandElements';
import { RoleLoginScreen } from './components/RoleLoginScreen';
import { NurseDashboardView } from './components/nurse/NurseDashboardView';
import { AttentionBoardView } from './components/nurse/AttentionBoardView';
import { PatientProfileView } from './components/nurse/PatientProfileView';
import { VitalsTimelineView } from './components/nurse/VitalsTimelineView';
import { VoiceDocumentationView } from './components/nurse/VoiceDocumentationView';
import { CreateReferralView } from './components/nurse/CreateReferralView';
import { HospitalCapacityView } from './components/management/HospitalCapacityView';
import { EmergencyIntakeView } from './components/emergency/EmergencyIntakeView';
import { ReceivingHospitalView } from './components/receiving/ReceivingHospitalView';
import { PatientJourneyView } from './components/patient/PatientJourneyView';

export default function App() {
  // Start on the Role Switcher / Login screen (matching Screenshot 1)
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [nurseTab, setNurseTab] = useState<NurseNavTab>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PT-2847');
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState<boolean>(false);

  // Shared In-Memory Clinical & Operational State Store
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [wards, setWards] = useState<Ward[]>(INITIAL_WARDS);
  const [capacityLogs, setCapacityLogs] = useState<CapacityLogEntry[]>(
    INITIAL_CAPACITY_LOGS
  );
  const [referrals, setReferrals] = useState<Referral[]>(INITIAL_REFERRALS);

  const selectedPatient =
    patients.find((p) => p.id === selectedPatientId) || patients[0];
  const primaryReferral =
    referrals.find((r) => r.patientId === selectedPatient.id) || referrals[0];

  // Handler: Select patient and navigate to a specific Nurse tab
  const handleSelectPatient = (patientId: string, targetTab: NurseNavTab) => {
    setSelectedPatientId(patientId);
    setNurseTab(targetTab);
  };

  // Handler: Cycle task status (Pending -> In Progress -> Completed -> Pending)
  const handleToggleTaskStatus = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextStatus =
          t.status === 'Pending'
            ? 'In Progress'
            : t.status === 'In Progress'
            ? 'Completed'
            : 'Pending';
        return { ...t, status: nextStatus };
      })
    );
  };

  // Handler: Add a manual observation & dynamically update patient status based on trend evaluation
  const handleAddManualObservation = (
    patientId: string,
    obs: Omit<ObservationPoint, 'id'>
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const newObs: ObservationPoint = {
          ...obs,
          id: `obs-${Date.now()}`,
        };
        const updatedPatient: Patient = {
          ...p,
          observations: [...p.observations, newObs],
        };
        const trend = evaluatePatientTrend(updatedPatient);
        if (trend) {
          updatedPatient.status = trend.severity;
        }
        return updatedPatient;
      })
    );
  };

  // Handler: Approve a Voice-Structured Observation & Save Clinical Note
  const handleApproveVoiceObservation = (
    patientId: string,
    obs: Omit<ObservationPoint, 'id'>,
    note: Omit<ClinicalNote, 'id'>
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const newObs: ObservationPoint = {
          ...obs,
          id: `obs-voice-${Date.now()}`,
        };
        const newNote: ClinicalNote = {
          ...note,
          id: `note-${Date.now()}`,
        };
        const updatedPatient: Patient = {
          ...p,
          observations: [...p.observations, newObs],
          clinicalNotes: [newNote, ...p.clinicalNotes],
        };
        const trend = evaluatePatientTrend(updatedPatient);
        if (trend) {
          updatedPatient.status = trend.severity;
        }
        return updatedPatient;
      })
    );
  };

  // Handler: Save unapproved AI Note Draft only (Guardrail: not an approved Clinical Note until approved)
  const handleSaveAiNoteDraftOnly = (
    patientId: string,
    note: Omit<ClinicalNote, 'id'>
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const draftNote: ClinicalNote = {
          ...note,
          id: `draft-${Date.now()}`,
          reviewStatus: 'AI Note Draft',
        };
        return {
          ...p,
          clinicalNotes: [draftNote, ...p.clinicalNotes],
        };
      })
    );
  };

  // Handler: Approve an existing AI Note Draft in Nursing Notes
  const handleApproveNoteDraft = (patientId: string, noteId: string) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          clinicalNotes: p.clinicalNotes.map((n) =>
            n.id === noteId
              ? {
                  ...n,
                  reviewStatus: 'Approved Clinical Note',
                  approvedAt: '2025-09-26 16:06',
                  approvedBy: 'Sister A. Kumi',
                }
              : n
          ),
        };
      })
    );
  };

  // Phase 2 Handlers: Live Ward Capacity (Admission, Discharge, Internal Transfer)
  const handleAdmitPatientToWard = (
    wardId: string,
    patientName: string,
    targetBedNumber?: number
  ) => {
    setWards((prev) =>
      prev.map((w) => {
        if (w.id !== wardId || w.availableBeds <= 0) return w;
        const bedToFill =
          targetBedNumber ||
          w.beds.find((b) => b.status === 'Available')?.bedNumber;
        if (!bedToFill) return w;

        const updatedBeds = w.beds.map((b) =>
          b.bedNumber === bedToFill
            ? {
                ...b,
                status: 'Occupied' as const,
                patientName,
                acuity: 'Stable' as const,
              }
            : b
        );
        const occupied = updatedBeds.filter(
          (b) => b.status === 'Occupied'
        ).length;
        const available = w.totalBeds - occupied;

        setCapacityLogs((logs) => [
          {
            id: `clog-${Date.now()}`,
            timestamp: '16:08',
            action: 'Admission',
            wardName: w.name,
            patientName,
            bedNumber: bedToFill,
            deltaDescription: `${w.name} available beds decreased from ${w.availableBeds} → ${available} (${occupied}/${w.totalBeds} occupied)`,
          },
          ...logs,
        ]);

        return {
          ...w,
          beds: updatedBeds,
          occupiedBeds: occupied,
          availableBeds: available,
        };
      })
    );
  };

  const handleDischargePatientFromWard = (
    wardId: string,
    bedNumber: number
  ) => {
    setWards((prev) =>
      prev.map((w) => {
        if (w.id !== wardId) return w;
        const targetBed = w.beds.find((b) => b.bedNumber === bedNumber);
        if (!targetBed || targetBed.status !== 'Occupied') return w;

        const dischargedName = targetBed.patientName || 'Patient';
        const updatedBeds = w.beds.map((b) =>
          b.bedNumber === bedNumber
            ? {
                bedNumber: b.bedNumber,
                status: 'Available' as const,
              }
            : b
        );
        const occupied = updatedBeds.filter(
          (b) => b.status === 'Occupied'
        ).length;
        const available = w.totalBeds - occupied;

        setCapacityLogs((logs) => [
          {
            id: `clog-${Date.now()}`,
            timestamp: '16:09',
            action: 'Discharge',
            wardName: w.name,
            patientName: dischargedName,
            bedNumber,
            deltaDescription: `${w.name} available beds increased from ${w.availableBeds} → ${available} (${occupied}/${w.totalBeds} occupied)`,
          },
          ...logs,
        ]);

        return {
          ...w,
          beds: updatedBeds,
          occupiedBeds: occupied,
          availableBeds: available,
        };
      })
    );
  };

  const handleTransferPatientBetweenWards = (
    fromWardId: string,
    fromBedNumber: number,
    toWardId: string
  ) => {
    const sourceWard = wards.find((w) => w.id === fromWardId);
    const destWard = wards.find((w) => w.id === toWardId);
    const movingBed = sourceWard?.beds.find(
      (b) => b.bedNumber === fromBedNumber
    );
    const destFreeBed = destWard?.beds.find((b) => b.status === 'Available');

    if (!sourceWard || !destWard || !movingBed || !destFreeBed) return;
    const movingName = movingBed.patientName || 'Transferred Patient';

    setWards((prev) =>
      prev.map((w) => {
        if (w.id === fromWardId) {
          const updatedBeds = w.beds.map((b) =>
            b.bedNumber === fromBedNumber
              ? { bedNumber: b.bedNumber, status: 'Available' as const }
              : b
          );
          const occupied = updatedBeds.filter(
            (b) => b.status === 'Occupied'
          ).length;
          return {
            ...w,
            beds: updatedBeds,
            occupiedBeds: occupied,
            availableBeds: w.totalBeds - occupied,
          };
        }
        if (w.id === toWardId) {
          const updatedBeds = w.beds.map((b) =>
            b.bedNumber === destFreeBed.bedNumber
              ? {
                  bedNumber: b.bedNumber,
                  status: 'Occupied' as const,
                  patientName: movingName,
                  acuity: movingBed.acuity || ('Stable' as const),
                }
              : b
          );
          const occupied = updatedBeds.filter(
            (b) => b.status === 'Occupied'
          ).length;
          return {
            ...w,
            beds: updatedBeds,
            occupiedBeds: occupied,
            availableBeds: w.totalBeds - occupied,
          };
        }
        return w;
      })
    );

    setCapacityLogs((logs) => [
      {
        id: `clog-${Date.now()}`,
        timestamp: '16:10',
        action: 'Internal Transfer',
        wardName: `${sourceWard.name} → ${destWard.name}`,
        patientName: movingName,
        bedNumber: destFreeBed.bedNumber,
        deltaDescription: `Moved from ${sourceWard.name} Bed ${fromBedNumber} to ${destWard.name} Bed ${destFreeBed.bedNumber}`,
      },
      ...logs,
    ]);
  };

  // Phase 2 Referral Lifecycle & Document Request Handlers
  const handleUpdateReferral = (updated: Partial<Referral>) => {
    setReferrals((prev) =>
      prev.map((r) =>
        r.id === primaryReferral.id
          ? { ...r, ...updated, updatedAt: '2025-09-26 16:08' }
          : r
      )
    );
  };

  const handleTransitionReferralStatus = (
    referralId: string,
    newStatus: ReferralStatus,
    actor: string,
    facility: string,
    note: string
  ) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== referralId) return r;
        return {
          ...r,
          status: newStatus,
          updatedAt: '16:10',
          history: [
            {
              id: `hist-${Date.now()}`,
              status: newStatus,
              timestamp: '16:10',
              actor,
              facility,
              note,
            },
            ...r.history,
          ],
        };
      })
    );

    // If referral reaches Admitted at receiving hospital, free up the bed in Medical Ward B
    if (newStatus === 'Admitted') {
      handleDischargePatientFromWard('ward-b', 7);
    }
  };

  const handleReviewDocumentRequest = (
    referralId: string,
    docId: string,
    decision: 'Approved' | 'Rejected'
  ) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== referralId) return r;
        return {
          ...r,
          documentRequests: r.documentRequests.map((d) =>
            d.id === docId
              ? {
                  ...d,
                  status: decision,
                  reviewedBy: 'Sister A. Kumi',
                  reviewedAt: '16:11',
                }
              : d
          ),
          history: [
            {
              id: `hist-doc-${Date.now()}`,
              status: 'Document Approved',
              timestamp: '16:11',
              actor: 'Sister A. Kumi',
              facility: "St. Mary's General Hospital",
              note: `Document request ${decision.toLowerCase()} for receiving team.`,
            },
            ...r.history,
          ],
        };
      })
    );
  };

  const handleRequestDocumentFromReceiving = (
    referralId: string,
    docItem: Omit<DocumentRequestItem, 'id'>
  ) => {
    setReferrals((prev) =>
      prev.map((r) => {
        if (r.id !== referralId) return r;
        return {
          ...r,
          documentRequests: [
            {
              ...docItem,
              id: `doc-req-${Date.now()}`,
            },
            ...r.documentRequests,
          ],
        };
      })
    );
  };

  const handleCreateEmergencyReferral = (newReferral: Referral) => {
    setReferrals((prev) => [newReferral, ...prev]);
  };

  // Phase 3 Patient Care Plan & Symptom Check-in Handlers
  const handleToggleCarePlanItem = (
    patientId: string,
    carePlanItemId: string
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        return {
          ...p,
          carePlan: p.carePlan.map((cp) =>
            cp.id === carePlanItemId
              ? { ...cp, completedToday: !cp.completedToday }
              : cp
          ),
        };
      })
    );
  };

  const handleSubmitSymptomReport = (
    patientId: string,
    report: Omit<PatientSymptomReport, 'id' | 'patientId'>
  ) => {
    setPatients((prev) =>
      prev.map((p) => {
        if (p.id !== patientId) return p;
        const newReport: PatientSymptomReport = {
          ...report,
          id: `pr-${Date.now()}`,
          patientId,
        };
        return {
          ...p,
          patientReports: [newReport, ...p.patientReports],
        };
      })
    );
  };

  // Render Role Switcher Login Screen when currentRole === null
  if (!currentRole) {
    return <RoleLoginScreen onSelectRole={(role) => setCurrentRole(role)} />;
  }

  // User profile metadata per role
  const roleProfiles: Record<
    Role,
    { initials: string; name: string; subtitle: string }
  > = {
    nurse: {
      initials: 'AK',
      name: 'Sister A. Kumi',
      subtitle: 'Medical Ward B',
    },
    management: {
      initials: 'NM',
      name: 'Dr. N. Mensah',
      subtitle: 'Hospital Capacity Ops',
    },
    emergency: {
      initials: 'KO',
      name: 'Paramedic K. Ofori',
      subtitle: 'Medic Unit 4 · EMS',
    },
    receiving: {
      initials: 'KM',
      name: 'Dr. K. Mensah',
      subtitle: 'City General · Thoracic',
    },
    patient: {
      initials: 'MO',
      name: 'Marcus Osei',
      subtitle: 'Patient · PT-2847',
    },
  };

  const activeProfile = roleProfiles[currentRole];

  const nurseNavItems: {
    id: NurseNavTab;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutGrid className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      id: 'attention',
      label: 'Attention Board',
      icon: <AlertTriangle className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      id: 'profile',
      label: 'Patient Profile',
      icon: <User className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      id: 'timeline',
      label: 'Vitals Timeline',
      icon: <Activity className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      id: 'voice',
      label: 'Voice Documentation',
      icon: <Mic className="w-4 h-4" strokeWidth={1.75} />,
    },
    {
      id: 'referral',
      label: 'Create Referral',
      icon: <Send className="w-4 h-4" strokeWidth={1.75} />,
    },
  ];

  return (
    <div className="min-h-dvh lg:h-dvh lg:overflow-hidden flex flex-col lg:flex-row bg-[#FAF8F5] text-[#16232B]">
      {/* Mobile / Tablet Top Header (< 1024px) */}
      <header className="lg:hidden sticky top-0 z-30 bg-[#1B3A4E] text-white px-4 pt-4 pb-3 flex items-center justify-between border-b border-white/10 safe-top">
        <div className="flex items-center gap-1 min-w-0">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            aria-label="Open navigation and role switcher menu"
            className="w-9 min-h-[44px] -ml-1.5 flex items-center justify-center rounded-lg text-white hover:bg-white/10 shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={() => setCurrentRole(null)}
            className="min-h-[44px] flex items-center text-left focus:outline-none truncate"
            title="Return to Role Switcher"
          >
            <CareBridgeLogo variant="light" size="sm" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="min-h-[44px] px-2.5 py-1.5 rounded-lg bg-[#23455B] border border-white/10 flex items-center gap-2 text-left"
          >
            <span className="w-6 h-6 rounded-full bg-[#2F6F6B] flex items-center justify-center font-display text-[11px] font-semibold text-white shrink-0">
              {activeProfile.initials}
            </span>
            <span className="text-xs font-medium text-white max-w-[110px] sm:max-w-[160px] truncate">
              {activeProfile.name}
            </span>
          </button>
          <button
            onClick={() => setShowHelpModal(true)}
            aria-label="Production EMR/HIS Integration Guide"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-[#C4D4DF]"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Slide-In Drawer (< 1024px) with Role Switcher & Full Nurse Nav */}
      {mobileDrawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-[#1B3A4E] text-white h-dvh overflow-y-auto flex flex-col justify-between px-4 pt-6 pb-5 safe-top safe-bottom shadow-2xl">
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-3.5 pt-1">
                <CareBridgeLogo variant="light" size="md" />
                <button
                  onClick={() => setMobileDrawerOpen(false)}
                  aria-label="Close menu"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#9CB0BC] hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Active User Profile Card */}
              <div className="bg-[#23455B] border border-white/10 rounded-xl p-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#2F6F6B] flex items-center justify-center font-display text-xs font-semibold text-white shrink-0">
                  {activeProfile.initials}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {activeProfile.name}
                  </div>
                  <div className="text-xs text-[#8CA2B0] truncate">
                    {activeProfile.subtitle}
                  </div>
                </div>
              </div>

              {/* Nurse Navigation inside Drawer */}
              {currentRole === 'nurse' && (
                <div className="space-y-1">
                  <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#7D97A6] uppercase">
                    NURSE NAVIGATION
                  </div>
                  {nurseNavItems.map((item) => {
                    const isActive = nurseTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setNurseTab(item.id);
                          setMobileDrawerOpen(false);
                        }}
                        className={`w-full min-h-[44px] flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#214B59] text-white border-l-2 border-[#2F6F6B]'
                            : 'text-[#9CB0BC] hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <span
                          className={
                            isActive ? 'text-[#2F6F6B]' : 'text-[#8CA2B0]'
                          }
                        >
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Cross-Role Switcher inside Drawer */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="px-3 pb-1 text-[10px] font-semibold tracking-[0.12em] text-[#7D97A6] uppercase">
                  ROLE SWITCHER (DEMO)
                </div>
                {(
                  [
                    {
                      id: 'nurse',
                      label: 'Nurse (Phase 1)',
                      icon: <User className="w-4 h-4" />,
                    },
                    {
                      id: 'management',
                      label: 'Hospital Capacity (Phase 2)',
                      icon: <LayoutGrid className="w-4 h-4" />,
                    },
                    {
                      id: 'emergency',
                      label: 'Emergency Team (Phase 2)',
                      icon: <Zap className="w-4 h-4" />,
                    },
                    {
                      id: 'receiving',
                      label: 'Receiving Hospital (Phase 2)',
                      icon: <Home className="w-4 h-4" />,
                    },
                    {
                      id: 'patient',
                      label: 'Patient Journey (Phase 3)',
                      icon: <Heart className="w-4 h-4" />,
                    },
                  ] as const
                ).map((r) => {
                  const active = currentRole === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => {
                        setCurrentRole(r.id);
                        setMobileDrawerOpen(false);
                      }}
                      className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                        active
                          ? 'bg-[#2F6F6B] text-white font-semibold'
                          : 'text-[#8CA2B0] hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {r.icon}
                      <span className="truncate">{r.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="text-xs text-[#7D97A6] space-y-0.5">
                <div>Shift: Day · 07:00–19:00</div>
                <div className="font-mono-data">26 Sep 2025 · 16:05</div>
              </div>

              <button
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setCurrentRole(null);
                }}
                className="w-full min-h-[44px] inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-sm text-[#C4D4DF] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>All Roles Screen</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Left Sidebar matching Screenshots 2-10 (Locked in place on Desktop >= 1024px) */}
      <aside className="hidden lg:flex w-60 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto bg-[#1B3A4E] text-white shrink-0 flex-col justify-between select-none">
        <div className="px-4 pt-6 pb-4 space-y-5">
          {/* Logo */}
          <div className="px-2 pt-1 flex items-center justify-between">
            <button
              onClick={() => setCurrentRole(null)}
              className="text-left focus:outline-none"
              title="Return to Role Switcher"
            >
              <CareBridgeLogo variant="light" size="md" />
            </button>
          </div>

          {/* User Profile Card matching Screenshots */}
          <div className="bg-[#23455B] border border-white/10 rounded-xl p-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2F6F6B] flex items-center justify-center font-display text-xs font-semibold text-white shrink-0">
              {activeProfile.initials}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white truncate">
                {activeProfile.name}
              </div>
              <div className="text-xs text-[#8CA2B0] truncate">
                {activeProfile.subtitle}
              </div>
            </div>
          </div>

          {/* Primary Navigation for Nurse Role */}
          {currentRole === 'nurse' && (
            <div className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-semibold tracking-[0.12em] text-[#7D97A6] uppercase">
                NAVIGATION
              </div>
              {nurseNavItems.map((item) => {
                const isActive = nurseTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setNurseTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#214B59] text-white border-l-2 border-[#2F6F6B]'
                        : 'text-[#9CB0BC] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span
                      className={
                        isActive ? 'text-[#2F6F6B]' : 'text-[#8CA2B0]'
                      }
                    >
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cross-Role Quick Switcher in Sidebar so Evaluators can test all 3 Phases seamlessly */}
          <div className="pt-2 border-t border-white/10 space-y-1">
            <div className="px-3 pb-1 text-[10px] font-semibold tracking-[0.12em] text-[#7D97A6] uppercase">
              ROLE SWITCHER (DEMO)
            </div>
            {(
              [
                {
                  id: 'nurse',
                  label: 'Nurse (Phase 1)',
                  icon: <User className="w-3.5 h-3.5" />,
                },
                {
                  id: 'management',
                  label: 'Hospital Capacity (Phase 2)',
                  icon: <LayoutGrid className="w-3.5 h-3.5" />,
                },
                {
                  id: 'emergency',
                  label: 'Emergency Team (Phase 2)',
                  icon: <Zap className="w-3.5 h-3.5" />,
                },
                {
                  id: 'receiving',
                  label: 'Receiving Hospital (Phase 2)',
                  icon: <Home className="w-3.5 h-3.5" />,
                },
                {
                  id: 'patient',
                  label: 'Patient Journey (Phase 3)',
                  icon: <Heart className="w-3.5 h-3.5" />,
                },
              ] as const
            ).map((r) => {
              const active = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setCurrentRole(r.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors ${
                    active
                      ? 'bg-[#2F6F6B] text-white font-semibold'
                      : 'text-[#8CA2B0] hover:text-white hover:bg-white/5'
                  }`}
                >
                  {r.icon}
                  <span className="truncate">{r.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Shift Info & Return to Role Login Screen */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="text-[11px] text-[#7D97A6] space-y-0.5">
            <div>Shift: Day · 07:00–19:00</div>
            <div className="font-mono-data">26 Sep 2025 · 16:05</div>
          </div>

          <button
            onClick={() => setCurrentRole(null)}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-[#C4D4DF] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>All Roles Screen</span>
          </button>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 min-w-0 lg:h-dvh overflow-x-hidden overflow-y-auto relative">
        {currentRole === 'nurse' && (
          <>
            {nurseTab === 'dashboard' && (
              <NurseDashboardView
                patients={patients}
                tasks={tasks}
                referrals={referrals}
                onSelectPatient={handleSelectPatient}
                onToggleTaskStatus={handleToggleTaskStatus}
                onNavigate={(tab) => setNurseTab(tab)}
              />
            )}
            {nurseTab === 'attention' && (
              <AttentionBoardView
                patients={patients}
                onSelectPatient={handleSelectPatient}
              />
            )}
            {nurseTab === 'profile' && (
              <PatientProfileView
                patient={selectedPatient}
                allPatients={patients}
                tasks={tasks}
                referrals={referrals}
                onSwitchPatient={(id) => setSelectedPatientId(id)}
                onNavigate={(tab) => setNurseTab(tab)}
                onApproveNoteDraft={handleApproveNoteDraft}
                onToggleTaskStatus={handleToggleTaskStatus}
              />
            )}
            {nurseTab === 'timeline' && (
              <VitalsTimelineView
                patient={selectedPatient}
                allPatients={patients}
                onSwitchPatient={(id) => setSelectedPatientId(id)}
                onAddManualObservation={handleAddManualObservation}
              />
            )}
            {nurseTab === 'voice' && (
              <VoiceDocumentationView
                patient={selectedPatient}
                allPatients={patients}
                onSwitchPatient={(id) => setSelectedPatientId(id)}
                onApproveVoiceObservation={handleApproveVoiceObservation}
                onSaveAiNoteDraftOnly={handleSaveAiNoteDraftOnly}
                onNavigate={(tab) => setNurseTab(tab)}
              />
            )}
            {nurseTab === 'referral' && (
              <CreateReferralView
                patient={selectedPatient}
                referral={primaryReferral}
                onUpdateReferral={handleUpdateReferral}
                onTransitionReferralStatus={handleTransitionReferralStatus}
                onReviewDocumentRequest={handleReviewDocumentRequest}
                onSwitchRole={(r) => setCurrentRole(r)}
              />
            )}
          </>
        )}

        {currentRole === 'management' && (
          <HospitalCapacityView
            wards={wards}
            capacityLogs={capacityLogs}
            onAdmitPatient={handleAdmitPatientToWard}
            onDischargePatient={handleDischargePatientFromWard}
            onTransferPatient={handleTransferPatientBetweenWards}
          />
        )}

        {currentRole === 'emergency' && (
          <EmergencyIntakeView
            onCreateEmergencyReferral={handleCreateEmergencyReferral}
            onSwitchRole={(r) => setCurrentRole(r)}
          />
        )}

        {currentRole === 'receiving' && (
          <ReceivingHospitalView
            referrals={referrals}
            patients={patients}
            onTransitionReferralStatus={handleTransitionReferralStatus}
            onRequestDocument={handleRequestDocumentFromReceiving}
            onSwitchRole={(r) => setCurrentRole(r)}
          />
        )}

        {currentRole === 'patient' && (
          <PatientJourneyView
            patient={patients[0]}
            referral={referrals[0]}
            onToggleCarePlanItem={handleToggleCarePlanItem}
            onSubmitSymptomReport={handleSubmitSymptomReport}
          />
        )}

        {/* Desktop-only floating Help button (on mobile/tablet it sits cleanly in the top header) */}
        <button
          onClick={() => setShowHelpModal(true)}
          aria-label="Production EMR/HIS Integration Guide"
          className="hidden lg:flex fixed bottom-5 right-5 w-11 h-11 rounded-full bg-[#1B3A4E] hover:bg-[#244B63] text-white items-center justify-center shadow-md transition-colors z-40"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        {/* Help / Integration Modal (Full-width bottom sheet on mobile, centered modal on desktop) */}
        {showHelpModal && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-[#FAF8F5] border border-[#D9DFE1] rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[90dvh] overflow-y-auto p-5 sm:p-6 space-y-4 shadow-xl safe-bottom">
              <div className="flex items-start justify-between gap-3 border-b border-[#D9DFE1] pb-3">
                <h3 className="font-display text-lg font-semibold text-[#16232B]">
                  CareBridge — Prototype Simulation vs. Production EMR/HIS
                  Integration
                </h3>
                <button
                  onClick={() => setShowHelpModal(false)}
                  aria-label="Close modal"
                  className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#5C6B72] hover:text-[#16232B] shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-base sm:text-xs text-[#16232B] leading-relaxed">
                <p>
                  <strong>1. Medical Device Feeds:</strong> In production,
                  vital observations ingest via HL7 v2 ORU^R01 and FHIR{' '}
                  <code className="font-mono-data">Observation</code> streams
                  from bedside monitors. Voice notes structured by Gemini remain{' '}
                  <code className="font-mono-data">AI Note Draft</code> records
                  until a clinician clicks <strong>Approve &amp; Save</strong>.
                </p>
                <p>
                  <strong>2. Hospital Bed Capacity (HIS / ADT):</strong> Ward
                  counts connect to hospital PAS/ADT event streams (HL7 ADT^A01
                  Admit, A02 Transfer, A03 Discharge).
                </p>
                <p>
                  <strong>3. Facility Network &amp; Matching:</strong> Regional
                  hospital capabilities query a federated FHIR{' '}
                  <code className="font-mono-data">HealthcareService</code> &amp;
                  capacity directory, evaluated via deterministic requirement
                  checklists.
                </p>
                <p>
                  <strong>4. Inter-Hospital Referrals &amp; Document Release:</strong>{' '}
                  Uses FHIR <code className="font-mono-data">ServiceRequest</code>{' '}
                  and IHE XDS.b / FHIR{' '}
                  <code className="font-mono-data">DocumentReference</code> with
                  granular per-document consent and release locks.
                </p>
                <p>
                  <strong>5. Patient Verification &amp; Portal:</strong>{' '}
                  Authenticated via SMART-on-FHIR patient launch linked to the
                  national/hospital Master Patient Index (MPI).
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
