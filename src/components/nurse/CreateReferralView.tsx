import React, { useState } from 'react';
import { CheckCircle2, Check, X, FileText, ArrowRight } from 'lucide-react';
import {
  Patient,
  Referral,
  ReferralStatus,
  Role,
} from '../../types/carebridge';
import {
  REGIONAL_FACILITIES,
  evaluateFacilityChecklist,
} from '../../data/mockData';
import {
  ReferralStatusBadge,
  REFERRAL_LIFECYCLE_STEPS,
} from '../BrandElements';

interface CreateReferralViewProps {
  patient: Patient;
  referral: Referral;
  onUpdateReferral: (updated: Partial<Referral>) => void;
  onTransitionReferralStatus: (
    referralId: string,
    newStatus: ReferralStatus,
    actor: string,
    facility: string,
    note: string
  ) => void;
  onReviewDocumentRequest: (
    referralId: string,
    docId: string,
    decision: 'Approved' | 'Rejected'
  ) => void;
  onSwitchRole: (role: Role) => void;
}

export const CreateReferralView: React.FC<CreateReferralViewProps> = ({
  patient,
  referral,
  onUpdateReferral,
  onTransitionReferralStatus,
  onReviewDocumentRequest,
  onSwitchRole,
}) => {
  const [requiredService, setRequiredService] = useState(
    referral.requiredService
  );
  const [urgency, setUrgency] = useState(referral.urgency);
  const [receivingFacilityId, setReceivingFacilityId] = useState(
    referral.receivingFacilityId
  );
  const [reasonForReferral, setReasonForReferral] = useState(
    referral.reasonForReferral
  );
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);
  const [showFacilityComparison, setShowFacilityComparison] = useState(false);

  const selectedFacility =
    REGIONAL_FACILITIES.find((f) => f.id === receivingFacilityId) ||
    REGIONAL_FACILITIES[0];

  const handleFacilityChange = (facId: string) => {
    setReceivingFacilityId(facId);
    const fac = REGIONAL_FACILITIES.find((f) => f.id === facId);
    if (fac) {
      onUpdateReferral({
        receivingFacilityId: fac.id,
        receivingFacilityName: `${fac.name} — ${fac.unitName}`,
      });
    }
  };

  const handleSaveDraft = () => {
    onUpdateReferral({
      requiredService,
      urgency,
      reasonForReferral,
      status: 'Draft',
    });
    setStatusFeedback('Referral saved as Draft.');
    setTimeout(() => setStatusFeedback(null), 3500);
  };

  const handleSubmitReferral = () => {
    onUpdateReferral({
      requiredService,
      urgency,
      reasonForReferral,
    });
    onTransitionReferralStatus(
      referral.id,
      'Submitted',
      'Sister A. Kumi (with Dr. E. Asamoah)',
      "St. Mary's General Hospital",
      `Referral submitted to ${selectedFacility.name} (${requiredService}, ${urgency}).`
    );
    setStatusFeedback(
      `Referral submitted to ${selectedFacility.name}. Switch to Receiving Hospital role to review & accept, or advance status below.`
    );
  };

  const latestObs = patient.observations[patient.observations.length - 1];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6 pb-24 lg:pb-8">
      {/* Header matching Screenshot 233856 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-[#5C6B72] mb-1">
            {patient.name} · {patient.id}
          </p>
          <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
            Create Referral
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <ReferralStatusBadge status={referral.status} />
        </div>
      </div>

      {/* Live Feedback Banner */}
      {statusFeedback && (
        <div className="bg-[#EAF2F0] border border-[#2F6F6B] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm sm:text-xs text-[#1B3A4E]">
          <span>{statusFeedback}</span>
          <button
            onClick={() => onSwitchRole('receiving')}
            className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-lg bg-[#1B3A4E] text-white font-semibold hover:bg-[#244B63] whitespace-nowrap"
          >
            <span>Open Receiving Hospital View</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Two-Column Grid matching Screenshot 233856 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-5 sm:space-y-6">
          {/* Card 1: Referral Information */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-5">
            <h2 className="font-display text-base font-semibold text-[#16232B]">
              Referral Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm sm:text-xs text-[#5C6B72] mb-1.5">
                  Required Service
                </label>
                <select
                  value={requiredService}
                  onChange={(e) => {
                    setRequiredService(e.target.value);
                    onUpdateReferral({ requiredService: e.target.value });
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-sm text-[#16232B] focus:outline-none focus:border-[#2F6F6B]"
                >
                  <option value="Thoracic Surgery">Thoracic Surgery</option>
                  <option value="Trauma Surgery">Trauma Surgery</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="General Medicine">General Medicine</option>
                </select>
              </div>

              <div>
                <label className="block text-sm sm:text-xs text-[#5C6B72] mb-1.5">
                  Urgency
                </label>
                <select
                  value={urgency}
                  onChange={(e) => {
                    const val = e.target.value as Referral['urgency'];
                    setUrgency(val);
                    onUpdateReferral({ urgency: val });
                  }}
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-sm text-[#16232B] focus:outline-none focus:border-[#2F6F6B]"
                >
                  <option value="Urgent">Urgent</option>
                  <option value="Emergency — Immediate">
                    Emergency — Immediate
                  </option>
                  <option value="Routine">Routine</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="block text-sm sm:text-xs text-[#5C6B72]">
                  Receiving Facility
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setShowFacilityComparison(!showFacilityComparison)
                  }
                  className="min-h-[36px] sm:min-h-0 text-xs text-[#2F6F6B] hover:underline font-medium"
                >
                  {showFacilityComparison
                    ? 'Hide Facility Capability Checklist'
                    : 'Compare Regional Facility Capabilities'}
                </button>
              </div>
              <select
                value={receivingFacilityId}
                onChange={(e) => handleFacilityChange(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-sm text-[#16232B] focus:outline-none focus:border-[#2F6F6B]"
              >
                {REGIONAL_FACILITIES.map((fac) => (
                  <option key={fac.id} value={fac.id}>
                    {fac.name} — {fac.unitName}
                  </option>
                ))}
              </select>
            </div>

            {/* Explainable Per-Requirement Facility Match Checklist (Never a percentage score) */}
            {showFacilityComparison && (
              <div className="bg-[#FAF8F5] border border-[#D9DFE1] rounded-xl p-3.5 sm:p-4 space-y-3">
                <div className="text-xs font-semibold text-[#1B3A4E]">
                  Facility Capability Checklist for {patient.name} (
                  {requiredService}, High-Flow O₂, Chest Drain, HDU/ICU)
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {REGIONAL_FACILITIES.map((fac) => {
                    const match = evaluateFacilityChecklist(
                      {
                        highFlowOxygen: true,
                        specialty: (requiredService as any) || 'Thoracic Surgery',
                        equipment: 'Chest Drain / Pleural Kit',
                        icuBedRequired: true,
                      },
                      fac
                    );
                    const isSelected = fac.id === receivingFacilityId;
                    return (
                      <div
                        key={fac.id}
                        onClick={() => handleFacilityChange(fac.id)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-white border-[#2F6F6B]'
                            : 'bg-white/70 border-[#D9DFE1] hover:border-[#2F6F6B]'
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="font-semibold text-xs text-[#16232B]">
                            {fac.name} — {fac.unitName}
                          </div>
                          <span
                            className={`text-[11px] font-mono-data px-2 py-0.5 rounded ${
                              match.allRequiredMet
                                ? 'bg-[#E6F2EB] text-[#35694B]'
                                : 'bg-[#FDF3DF] text-[#966217]'
                            }`}
                          >
                            {match.metCount} of {match.requiredCount}{' '}
                            requirements verified
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {match.rows.map((r, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-1.5 text-xs sm:text-[11px]"
                            >
                              {r.met ? (
                                <Check className="w-3.5 h-3.5 text-[#4C8B67] shrink-0 mt-0.5" />
                              ) : (
                                <X className="w-3.5 h-3.5 text-[#B4432F] shrink-0 mt-0.5" />
                              )}
                              <div>
                                <span className="font-medium text-[#16232B]">
                                  {r.requirementLabel}:
                                </span>{' '}
                                <span className="text-[#5C6B72]">
                                  {r.explanation}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm sm:text-xs text-[#5C6B72] mb-1.5">
                Reason for Referral
              </label>
              <textarea
                rows={3}
                value={reasonForReferral}
                onChange={(e) => {
                  setReasonForReferral(e.target.value);
                  onUpdateReferral({ reasonForReferral: e.target.value });
                }}
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-sm text-[#16232B] leading-relaxed focus:outline-none focus:border-[#2F6F6B]"
              />
            </div>
          </div>

          {/* Card 2: Clinical Summary (Auto-pulled from record) matching Screenshot 233856 */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="font-display text-base font-semibold text-[#16232B]">
                Clinical Summary
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EAF2F0] text-[#2F6F6B] border border-[#C5DBD7]">
                Auto-pulled from record
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#5C6B72] mb-1.5">
                  DIAGNOSIS
                </div>
                <p className="text-sm text-[#16232B] leading-snug">
                  {patient.diagnosis}
                </p>
              </div>

              <div>
                <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#5C6B72] mb-1.5">
                  ALLERGIES
                </div>
                <div className="flex flex-wrap gap-2">
                  {patient.allergies.map((allergy) => (
                    <span
                      key={allergy}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-[#FCEEE9] text-[#B4432F]"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#5C6B72] mb-2">
                CURRENT MEDICATIONS
              </div>
              <div className="flex flex-wrap gap-2">
                {patient.medications.map((med) => (
                  <span
                    key={med}
                    className="font-mono-data text-xs px-3 py-1.5 rounded-lg bg-[#EEF1F2] text-[#16232B]"
                  >
                    {med}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="text-[10px] font-mono-data uppercase tracking-wider text-[#5C6B72] mb-2">
                LATEST OBSERVATIONS ({latestObs?.timeLabel || '16:02'})
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <div className="text-[11px] text-[#5C6B72]">SpO₂</div>
                  <div className="font-mono-data text-sm font-semibold text-[#16232B] mt-0.5">
                    {latestObs?.spO2 ?? 91}%
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#5C6B72]">RR</div>
                  <div className="font-mono-data text-sm font-semibold text-[#16232B] mt-0.5">
                    26/min
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#5C6B72]">HR</div>
                  <div className="font-mono-data text-sm font-semibold text-[#16232B] mt-0.5">
                    98 bpm
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-[#5C6B72]">BP</div>
                  <div className="font-mono-data text-sm font-semibold text-[#16232B] mt-0.5">
                    113/72
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Document Requests from Receiving Hospital (Real Per-Item Approval/Rejection) */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="font-display text-base font-semibold text-[#16232B]">
                  Receiving Hospital Document Requests
                </h2>
                <p className="text-sm sm:text-xs text-[#5C6B72] mt-0.5">
                  Records requested by {referral.receivingFacilityName}. Only
                  items you approve become visible to the receiving team.
                </p>
              </div>
              <span className="font-mono-data text-xs text-[#5C6B72]">
                {referral.documentRequests.length} items
              </span>
            </div>

            <div className="divide-y divide-[#EEF1F2]">
              {referral.documentRequests.map((doc) => (
                <div
                  key={doc.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <FileText className="w-4 h-4 text-[#2F6F6B] shrink-0" />
                      <span className="text-sm font-medium text-[#16232B]">
                        {doc.documentType}
                      </span>
                      <span className="text-xs text-[#5C6B72]">
                        · {doc.category}
                      </span>
                    </div>
                    <div className="text-xs text-[#5C6B72] font-mono-data">
                      Requested by {doc.requestedBy} at {doc.requestedAt}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto self-start sm:self-center">
                    {doc.status === 'Requested' ? (
                      <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() =>
                            onReviewDocumentRequest(
                              referral.id,
                              doc.id,
                              'Approved'
                            )
                          }
                          className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 rounded-lg bg-[#2F6F6B] hover:bg-[#255A56] text-white text-xs font-semibold"
                        >
                          <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          Approve Release
                        </button>
                        <button
                          onClick={() =>
                            onReviewDocumentRequest(
                              referral.id,
                              doc.id,
                              'Rejected'
                            )
                          }
                          className="min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1 px-3 py-2 sm:py-1.5 rounded-lg bg-[#FCEEE9] hover:bg-[#F7DDD4] text-[#B4432F] text-xs font-medium"
                        >
                          <X className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                          Reject
                        </button>
                      </div>
                    ) : doc.status === 'Approved' ? (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#E6F2EB] text-[#35694B]">
                        ✓ Approved &amp; Shared ({doc.reviewedAt})
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FCEEE9] text-[#B4432F]">
                        Rejected by Referring Facility
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) matching Screenshot 233856 */}
        <div className="lg:col-span-4 space-y-5">
          {/* Referring Facility Card */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-2">
            <h3 className="font-display text-sm font-semibold text-[#16232B]">
              Referring Facility
            </h3>
            <div className="text-sm font-semibold text-[#16232B] pt-1">
              St. Mary&apos;s General Hospital
            </div>
            <div className="text-xs text-[#5C6B72]">
              Medical Ward B · Dr. E. Asamoah
            </div>
            <div className="text-xs text-[#5C6B72]">
              Sister A. Kumi (completing)
            </div>
          </div>

          {/* Before Submitting Checklist Card */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-3.5">
            <h3 className="font-display text-sm font-semibold text-[#16232B]">
              Before Submitting
            </h3>
            <ul className="space-y-2.5 text-sm sm:text-xs text-[#16232B]">
              {[
                'Reason clearly documented',
                'Required service specified',
                'Receiving facility named',
                'Clinical summary reviewed',
                'Allergies included',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5">
                  <CheckCircle2
                    className="w-4 h-4 text-[#4C8B67] shrink-0"
                    strokeWidth={1.75}
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Desktop Primary & Secondary Action Buttons */}
          <div className="hidden lg:block space-y-2.5">
            <button
              type="button"
              onClick={handleSubmitReferral}
              className="w-full py-3 px-4 rounded-lg bg-[#2F6F6B] hover:bg-[#255A56] text-white text-sm font-semibold transition-colors"
            >
              {referral.status === 'Draft'
                ? 'Submit Referral'
                : 'Update & Re-Submit Referral'}
            </button>

            <button
              type="button"
              onClick={handleSaveDraft}
              className="w-full py-3 px-4 rounded-lg bg-white border border-[#D9DFE1] hover:bg-[#EEF1F2] text-[#16232B] text-sm font-medium transition-colors"
            >
              Save as Draft
            </button>
          </div>

          {/* Live Referral State Machine Progress Card */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xs font-semibold uppercase tracking-wider text-[#5C6B72]">
                Referral Lifecycle State
              </h3>
              <span className="font-mono-data text-xs text-[#2F6F6B] font-medium">
                {referral.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {REFERRAL_LIFECYCLE_STEPS.map((st) => {
                const isCurrent = referral.status === st;
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      onTransitionReferralStatus(
                        referral.id,
                        st,
                        'CareBridge Coordinator',
                        referral.receivingFacilityName,
                        `Referral transitioned to ${st}.`
                      )
                    }
                    className={`min-h-[36px] sm:min-h-0 px-2.5 py-1.5 sm:py-1 rounded text-xs sm:text-[11px] font-medium border transition-colors ${
                      isCurrent
                        ? 'bg-[#1B3A4E] text-white border-[#1B3A4E]'
                        : 'bg-[#FAF8F5] text-[#5C6B72] border-[#D9DFE1] hover:border-[#2F6F6B]'
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
            <p className="text-xs sm:text-[11px] text-[#5C6B72]">
              Transitions synchronize immediately with the Receiving Hospital
              and the Patient&apos;s Care Journey.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile / Tablet Sticky Bottom Action Bar (< 1024px) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-[#D9DFE1] px-4 py-2.5 flex items-center gap-2.5 shadow-lg safe-bottom">
        <button
          type="button"
          onClick={handleSaveDraft}
          className="min-h-[44px] px-4 py-2 rounded-lg bg-white border border-[#D9DFE1] text-xs font-semibold text-[#16232B]"
        >
          Save Draft
        </button>

        <button
          type="button"
          onClick={handleSubmitReferral}
          className="flex-1 min-h-[44px] py-2.5 px-4 rounded-lg bg-[#2F6F6B] text-white text-xs font-semibold"
        >
          {referral.status === 'Draft'
            ? 'Submit Referral'
            : 'Update & Re-Submit Referral'}
        </button>
      </div>
    </div>
  );
};
