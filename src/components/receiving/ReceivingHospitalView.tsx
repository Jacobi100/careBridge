import React, { useState } from 'react';
import {
  FileText,
  Lock,
  Unlock,
  Plus,
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Truck,
} from 'lucide-react';
import {
  Referral,
  ReferralStatus,
  Patient,
  DocumentRequestItem,
  Role,
} from '../../types/carebridge';
import {
  ReferralStatusBadge,
  REFERRAL_LIFECYCLE_STEPS,
  BridgeArcSymbol,
} from '../BrandElements';

interface ReceivingHospitalViewProps {
  referrals: Referral[];
  patients: Patient[];
  onTransitionReferralStatus: (
    referralId: string,
    newStatus: ReferralStatus,
    actor: string,
    facility: string,
    note: string
  ) => void;
  onRequestDocument: (
    referralId: string,
    docItem: Omit<DocumentRequestItem, 'id'>
  ) => void;
  onSwitchRole: (role: Role) => void;
}

const AVAILABLE_DOCUMENT_TEMPLATES: {
  documentType: string;
  category: DocumentRequestItem['category'];
  previewWhenApproved: string;
}[] = [
  {
    documentType: 'Nursing 8-Hour Vitals & Oxygen Escalation Flowsheet',
    category: 'Nursing Flowsheet',
    previewWhenApproved:
      '08:15 SpO₂ 98% (RA), RR 20 -> 12:00 SpO₂ 95% (NRM 4L), RR 23 -> 14:00 SpO₂ 93%, RR 26 -> 16:02 SpO₂ 91%, RR 29/min, HR 103 bpm, Temp 38.1°C.',
  },
  {
    documentType: 'Surgical & Intercostal Chest Drain Consent Form',
    category: 'Consent / Legal',
    previewWhenApproved:
      'Signed informed consent by patient Marcus Osei (PT-2847) witnessed by Sister A. Kumi & Dr. E. Asamoah for tube thoracostomy and thoracic surgical intervention.',
  },
  {
    documentType: 'Blood Group, Crossmatch (2 Units PRBC) & Coagulation',
    category: 'Lab / ABG',
    previewWhenApproved:
      'Blood Group: O Rh Positive | Antibody Screen: Negative | INR: 1.0 | APTT: 29s | Platelets: 245 x10⁹/L | 2 units crossmatched and held in blood bank.',
  },
];

export const ReceivingHospitalView: React.FC<ReceivingHospitalViewProps> = ({
  referrals,
  patients,
  onTransitionReferralStatus,
  onRequestDocument,
  onSwitchRole,
}) => {
  const [selectedReferralId, setSelectedReferralId] = useState<string>(
    referrals[0]?.id || ''
  );
  const [selectedDocTemplateIdx, setSelectedDocTemplateIdx] = useState(0);
  const [decisionNote, setDecisionNote] = useState('');

  const activeReferral =
    referrals.find((r) => r.id === selectedReferralId) || referrals[0];

  const linkedPatient =
    patients.find((p) => p.id === activeReferral?.patientId) || patients[0];

  if (!activeReferral) {
    return (
      <div className="p-8 text-center text-sm text-[#5C6B72]">
        No incoming referrals in queue.
      </div>
    );
  }

  const handleRequestNewDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const tpl = AVAILABLE_DOCUMENT_TEMPLATES[selectedDocTemplateIdx];
    if (!tpl) return;

    onRequestDocument(activeReferral.id, {
      documentType: tpl.documentType,
      category: tpl.category,
      requestedBy: 'Dr. K. Mensah (Thoracic Surgery, City General)',
      requestedAt: '16:10',
      status: 'Requested',
      clinicalDataPreview: tpl.previewWhenApproved,
    });

    // Also transition to Information Requested if currently Submitted or Under Review
    if (
      activeReferral.status === 'Submitted' ||
      activeReferral.status === 'Under Review'
    ) {
      onTransitionReferralStatus(
        activeReferral.id,
        'Information Requested',
        'Dr. K. Mensah',
        'City General Hospital',
        `Requested additional clinical record: ${tpl.documentType}`
      );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#5C6B72] mb-1">
            City General Hospital · Thoracic Surgery &amp; Trauma Receiving
            Console
          </p>
          <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
            Incoming Referrals &amp; Pre-Arrival Records
          </h1>
        </div>

        {/* Referral Selector if multiple exist */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <select
            value={activeReferral.id}
            onChange={(e) => setSelectedReferralId(e.target.value)}
            className="min-h-[44px] sm:min-h-0 flex-1 sm:flex-initial px-3.5 py-2 rounded-lg bg-white border border-[#D9DFE1] text-base sm:text-xs font-mono-data text-[#16232B]"
          >
            {referrals.map((r) => (
              <option key={r.id} value={r.id}>
                {r.id} · {r.patientName} ({r.status})
              </option>
            ))}
          </select>
          <ReferralStatusBadge status={activeReferral.status} />
        </div>
      </div>

      {/* Visual Bridge Line Lifecycle Stepper */}
      <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <BridgeArcSymbol className="w-6 h-3.5 shrink-0" color="#2F6F6B" />
            <h2 className="font-display text-sm font-semibold text-[#16232B]">
              Referral State Machine — Live Cross-Hospital Synchronization
            </h2>
          </div>
          <span className="text-xs text-[#5C6B72]">
            Tap any stage to transition state across Referring, Receiving &amp;
            Patient views
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {REFERRAL_LIFECYCLE_STEPS.map((st, idx) => {
            const isCurrent = activeReferral.status === st;
            const currentIdx = REFERRAL_LIFECYCLE_STEPS.indexOf(
              activeReferral.status
            );
            const isCompleted = currentIdx > idx;

            return (
              <React.Fragment key={st}>
                <button
                  onClick={() =>
                    onTransitionReferralStatus(
                      activeReferral.id,
                      st,
                      'Dr. K. Mensah (Receiving Lead)',
                      'City General Hospital',
                      decisionNote.trim() ||
                        `Referral status updated to ${st} by receiving surgical team.`
                    )
                  }
                  className={`min-h-[40px] sm:min-h-0 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    isCurrent
                      ? 'bg-[#1B3A4E] text-white border-[#1B3A4E]'
                      : isCompleted
                      ? 'bg-[#EAF2F0] text-[#2F6F6B] border-[#B8D4CE]'
                      : 'bg-[#FAF8F5] text-[#5C6B72] border-[#D9DFE1] hover:border-[#2F6F6B]'
                  }`}
                >
                  {isCompleted ? `✓ ${st}` : st}
                </button>
                {idx < REFERRAL_LIFECYCLE_STEPS.length - 1 && (
                  <span className="hidden sm:inline text-[#BDC7CC] text-xs">
                    →
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Primary Receiving Clinician Action Bar */}
        <div className="pt-3 border-t border-[#EEF1F2] flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <input
            type="text"
            placeholder="Optional clinical handover / receiving bed note (e.g., Assign Thoracic HDU Bed 4)..."
            value={decisionNote}
            onChange={(e) => setDecisionNote(e.target.value)}
            className="w-full lg:flex-1 min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-xs text-[#16232B]"
          />

          <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2">
            <button
              onClick={() =>
                onTransitionReferralStatus(
                  activeReferral.id,
                  'Under Review',
                  'Dr. K. Mensah',
                  'City General Hospital',
                  'Thoracic surgical team reviewing clinical summary and imaging.'
                )
              }
              className="min-h-[44px] sm:min-h-0 px-3 py-2 rounded-lg bg-[#EEF1F2] hover:bg-[#E0E6E8] text-xs font-medium text-[#16232B]"
            >
              Mark Under Review
            </button>

            <button
              onClick={() =>
                onTransitionReferralStatus(
                  activeReferral.id,
                  'Information Requested',
                  'Dr. K. Mensah',
                  'City General Hospital',
                  decisionNote.trim() ||
                    'Requested ABG and analgesia records prior to transfer.'
                )
              }
              className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FDF3DF] hover:bg-[#F9E7C2] text-[#966217] border border-[#E5C278] text-xs font-medium"
            >
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              Request Info
            </button>

            <button
              onClick={() =>
                onTransitionReferralStatus(
                  activeReferral.id,
                  'Accepted',
                  'Dr. K. Mensah',
                  'City General Hospital',
                  decisionNote.trim() ||
                    'Accepted for Thoracic HDU Bed 4. Chest drain tray prepared.'
                )
              }
              className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2F6F6B] hover:bg-[#255A56] text-white text-xs font-semibold"
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              Accept Referral
            </button>

            <button
              onClick={() =>
                onTransitionReferralStatus(
                  activeReferral.id,
                  'En Route',
                  'Ambulance Dispatch',
                  'Inter-Facility Transfer',
                  'Patient departed St. Mary’s General Hospital on 4L/min NRM.'
                )
              }
              className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#FCEFE8] hover:bg-[#F9E1D4] text-[#B85D2B] border border-[#EFC7B0] text-xs font-medium"
            >
              <Truck className="w-3.5 h-3.5 shrink-0" />
              Mark En Route
            </button>

            <button
              onClick={() =>
                onTransitionReferralStatus(
                  activeReferral.id,
                  'Admitted',
                  'Dr. K. Mensah',
                  'City General Hospital',
                  'Patient arrived and admitted to Thoracic HDU Bed 4.'
                )
              }
              className="min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-lg bg-[#1B3A4E] hover:bg-[#244B63] text-white text-xs font-semibold"
            >
              Confirm Arrival &amp; Admit
            </button>

            <button
              onClick={() =>
                onTransitionReferralStatus(
                  activeReferral.id,
                  'Declined',
                  'Dr. K. Mensah',
                  'City General Hospital',
                  decisionNote.trim() ||
                    'Declined — alternative facility required.'
                )
              }
              className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-[#FCEEE9] hover:bg-[#F7DDD4] text-[#B4432F] text-xs font-medium"
            >
              <XCircle className="w-3.5 h-3.5 shrink-0" />
              Decline
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Split: Incoming Clinical Summary vs Granular Document Request & Release */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 6 Cols: Incoming Referral Packet & Evidence */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-[#EEF1F2] pb-4">
              <div>
                <span className="font-mono-data text-xs text-[#5C6B72]">
                  {activeReferral.id} · From {activeReferral.referringFacility}
                </span>
                <h2 className="font-display text-xl font-semibold text-[#16232B] mt-0.5">
                  {activeReferral.patientName} ({activeReferral.patientAgeSex})
                </h2>
                <p className="text-xs text-[#5C6B72] mt-0.5">
                  Referring Clinician: {activeReferral.referringClinician} ·
                  Completed by {activeReferral.completingNurse}
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#FCEEE9] text-[#B4432F]">
                {activeReferral.urgency}
              </span>
            </div>

            <div>
              <div className="text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                REASON FOR REFERRAL ({activeReferral.requiredService})
              </div>
              <p className="text-sm text-[#16232B] leading-relaxed">
                {activeReferral.reasonForReferral}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 pt-2">
              <div className="p-3.5 rounded-lg bg-[#FCEEE9] border border-[#F2C6B8]">
                <div className="text-[10px] font-mono-data uppercase text-[#B4432F] font-semibold">
                  ALLERGIES
                </div>
                <div className="text-xs font-semibold text-[#8A2E1E] mt-1">
                  {linkedPatient.allergies.join(' · ')}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-[#EAF2F0] border border-[#C5DBD7]">
                <div className="text-[10px] font-mono-data uppercase text-[#2F6F6B] font-semibold">
                  ASSIGNED RECEIVING BAY
                </div>
                <div className="text-xs font-semibold text-[#1B3A4E] mt-1">
                  {activeReferral.assignedReceivingBed || 'Thoracic HDU Bed 4'}
                </div>
              </div>
            </div>

            {/* Audit Trail */}
            <div className="pt-3 border-t border-[#EEF1F2] space-y-2.5">
              <div className="text-[10px] font-mono-data uppercase text-[#5C6B72] font-semibold">
                REFERRAL AUDIT TRAIL
              </div>
              {activeReferral.history.map((h) => (
                <div
                  key={h.id}
                  className="text-xs flex flex-col sm:flex-row sm:items-start justify-between gap-1.5 sm:gap-3 bg-[#FAF8F5] p-3 sm:p-2.5 rounded-lg"
                >
                  <div>
                    <span className="font-semibold text-[#1B3A4E]">
                      {h.status}
                    </span>{' '}
                    <span className="text-[#5C6B72]">({h.actor})</span>
                    <div className="text-[#16232B] mt-0.5 leading-relaxed">
                      {h.note}
                    </div>
                  </div>
                  <span className="font-mono-data text-[11px] text-[#5C6B72] whitespace-nowrap">
                    {h.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 6 Cols: Granular Document Requests (Only Approved Items Visible!) */}
        <div className="lg:col-span-6 space-y-5">
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#16232B]">
                Targeted Clinical Document Requests
              </h2>
              <p className="text-sm sm:text-xs text-[#5C6B72] mt-0.5">
                Request specific records from {activeReferral.referringFacility}
                . Requested items remain locked until explicitly approved by the
                referring team.
              </p>
            </div>

            {/* Request New Document Form */}
            <form
              onSubmit={handleRequestNewDoc}
              className="flex flex-col sm:flex-row gap-2.5 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#D9DFE1]"
            >
              <select
                value={selectedDocTemplateIdx}
                onChange={(e) =>
                  setSelectedDocTemplateIdx(Number(e.target.value))
                }
                className="flex-1 min-h-[44px] sm:min-h-0 px-3 py-2 rounded-lg bg-white border border-[#D9DFE1] text-base sm:text-xs text-[#16232B]"
              >
                {AVAILABLE_DOCUMENT_TEMPLATES.map((tpl, idx) => (
                  <option key={tpl.documentType} value={idx}>
                    {tpl.documentType} ({tpl.category})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#1B3A4E] hover:bg-[#244B63] text-white text-xs font-semibold whitespace-nowrap"
              >
                <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                Request Document
              </button>
            </form>

            {/* List of Requested Documents */}
            <div className="space-y-3">
              {activeReferral.documentRequests.map((doc) => {
                const isApproved = doc.status === 'Approved';
                const isRejected = doc.status === 'Rejected';

                return (
                  <div
                    key={doc.id}
                    className={`rounded-xl p-4 border space-y-2.5 ${
                      isApproved
                        ? 'bg-[#F4FAF7] border-[#B8DFC8]'
                        : isRejected
                        ? 'bg-[#FCEEE9] border-[#F2C6B8]'
                        : 'bg-[#FAF8F5] border-[#D9DFE1]'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                      <div className="flex items-start gap-2">
                        {isApproved ? (
                          <Unlock className="w-4 h-4 text-[#4C8B67] shrink-0 mt-0.5" />
                        ) : (
                          <Lock className="w-4 h-4 text-[#C98A2E] shrink-0 mt-0.5" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-[#16232B]">
                            {doc.documentType}
                          </div>
                          <div className="font-mono-data text-[11px] text-[#5C6B72]">
                            {doc.category} · Requested at {doc.requestedAt}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`self-start px-2.5 py-0.5 rounded-full text-[11px] font-medium whitespace-nowrap ${
                          isApproved
                            ? 'bg-[#E6F2EB] text-[#35694B]'
                            : isRejected
                            ? 'bg-[#FCEEE9] text-[#B4432F]'
                            : 'bg-[#FDF3DF] text-[#966217]'
                        }`}
                      >
                        {isApproved
                          ? 'Approved & Visible'
                          : isRejected
                          ? 'Declined by Referring Hospital'
                          : 'Awaiting Referring Approval'}
                      </span>
                    </div>

                    {/* Enforce Guardrail: ONLY approved items show clinical content on the receiving side */}
                    {isApproved ? (
                      <div className="bg-white border border-[#C2DFCE] rounded-lg p-3 text-xs text-[#16232B] leading-relaxed font-mono-data">
                        <div className="text-[10px] uppercase text-[#4C8B67] font-semibold mb-1">
                          RELEASED CLINICAL RECORD (APPROVED BY {doc.reviewedBy}
                          )
                        </div>
                        {doc.clinicalDataPreview}
                      </div>
                    ) : isRejected ? (
                      <div className="text-xs text-[#B4432F]">
                        Access to this document was declined by the referring
                        hospital.
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/80 border border-dashed border-[#D9DFE1] rounded-lg p-3 text-xs text-[#5C6B72]">
                        <span>
                          Record content is locked until approved by St.
                          Mary&apos;s General Hospital.
                        </span>
                        <button
                          onClick={() => onSwitchRole('nurse')}
                          className="min-h-[40px] sm:min-h-0 inline-flex items-center gap-1 text-[#2F6F6B] font-semibold hover:underline whitespace-nowrap"
                        >
                          <span>Switch to Nurse to Approve</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Sticky Bottom Primary Action Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-[#D9DFE1] px-4 py-2.5 flex items-center gap-2 shadow-lg safe-bottom">
        <button
          onClick={() =>
            onTransitionReferralStatus(
              activeReferral.id,
              'Declined',
              'Dr. K. Mensah',
              'City General Hospital',
              decisionNote.trim() || 'Declined — alternative facility required.'
            )
          }
          className="min-h-[44px] px-3 py-2 rounded-lg bg-[#FCEEE9] text-[#B4432F] text-xs font-semibold inline-flex items-center justify-center gap-1"
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Decline</span>
        </button>

        <button
          onClick={() =>
            onTransitionReferralStatus(
              activeReferral.id,
              'Information Requested',
              'Dr. K. Mensah',
              'City General Hospital',
              decisionNote.trim() ||
                'Requested ABG and analgesia records prior to transfer.'
            )
          }
          className="min-h-[44px] px-3 py-2 rounded-lg bg-[#FDF3DF] text-[#966217] border border-[#E5C278] text-xs font-semibold inline-flex items-center justify-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Request Info</span>
        </button>

        <button
          onClick={() =>
            onTransitionReferralStatus(
              activeReferral.id,
              'Accepted',
              'Dr. K. Mensah',
              'City General Hospital',
              decisionNote.trim() ||
                'Accepted for Thoracic HDU Bed 4. Chest drain tray prepared.'
            )
          }
          className="flex-1 min-h-[44px] px-3.5 py-2 rounded-lg bg-[#2F6F6B] text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Accept Referral</span>
        </button>
      </div>
    </div>
  );
};
