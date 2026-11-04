import React, { useState } from 'react';
import {
  UserPlus,
  UserMinus,
  ArrowRightLeft,
  AlertTriangle,
  Bed,
} from 'lucide-react';
import { Ward, CapacityLogEntry } from '../../types/carebridge';

interface HospitalCapacityViewProps {
  wards: Ward[];
  capacityLogs: CapacityLogEntry[];
  onAdmitPatient: (
    wardId: string,
    patientName: string,
    bedNumber?: number
  ) => void;
  onDischargePatient: (wardId: string, bedNumber: number) => void;
  onTransferPatient: (
    fromWardId: string,
    fromBedNumber: number,
    toWardId: string
  ) => void;
}

export const HospitalCapacityView: React.FC<HospitalCapacityViewProps> = ({
  wards,
  capacityLogs,
  onAdmitPatient,
  onDischargePatient,
  onTransferPatient,
}) => {
  const [selectedWardId, setSelectedWardId] = useState<string>(wards[0].id);
  const [admitName, setAdmitName] = useState('Daniel Mensah (PT-2894)');
  const [transferTargetWardId, setTransferTargetWardId] = useState<string>(
    wards[1]?.id || wards[0].id
  );
  const [actionBanner, setActionBanner] = useState<string | null>(null);

  const totalBeds = wards.reduce((acc, w) => acc + w.totalBeds, 0);
  const totalOccupied = wards.reduce((acc, w) => acc + w.occupiedBeds, 0);
  const totalAvailable = wards.reduce((acc, w) => acc + w.availableBeds, 0);
  const occupancyRate = Math.round((totalOccupied / totalBeds) * 100);

  const selectedWard =
    wards.find((w) => w.id === selectedWardId) || wards[0];

  const handleQuickAdmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitName.trim()) return;
    if (selectedWard.availableBeds <= 0) {
      setActionBanner(
        `Cannot admit to ${selectedWard.name}: 0 available beds (${selectedWard.occupiedBeds}/${selectedWard.totalBeds} occupied).`
      );
      return;
    }
    onAdmitPatient(selectedWard.id, admitName.trim());
    setActionBanner(
      `Admitted ${admitName.trim()} to ${selectedWard.name}. Live ward capacity updated.`
    );
    setAdmitName('Akosua Boateng (PT-2899)');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[#5C6B72] mb-1">
            St. Mary&apos;s General Hospital · Real-time ADT Capacity
          </p>
          <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
            Hospital Capacity &amp; Bed Management
          </h1>
        </div>

        <div className="grid grid-cols-2 sm:flex items-center gap-2.5 sm:gap-3">
          <div className="bg-white border border-[#D9DFE1] rounded-xl px-4 sm:px-5 py-3 text-center">
            <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#16232B]">
              {totalBeds}
            </div>
            <div className="text-xs text-[#5C6B72]">Total Beds</div>
          </div>

          <div className="bg-white border border-[#D9DFE1] rounded-xl px-4 sm:px-5 py-3 text-center">
            <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#1B3A4E]">
              {totalOccupied}
            </div>
            <div className="text-xs text-[#5C6B72]">Occupied</div>
          </div>

          <div className="bg-[#EAF2F0] border border-[#2F6F6B] rounded-xl px-4 sm:px-5 py-3 text-center">
            <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#2F6F6B]">
              {totalAvailable}
            </div>
            <div className="text-xs text-[#5C6B72]">Available Now</div>
          </div>

          <div
            className={`rounded-xl px-4 sm:px-5 py-3 text-center border ${
              occupancyRate >= 85
                ? 'bg-[#FDF5E6] border-[#E5C278]'
                : 'bg-white border-[#D9DFE1]'
            }`}
          >
            <div
              className={`font-mono-data text-xl sm:text-2xl font-semibold ${
                occupancyRate >= 85 ? 'text-[#C98A2E]' : 'text-[#4C8B67]'
              }`}
            >
              {occupancyRate}%
            </div>
            <div className="text-xs text-[#5C6B72]">Occupancy</div>
          </div>
        </div>
      </div>

      {/* Explainable Operational Capacity Alert (Always paired with evidence) */}
      {wards.some((w) => w.availableBeds === 0) && (
        <div className="bg-[#FDF5E6] border border-[#E5C278] border-l-4 border-l-[#C98A2E] rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#966217]">
            <AlertTriangle className="w-4 h-4 text-[#C98A2E] shrink-0" />
            <span>Critical Care Capacity Constraint Identified</span>
          </div>
          <p className="text-sm sm:text-xs text-[#16232B] leading-relaxed">
            <strong>Evidence:</strong> High-Dependency &amp; ICU is at 100%
            occupancy (6/6 beds occupied, 0 available) and lacks on-site
            Thoracic Surgery cover. Patients requiring pleural surgical
            intervention or HDU escalation (e.g. Marcus Osei, PT-2847) require
            inter-hospital referral.
          </p>
        </div>
      )}

      {actionBanner && (
        <div className="bg-[#EAF2F0] border border-[#2F6F6B] rounded-xl px-4 py-3 text-sm sm:text-xs text-[#1B3A4E] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>{actionBanner}</span>
          <button
            onClick={() => setActionBanner(null)}
            className="text-xs underline self-end sm:self-auto"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Ward Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {wards.map((ward) => {
          const isSelected = ward.id === selectedWard.id;
          const isFull = ward.availableBeds === 0;
          const pct = Math.round((ward.occupiedBeds / ward.totalBeds) * 100);

          return (
            <button
              key={ward.id}
              onClick={() => setSelectedWardId(ward.id)}
              className={`text-left rounded-xl p-4 sm:p-5 border transition-all ${
                isSelected
                  ? 'bg-white border-2 border-[#1B3A4E] shadow-sm'
                  : 'bg-white border-[#D9DFE1] hover:border-[#2F6F6B]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-mono-data text-[#5C6B72]">
                  {ward.floor}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-mono-data font-medium ${
                    isFull
                      ? 'bg-[#FCEEE9] text-[#B4432F]'
                      : 'bg-[#E6F2EB] text-[#35694B]'
                  }`}
                >
                  {ward.availableBeds} free
                </span>
              </div>

              <h2 className="font-display text-base font-semibold text-[#16232B]">
                {ward.name}
              </h2>
              <p className="text-xs text-[#5C6B72] mt-0.5 mb-4">
                {ward.specialty}
              </p>

              {/* Progress bar */}
              <div className="w-full h-2 bg-[#EEF1F2] rounded-full overflow-hidden mb-2.5">
                <div
                  className={`h-full transition-all duration-300 ${
                    isFull
                      ? 'bg-[#B4432F]'
                      : pct >= 80
                      ? 'bg-[#C98A2E]'
                      : 'bg-[#2F6F6B]'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-center justify-between font-mono-data text-xs">
                <span className="text-[#16232B] font-medium">
                  {ward.occupiedBeds} / {ward.totalBeds} occupied
                </span>
                <span className="text-[#5C6B72]">{pct}%</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Ward Bed Map & Live Admission / Discharge / Transfer Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Left 8 Cols: Interactive Bed Map */}
        <div className="lg:col-span-8 bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EEF1F2]">
            <div>
              <h2 className="font-display text-lg font-semibold text-[#16232B]">
                {selectedWard.name} — Live Bed Grid
              </h2>
              <p className="text-sm sm:text-xs text-[#5C6B72]">
                Tap any occupied bed to Discharge or Transfer, or tap an
                available bed to Admit immediately.
              </p>
            </div>
            <div className="flex items-center gap-2.5 sm:gap-3 font-mono-data text-xs">
              <span className="px-2.5 py-1 rounded bg-[#EEF1F2] text-[#16232B]">
                Occupied: {selectedWard.occupiedBeds}
              </span>
              <span className="px-2.5 py-1 rounded bg-[#E6F2EB] text-[#35694B]">
                Available: {selectedWard.availableBeds}
              </span>
            </div>
          </div>

          {/* Transfer target selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 bg-[#FAF8F5] border border-[#D9DFE1] rounded-lg px-3.5 sm:px-4 py-3 sm:py-2.5 text-xs">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#2F6F6B] shrink-0" />
              <span className="text-[#16232B] font-medium">
                Destination Ward for Internal Transfers:
              </span>
            </div>
            <select
              value={transferTargetWardId}
              onChange={(e) => setTransferTargetWardId(e.target.value)}
              className="min-h-[44px] sm:min-h-0 bg-white border border-[#D9DFE1] rounded-md px-3 sm:px-2.5 py-1.5 sm:py-1 text-base sm:text-xs font-medium text-[#16232B]"
            >
              {wards
                .filter((w) => w.id !== selectedWard.id)
                .map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.availableBeds} available)
                  </option>
                ))}
            </select>
          </div>

          {/* Bed Slots Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {selectedWard.beds.map((bed) => {
              const isOccupied = bed.status === 'Occupied';
              return (
                <div
                  key={bed.bedNumber}
                  className={`rounded-xl p-4 border flex flex-col justify-between min-h-[128px] ${
                    isOccupied
                      ? bed.acuity === 'Attention'
                        ? 'bg-[#FDF5E6] border-[#E5C278]'
                        : 'bg-[#FAF8F5] border-[#D9DFE1]'
                      : 'bg-[#F3F9F6] border-dashed border-[#8CC2A3]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono-data text-xs font-semibold text-[#16232B] inline-flex items-center gap-1.5">
                        <Bed className="w-3.5 h-3.5 text-[#2F6F6B]" />
                        Bed {bed.bedNumber}
                      </span>
                      <span
                        className={`text-[10px] font-mono-data px-2 py-0.5 rounded-full ${
                          isOccupied
                            ? 'bg-[#EEF1F2] text-[#5C6B72]'
                            : 'bg-[#E6F2EB] text-[#35694B] font-semibold'
                        }`}
                      >
                        {bed.status}
                      </span>
                    </div>

                    {isOccupied ? (
                      <div className="text-sm font-semibold text-[#16232B] break-words">
                        {bed.patientName || 'Assigned Patient'}
                      </div>
                    ) : (
                      <div className="text-xs text-[#4C8B67] mt-1">
                        Sanitized &amp; Ready for Admission
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-2 border-t border-black/5 flex items-center gap-2">
                    {isOccupied ? (
                      <>
                        <button
                          onClick={() => {
                            onDischargePatient(selectedWard.id, bed.bedNumber);
                            setActionBanner(
                              `Discharged ${bed.patientName} from ${selectedWard.name} Bed ${bed.bedNumber}. Available beds +1.`
                            );
                          }}
                          className="flex-1 min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-md bg-white border border-[#D9DFE1] hover:border-[#B4432F] hover:text-[#B4432F] text-xs sm:text-[11px] font-medium text-[#16232B] transition-colors"
                        >
                          <UserMinus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          Discharge
                        </button>
                        <button
                          onClick={() => {
                            const target = wards.find(
                              (w) => w.id === transferTargetWardId
                            );
                            if (!target || target.availableBeds <= 0) {
                              setActionBanner(
                                `Cannot transfer: Destination ward has 0 available beds.`
                              );
                              return;
                            }
                            onTransferPatient(
                              selectedWard.id,
                              bed.bedNumber,
                              transferTargetWardId
                            );
                            setActionBanner(
                              `Transferred ${bed.patientName} from ${selectedWard.name} to ${target.name}. Both wards updated live.`
                            );
                          }}
                          className="flex-1 min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1 px-2.5 py-2 sm:py-1.5 rounded-md bg-[#1B3A4E] hover:bg-[#254B63] text-white text-xs sm:text-[11px] font-medium transition-colors"
                        >
                          <ArrowRightLeft className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                          Transfer
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          const nameToAdmit =
                            admitName.trim() || 'Walk-in Admission';
                          onAdmitPatient(
                            selectedWard.id,
                            nameToAdmit,
                            bed.bedNumber
                          );
                          setActionBanner(
                            `Admitted ${nameToAdmit} into ${selectedWard.name} Bed ${bed.bedNumber}.`
                          );
                        }}
                        className="w-full min-h-[44px] sm:min-h-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-md bg-[#2F6F6B] hover:bg-[#255A56] text-white text-xs font-semibold transition-colors"
                      >
                        <UserPlus className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                        Admit to Bed {bed.bedNumber}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 4 Cols: Quick Admit Form & Live ADT Log */}
        <div className="lg:col-span-4 space-y-5">
          {/* Quick Admission Panel */}
          <form
            onSubmit={handleQuickAdmit}
            className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5 space-y-4"
          >
            <h3 className="font-display text-sm font-semibold text-[#16232B]">
              Direct Ward Admission
            </h3>
            <div>
              <label className="block text-sm sm:text-xs text-[#5C6B72] mb-1">
                Target Ward
              </label>
              <select
                value={selectedWard.id}
                onChange={(e) => setSelectedWardId(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-xs font-medium text-[#16232B]"
              >
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} ({w.availableBeds} available)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm sm:text-xs text-[#5C6B72] mb-1">
                Patient Name &amp; ID
              </label>
              <input
                type="text"
                value={admitName}
                onChange={(e) => setAdmitName(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#D9DFE1] text-base sm:text-xs text-[#16232B]"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[44px] py-2.5 px-4 rounded-lg bg-[#2F6F6B] hover:bg-[#255A56] text-white text-xs font-semibold transition-colors"
            >
              Admit Patient &amp; Update Capacity
            </button>
          </form>

          {/* Live Capacity Movement Feed */}
          <div className="bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-5 space-y-3.5">
            <h3 className="font-display text-sm font-semibold text-[#16232B]">
              Live Capacity &amp; ADT Feed
            </h3>
            <div className="divide-y divide-[#EEF1F2]">
              {capacityLogs.map((log) => (
                <div key={log.id} className="py-3 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <span className="text-xs font-semibold text-[#1B3A4E]">
                      {log.action} · {log.wardName}
                    </span>
                    <span className="font-mono-data text-[11px] text-[#5C6B72]">
                      {log.timestamp}
                    </span>
                  </div>
                  <div className="text-xs text-[#16232B]">
                    {log.patientName} (Bed {log.bedNumber})
                  </div>
                  <div className="text-[11px] text-[#5C6B72] font-mono-data">
                    {log.deltaDescription}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
