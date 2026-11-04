import React from 'react';
import {
  Patient,
  TaskItem,
  NurseNavTab,
  Referral,
} from '../../types/carebridge';
import { evaluatePatientTrend } from '../../data/mockData';
import {
  AiDraftedBadge,
  PatientStatusBadge,
  ReferralStatusBadge,
} from '../BrandElements';

interface NurseDashboardViewProps {
  patients: Patient[];
  tasks: TaskItem[];
  referrals: Referral[];
  onSelectPatient: (patientId: string, targetTab: NurseNavTab) => void;
  onToggleTaskStatus: (taskId: string) => void;
  onNavigate: (tab: NurseNavTab) => void;
}

export const NurseDashboardView: React.FC<NurseDashboardViewProps> = ({
  patients,
  tasks,
  referrals,
  onSelectPatient,
  onToggleTaskStatus,
  onNavigate,
}) => {
  // Evaluate live trend alerts across all assigned patients
  const patientTrends = patients.map((p) => ({
    patient: p,
    trend: evaluatePatientTrend(p),
  }));

  const attentionPatients = patientTrends.filter(
    (pt) => pt.trend?.severity === 'Attention' || pt.patient.status === 'Attention'
  );

  const primaryAlert =
    attentionPatients.find((pt) => pt.trend !== null)?.trend || null;
  const primaryAlertPatient =
    attentionPatients.find((pt) => pt.trend !== null)?.patient || patients[0];

  const pendingTaskCount = tasks.filter((t) => t.status !== 'Completed').length;

  // Check if there are pending document requests from a receiving hospital
  const pendingDocRequests = referrals.flatMap((r) =>
    r.documentRequests
      .filter((d) => d.status === 'Requested')
      .map((d) => ({ referral: r, doc: d }))
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6">
      {/* Top Header & Stat Cards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm text-[#5C6B72] mb-1">
            Good afternoon, Sister Kumi
          </p>
          <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
            Shift Overview
          </h1>
        </div>

        <div className="grid grid-cols-3 sm:flex items-center gap-2.5 sm:gap-3.5">
          <div className="bg-white border border-[#D9DFE1] rounded-xl px-3 sm:px-6 py-3 sm:py-3.5 sm:min-w-[118px] text-center">
            <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#16232B]">
              {patients.length}
            </div>
            <div className="text-[11px] sm:text-xs text-[#5C6B72] mt-0.5">
              Patients
            </div>
          </div>

          <button
            onClick={() => onNavigate('attention')}
            className="bg-[#FDF5E6] border border-[#E5C278] rounded-xl px-3 sm:px-6 py-3 sm:py-3.5 sm:min-w-[130px] text-center hover:bg-[#FBF0D9] transition-colors"
          >
            <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#C98A2E]">
              {attentionPatients.length}
            </div>
            <div className="text-[11px] sm:text-xs text-[#5C6B72] mt-0.5">
              Need Attention
            </div>
          </button>

          <div className="bg-white border border-[#D9DFE1] rounded-xl px-3 sm:px-6 py-3 sm:py-3.5 sm:min-w-[130px] text-center">
            <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#16232B]">
              {pendingTaskCount}
            </div>
            <div className="text-[11px] sm:text-xs text-[#5C6B72] mt-0.5">
              Pending Tasks
            </div>
          </div>
        </div>
      </div>

      {/* Explainable Automated Trend Detection Banner */}
      {primaryAlert && (
        <div className="bg-[#EAF2F0] border border-[#C8DDD9] border-l-4 border-l-[#2F6F6B] rounded-xl p-4 sm:p-5 space-y-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <AiDraftedBadge />
            <span className="text-xs text-[#5C6B72] font-mono-data">
              Automated trend detection · {primaryAlertPatient.id}
            </span>
          </div>

          <p className="text-base sm:text-[15px] font-medium text-[#16232B] leading-snug">
            {primaryAlert.dashboardHeadline}
          </p>

          <div>
            <button
              onClick={() =>
                onSelectPatient(primaryAlertPatient.id, 'timeline')
              }
              className="min-h-[44px] sm:min-h-0 px-4 sm:px-3.5 py-2 sm:py-1.5 rounded-lg border border-[#2F6F6B] text-[#2F6F6B] hover:bg-[#2F6F6B] hover:text-white text-xs font-medium transition-colors"
            >
              View Vitals Timeline →
            </button>
          </div>

          <div className="bg-[#DFECE9] border border-[#C3DBD7] rounded-lg p-3.5">
            <div className="text-[10px] font-mono-data font-semibold uppercase tracking-wider text-[#5C6B72] mb-1">
              EVIDENCE
            </div>
            <p className="text-sm sm:text-xs text-[#16232B] leading-relaxed">
              {primaryAlert.evidenceText}
            </p>
          </div>
        </div>
      )}

      {/* Active Referral / Receiving Hospital Document Request Coordination Banner (if any) */}
      {(pendingDocRequests.length > 0 ||
        referrals.some((r) => r.status !== 'Draft')) && (
        <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-[#1B3A4E] uppercase tracking-wider">
                Inter-Hospital Coordination
              </span>
              {referrals[0] && (
                <ReferralStatusBadge status={referrals[0].status} />
              )}
            </div>
            <p className="text-sm sm:text-xs text-[#5C6B72]">
              {pendingDocRequests.length > 0
                ? `${pendingDocRequests.length} clinical document request(s) from ${referrals[0]?.receivingFacilityName} awaiting your approval.`
                : `Referral for ${referrals[0]?.patientName} to ${referrals[0]?.receivingFacilityName} is currently ${referrals[0]?.status}.`}
            </p>
          </div>
          <button
            onClick={() => onNavigate('referral')}
            className="min-h-[44px] sm:min-h-0 px-4 sm:px-3.5 py-2 rounded-lg bg-[#1B3A4E] text-white text-xs font-medium hover:bg-[#244B63] whitespace-nowrap self-stretch sm:self-center text-center"
          >
            {pendingDocRequests.length > 0
              ? 'Review Document Requests'
              : 'Open Referral Record'}
          </button>
        </div>
      )}

      {/* Main Two-Column Grid: Assigned Patients & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Columns: Assigned Patients */}
        <div className="lg:col-span-2 bg-white border border-[#D9DFE1] rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between border-b border-[#EEF1F2]">
            <h2 className="font-display text-base font-semibold text-[#16232B]">
              Assigned Patients
            </h2>
            <span className="font-mono-data text-xs text-[#5C6B72]">
              Medical Ward B
            </span>
          </div>

          {/* Mobile Stacked Patient Cards (< 768px) — Never sideways scroll on a phone */}
          <div className="md:hidden divide-y divide-[#EEF1F2]">
            {patientTrends.map(({ patient, trend }) => {
              const computedStatus = trend ? trend.severity : patient.status;
              const reasonText = trend
                ? trend.shortSummary
                : patient.staticStatusReason || '—';

              return (
                <div key={patient.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-base text-[#16232B]">
                        {patient.name}
                      </div>
                      <div className="font-mono-data text-xs text-[#5C6B72] mt-0.5">
                        {patient.id} · {patient.shortAgeSex} · Bed {patient.bed}
                      </div>
                    </div>
                    <PatientStatusBadge status={computedStatus} />
                  </div>

                  <p
                    className={`text-sm leading-relaxed ${
                      computedStatus === 'Attention'
                        ? 'text-[#9A5B13] font-medium'
                        : computedStatus === 'Monitoring'
                        ? 'text-[#9A5B13]'
                        : 'text-[#5C6B72]'
                    }`}
                  >
                    {reasonText}
                  </p>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => onSelectPatient(patient.id, 'profile')}
                      className="min-h-[44px] px-3 py-2 rounded-lg bg-[#EEF1F2] hover:bg-[#E0E6E8] text-xs font-semibold text-[#16232B] transition-colors"
                    >
                      Open Profile
                    </button>
                    <button
                      onClick={() => onSelectPatient(patient.id, 'timeline')}
                      className="min-h-[44px] px-3 py-2 rounded-lg bg-[#EAF2F0] hover:bg-[#DCE9E6] text-xs font-semibold text-[#1B3A4E] border border-[#C5DBD7] transition-colors"
                    >
                      Vitals Timeline
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tablet / Desktop Table (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#EEF1F2] bg-[#FAF8F5]/60 text-[11px] font-mono-data uppercase text-[#5C6B72]">
                  <th className="py-3 px-6 font-medium">PATIENT</th>
                  <th className="py-3 px-3 font-medium">BED</th>
                  <th className="py-3 px-4 font-medium">STATUS</th>
                  <th className="py-3 px-4 font-medium">
                    REASON / LAST OBSERVATION
                  </th>
                  <th className="py-3 px-6 font-medium text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF1F2] text-sm">
                {patientTrends.map(({ patient, trend }) => {
                  const computedStatus = trend
                    ? trend.severity
                    : patient.status;
                  const reasonText = trend
                    ? trend.shortSummary
                    : patient.staticStatusReason || '—';

                  return (
                    <tr
                      key={patient.id}
                      className="hover:bg-[#FAF8F5]/80 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-semibold text-[#16232B]">
                          {patient.name}
                        </div>
                        <div className="font-mono-data text-xs text-[#5C6B72] mt-0.5">
                          {patient.id} · {patient.shortAgeSex}
                        </div>
                      </td>

                      <td className="py-4 px-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#EEF1F2] font-mono-data text-xs font-medium text-[#16232B]">
                          {patient.bed}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <PatientStatusBadge status={computedStatus} />
                      </td>

                      <td className="py-4 px-4 max-w-[230px]">
                        <span
                          className={`text-xs leading-relaxed block ${
                            computedStatus === 'Attention'
                              ? 'text-[#9A5B13] font-medium'
                              : computedStatus === 'Monitoring'
                              ? 'text-[#9A5B13]'
                              : 'text-[#5C6B72]'
                          }`}
                        >
                          {reasonText}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() =>
                              onSelectPatient(patient.id, 'profile')
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#EEF1F2] hover:bg-[#E0E6E8] text-xs font-medium text-[#16232B] transition-colors"
                          >
                            Profile
                          </button>
                          <button
                            onClick={() =>
                              onSelectPatient(patient.id, 'timeline')
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#EEF1F2] hover:bg-[#E0E6E8] text-xs font-medium text-[#16232B] transition-colors"
                          >
                            Timeline
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Pending Tasks */}
        <div className="bg-white border border-[#D9DFE1] rounded-xl overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#EEF1F2] flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-[#16232B]">
              Pending Tasks
            </h2>
            <span className="text-[11px] text-[#5C6B72]">Tap to update</span>
          </div>

          <div className="divide-y divide-[#EEF1F2]">
            {tasks.map((task) => {
              const isCompleted = task.status === 'Completed';
              const isInProgress = task.status === 'In Progress';

              return (
                <div
                  key={task.id}
                  onClick={() => onToggleTaskStatus(task.id)}
                  className="px-4 sm:px-6 py-4 min-h-[60px] flex items-center justify-between gap-3 hover:bg-[#FAF8F5] cursor-pointer transition-colors"
                >
                  <div>
                    <div
                      className={`text-sm font-medium ${
                        isCompleted
                          ? 'line-through text-[#8C9A9E]'
                          : 'text-[#16232B]'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="font-mono-data text-xs text-[#5C6B72] mt-1">
                      {task.dueTime} · {task.patientName} ({task.patientId})
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap ${
                      isCompleted
                        ? 'bg-[#E6F2EB] text-[#4C8B67]'
                        : isInProgress
                        ? 'bg-[#FDF3DF] text-[#966217]'
                        : 'bg-[#EEF1F2] text-[#5C6B72]'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
