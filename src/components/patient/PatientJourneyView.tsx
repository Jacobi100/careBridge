import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Heart,
  Pill,
  Send,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import {
  Patient,
  Referral,
  PatientSymptomReport,
} from '../../types/carebridge';
import { BridgeArcSymbol, ReferralStatusBadge } from '../BrandElements';

interface PatientJourneyViewProps {
  patient: Patient;
  referral: Referral;
  onToggleCarePlanItem: (patientId: string, carePlanItemId: string) => void;
  onSubmitSymptomReport: (
    patientId: string,
    report: Omit<PatientSymptomReport, 'id' | 'patientId'>
  ) => void;
}

export const PatientJourneyView: React.FC<PatientJourneyViewProps> = ({
  patient,
  referral,
  onToggleCarePlanItem,
  onSubmitSymptomReport,
}) => {
  const [painLevel, setPainLevel] = useState(5);
  const [breathingStatus, setBreathingStatus] =
    useState<PatientSymptomReport['breathingStatus']>(
      'Mildly Short of Breath'
    );
  const [symptomNote, setSymptomNote] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState(false);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptomNote.trim()) return;

    onSubmitSymptomReport(patient.id, {
      timestamp: '16:12',
      painLevel,
      breathingStatus,
      symptomNote: symptomNote.trim(),
      acknowledgedByNurse: false,
    });

    setSymptomNote('');
    setSubmittedNotice(true);
    setTimeout(() => setSubmittedNotice(false), 4000);
  };

  // Map Referral State Machine automatically onto Patient-Friendly Care Journey Milestones
  const journeySteps = [
    {
      id: 'step-admitted',
      title: "Admitted to St. Mary's General Hospital",
      subtitle: `${patient.wardName} · Bed ${patient.bed} · Care led by Dr. E. Asamoah & Sister A. Kumi`,
      time: '09:14',
      state: 'completed' as const,
      explanation:
        'Initial chest imaging, pain relief, and oxygen support started.',
    },
    {
      id: 'step-monitoring',
      title: 'Continuous Vital Signs & Respiratory Monitoring',
      subtitle: 'Automated trend detection & nursing observations active',
      time: '08:15 – 16:02',
      state: 'completed' as const,
      explanation:
        'Your care team noticed you needed extra support with breathing and arranged a specialist consultation.',
    },
    {
      id: 'step-referral',
      title: `Specialist Referral to ${referral.receivingFacilityName}`,
      subtitle: `Current Referral Status: ${referral.status}`,
      time: referral.updatedAt,
      state:
        referral.status === 'Accepted' ||
        referral.status === 'Transfer Pending' ||
        referral.status === 'En Route' ||
        referral.status === 'Arrived' ||
        referral.status === 'Admitted'
          ? ('completed' as const)
          : ('current' as const),
      explanation:
        referral.status === 'Draft'
          ? 'Sister A. Kumi is preparing your clinical summary and allergy records so you will not have to repeat your medical history.'
          : referral.status === 'Submitted' ||
            referral.status === 'Under Review' ||
            referral.status === 'Information Requested'
          ? 'Your medical summary and chest scan have been sent ahead to the Thoracic Surgery team at City General Hospital.'
          : referral.status === 'Accepted'
          ? `City General Hospital has accepted your transfer and reserved ${
              referral.assignedReceivingBed || 'Thoracic HDU Bed 4'
            } for your arrival.`
          : referral.status === 'Declined'
          ? 'Your care team is coordinating an alternative specialist unit.'
          : 'Specialist team has reviewed and accepted your records.',
    },
    {
      id: 'step-transfer',
      title: 'Coordinated Hospital Transfer & Arrival',
      subtitle:
        referral.status === 'En Route'
          ? 'Ambulance transfer currently en route'
          : referral.status === 'Arrived' || referral.status === 'Admitted'
          ? `Arrived at ${referral.receivingFacilityName}`
          : 'Scheduled once receiving bed is confirmed',
      time:
        referral.status === 'En Route' ||
        referral.status === 'Arrived' ||
        referral.status === 'Admitted'
          ? 'Active Now'
          : 'Upcoming',
      state:
        referral.status === 'Admitted' || referral.status === 'Arrived'
          ? ('completed' as const)
          : referral.status === 'En Route' ||
            referral.status === 'Transfer Pending'
          ? ('current' as const)
          : ('upcoming' as const),
      explanation:
        'Your allergies (Penicillin, NSAIDs), medications, and scan results travel with you automatically.',
    },
    {
      id: 'step-recovery',
      title: 'Specialist Treatment & Post-Discharge Care Plan',
      subtitle: 'Continued recovery, breathing exercises, and follow-up',
      time: referral.status === 'Admitted' ? 'In Progress' : 'Next Stage',
      state:
        referral.status === 'Admitted'
          ? ('current' as const)
          : ('upcoming' as const),
      explanation:
        'Ongoing medication reminders and direct symptom check-ins with your care team.',
    },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1100px] mx-auto space-y-5 sm:space-y-6">
      {/* Warm Human-Centered Patient Header using Clay Amber (#D97D4A) accent */}
      <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-[#D97D4A]">
            <Heart className="w-4 h-4 fill-[#D97D4A]/20 text-[#D97D4A]" />
            <span>Patient Care Companion · Connected Journey</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-semibold text-[#16232B]">
            Hello, {patient.name.split(' ')[0]}
          </h1>
          <p className="text-base sm:text-sm text-[#5C6B72] leading-relaxed">
            Your care team at St. Mary&apos;s General Hospital and{' '}
            {referral.receivingFacilityName.split('—')[0]} are connected through
            CareBridge.
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-[#EEF1F2]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-[#5C6B72]">Transfer Status:</span>
            <ReferralStatusBadge status={referral.status} />
          </div>
          <div className="font-mono-data text-xs text-[#5C6B72]">
            ID: {patient.id} · Allergic to: {patient.allergies.join(', ')}
          </div>
        </div>
      </div>

      {/* Main Grid: Left 7 Cols = My Care Journey Timeline, Right 5 Cols = Symptom Check-in & Medications */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 7 Cols: My Care Journey */}
        <div className="lg:col-span-7 bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-[#EEF1F2] pb-4">
            <div className="flex items-center gap-2.5">
              <BridgeArcSymbol className="w-7 h-4 shrink-0" color="#D97D4A" />
              <div>
                <h2 className="font-display text-lg font-semibold text-[#16232B]">
                  My Care Journey
                </h2>
                <p className="text-sm sm:text-xs text-[#5C6B72]">
                  Updates automatically as your care team coordinates your
                  treatment and referral.
                </p>
              </div>
            </div>
          </div>

          <div className="relative pl-6 sm:pl-7 border-l-2 border-[#D9DFE1] space-y-6 sm:space-y-7 ml-2 sm:ml-0">
            {journeySteps.map((step) => {
              const isCompleted = step.state === 'completed';
              const isCurrent = step.state === 'current';

              return (
                <div key={step.id} className="relative">
                  {/* Timeline Node */}
                  <span
                    className={`absolute -left-[31px] sm:-left-[35px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                      isCompleted
                        ? 'bg-[#4C8B67]'
                        : isCurrent
                        ? 'bg-[#D97D4A] ring-4 ring-[#FCEFE8]'
                        : 'bg-[#D9DFE1]'
                    }`}
                  />

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2">
                    <h3
                      className={`font-display text-base sm:text-sm font-semibold ${
                        isCurrent
                          ? 'text-[#D97D4A]'
                          : isCompleted
                          ? 'text-[#16232B]'
                          : 'text-[#5C6B72]'
                      }`}
                    >
                      {step.title}
                    </h3>
                    <span className="font-mono-data text-xs text-[#5C6B72]">
                      {step.time}
                    </span>
                  </div>

                  <div className="text-sm sm:text-xs font-medium text-[#1B3A4E] mt-1 sm:mt-0.5">
                    {step.subtitle}
                  </div>

                  <p className="text-sm sm:text-xs text-[#5C6B72] leading-relaxed mt-2 sm:mt-1.5 bg-[#FAF8F5] p-3.5 sm:p-3 rounded-lg border border-[#EEF1F2]">
                    {step.explanation}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Reassurance Footer */}
          <div className="bg-[#EAF2F0] border border-[#C5DBD7] rounded-xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#2F6F6B] shrink-0 mt-0.5" />
            <div className="text-sm sm:text-xs text-[#1B3A4E] leading-relaxed">
              <strong>What moves ahead of you:</strong> Your allergy alert (
              {patient.allergies.join(', ')}), chest scan summary, and current
              medications have been verified by Sister A. Kumi so the receiving
              team is ready before you arrive.
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Symptom Check-In & Care Plan / Reminders */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6">
          {/* Card 1: Report Symptoms / Progress to Care Team */}
          <form
            onSubmit={handleReportSubmit}
            className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4"
          >
            <div>
              <h2 className="font-display text-lg sm:text-base font-semibold text-[#16232B]">
                Share How You Are Feeling
              </h2>
              <p className="text-sm sm:text-xs text-[#5C6B72] mt-0.5">
                Your update is shared directly with Sister A. Kumi and your care
                team&apos;s timeline.
              </p>
            </div>

            {submittedNotice && (
              <div className="bg-[#E6F2EB] border border-[#B8DFC8] rounded-lg p-3 text-sm sm:text-xs text-[#35694B] font-medium">
                ✓ Your symptom update has been sent to Sister A. Kumi and added
                to your clinical timeline.
              </div>
            )}

            <div>
              <div className="flex items-center justify-between text-sm sm:text-xs mb-2">
                <span className="text-[#5C6B72]">Current Pain Level (1–10)</span>
                <span className="font-mono-data font-semibold text-[#D97D4A]">
                  {painLevel} / 10
                </span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={painLevel}
                onChange={(e) => setPainLevel(Number(e.target.value))}
                className="w-full h-7 accent-[#D97D4A] cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-xs text-[#5C6B72] mb-2">
                Breathing Comfort
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {(
                  [
                    'Comfortable',
                    'Mildly Short of Breath',
                    'Hard to Breathe',
                  ] as const
                ).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setBreathingStatus(status)}
                    className={`min-h-[44px] p-2.5 sm:p-2 rounded-lg text-sm sm:text-[11px] font-medium border text-center transition-colors ${
                      breathingStatus === status
                        ? 'bg-[#FCEFE8] border-[#D97D4A] text-[#9E4E22]'
                        : 'bg-[#FAF8F5] border-[#D9DFE1] text-[#5C6B72]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm sm:text-xs text-[#5C6B72] mb-1.5">
                Note for Your Nurse / Care Team
              </label>
              <textarea
                rows={3}
                placeholder="e.g., Pain improved slightly after sitting upright, or feeling more breathless..."
                value={symptomNote}
                onChange={(e) => setSymptomNote(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-xs text-[#16232B] focus:outline-none focus:border-[#D97D4A]"
              />
            </div>

            {/* Primary Patient-Facing CTA uses Clay Amber (#D97D4A) per Brand Guidelines */}
            <button
              type="submit"
              className="w-full min-h-[48px] sm:min-h-[44px] py-3 sm:py-2.5 px-4 rounded-xl sm:rounded-lg bg-[#D97D4A] hover:bg-[#C36B3B] text-white text-sm sm:text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
            >
              <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span>Send Update to Care Team</span>
            </button>

            {/* Recent Patient Reports */}
            {patient.patientReports.length > 0 && (
              <div className="pt-3 border-t border-[#EEF1F2] space-y-2">
                <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
                  RECENT UPDATES SENT TO CARE TEAM
                </div>
                {patient.patientReports.map((rep) => (
                  <div
                    key={rep.id}
                    className="p-3 rounded-lg bg-[#FAF8F5] border border-[#EEF1F2] text-sm sm:text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-1 font-mono-data text-xs sm:text-[11px] text-[#5C6B72]">
                      <span>
                        Pain {rep.painLevel}/10 · {rep.breathingStatus}
                      </span>
                      <span>{rep.timestamp}</span>
                    </div>
                    <div className="text-[#16232B] mt-1">
                      &ldquo;{rep.symptomNote}&rdquo;
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Card 2: Care Plan, Medications & Reminders (Large tappable cards on mobile) */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Pill className="w-4 h-4 text-[#2F6F6B]" />
                <h2 className="font-display text-lg sm:text-base font-semibold text-[#16232B]">
                  Care Plan &amp; Reminders
                </h2>
              </div>
              <span className="text-xs sm:text-[11px] text-[#5C6B72]">
                Tap to check
              </span>
            </div>

            <div className="space-y-3">
              {patient.carePlan.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => onToggleCarePlanItem(patient.id, item.id)}
                  className={`w-full text-left min-h-[64px] p-4 sm:p-3.5 rounded-xl border cursor-pointer transition-colors flex items-start gap-3.5 ${
                    item.completedToday
                      ? 'bg-[#F4FAF7] border-[#B8DFC8]'
                      : 'bg-[#FAF8F5] border-[#D9DFE1] hover:border-[#2F6F6B]'
                  }`}
                >
                  {item.completedToday ? (
                    <CheckCircle2 className="w-5 h-5 sm:w-4 sm:h-4 text-[#4C8B67] shrink-0 mt-0.5" />
                  ) : (
                    <Clock className="w-5 h-5 sm:w-4 sm:h-4 text-[#C98A2E] shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="text-sm sm:text-xs font-semibold text-[#16232B]">
                      {item.title}
                    </div>
                    <div className="font-mono-data text-xs sm:text-[11px] text-[#2F6F6B] mt-0.5">
                      {item.schedule}
                    </div>
                    <div className="text-xs sm:text-[11px] text-[#5C6B72] mt-1 leading-relaxed">
                      {item.instructions}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
