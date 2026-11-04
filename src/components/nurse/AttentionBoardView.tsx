import React from 'react';
import { Patient, NurseNavTab } from '../../types/carebridge';
import { evaluatePatientTrend } from '../../data/mockData';
import { AiDraftedBadge, PatientStatusBadge } from '../BrandElements';

interface AttentionBoardViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string, targetTab: NurseNavTab) => void;
}

export const AttentionBoardView: React.FC<AttentionBoardViewProps> = ({
  patients,
  onSelectPatient,
}) => {
  const evaluated = patients.map((p) => {
    const trend = evaluatePatientTrend(p);
    const effectiveStatus = trend ? trend.severity : p.status;
    return { patient: p, trend, effectiveStatus };
  });

  const attentionCount = evaluated.filter(
    (e) => e.effectiveStatus === 'Attention'
  ).length;
  const monitoringCount = evaluated.filter(
    (e) => e.effectiveStatus === 'Monitoring'
  ).length;
  const stableCount = evaluated.filter(
    (e) => e.effectiveStatus === 'Stable'
  ).length;

  const flaggedList = evaluated.filter(
    (e) =>
      e.effectiveStatus === 'Attention' || e.effectiveStatus === 'Monitoring'
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div>
        <p className="text-xs text-[#5C6B72] mb-1">
          Real-time · Medical Ward B
        </p>
        <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
          Attention Board
        </h1>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5">
          <div className="font-mono-data text-2xl font-semibold text-[#16232B]">
            {patients.length}
          </div>
          <div className="text-xs text-[#5C6B72] mt-1">Patients</div>
        </div>

        <div className="bg-[#FDF5E6] border border-[#E5C278] rounded-xl p-4 sm:p-5">
          <div className="font-mono-data text-2xl font-semibold text-[#C98A2E]">
            {attentionCount}
          </div>
          <div className="text-xs text-[#5C6B72] mt-1">Attention</div>
        </div>

        <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5">
          <div className="font-mono-data text-2xl font-semibold text-[#16232B]">
            {monitoringCount}
          </div>
          <div className="text-xs text-[#5C6B72] mt-1">Monitoring</div>
        </div>

        <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5">
          <div className="font-mono-data text-2xl font-semibold text-[#16232B]">
            {stableCount}
          </div>
          <div className="text-xs text-[#5C6B72] mt-1">Stable</div>
        </div>
      </div>

      {/* Requires Attention Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#C98A2E]" />
          <h2 className="font-display text-base font-semibold text-[#16232B]">
            Requires Attention
          </h2>
        </div>

        {flaggedList.map(({ patient, trend, effectiveStatus }, idx) => {
          const latestObs =
            patient.observations[patient.observations.length - 1];
          const lastRecordedTime = latestObs ? latestObs.timeLabel : '16:00';
          const flaggedTime = trend ? trend.flaggedAt : '15:05';

          return (
            <div
              key={patient.id}
              className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
                    <span className="font-mono-data text-xs text-[#5C6B72]">
                      #{idx + 1}
                    </span>
                    <span className="font-display text-lg font-semibold text-[#16232B]">
                      {patient.name}
                    </span>
                    <span className="font-mono-data text-xs text-[#5C6B72]">
                      {patient.id} · Bed {patient.bed}
                    </span>
                    <PatientStatusBadge status={effectiveStatus} />
                  </div>

                  <p className="text-base sm:text-[15px] font-medium text-[#16232B] leading-snug">
                    {trend
                      ? trend.shortSummary
                      : patient.staticStatusReason ||
                        'Requires clinical observation'}
                  </p>

                  <p className="font-mono-data text-xs text-[#5C6B72]">
                    Last recorded: {lastRecordedTime} · AI flagged:{' '}
                    {flaggedTime}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:flex items-center gap-2.5 w-full sm:w-auto self-start">
                  <button
                    onClick={() => onSelectPatient(patient.id, 'timeline')}
                    className="min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-lg bg-[#EAF2F0] hover:bg-[#DCE9E6] text-[#1B3A4E] border border-[#C5DBD7] text-xs font-medium transition-colors text-center"
                  >
                    View Timeline
                  </button>
                  <button
                    onClick={() => onSelectPatient(patient.id, 'profile')}
                    className="min-h-[44px] sm:min-h-0 px-3.5 py-2 rounded-lg bg-[#1B3A4E] hover:bg-[#244B63] text-white text-xs font-medium transition-colors text-center"
                  >
                    Open Profile
                  </button>
                </div>
              </div>

              {/* Explainable Evidence Block — Never a bare alert without evidence */}
              {trend && (
                <div className="bg-[#EAF2F0] border border-[#C8DDD9] border-l-4 border-l-[#2F6F6B] rounded-lg p-3.5 sm:p-4 space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <AiDraftedBadge />
                    <span className="text-xs text-[#5C6B72] font-mono-data">
                      Flagged at {trend.flaggedAt}
                    </span>
                  </div>

                  <p className="text-sm sm:text-xs text-[#16232B]">
                    Automated trend detection identified a clinically
                    significant pattern. Human assessment recommended.
                  </p>

                  <div className="bg-[#DFECE9] border border-[#C3DBD7] rounded-lg p-3">
                    <div className="text-[10px] font-mono-data font-semibold uppercase tracking-wider text-[#5C6B72] mb-1">
                      EVIDENCE
                    </div>
                    <p className="text-sm sm:text-xs text-[#16232B] leading-relaxed">
                      {trend.evidenceText}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
