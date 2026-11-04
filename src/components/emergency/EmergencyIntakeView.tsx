import React, { useState } from 'react';
import {
  Mic,
  Check,
  X,
  AlertTriangle,
  Send,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  FacilityRequirementInput,
  Referral,
  Role,
} from '../../types/carebridge';
import {
  REGIONAL_FACILITIES,
  evaluateFacilityChecklist,
} from '../../data/mockData';
import { AiDraftedBadge } from '../BrandElements';

interface EmergencyIntakeViewProps {
  onCreateEmergencyReferral: (newReferral: Referral) => void;
  onSwitchRole: (role: Role) => void;
}

const DEFAULT_AMBULANCE_TRANSCRIPT =
  'Medic Unit 4 en route with 41-year-old male involved in high-speed RTA. Temperature 36.9, pulse 114, respiratory rate 28, oxygen sat 90% on 15 liters non-rebreather mask, blood pressure 104 over 68. Patient alert and anxious, GCS 14, complaining of severe right chest pain and shortness of breath. Onset 35 minutes ago at scene. Needs Thoracic Surgery, high-flow oxygen, chest drain equipment, and an HDU or ICU bed.';

export const EmergencyIntakeView: React.FC<EmergencyIntakeViewProps> = ({
  onCreateEmergencyReferral,
  onSwitchRole,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [intakeApproved, setIntakeApproved] = useState(false);
  const [dispatchedBanner, setDispatchedBanner] = useState<string | null>(null);

  const [transcript, setTranscript] = useState(DEFAULT_AMBULANCE_TRANSCRIPT);

  // AI-drafted structured intake fields (require explicit human Approve before becoming active intake record)
  const [patientName, setPatientName] = useState(
    'Kojo Mensah (EMG-409 · 41M)'
  );
  const [temperature, setTemperature] = useState('36.9°C');
  const [pulse, setPulse] = useState('114 bpm');
  const [respiratoryRate, setRespiratoryRate] = useState('28 /min');
  const [spO2, setSpO2] = useState('90%');
  const [bp, setBp] = useState('104/68');
  const [oxygenSource, setOxygenSource] = useState('NRM 15L/min');
  const [mentalStatus, setMentalStatus] = useState('Alert, anxious · GCS 14');
  const [reportedSymptom, setReportedSymptom] = useState(
    'Blunt right chest trauma, dyspnoea, reduced right air entry'
  );
  const [onset, setOnset] = useState('~35 minutes ago (scene)');

  // Patient Requirement Checklist Inputs for Facility Matching
  const [requirements, setRequirements] = useState<FacilityRequirementInput>({
    highFlowOxygen: true,
    specialty: 'Thoracic Surgery',
    equipment: 'Chest Drain / Pleural Kit',
    icuBedRequired: true,
  });

  const handleExtractFromVoice = async () => {
    setIsExtracting(true);
    setFallbackNotice(null);
    setIntakeApproved(false);

    try {
      const res = await fetch('/api/extract-voice-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript, mode: 'emergency' }),
      });

      if (!res.ok) {
        throw new Error('Voice processing unavailable — enter manually');
      }

      const data = await res.json();
      const s = data.structured;
      if (s) {
        if (s.temperature) setTemperature(s.temperature);
        if (s.pulse) setPulse(s.pulse);
        if (s.respiratoryRate) setRespiratoryRate(s.respiratoryRate);
        if (s.spO2) setSpO2(s.spO2);
        if (s.bp) setBp(s.bp);
        if (s.oxygenSource) setOxygenSource(s.oxygenSource);
        if (s.mentalStatus) setMentalStatus(s.mentalStatus);
        if (s.reportedSymptom) setReportedSymptom(s.reportedSymptom);
        if (s.onset) setOnset(s.onset);
      }
    } catch {
      setFallbackNotice('Voice processing unavailable — enter manually');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleDispatchToFacility = (facilityId: string) => {
    const fac =
      REGIONAL_FACILITIES.find((f) => f.id === facilityId) ||
      REGIONAL_FACILITIES[0];

    const newRef: Referral = {
      id: `REF-EMG-${Math.floor(100 + Math.random() * 899)}`,
      patientId: 'EMG-409',
      patientName: patientName.split('(')[0].trim(),
      patientAgeSex: '41 · Male',
      referringFacility: 'National Ambulance Service — Medic Unit 4',
      referringWard: 'Pre-Hospital Scene Intake',
      referringClinician: 'Paramedic Lead K. Ofori',
      completingNurse: 'Paramedic Lead K. Ofori',
      receivingFacilityId: fac.id,
      receivingFacilityName: `${fac.name} — ${fac.unitName}`,
      requiredService: requirements.specialty,
      urgency: 'Emergency — Immediate',
      reasonForReferral: `${reportedSymptom}. Vitals en route: SpO₂ ${spO2} on ${oxygenSource}, RR ${respiratoryRate}, HR ${pulse}, BP ${bp}.`,
      status: 'Submitted',
      createdAt: '2025-09-26 16:08',
      updatedAt: '2025-09-26 16:08',
      assignedReceivingBed: 'Trauma Resus Bay 1',
      documentRequests: [
        {
          id: `doc-emg-1`,
          documentType: 'Ambulance ePCR Vital Signs & Scene Handover Log',
          category: 'Nursing Flowsheet',
          requestedBy: `Receiving Triage (${fac.name})`,
          requestedAt: '16:08',
          status: 'Approved',
          reviewedBy: 'Paramedic Lead K. Ofori',
          reviewedAt: '16:08',
          clinicalDataPreview: `Scene ePCR: ${transcript} | Approved Vitals: Temp ${temperature}, HR ${pulse}, RR ${respiratoryRate}, SpO₂ ${spO2} (${oxygenSource}), BP ${bp}.`,
        },
      ],
      history: [
        {
          id: `h-emg-1`,
          status: 'Submitted',
          timestamp: '16:08',
          actor: 'Paramedic Lead K. Ofori',
          facility: 'Medic Unit 4',
          note: `Emergency pre-arrival referral transmitted ahead of patient to ${fac.name}.`,
        },
      ],
    };

    onCreateEmergencyReferral(newRef);
    setDispatchedBanner(
      `Pre-arrival emergency referral transmitted to ${fac.name}. Information is now ahead of the patient.`
    );
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6 pb-28 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#5C6B72] mb-1">
            National Ambulance Service · Medic Unit 4 · Pre-Hospital Coordination
          </p>
          <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
            Emergency Intake &amp; Facility Matching
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIsRecording(!isRecording);
              if (isRecording) {
                handleExtractFromVoice();
              }
            }}
            className={`hidden lg:inline-flex min-h-[44px] items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              isRecording
                ? 'bg-[#FCEEE9] text-[#B4432F] border border-[#F2C6B8]'
                : 'bg-[#2F6F6B] text-white hover:bg-[#255A56]'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>
              {isRecording
                ? 'Stop Scene Recording & Structure'
                : 'Record Voice Intake'}
            </span>
          </button>

          <button
            onClick={() =>
              setFallbackNotice('Voice processing unavailable — enter manually')
            }
            className="min-h-[44px] w-full sm:w-auto px-3.5 py-2.5 rounded-lg bg-white border border-[#D9DFE1] text-sm sm:text-xs font-medium text-[#5C6B72] hover:text-[#16232B]"
          >
            Simulate Offline Fallback
          </button>
        </div>
      </div>

      {/* Guardrail Banner */}
      <div className="bg-[#EAF2F0] border border-[#C5DBD7] rounded-xl px-4 py-3.5 flex items-start sm:items-center gap-2.5 text-sm sm:text-xs text-[#1B3A4E] leading-relaxed">
        <Info className="w-4 h-4 text-[#2F6F6B] shrink-0 mt-0.5 sm:mt-0" />
        <span>
          Guardrail: AI structures voice notes into draft fields only. Paramedic
          must click <strong>Approve Intake</strong> before transmitting to a
          receiving hospital. Facility matching uses explainable requirement
          checklists — never opaque percentage scores.
        </span>
      </div>

      {fallbackNotice && (
        <div className="bg-[#FDF3DF] border border-[#E5C278] rounded-xl px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm sm:text-xs text-[#8C5811]">
          <div className="flex items-start sm:items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#C98A2E] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <span className="font-semibold">{fallbackNotice}</span>
              <span> — Manual entry active below without blocking dispatch.</span>
            </div>
          </div>
          <button
            onClick={() => setFallbackNotice(null)}
            className="min-h-[44px] sm:min-h-0 self-end sm:self-auto underline text-xs px-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {dispatchedBanner && (
        <div className="bg-[#E6F2EB] border border-[#4C8B67] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm sm:text-xs text-[#1B3A4E]">
          <span className="font-medium leading-relaxed">{dispatchedBanner}</span>
          <button
            onClick={() => onSwitchRole('receiving')}
            className="min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 rounded-lg bg-[#1B3A4E] text-white font-semibold hover:bg-[#244B63] whitespace-nowrap"
          >
            View in Receiving Hospital Console →
          </button>
        </div>
      )}

      {/* Step 1: Voice -> Structured Intake Review */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        {/* Left 5 Cols: Transcript */}
        <div className="lg:col-span-5 bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs sm:text-[11px] font-mono-data uppercase text-[#5C6B72] font-semibold">
              SCENE VOICE TRANSCRIPT
            </span>
            <button
              onClick={handleExtractFromVoice}
              disabled={isExtracting}
              className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-1.5 text-xs text-[#2F6F6B] font-semibold hover:underline px-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isExtracting ? 'Structuring...' : 'Extract with Gemini'}
            </button>
          </div>

          <textarea
            rows={5}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="w-full text-base sm:text-sm text-[#16232B] leading-relaxed bg-[#FAF8F5] border border-[#D9DFE1] rounded-lg p-3 focus:outline-none focus:border-[#2F6F6B]"
          />

          <div className="pt-1">
            <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1.5">
              Patient Identifier / Triage Tag
            </label>
            <input
              type="text"
              value={patientName}
              onChange={(e) => setPatientName(e.target.value)}
              className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] text-base sm:text-xs font-medium text-[#16232B]"
            />
          </div>
        </div>

        {/* Right 7 Cols: Editable AI-Drafted Intake Fields */}
        <div className="lg:col-span-7 bg-[#EAF2F0] border border-[#C8DDD9] border-l-4 border-l-[#2F6F6B] rounded-xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {intakeApproved ? (
                <span className="px-2.5 py-1 rounded-full text-xs sm:text-[11px] font-medium bg-[#E6F2EB] text-[#35694B] border border-[#B8DFC8]">
                  ✓ Paramedic-Approved Intake
                </span>
              ) : (
                <AiDraftedBadge label="AI Note Draft — Requires Approval" />
              )}
            </div>

            <button
              onClick={() => setIntakeApproved(true)}
              className={`min-h-[44px] sm:min-h-0 inline-flex items-center gap-1.5 px-4 py-2 sm:py-1.5 rounded-lg text-sm sm:text-xs font-semibold transition-colors ${
                intakeApproved
                  ? 'bg-[#4C8B67] text-white'
                  : 'bg-[#2F6F6B] hover:bg-[#255A56] text-white'
              }`}
            >
              <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span>
                {intakeApproved ? 'Intake Approved' : 'Approve Intake Fields'}
              </span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                TEMP
              </label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => {
                  setTemperature(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm font-medium text-[#16232B] mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                PULSE
              </label>
              <input
                type="text"
                value={pulse}
                onChange={(e) => {
                  setPulse(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm font-medium text-[#16232B] mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                RESP RATE
              </label>
              <input
                type="text"
                value={respiratoryRate}
                onChange={(e) => {
                  setRespiratoryRate(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm font-medium text-[#16232B] mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                SPO₂
              </label>
              <input
                type="text"
                value={spO2}
                onChange={(e) => {
                  setSpO2(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm font-medium text-[#B4432F] mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                OXYGEN SOURCE
              </label>
              <input
                type="text"
                value={oxygenSource}
                onChange={(e) => {
                  setOxygenSource(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-xs font-medium text-[#16232B] mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                BLOOD PRESSURE
              </label>
              <input
                type="text"
                value={bp}
                onChange={(e) => {
                  setBp(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-xs font-medium text-[#16232B] mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                MENTAL STATUS
              </label>
              <input
                type="text"
                value={mentalStatus}
                onChange={(e) => {
                  setMentalStatus(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 text-base sm:text-xs font-medium text-[#16232B] mt-0.5 focus:outline-none"
              />
            </div>

            <div className="bg-white border border-[#D9DFE1] rounded-lg p-3 sm:p-2.5">
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
                ONSET
              </label>
              <input
                type="text"
                value={onset}
                onChange={(e) => {
                  setOnset(e.target.value);
                  setIntakeApproved(false);
                }}
                className="w-full min-h-[40px] sm:min-h-0 text-base sm:text-xs font-medium text-[#16232B] mt-0.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="bg-white border border-[#D9DFE1] rounded-lg p-3">
            <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72]">
              REPORTED SYMPTOM &amp; SCENE ASSESSMENT
            </label>
            <input
              type="text"
              value={reportedSymptom}
              onChange={(e) => {
                setReportedSymptom(e.target.value);
                setIntakeApproved(false);
              }}
              className="w-full min-h-[40px] sm:min-h-0 text-base sm:text-xs font-medium text-[#16232B] mt-1 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Step 2: Patient Requirements & Explainable Per-Requirement Facility Checklist */}
      <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#EEF1F2]">
          <div>
            <h2 className="font-display text-lg font-semibold text-[#16232B]">
              Explainable Facility Capability Matching
            </h2>
            <p className="text-sm sm:text-xs text-[#5C6B72]">
              Adjust the patient&apos;s clinical requirements below to evaluate
              regional hospitals via explicit capability checklists.
            </p>
          </div>

          {/* Interactive Requirement Filters (single-column / full-width on mobile with 44px height) */}
          <div className="grid grid-cols-1 sm:flex sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-3">
            <label className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-2 text-sm sm:text-xs bg-[#FAF8F5] border border-[#D9DFE1] rounded-lg px-3 py-2 sm:py-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requirements.highFlowOxygen}
                onChange={(e) =>
                  setRequirements((prev) => ({
                    ...prev,
                    highFlowOxygen: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-[#2F6F6B]"
              />
              <span>High-Flow O₂</span>
            </label>

            <select
              value={requirements.specialty}
              onChange={(e) =>
                setRequirements((prev) => ({
                  ...prev,
                  specialty: e.target.value as any,
                }))
              }
              className="min-h-[44px] sm:min-h-0 text-base sm:text-xs bg-[#FAF8F5] border border-[#D9DFE1] rounded-lg px-3 py-2 sm:py-1.5 text-[#16232B]"
            >
              <option value="Thoracic Surgery">
                Specialty: Thoracic Surgery
              </option>
              <option value="Trauma Surgery">Specialty: Trauma Surgery</option>
              <option value="Cardiology">Specialty: Cardiology</option>
              <option value="General Medicine">
                Specialty: General Medicine
              </option>
            </select>

            <select
              value={requirements.equipment}
              onChange={(e) =>
                setRequirements((prev) => ({
                  ...prev,
                  equipment: e.target.value as any,
                }))
              }
              className="min-h-[44px] sm:min-h-0 text-base sm:text-xs bg-[#FAF8F5] border border-[#D9DFE1] rounded-lg px-3 py-2 sm:py-1.5 text-[#16232B]"
            >
              <option value="Chest Drain / Pleural Kit">
                Equip: Chest Drain / Pleural Kit
              </option>
              <option value="Mechanical Ventilator">
                Equip: Mechanical Ventilator
              </option>
              <option value="CT Imaging">Equip: CT Imaging</option>
            </select>

            <label className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-2 text-sm sm:text-xs bg-[#FAF8F5] border border-[#D9DFE1] rounded-lg px-3 py-2 sm:py-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={requirements.icuBedRequired}
                onChange={(e) =>
                  setRequirements((prev) => ({
                    ...prev,
                    icuBedRequired: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-[#2F6F6B]"
              />
              <span>ICU / HDU Bed Required</span>
            </label>
          </div>
        </div>

        {/* 3 Regional Facilities Checklist Comparison Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {REGIONAL_FACILITIES.map((facility) => {
            const evaluation = evaluateFacilityChecklist(
              requirements,
              facility
            );

            return (
              <div
                key={facility.id}
                className={`rounded-xl p-4 sm:p-5 border flex flex-col justify-between space-y-4 ${
                  evaluation.allRequiredMet
                    ? 'bg-[#FAF8F5] border-2 border-[#2F6F6B]'
                    : 'bg-white border-[#D9DFE1]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display text-base font-semibold text-[#16232B]">
                        {facility.name}
                      </h3>
                      <p className="text-xs text-[#5C6B72]">
                        {facility.unitName}
                      </p>
                    </div>
                    <span className="font-mono-data text-xs text-[#5C6B72] whitespace-nowrap">
                      {facility.distanceKm} km · {facility.etaMinutes}m
                    </span>
                  </div>

                  {/* Checklist Status Summary (No percentage score!) */}
                  <div
                    className={`px-3 py-2.5 rounded-lg text-xs font-medium border ${
                      evaluation.allRequiredMet
                        ? 'bg-[#E6F2EB] text-[#35694B] border-[#B8DFC8]'
                        : 'bg-[#FDF5E6] text-[#966217] border-[#E5C278]'
                    }`}
                  >
                    <div className="font-semibold">
                      {evaluation.allRequiredMet
                        ? `All ${evaluation.requiredCount} Clinical Requirements Met`
                        : `${evaluation.metCount} of ${evaluation.requiredCount} Requirements Met`}
                    </div>
                    <div className="text-xs sm:text-[11px] mt-0.5 opacity-90 leading-relaxed">
                      {evaluation.recommendationSummary}
                    </div>
                  </div>

                  {/* Per-Requirement Checklist Explanation */}
                  <div className="space-y-2.5 pt-1">
                    {evaluation.rows.map((row, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2.5 text-xs border-b border-[#EEF1F2] pb-2 last:border-none"
                      >
                        {row.met ? (
                          <span className="w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-[#E6F2EB] text-[#4C8B67] flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          </span>
                        ) : (
                          <span className="w-5 h-5 sm:w-4 sm:h-4 rounded-full bg-[#FCEEE9] text-[#B4432F] flex items-center justify-center shrink-0 mt-0.5">
                            <X className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          </span>
                        )}
                        <div>
                          <div className="font-medium text-[#16232B] text-sm sm:text-xs">
                            {row.requirementLabel}
                          </div>
                          <div className="text-xs sm:text-[11px] text-[#5C6B72] leading-snug mt-0.5">
                            {row.explanation}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => handleDispatchToFacility(facility.id)}
                    className={`w-full min-h-[44px] py-2.5 px-4 rounded-lg text-sm sm:text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors ${
                      evaluation.allRequiredMet
                        ? 'bg-[#2F6F6B] hover:bg-[#255A56] text-white'
                        : 'bg-[#EEF1F2] hover:bg-[#E0E6E8] text-[#16232B]'
                    }`}
                  >
                    <Send className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                    <span>Transmit Pre-Arrival Referral</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile One-Handed Sticky Bottom Bar: 64px+ Voice Record Button + Quick Approve */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-[#D9DFE1] px-4 py-2.5 flex items-center gap-3 shadow-lg safe-bottom">
        <button
          onClick={handleToggleSpeech}
          aria-label="Field Voice Record"
          className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 transition-all shadow-md ${
            isRecording
              ? 'bg-[#B4432F] text-white ring-4 ring-[#FCEEE9]'
              : 'bg-[#D97D4A] text-white active:scale-95'
          }`}
        >
          {isRecording ? (
            <>
              <MicOff className="w-6 h-6" />
              <span className="text-[10px] font-mono-data font-semibold mt-0.5">
                STOP
              </span>
            </>
          ) : (
            <>
              <Mic className="w-6 h-6" />
              <span className="text-[10px] font-mono-data font-semibold mt-0.5">
                VOICE
              </span>
            </>
          )}
        </button>

        <div className="flex-1 flex flex-col gap-1.5">
          <button
            onClick={() => setIntakeApproved(true)}
            className={`w-full min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${
              intakeApproved
                ? 'bg-[#4C8B67] text-white'
                : 'bg-[#2F6F6B] text-white'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>
              {intakeApproved
                ? 'Intake Approved · Ready to Route'
                : 'Approve Intake Fields'}
            </span>
          </button>
          <button
            onClick={handleExtractFromVoice}
            disabled={isExtracting}
            className="w-full min-h-[36px] px-3 py-1 rounded-lg bg-[#EEF1F2] text-[#1B3A4E] text-[11px] font-semibold inline-flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2F6F6B]" />
            <span>
              {isExtracting ? 'Structuring with Gemini...' : 'Re-run AI Structuring'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
