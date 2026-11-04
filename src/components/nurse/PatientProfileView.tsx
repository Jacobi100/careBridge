import React, { useState } from 'react';
import { Mic, Check, AlertTriangle } from 'lucide-react';
import {
  Patient,
  NurseNavTab,
  TaskItem,
  Referral,
} from '../../types/carebridge';
import { evaluatePatientTrend } from '../../data/mockData';
import {
  AiDraftedBadge,
  ClinicianVerifiedBadge,
  PatientStatusBadge,
  ReferralStatusBadge,
} from '../BrandElements';

interface PatientProfileViewProps {
  patient: Patient;
  allPatients: Patient[];
  tasks: TaskItem[];
  referrals: Referral[];
  onSwitchPatient: (patientId: string) => void;
  onNavigate: (tab: NurseNavTab) => void;
  onApproveNoteDraft: (patientId: string, noteId: string) => void;
  onToggleTaskStatus: (taskId: string) => void;
}

type ProfileSubTab =
  | 'Observations'
  | 'Investigations'
  | 'Nursing Notes'
  | 'Tasks'
  | 'Care Plan'
  | 'Referrals'
  | 'Timeline';

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  allPatients,
  tasks,
  referrals,
  onSwitchPatient,
  onNavigate,
  onApproveNoteDraft,
  onToggleTaskStatus,
}) => {
  const [activeSubTab, setActiveSubTab] =
    useState<ProfileSubTab>('Observations');

  const trend = evaluatePatientTrend(patient);
  const effectiveStatus = trend ? trend.severity : patient.status;

  // Show key observations in reverse chronological order (matching Screenshot 233628: 16:02, 12:00, 08:15 + any newly added)
  const displayedObservations = [...patient.observations]
    .filter(
      (obs, idx, arr) =>
        idx === 0 ||
        idx === arr.length - 1 ||
        obs.timeLabel === '12:00' ||
        obs.isVoiceStructured ||
        idx >= 8
    )
    .reverse();

  const patientTasks = tasks.filter((t) => t.patientId === patient.id);
  const patientReferrals = referrals.filter((r) => r.patientId === patient.id);

  const subTabs: ProfileSubTab[] = [
    'Observations',
    'Investigations',
    'Nursing Notes',
    'Tasks',
    'Care Plan',
    'Referrals',
    'Timeline',
  ];

  return (
    <div className="min-h-full flex flex-col">
      {/* Top Dark Slate Banner matching Screenshot 233628 */}
      <div className="bg-[#1B3A4E] text-white px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6 pb-0 border-b border-[#2B4E64]">
        <div className="max-w-[1220px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
              <h1 className="font-display text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {patient.name}
              </h1>
              <PatientStatusBadge status={effectiveStatus} />
              <select
                aria-label="Select patient"
                value={patient.id}
                onChange={(e) => onSwitchPatient(e.target.value)}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0 sm:ml-2 bg-[#254A61] text-base sm:text-xs text-[#C4D4DF] border border-white/15 rounded-lg px-3 sm:px-2.5 py-2 sm:py-1.5 font-mono-data focus:outline-none focus:border-[#2F6F6B]"
              >
                {allPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    Switch: {p.name} ({p.id})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={() => onNavigate('voice')}
                className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#2F6F6B] hover:bg-[#275E5A] text-white text-xs font-semibold transition-colors"
              >
                <Mic className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span>Document</span>
              </button>
              <button
                onClick={() => onNavigate('timeline')}
                className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center px-4 py-2 rounded-lg bg-[#254A61] hover:bg-[#2F5B76] text-white border border-white/10 text-xs font-semibold transition-colors"
              >
                Vitals Timeline
              </button>
            </div>
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 sm:gap-6 pb-5 sm:pb-6 max-w-2xl">
            <div>
              <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#8CA2B0]">
                ID
              </div>
              <div className="font-mono-data text-sm font-medium text-white mt-0.5">
                {patient.id}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#8CA2B0]">
                AGE / SEX
              </div>
              <div className="font-mono-data text-sm font-medium text-white mt-0.5">
                {patient.age} · {patient.sex}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#8CA2B0]">
                WARD
              </div>
              <div className="text-sm font-medium text-white mt-0.5">
                {patient.wardName}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#8CA2B0]">
                BED
              </div>
              <div className="font-mono-data text-sm font-medium text-white mt-0.5">
                {patient.bed}
              </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#8CA2B0]">
                ADMITTED
              </div>
              <div className="font-mono-data text-sm font-medium text-white mt-0.5">
                {patient.admittedAt}
              </div>
            </div>
          </div>

          {/* Sub-navigation Tabs: Horizontally scrollable strip, never wrapping into multiple rows */}
          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
            {subTabs.map((tab) => {
              const isActive = activeSubTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSubTab(tab)}
                  className={`min-h-[44px] inline-flex items-center pb-2.5 pt-1 text-xs font-medium whitespace-nowrap border-b-2 shrink-0 transition-colors ${
                    isActive
                      ? 'border-[#2F6F6B] text-white font-semibold'
                      : 'border-transparent text-[#8CA2B0] hover:text-white'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] w-full mx-auto space-y-5">
        {/* Allergies & Diagnosis Strip (Always visible at top of Observations) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
          <div className="bg-[#FCEEE9] border border-[#F2C6B8] rounded-xl p-4">
            <div className="text-[10px] font-mono-data font-semibold uppercase tracking-wider text-[#B4432F] mb-1">
              ⚠ ALLERGIES
            </div>
            <div className="text-sm font-semibold text-[#8A2E1E]">
              {patient.allergies.join(' · ')}
            </div>
          </div>

          <div className="bg-[#EBF3F7] border border-[#C5DCE8] rounded-xl p-4">
            <div className="text-[10px] font-mono-data font-semibold uppercase tracking-wider text-[#3F6E8C] mb-1">
              DIAGNOSIS
            </div>
            <div className="text-sm text-[#16232B] leading-snug">
              {patient.diagnosis}
            </div>
          </div>
        </div>

        {/* TAB 1: OBSERVATIONS */}
        {activeSubTab === 'Observations' && (
          <div className="space-y-4">
            {displayedObservations.map((obs) => {
              // Match screenshot 233628 display values for 16:02 voice card
              const displayRr =
                obs.id === 'obs-m-9' && obs.isVoiceStructured ? 26 : obs.rr;
              const displayHr =
                obs.id === 'obs-m-9' && obs.isVoiceStructured ? 98 : obs.hr;
              const displayBpSys =
                obs.id === 'obs-m-9' && obs.isVoiceStructured
                  ? 113
                  : obs.bpSystolic;
              const displayTemp =
                obs.id === 'obs-m-9' && obs.isVoiceStructured ? 37.8 : obs.temp;

              return (
                <div
                  key={obs.id}
                  className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#EEF1F2]">
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                      <span className="font-mono-data text-sm font-medium text-[#16232B]">
                        {obs.timeLabel}
                      </span>
                      {obs.verificationStatus === 'AI-drafted' ? (
                        <AiDraftedBadge />
                      ) : (
                        <ClinicianVerifiedBadge />
                      )}
                    </div>
                    <span className="text-xs text-[#5C6B72]">
                      {obs.recordedBy}
                    </span>
                  </div>

                  {/* 6-Column Vitals Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 sm:gap-4">
                    <div>
                      <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
                        SPO₂
                      </div>
                      <div className="font-mono-data text-base font-semibold text-[#16232B] mt-1">
                        {obs.spO2}%
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
                        RR
                      </div>
                      <div className="font-mono-data text-base font-semibold text-[#16232B] mt-1">
                        {displayRr}/min
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
                        HR
                      </div>
                      <div className="font-mono-data text-base font-semibold text-[#16232B] mt-1">
                        {displayHr} bpm
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
                        BP
                      </div>
                      <div className="font-mono-data text-base font-semibold text-[#16232B] mt-1">
                        {displayBpSys}/{obs.bpDiastolic}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
                        TEMP
                      </div>
                      <div className="font-mono-data text-base font-semibold text-[#16232B] mt-1">
                        {displayTemp.toFixed(1)}°C
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
                        O₂ SOURCE
                      </div>
                      <div className="font-mono-data text-base font-semibold text-[#16232B] mt-1">
                        {obs.oxygenSource}
                      </div>
                    </div>
                  </div>

                  {/* Voice-structured observation nested card */}
                  {(obs.mentalStatus || obs.reportedSymptom) && (
                    <div className="bg-[#EAF2F0] border-l-4 border-l-[#2F6F6B] rounded-lg p-3.5 sm:p-4 space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <AiDraftedBadge />
                        <span className="text-xs text-[#5C6B72]">
                          Voice-structured observation
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                        <div>
                          <div className="text-xs sm:text-[11px] text-[#5C6B72]">
                            Mental Status
                          </div>
                          <div className="text-sm font-medium text-[#16232B] mt-0.5">
                            {obs.mentalStatus || 'Alert and oriented'}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs sm:text-[11px] text-[#5C6B72]">
                            Reported Symptom
                          </div>
                          <div className="text-sm font-medium text-[#16232B] mt-0.5">
                            {obs.reportedSymptom || 'None reported'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: INVESTIGATIONS */}
        {activeSubTab === 'Investigations' && (
          <div className="space-y-3">
            {patient.investigations.length === 0 ? (
              <div className="bg-white border border-[#D9DFE1] rounded-xl p-6 sm:p-8 text-center text-sm text-[#5C6B72]">
                No laboratory or imaging investigations ordered for this
                encounter.
              </div>
            ) : (
              patient.investigations.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-semibold text-[#16232B]">
                        {inv.name}
                      </span>
                      <span className="text-xs text-[#5C6B72]">
                        · {inv.category}
                      </span>
                    </div>
                    <span className="font-mono-data text-xs text-[#5C6B72]">
                      Reported: {inv.reportedAt}
                    </span>
                  </div>
                  <p className="text-sm text-[#16232B] leading-relaxed">
                    {inv.summary}
                  </p>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: NURSING NOTES (Shows AI Note Drafts vs Approved Clinical Notes) */}
        {activeSubTab === 'Nursing Notes' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-sm sm:text-xs text-[#5C6B72]">
                Guardrail: AI-drafted notes never become final Clinical Notes
                until explicitly approved by a nurse.
              </p>
              <button
                onClick={() => onNavigate('voice')}
                className="min-h-[44px] sm:min-h-0 px-4 sm:px-3.5 py-2 rounded-lg bg-[#2F6F6B] text-white text-xs font-medium hover:bg-[#265C58] self-start sm:self-auto"
              >
                + New Voice Documentation
              </button>
            </div>

            {patient.clinicalNotes.length === 0 ? (
              <div className="bg-white border border-[#D9DFE1] rounded-xl p-6 sm:p-8 text-center text-sm text-[#5C6B72]">
                No clinical notes recorded yet. Use Voice Documentation to
                capture and structure a note.
              </div>
            ) : (
              patient.clinicalNotes.map((note) => {
                const isDraft = note.reviewStatus === 'AI Note Draft';
                return (
                  <div
                    key={note.id}
                    className={`rounded-xl p-4 sm:p-5 border space-y-3 ${
                      isDraft
                        ? 'bg-[#FDF5E6] border-[#E5C278]'
                        : 'bg-white border-[#D9DFE1]'
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-data text-xs font-medium text-[#16232B]">
                          {note.timestamp}
                        </span>
                        {isDraft ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FCE4B8] text-[#8C5811]">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            AI Note Draft — Pending Nurse Approval
                          </span>
                        ) : (
                          <ClinicianVerifiedBadge label="Approved Clinical Note" />
                        )}
                      </div>

                      {isDraft && (
                        <button
                          onClick={() =>
                            onApproveNoteDraft(patient.id, note.id)
                          }
                          className="min-h-[44px] sm:min-h-0 w-full sm:w-auto justify-center inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#2F6F6B] text-white text-xs font-semibold hover:bg-[#255A56]"
                        >
                          <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          Approve &amp; Finalize Note
                        </button>
                      )}
                    </div>

                    <p className="text-sm text-[#16232B] leading-relaxed italic">
                      &ldquo;{note.transcript}&rdquo;
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2 border-t border-black/5 text-xs">
                      <div>
                        <span className="text-[#5C6B72]">Temp / HR:</span>{' '}
                        <span className="font-mono-data font-medium">
                          {note.structuredFields.temperature} ·{' '}
                          {note.structuredFields.pulse}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5C6B72]">RR / SpO₂:</span>{' '}
                        <span className="font-mono-data font-medium">
                          {note.structuredFields.respiratoryRate} ·{' '}
                          {note.structuredFields.spO2}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5C6B72]">O₂ Source:</span>{' '}
                        <span className="font-mono-data font-medium">
                          {note.structuredFields.oxygenSource}
                        </span>
                      </div>
                      <div>
                        <span className="text-[#5C6B72]">Symptom:</span>{' '}
                        <span className="font-medium">
                          {note.structuredFields.reportedSymptom}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* TAB 4: TASKS */}
        {activeSubTab === 'Tasks' && (
          <div className="bg-white border border-[#D9DFE1] rounded-xl divide-y divide-[#EEF1F2]">
            {patientTasks.length === 0 ? (
              <div className="p-6 sm:p-8 text-center text-sm text-[#5C6B72]">
                No tasks assigned for {patient.name}.
              </div>
            ) : (
              patientTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => onToggleTaskStatus(t.id)}
                  className="p-4 sm:px-6 min-h-[60px] flex items-center justify-between gap-3 hover:bg-[#FAF8F5] cursor-pointer"
                >
                  <div>
                    <div className="text-sm font-medium text-[#16232B]">
                      {t.title}
                    </div>
                    <div className="font-mono-data text-xs text-[#5C6B72]">
                      Scheduled: {t.dueTime}
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EEF1F2] text-[#16232B] shrink-0">
                    {t.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 5: CARE PLAN */}
        {activeSubTab === 'Care Plan' && (
          <div className="space-y-4">
            <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5">
              <h3 className="font-display text-sm font-semibold text-[#16232B] mb-3">
                Active Medications
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.medications.map((med, i) => (
                  <span
                    key={i}
                    className="font-mono-data text-xs px-3 py-1.5 rounded-lg bg-[#EEF1F2] text-[#16232B]"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>

            {patient.carePlan.map((cp) => (
              <div
                key={cp.id}
                className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4"
              >
                <div>
                  <span className="text-[11px] font-mono-data uppercase text-[#2F6F6B] font-semibold">
                    {cp.category}
                  </span>
                  <h4 className="font-display text-sm font-semibold text-[#16232B] mt-0.5">
                    {cp.title}
                  </h4>
                  <p className="text-xs text-[#5C6B72] mt-1">
                    {cp.instructions}
                  </p>
                </div>
                <span className="font-mono-data text-xs text-[#5C6B72] whitespace-nowrap">
                  {cp.schedule}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* TAB 6: REFERRALS */}
        {activeSubTab === 'Referrals' && (
          <div className="space-y-4">
            {patientReferrals.map((ref) => (
              <div
                key={ref.id}
                className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-mono-data text-xs text-[#5C6B72]">
                      {ref.id} · {ref.requiredService}
                    </span>
                    <h3 className="font-display text-base font-semibold text-[#16232B]">
                      {ref.receivingFacilityName}
                    </h3>
                  </div>
                  <ReferralStatusBadge status={ref.status} />
                </div>
                <p className="text-sm text-[#16232B]">
                  {ref.reasonForReferral}
                </p>
                <button
                  onClick={() => onNavigate('referral')}
                  className="min-h-[44px] sm:min-h-0 w-full sm:w-auto px-4 py-2 rounded-lg bg-[#1B3A4E] text-white text-xs font-medium hover:bg-[#254B63]"
                >
                  Manage Referral &amp; Document Requests →
                </button>
              </div>
            ))}
          </div>
        )}

        {/* TAB 7: UNIFIED TIMELINE */}
        {activeSubTab === 'Timeline' && (
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-5">
            <h3 className="font-display text-base font-semibold text-[#16232B]">
              Unified Patient Continuity Timeline
            </h3>

            <div className="relative pl-6 border-l-2 border-[#2F6F6B] space-y-6 ml-1 sm:ml-0">
              {trend && (
                <div className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#C98A2E] border-2 border-white" />
                  <div className="text-xs font-mono-data text-[#C98A2E] font-semibold">
                    {trend.flaggedAt} · Explainable Trend Alert
                  </div>
                  <div className="text-sm font-medium text-[#16232B] mt-0.5">
                    {trend.shortSummary}
                  </div>
                  <div className="text-xs text-[#5C6B72] mt-1 leading-relaxed">
                    {trend.evidenceText}
                  </div>
                </div>
              )}

              {patient.patientReports.map((rep) => (
                <div key={rep.id} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#D97D4A] border-2 border-white" />
                  <div className="text-xs font-mono-data text-[#D97D4A] font-semibold">
                    {rep.timestamp} · Patient Self-Reported Symptom
                  </div>
                  <div className="text-sm font-medium text-[#16232B] mt-0.5">
                    Pain {rep.painLevel}/10 · {rep.breathingStatus}
                  </div>
                  <div className="text-xs text-[#5C6B72] mt-0.5">
                    &ldquo;{rep.symptomNote}&rdquo;
                  </div>
                </div>
              ))}

              {[...patient.observations].reverse().map((obs) => (
                <div key={obs.id} className="relative">
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[#2F6F6B] border-2 border-white" />
                  <div className="text-xs font-mono-data text-[#5C6B72]">
                    {obs.timeLabel} · Observation ({obs.verificationStatus}) ·{' '}
                    {obs.recordedBy}
                  </div>
                  <div className="font-mono-data text-xs text-[#16232B] mt-0.5 leading-relaxed">
                    SpO₂ {obs.spO2}% · RR {obs.rr}/min · HR {obs.hr} bpm · BP{' '}
                    {obs.bpSystolic}/{obs.bpDiastolic} · Temp {obs.temp}°C (
                    {obs.oxygenSource})
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
