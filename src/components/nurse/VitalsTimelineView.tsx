import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Patient, ObservationPoint } from '../../types/carebridge';
import { evaluatePatientTrend } from '../../data/mockData';
import { AiDraftedBadge } from '../BrandElements';

interface VitalsTimelineViewProps {
  patient: Patient;
  allPatients: Patient[];
  onSwitchPatient: (patientId: string) => void;
  onAddManualObservation: (
    patientId: string,
    obs: Omit<ObservationPoint, 'id'>
  ) => void;
}

type MetricKey = 'spO2' | 'rr' | 'hr' | 'bpSystolic' | 'temp';

export const VitalsTimelineView: React.FC<VitalsTimelineViewProps> = ({
  patient,
  allPatients,
  onSwitchPatient,
  onAddManualObservation,
}) => {
  const [activeMetrics, setActiveMetrics] = useState<Record<MetricKey, boolean>>({
    spO2: true,
    rr: true,
    hr: false,
    bpSystolic: false,
    temp: false,
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSpO2, setNewSpO2] = useState('91');
  const [newRr, setNewRr] = useState('29');
  const [newHr, setNewHr] = useState('104');
  const [newBpSys, setNewBpSys] = useState('110');
  const [newBpDia, setNewBpDia] = useState('70');
  const [newTemp, setNewTemp] = useState('38.1');
  const [newO2Source, setNewO2Source] = useState('NRM 6L/min');
  const [newSpanHours, setNewSpanHours] = useState('4');

  const observations = patient.observations;
  const firstObs = observations[0];
  const latestObs = observations[observations.length - 1];
  const trend = evaluatePatientTrend(patient);

  const toggleMetric = (key: MetricKey) => {
    setActiveMetrics((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuickAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    const lastHours = latestObs ? latestObs.hoursFromStart : 0;
    const addedSpan = Math.max(1, Number(newSpanHours) || 4);
    const nowTime = '16:30';

    onAddManualObservation(patient.id, {
      timestamp: `2025-09-26 ${nowTime}`,
      timeLabel: nowTime,
      hoursFromStart: lastHours + addedSpan,
      spO2: Number(newSpO2) || 91,
      rr: Number(newRr) || 29,
      hr: Number(newHr) || 102,
      bpSystolic: Number(newBpSys) || 110,
      bpDiastolic: Number(newBpDia) || 70,
      temp: Number(newTemp) || 38.0,
      oxygenSource: newO2Source,
      recordedBy: 'Sister A. Kumi',
      verificationStatus: 'Clinician-verified',
    });
    setShowAddForm(false);
  };

  // Simulate the exact 4-hour 98% -> 91% SpO2, RR 20 -> 29 demo scenario on any patient
  const handleSimulateDemoDrop = () => {
    const lastHours = latestObs ? latestObs.hoursFromStart : 4;
    onAddManualObservation(patient.id, {
      timestamp: '2025-09-26 16:15',
      timeLabel: '16:15',
      hoursFromStart: lastHours + 4,
      spO2: 91,
      rr: 29,
      hr: 103,
      bpSystolic: 110,
      bpDiastolic: 70,
      temp: 38.1,
      oxygenSource: 'NRM 4L/min',
      mentalStatus: 'Anxious, tachypnoeic',
      reportedSymptom: 'Worsening pleuritic chest pain and shortness of breath',
      recordedBy: 'Sister A. Kumi',
      verificationStatus: 'Clinician-verified',
    });
  };

  // SVG Chart Geometry
  const chartWidth = 960;
  const chartHeight = 300;
  const padLeft = 48;
  const padRight = 28;
  const padTop = 28;
  const padBottom = 38;
  const plotW = chartWidth - padLeft - padRight;
  const plotH = chartHeight - padTop - padBottom;

  // Map value (0..140 scale or 0..105 scale) to Y coordinate
  const maxScale = activeMetrics.hr || activeMetrics.bpSystolic ? 140 : 105;
  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxScale, val));
    return padTop + plotH - (clamped / maxScale) * plotH;
  };

  const getX = (index: number) => {
    if (observations.length <= 1) return padLeft + plotW / 2;
    return padLeft + (index / (observations.length - 1)) * plotW;
  };

  // Threshold crossing index (where SpO2 <= 93 or RR >= 26)
  const thresholdStartIndex = observations.findIndex(
    (o) => o.spO2 <= 93 || o.rr >= 26
  );

  const spO2Delta = latestObs.spO2 - firstObs.spO2;
  const rrDelta = latestObs.rr - firstObs.rr;
  const hrDelta = latestObs.hr - firstObs.hr;
  const bpDelta = latestObs.bpSystolic - firstObs.bpSystolic;
  const tempDelta = +(latestObs.temp - firstObs.temp).toFixed(1);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-1">
            <span className="text-xs text-[#5C6B72]">
              {patient.name} · {patient.id} · Bed {patient.bed}
            </span>
            <select
              aria-label="Switch patient on timeline"
              value={patient.id}
              onChange={(e) => onSwitchPatient(e.target.value)}
              className="min-h-[40px] sm:min-h-0 text-base sm:text-xs font-mono-data bg-white border border-[#D9DFE1] rounded-md px-2.5 py-1 text-[#16232B]"
            >
              {allPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>
          <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
            Vitals Timeline
          </h1>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="min-h-[44px] sm:min-h-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#D9DFE1] hover:border-[#2F6F6B] text-xs font-medium text-[#16232B] transition-colors"
          >
            <Plus className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-[#2F6F6B]" />
            <span>Add Observation</span>
          </button>

          <div className="text-right font-mono-data text-xs text-[#5C6B72]">
            <div>
              {firstObs.timeLabel} – {latestObs.timeLabel}
            </div>
            <div>26 Sep 2025</div>
          </div>
        </div>
      </div>

      {/* Interactive Add Observation Drawer for Testing Dynamic Trend Detection */}
      {showAddForm && (
        <form
          onSubmit={handleQuickAddObservation}
          className="bg-white border border-[#2F6F6B] rounded-xl p-4 sm:p-5 space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h3 className="font-display text-sm font-semibold text-[#16232B]">
                Log New Observation Point ({patient.name})
              </h3>
              <p className="text-xs text-[#5C6B72]">
                Adding a new observation dynamically re-evaluates the sequence
                for SpO₂ / RR divergence and updates all views.
              </p>
            </div>
            <button
              type="button"
              onClick={handleSimulateDemoDrop}
              className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg bg-[#FDF3DF] border border-[#E5C278] text-[#966217] text-xs font-medium hover:bg-[#FBE8C2] text-left sm:text-center"
            >
              Quick Test: Simulate 4h Drop (SpO₂ → 91%, RR → 29/min)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
            <div>
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                SpO₂ (%)
              </label>
              <input
                type="number"
                value={newSpO2}
                onChange={(e) => setNewSpO2(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] font-mono-data text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                Resp Rate (/min)
              </label>
              <input
                type="number"
                value={newRr}
                onChange={(e) => setNewRr(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] font-mono-data text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={newHr}
                onChange={(e) => setNewHr(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] font-mono-data text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                BP Systolic
              </label>
              <input
                type="number"
                value={newBpSys}
                onChange={(e) => setNewBpSys(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] font-mono-data text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                Time Span (+Hours)
              </label>
              <input
                type="number"
                value={newSpanHours}
                onChange={(e) => setNewSpanHours(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] font-mono-data text-base sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                O₂ Source
              </label>
              <input
                type="text"
                value={newO2Source}
                onChange={(e) => setNewO2Source(e.target.value)}
                className="w-full min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] font-mono-data text-base sm:text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="min-h-[44px] sm:min-h-0 px-3.5 py-2 sm:py-1.5 rounded-lg border border-[#D9DFE1] text-xs font-medium text-[#5C6B72]"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="min-h-[44px] sm:min-h-0 px-4 py-2 sm:py-1.5 rounded-lg bg-[#2F6F6B] text-white text-xs font-semibold"
            >
              Save Observation &amp; Re-evaluate Trend
            </button>
          </div>
        </form>
      )}

      {/* Desktop Explainable AI Trend Banner (>= 768px: shown above chart matching Screenshot 233722) */}
      {trend && (
        <div className="hidden md:block bg-[#EAF2F0] border border-[#C8DDD9] rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <AiDraftedBadge />
            <span className="text-xs text-[#5C6B72] font-mono-data">
              Trend detection · {trend.flaggedAt}
            </span>
          </div>

          <p className="text-[15px] font-medium text-[#16232B]">
            {trend.timelineHeadline}
          </p>

          <div className="bg-[#DFECE9] border border-[#C3DBD7] rounded-lg p-3.5">
            <div className="text-[10px] font-mono-data font-semibold uppercase tracking-wider text-[#5C6B72] mb-1">
              EVIDENCE
            </div>
            <p className="text-xs text-[#16232B] leading-relaxed">
              {trend.evidenceText}
            </p>
          </div>
        </div>
      )}

      {/* 5 Vitals Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-3.5">
        {/* SPO2 */}
        <div
          className={`rounded-xl p-3.5 sm:p-4 border ${
            latestObs.spO2 <= 93
              ? 'bg-[#FCEEE9] border-[#F2C6B8]'
              : 'bg-white border-[#D9DFE1]'
          }`}
        >
          <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
            SPO₂
          </div>
          <div
            className={`font-mono-data text-xl sm:text-2xl font-semibold mt-1 ${
              latestObs.spO2 <= 93 ? 'text-[#B4432F]' : 'text-[#16232B]'
            }`}
          >
            {latestObs.spO2}%
          </div>
          <div
            className={`font-mono-data text-[11px] mt-1.5 ${
              spO2Delta < 0 ? 'text-[#B4432F]' : 'text-[#5C6B72]'
            }`}
          >
            {spO2Delta <= 0 ? '↓' : '↑'} from {firstObs.spO2}%
          </div>
        </div>

        {/* RESP RATE */}
        <div
          className={`rounded-xl p-3.5 sm:p-4 border ${
            latestObs.rr >= 25
              ? 'bg-[#FCEEE9] border-[#F2C6B8]'
              : 'bg-white border-[#D9DFE1]'
          }`}
        >
          <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
            RESP RATE
          </div>
          <div
            className={`font-mono-data text-xl sm:text-2xl font-semibold mt-1 ${
              latestObs.rr >= 25 ? 'text-[#B4432F]' : 'text-[#16232B]'
            }`}
          >
            {latestObs.rr}/min
          </div>
          <div
            className={`font-mono-data text-[11px] mt-1.5 ${
              rrDelta > 0 && latestObs.rr >= 25
                ? 'text-[#B4432F]'
                : 'text-[#5C6B72]'
            }`}
          >
            {rrDelta >= 0 ? '↑' : '↓'} from {firstObs.rr}/min
          </div>
        </div>

        {/* HEART RATE */}
        <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5 sm:p-4">
          <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
            HEART RATE
          </div>
          <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#16232B] mt-1">
            {latestObs.hr} bpm
          </div>
          <div className="font-mono-data text-[11px] text-[#5C6B72] mt-1.5">
            {hrDelta >= 0 ? '↑' : '↓'} from {firstObs.hr} bpm
          </div>
        </div>

        {/* BP SYSTOLIC */}
        <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5 sm:p-4">
          <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
            BP SYSTOLIC
          </div>
          <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#16232B] mt-1">
            {latestObs.bpSystolic} mmHg
          </div>
          <div className="font-mono-data text-[11px] text-[#5C6B72] mt-1.5">
            {bpDelta <= 0 ? '↓' : '↑'} from {firstObs.bpSystolic} mmHg
          </div>
        </div>

        {/* TEMPERATURE */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-[#D9DFE1] rounded-xl p-3.5 sm:p-4">
          <div className="text-[10px] font-mono-data uppercase text-[#5C6B72]">
            TEMPERATURE
          </div>
          <div className="font-mono-data text-xl sm:text-2xl font-semibold text-[#16232B] mt-1">
            {latestObs.temp.toFixed(1)}°C
          </div>
          <div className="font-mono-data text-[11px] text-[#5C6B72] mt-1.5">
            {tempDelta >= 0 ? '↑' : '↓'} from {firstObs.temp.toFixed(1)}°C
          </div>
        </div>
      </div>

      {/* Interactive Metric Filter Toggles */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => toggleMetric('spO2')}
          className={`min-h-[40px] sm:min-h-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeMetrics.spO2
              ? 'bg-[#E3EFEA] border-[#2F6F6B] text-[#16232B]'
              : 'bg-white border-[#D9DFE1] text-[#5C6B72]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              activeMetrics.spO2 ? 'bg-[#2F6F6B]' : 'bg-[#BDC7CC]'
            }`}
          />
          SpO₂ (%)
        </button>

        <button
          onClick={() => toggleMetric('rr')}
          className={`min-h-[40px] sm:min-h-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeMetrics.rr
              ? 'bg-[#E5EFF6] border-[#3F6E8C] text-[#16232B]'
              : 'bg-white border-[#D9DFE1] text-[#5C6B72]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              activeMetrics.rr ? 'bg-[#3F6E8C]' : 'bg-[#BDC7CC]'
            }`}
          />
          Resp Rate (/min)
        </button>

        <button
          onClick={() => toggleMetric('hr')}
          className={`min-h-[40px] sm:min-h-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeMetrics.hr
              ? 'bg-[#FDF3DF] border-[#C98A2E] text-[#16232B]'
              : 'bg-white border-[#D9DFE1] text-[#5C6B72]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              activeMetrics.hr ? 'bg-[#C98A2E]' : 'bg-[#BDC7CC]'
            }`}
          />
          Heart Rate (bpm)
        </button>

        <button
          onClick={() => toggleMetric('bpSystolic')}
          className={`min-h-[40px] sm:min-h-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeMetrics.bpSystolic
              ? 'bg-[#EEF1F2] border-[#1B3A4E] text-[#16232B]'
              : 'bg-white border-[#D9DFE1] text-[#5C6B72]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              activeMetrics.bpSystolic ? 'bg-[#1B3A4E]' : 'bg-[#BDC7CC]'
            }`}
          />
          BP Systolic (mmHg)
        </button>

        <button
          onClick={() => toggleMetric('temp')}
          className={`min-h-[40px] sm:min-h-0 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            activeMetrics.temp
              ? 'bg-[#FCEFE8] border-[#D97D4A] text-[#16232B]'
              : 'bg-white border-[#D9DFE1] text-[#5C6B72]'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              activeMetrics.temp ? 'bg-[#D97D4A]' : 'bg-[#BDC7CC]'
            }`}
          />
          Temperature (°C)
        </button>
      </div>

      {/* SVG Trend Chart Card matching Screenshot 233722 (Responsive container + >=12px axis labels) */}
      <div className="bg-white border border-[#D9DFE1] rounded-xl p-3 sm:p-6">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto min-h-[210px] sm:min-h-[260px] overflow-visible"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Shaded Threshold Crossing Zone after 14:00 */}
          {thresholdStartIndex >= 0 && (
            <rect
              x={getX(thresholdStartIndex)}
              y={padTop}
              width={Math.max(0, getX(observations.length - 1) - getX(thresholdStartIndex))}
              height={plotH}
              fill="#FCEEE9"
              opacity="0.75"
            />
          )}

          {/* Horizontal Y-Axis Grid Lines */}
          {[100, 75, 50, 25].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={chartWidth - padRight}
                  y2={y}
                  stroke="#EEF1F2"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                <text
                  x={padLeft - 10}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#5C6B72] text-[14px] sm:text-[12px] font-mono-data"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* SpO2 Threshold Reference Line (94%) */}
          {activeMetrics.spO2 && (
            <line
              x1={padLeft}
              y1={getY(94)}
              x2={chartWidth - padRight}
              y2={getY(94)}
              stroke="#B8C7CE"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* RR Threshold Reference Line (24/min) */}
          {activeMetrics.rr && (
            <line
              x1={padLeft}
              y1={getY(24)}
              x2={chartWidth - padRight}
              y2={getY(24)}
              stroke="#B8C7CE"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          )}

          {/* X-Axis Timestamps (legible >=12px) */}
          {observations.map((obs, i) => (
            <text
              key={obs.id}
              x={getX(i)}
              y={chartHeight - 8}
              textAnchor="middle"
              className="fill-[#5C6B72] text-[14px] sm:text-[12px] font-mono-data"
            >
              {obs.timeLabel}
            </text>
          ))}

          {/* SpO2 Line & Points */}
          {activeMetrics.spO2 && (
            <g>
              <polyline
                fill="none"
                stroke="#2F6F6B"
                strokeWidth="2.5"
                points={observations
                  .map((o, i) => `${getX(i)},${getY(o.spO2)}`)
                  .join(' ')}
              />
              {observations.map((o, i) => {
                const isThreshold = o.spO2 <= 93;
                return (
                  <circle
                    key={`spo2-${o.id}`}
                    cx={getX(i)}
                    cy={getY(o.spO2)}
                    r={isThreshold ? 4.8 : 3.6}
                    fill={isThreshold ? '#B4432F' : '#2F6F6B'}
                  >
                    <title>
                      {o.timeLabel}: SpO₂ {o.spO2}%
                    </title>
                  </circle>
                );
              })}
            </g>
          )}

          {/* Respiratory Rate Line & Points */}
          {activeMetrics.rr && (
            <g>
              <polyline
                fill="none"
                stroke="#3F6E8C"
                strokeWidth="2.5"
                points={observations
                  .map((o, i) => `${getX(i)},${getY(o.rr)}`)
                  .join(' ')}
              />
              {observations.map((o, i) => {
                const isThreshold = o.rr >= 26;
                return (
                  <circle
                    key={`rr-${o.id}`}
                    cx={getX(i)}
                    cy={getY(o.rr)}
                    r={isThreshold ? 4.8 : 3.6}
                    fill={isThreshold ? '#B4432F' : '#3F6E8C'}
                  >
                    <title>
                      {o.timeLabel}: RR {o.rr}/min
                    </title>
                  </circle>
                );
              })}
            </g>
          )}

          {/* Heart Rate Line & Points */}
          {activeMetrics.hr && (
            <g>
              <polyline
                fill="none"
                stroke="#C98A2E"
                strokeWidth="2"
                points={observations
                  .map((o, i) => `${getX(i)},${getY(o.hr)}`)
                  .join(' ')}
              />
              {observations.map((o, i) => (
                <circle
                  key={`hr-${o.id}`}
                  cx={getX(i)}
                  cy={getY(o.hr)}
                  r={3.5}
                  fill="#C98A2E"
                />
              ))}
            </g>
          )}

          {/* BP Systolic Line & Points */}
          {activeMetrics.bpSystolic && (
            <g>
              <polyline
                fill="none"
                stroke="#1B3A4E"
                strokeWidth="2"
                points={observations
                  .map((o, i) => `${getX(i)},${getY(o.bpSystolic)}`)
                  .join(' ')}
              />
              {observations.map((o, i) => (
                <circle
                  key={`bp-${o.id}`}
                  cx={getX(i)}
                  cy={getY(o.bpSystolic)}
                  r={3.5}
                  fill="#1B3A4E"
                />
              ))}
            </g>
          )}

          {/* Temperature Line & Points */}
          {activeMetrics.temp && (
            <g>
              <polyline
                fill="none"
                stroke="#D97D4A"
                strokeWidth="2"
                points={observations
                  .map((o, i) => `${getX(i)},${getY(o.temp)}`)
                  .join(' ')}
              />
              {observations.map((o, i) => (
                <circle
                  key={`temp-${o.id}`}
                  cx={getX(i)}
                  cy={getY(o.temp)}
                  r={3.5}
                  fill="#D97D4A"
                />
              ))}
            </g>
          )}
        </svg>
      </div>

      {/* Mobile Explainable AI Trend Banner (< 768px: shown BELOW the chart per Step 2 rules) */}
      {trend && (
        <div className="md:hidden bg-[#EAF2F0] border border-[#C8DDD9] border-l-4 border-l-[#2F6F6B] rounded-xl p-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <AiDraftedBadge />
            <span className="text-xs text-[#5C6B72] font-mono-data">
              Trend detection · {trend.flaggedAt}
            </span>
          </div>

          <p className="text-base font-medium text-[#16232B] leading-snug">
            {trend.timelineHeadline}
          </p>

          <div className="bg-[#DFECE9] border border-[#C3DBD7] rounded-lg p-3.5">
            <div className="text-[10px] font-mono-data font-semibold uppercase tracking-wider text-[#5C6B72] mb-1">
              EVIDENCE
            </div>
            <p className="text-sm text-[#16232B] leading-relaxed">
              {trend.evidenceText}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
