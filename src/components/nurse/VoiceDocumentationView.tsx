import React, { useState, useEffect, useRef } from 'react';
import { User, Mic, Info, Check, AlertTriangle, Sparkles } from 'lucide-react';
import {
  Patient,
  NurseNavTab,
  ObservationPoint,
  ClinicalNote,
} from '../../types/carebridge';
import { AiDraftedBadge } from '../BrandElements';

interface VoiceDocumentationViewProps {
  patient: Patient;
  allPatients: Patient[];
  onSwitchPatient: (patientId: string) => void;
  onApproveVoiceObservation: (
    patientId: string,
    obs: Omit<ObservationPoint, 'id'>,
    note: Omit<ClinicalNote, 'id'>
  ) => void;
  onSaveAiNoteDraftOnly: (
    patientId: string,
    note: Omit<ClinicalNote, 'id'>
  ) => void;
  onNavigate: (tab: NurseNavTab) => void;
}

type VoiceStep = 'ready' | 'recording' | 'review' | 'saved';

const DEFAULT_DEMO_TRANSCRIPT =
  'Temperature 37.8, pulse 98, respiratory rate 26, oxygen sat 93 on 4 liters via non-rebreather mask. Patient appears anxious, complaining of increased chest pain, especially on inspiration. Onset approximately 30 minutes ago. Breath sounds reduced on the right side. Patient is alert and oriented, responding to questions appropriately.';

const DETERIORATION_4H_TRANSCRIPT =
  'Temperature 38.1, pulse 103, respiratory rate 29, oxygen sat 91 on 4 liters via non-rebreather mask. Patient is increasingly tachypnoeic and anxious, reporting sharp right-sided pleuritic chest pain over the past 4 hours. Alert and oriented.';

export const VoiceDocumentationView: React.FC<VoiceDocumentationViewProps> = ({
  patient,
  allPatients,
  onSwitchPatient,
  onApproveVoiceObservation,
  onSaveAiNoteDraftOnly,
  onNavigate,
}) => {
  const [step, setStep] = useState<VoiceStep>('ready');
  const [seconds, setSeconds] = useState(2);
  const [transcript, setTranscript] = useState(DEFAULT_DEMO_TRANSCRIPT);
  const [isExtracting, setIsExtracting] = useState(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [isEditingFields, setIsEditingFields] = useState(false);
  const [draftSavedBanner, setDraftSavedBanner] = useState(false);

  // Structured editable fields
  const [temperature, setTemperature] = useState('37.8°C');
  const [pulse, setPulse] = useState('98 bpm');
  const [respiratoryRate, setRespiratoryRate] = useState('26 /min');
  const [spO2, setSpO2] = useState('93%');
  const [oxygenSource, setOxygenSource] = useState('NRM 4L/min');
  const [mentalStatus, setMentalStatus] = useState('Anxious, alert & oriented');
  const [reportedSymptom, setReportedSymptom] = useState(
    'Increased chest pain, worse on inspiration'
  );
  const [onset, setOnset] = useState('~30 minutes ago');

  const recognitionRef = useRef<any>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let timer: any;
    if (step === 'recording') {
      timer = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60)
      .toString()
      .padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // Fallback local parser if API is unreachable, paired with explicit fallback notice if triggered by error
  const parseTranscriptLocally = (text: string) => {
    const tempMatch = text.match(/temperature\s+(\d+(?:\.\d+)?)/i);
    const pulseMatch = text.match(/(?:pulse|heart rate)\s+(\d+)/i);
    const rrMatch = text.match(/respiratory rate\s+(\d+)/i);
    const spo2Match = text.match(/(?:oxygen sat|spo2)\s+(\d+)/i);

    setTemperature(tempMatch ? `${tempMatch[1]}°C` : '37.8°C');
    setPulse(pulseMatch ? `${pulseMatch[1]} bpm` : '98 bpm');
    setRespiratoryRate(rrMatch ? `${rrMatch[1]} /min` : '26 /min');
    setSpO2(spo2Match ? `${spo2Match[1]}%` : '93%');

    if (/non-rebreather/i.test(text)) {
      const liters = text.match(/(\d+)\s*liters/i);
      setOxygenSource(`NRM ${liters ? liters[1] : '4'}L/min`);
    } else if (/room air/i.test(text)) {
      setOxygenSource('Room air');
    }

    if (/anxious/i.test(text) && /alert/i.test(text)) {
      setMentalStatus('Anxious, alert & oriented');
    }
    if (/chest pain/i.test(text)) {
      setReportedSymptom('Increased chest pain, worse on inspiration');
    }
    const onsetMatch = text.match(/onset\s+(?:approximately\s+)?([^.]+)/i);
    if (onsetMatch) {
      setOnset(`~${onsetMatch[1].trim()}`);
    }
  };

  const runGeminiExtraction = async (inputTranscript: string) => {
    setIsExtracting(true);
    setFallbackNotice(null);

    try {
      const response = await fetch('/api/extract-voice-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: inputTranscript, mode: 'nurse' }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(
          errData.error || 'Voice processing unavailable — enter manually'
        );
      }

      const data = await response.json();
      const s = data.structured;
      if (s) {
        setTemperature(s.temperature || '37.8°C');
        setPulse(s.pulse || '98 bpm');
        setRespiratoryRate(s.respiratoryRate || '26 /min');
        setSpO2(s.spO2 || '93%');
        setOxygenSource(s.oxygenSource || 'NRM 4L/min');
        setMentalStatus(s.mentalStatus || 'Anxious, alert & oriented');
        setReportedSymptom(
          s.reportedSymptom || 'Increased chest pain, worse on inspiration'
        );
        setOnset(s.onset || '~30 minutes ago');
      }
    } catch (err: any) {
      // Non-negotiable guardrail: never block workflow; show fallback message and allow manual entry
      parseTranscriptLocally(inputTranscript);
      setFallbackNotice('Voice processing unavailable — enter manually');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleStartRecording = () => {
    setSeconds(1);
    setFallbackNotice(null);
    setStep('recording');

    // Attempt Web Speech API if browser supports it
    const SpeechRec =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (SpeechRec) {
      try {
        const rec = new SpeechRec();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = 'en-US';
        rec.onresult = (event: any) => {
          let combined = '';
          for (let i = 0; i < event.results.length; i++) {
            combined += event.results[i][0].transcript + ' ';
          }
          if (combined.trim()) {
            setTranscript(combined.trim());
          }
        };
        rec.start();
        recognitionRef.current = rec;
      } catch {
        // Ignore mic permission errors in iframe and continue recording state seamlessly
      }
    }
  };

  const handleStopRecording = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setStep('review');
    await runGeminiExtraction(transcript);
  };

  const handleTriggerManualFallbackMode = () => {
    setFallbackNotice('Voice processing unavailable — enter manually');
    setIsEditingFields(true);
    setStep('review');
  };

  const handleApproveAndSave = () => {
    const numericTemp = parseFloat(temperature.replace(/[^\d.]/g, '')) || 37.8;
    const numericPulse = parseInt(pulse.replace(/[^\d]/g, ''), 10) || 98;
    const numericRr = parseInt(respiratoryRate.replace(/[^\d]/g, ''), 10) || 26;
    const numericSpO2 = parseInt(spO2.replace(/[^\d]/g, ''), 10) || 93;

    const latestObs = patient.observations[patient.observations.length - 1];
    const nextHours = latestObs ? latestObs.hoursFromStart + 4 : 4;

    onApproveVoiceObservation(
      patient.id,
      {
        timestamp: '2025-09-26 16:05',
        timeLabel: '16:05',
        hoursFromStart: nextHours,
        spO2: numericSpO2,
        rr: numericRr,
        hr: numericPulse,
        bpSystolic: 113,
        bpDiastolic: 72,
        temp: numericTemp,
        oxygenSource: oxygenSource || 'NRM 4L/min',
        mentalStatus,
        reportedSymptom,
        onset,
        recordedBy: 'Sister A. Kumi',
        verificationStatus: 'Clinician-verified',
        isVoiceStructured: true,
        originalTranscript: transcript,
      },
      {
        patientId: patient.id,
        timestamp: '2025-09-26 16:05',
        author: 'Sister A. Kumi',
        reviewStatus: 'Approved Clinical Note',
        transcript,
        structuredFields: {
          temperature,
          pulse,
          respiratoryRate,
          spO2,
          bp: '113/72',
          oxygenSource,
          mentalStatus,
          reportedSymptom,
          onset,
        },
        approvedAt: '2025-09-26 16:05',
        approvedBy: 'Sister A. Kumi',
      }
    );

    setStep('saved');
  };

  const handleSaveAsAiDraft = () => {
    onSaveAiNoteDraftOnly(patient.id, {
      patientId: patient.id,
      timestamp: '2025-09-26 16:04',
      author: 'Sister A. Kumi',
      reviewStatus: 'AI Note Draft',
      transcript,
      structuredFields: {
        temperature,
        pulse,
        respiratoryRate,
        spO2,
        bp: '113/72',
        oxygenSource,
        mentalStatus,
        reportedSymptom,
        onset,
      },
    });
    setDraftSavedBanner(true);
    setTimeout(() => setDraftSavedBanner(false), 4000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1220px] mx-auto space-y-5 sm:space-y-6 pb-24 lg:pb-8">
      {/* Header */}
      <div>
        <p className="text-xs text-[#5C6B72] mb-1">
          Capture once, structure automatically
        </p>
        <h1 className="font-display text-2xl sm:text-[32px] font-semibold text-[#16232B] leading-tight">
          Voice Documentation
        </h1>
      </div>

      {/* Patient Selection Bar matching Screenshots 233752 / 233814 / 233825 */}
      {step !== 'saved' && (
        <div className="bg-white border border-[#D9DFE1] rounded-xl px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
          <div className="flex items-center gap-2.5 text-sm">
            <User className="w-4 h-4 text-[#5C6B72] shrink-0" />
            <span className="text-[#5C6B72]">Patient:</span>
            <select
              aria-label="Select patient for voice documentation"
              value={patient.id}
              onChange={(e) => onSwitchPatient(e.target.value)}
              className="min-h-[40px] sm:min-h-0 flex-1 sm:flex-initial font-mono-data text-base sm:text-sm font-medium text-[#16232B] bg-transparent focus:outline-none cursor-pointer"
            >
              {allPatients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id} — {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="font-mono-data text-xs text-[#5C6B72]">
            Bed {patient.bed} · {patient.wardName}
          </div>
        </div>
      )}

      {/* STATE 1: READY TO RECORD (Screenshot 233752) */}
      {step === 'ready' && (
        <div className="py-10 sm:py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <button
            onClick={handleStartRecording}
            aria-label="Start voice recording"
            className="w-24 h-24 rounded-full bg-[#EAF2F0] border border-[#BED6D1] flex items-center justify-center text-[#2F6F6B] hover:bg-[#DCEAE7] transition-colors mb-6"
          >
            <Mic className="w-8 h-8" strokeWidth={1.75} />
          </button>

          <h2 className="font-display text-xl font-semibold text-[#16232B] mb-2">
            Ready to record
          </h2>

          <p className="text-base sm:text-sm text-[#5C6B72] leading-relaxed mb-7">
            Speak naturally. Say the patient&apos;s vitals, symptoms, and any
            observations. CareBridge will structure them automatically.
          </p>

          <button
            onClick={handleStartRecording}
            className="min-h-[48px] sm:min-h-[44px] w-full sm:w-auto px-6 py-3 rounded-xl sm:rounded-lg bg-[#2F6F6B] hover:bg-[#255A56] text-white text-sm font-semibold transition-colors"
          >
            Start Recording
          </button>

          {/* Secondary options for typed transcript or testing manual fallback guardrail */}
          <div className="mt-10 pt-6 border-t border-[#D9DFE1] w-full space-y-3">
            <div className="text-[11px] font-mono-data uppercase text-[#5C6B72]">
              Demo Controls &amp; Fallback Options
            </div>
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-2">
              <button
                onClick={() => {
                  setTranscript(DEFAULT_DEMO_TRANSCRIPT);
                  setStep('review');
                  runGeminiExtraction(DEFAULT_DEMO_TRANSCRIPT);
                }}
                className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg bg-white border border-[#D9DFE1] hover:border-[#2F6F6B] text-xs text-[#16232B]"
              >
                Structure Sample Shift Note (Gemini AI)
              </button>
              <button
                onClick={() => {
                  setTranscript(DETERIORATION_4H_TRANSCRIPT);
                  setStep('review');
                  runGeminiExtraction(DETERIORATION_4H_TRANSCRIPT);
                }}
                className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg bg-white border border-[#D9DFE1] hover:border-[#2F6F6B] text-xs text-[#16232B]"
              >
                Structure 4h Deterioration Note (91% SpO₂, RR 29)
              </button>
              <button
                onClick={handleTriggerManualFallbackMode}
                className="min-h-[44px] sm:min-h-0 px-3 py-2 sm:py-1.5 rounded-lg bg-[#FDF3DF] border border-[#E5C278] text-xs text-[#8C5811]"
              >
                Test Manual Entry Fallback Guardrail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STATE 2: RECORDING IN PROGRESS (Screenshot 233814) */}
      {step === 'recording' && (
        <div className="py-12 sm:py-16 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-24 h-24 rounded-full bg-[#2F6F6B] ring-8 ring-[#E5EEEC] flex items-center justify-center text-white mb-6">
            <Mic className="w-8 h-8" strokeWidth={1.75} />
          </div>

          {/* Waveform Bars matching Screenshot 233814 */}
          <div className="flex items-center justify-center gap-1 h-10 mb-4">
            {[
              14, 24, 32, 20, 12, 8, 18, 30, 36, 26, 16, 22, 14, 8, 18, 28, 32,
              24, 18, 26, 16, 10,
            ].map((height, idx) => (
              <span
                key={idx}
                className="w-1 rounded-full bg-[#2F6F6B] transition-all duration-150"
                style={{
                  height: `${
                    seconds % 2 === 0
                      ? height
                      : Math.max(8, (height * 3) % 34)
                  }px`,
                }}
              />
            ))}
          </div>

          <div className="font-mono-data text-2xl font-semibold text-[#16232B] mb-1">
            {formatTimer(seconds)}
          </div>

          <p className="text-sm sm:text-xs text-[#5C6B72] mb-7">
            Recording in progress — speak clearly
          </p>

          <button
            onClick={handleStopRecording}
            className="min-h-[48px] sm:min-h-[44px] w-full sm:w-auto px-6 py-2.5 rounded-xl sm:rounded-lg bg-[#FCEEE9] hover:bg-[#F8DFD6] text-[#8E3222] border border-[#F2C6B8] text-sm font-semibold transition-colors"
          >
            Stop Recording
          </button>
        </div>
      )}

      {/* STATE 3: REVIEW & EDIT AI-STRUCTURED FIELDS (Screenshot 233825) */}
      {step === 'review' && (
        <div className="space-y-5">
          {/* Mandatory Guardrail Info Banner */}
          <div className="bg-[#EAF2F0] border border-[#C5DBD7] rounded-xl px-4 py-3 flex items-start sm:items-center gap-2.5 text-sm sm:text-xs text-[#1B3A4E]">
            <Info className="w-4 h-4 text-[#2F6F6B] shrink-0 mt-0.5 sm:mt-0" />
            <span>
              Review and edit the AI-structured fields below before saving.
              Nothing is final until you click <strong>Approve &amp; Save</strong>.
            </span>
          </div>

          {/* Mandatory Fallback Guardrail Banner if Voice/AI Processing Fails */}
          {fallbackNotice && (
            <div className="bg-[#FDF3DF] border border-[#E5C278] rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-sm sm:text-xs text-[#8C5811]">
              <div className="flex items-start sm:items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#C98A2E] shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <span className="font-medium">{fallbackNotice}</span>
                  <span>
                    {' '}
                    — All fields below are unlocked for direct manual entry.
                  </span>
                </div>
              </div>
              <button
                onClick={() => setFallbackNotice(null)}
                className="underline text-xs self-end sm:self-auto"
              >
                Dismiss
              </button>
            </div>
          )}

          {draftSavedBanner && (
            <div className="bg-[#FDF3DF] border border-[#E5C278] rounded-xl px-4 py-2.5 text-sm sm:text-xs text-[#8C5811]">
              Saved as an unapproved <strong>AI Note Draft</strong> in Nursing
              Notes. It will not become an official Clinical Note until approved.
            </div>
          )}

          {/* Two-Column Split: Original Transcript first, then AI-Drafted Structured Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch">
            {/* Left Column: Original Transcript (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-[#D9DFE1] rounded-xl p-4 sm:p-6 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-mono-data uppercase tracking-wider text-[#5C6B72] font-semibold">
                    ORIGINAL TRANSCRIPT
                  </span>
                  <button
                    type="button"
                    onClick={() => runGeminiExtraction(transcript)}
                    disabled={isExtracting}
                    className="min-h-[40px] sm:min-h-0 inline-flex items-center gap-1 text-xs sm:text-[11px] text-[#2F6F6B] hover:underline font-medium disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
                    {isExtracting ? 'Structuring...' : 'Re-extract with Gemini'}
                  </button>
                </div>

                <textarea
                  aria-label="Original voice transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={6}
                  className="w-full text-base sm:text-[15px] text-[#16232B] leading-relaxed bg-transparent border border-transparent focus:border-[#D9DFE1] rounded-lg p-1 focus:outline-none resize-none"
                />

                <div className="font-mono-data text-xs text-[#5C6B72] pt-2">
                  Recorded · 16:02 · 0:23
                </div>
              </div>
            </div>

            {/* Right Column: AI-Drafted Structured Fields (7 cols) */}
            <div className="lg:col-span-7 bg-[#EAF2F0] border border-[#C8DDD9] border-l-4 border-l-[#2F6F6B] rounded-xl p-4 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <AiDraftedBadge />
                  <span className="text-xs text-[#5C6B72]">
                    {isExtracting
                      ? 'Gemini AI extracting structured fields...'
                      : 'Structured from voice recording — review before saving'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* TEMPERATURE */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    TEMPERATURE
                  </label>
                  <input
                    ref={firstInputRef}
                    type="text"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>

                {/* PULSE */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    PULSE
                  </label>
                  <input
                    type="text"
                    value={pulse}
                    onChange={(e) => setPulse(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>

                {/* RESPIRATORY RATE */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    RESPIRATORY RATE
                  </label>
                  <input
                    type="text"
                    value={respiratoryRate}
                    onChange={(e) => setRespiratoryRate(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>

                {/* SPO2 */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    SPO₂
                  </label>
                  <input
                    type="text"
                    value={spO2}
                    onChange={(e) => setSpO2(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>

                {/* OXYGEN SOURCE */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    OXYGEN SOURCE
                  </label>
                  <input
                    type="text"
                    value={oxygenSource}
                    onChange={(e) => setOxygenSource(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>

                {/* MENTAL STATUS */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    MENTAL STATUS
                  </label>
                  <input
                    type="text"
                    value={mentalStatus}
                    onChange={(e) => setMentalStatus(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>

                {/* REPORTED SYMPTOM */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    REPORTED SYMPTOM
                  </label>
                  <input
                    type="text"
                    value={reportedSymptom}
                    onChange={(e) => setReportedSymptom(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>

                {/* ONSET */}
                <div className="bg-white border border-[#D9DFE1] rounded-xl p-3.5">
                  <label className="block text-xs sm:text-[10px] font-mono-data uppercase text-[#5C6B72] mb-1">
                    ONSET
                  </label>
                  <input
                    type="text"
                    value={onset}
                    onChange={(e) => setOnset(e.target.value)}
                    className={`w-full min-h-[40px] sm:min-h-0 font-mono-data text-base sm:text-sm text-[#16232B] pb-1 border-b border-dashed ${
                      isEditingFields
                        ? 'border-[#2F6F6B] bg-[#FAF8F5]'
                        : 'border-[#C5D6D2]'
                    } focus:outline-none focus:border-[#2F6F6B]`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Action Bar matching Screenshot 233825 */}
          <div className="hidden lg:flex flex-wrap items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setStep('ready')}
              className="px-4 py-2.5 rounded-lg bg-white border border-[#D9DFE1] hover:bg-[#EEF1F2] text-xs font-medium text-[#5C6B72] transition-colors"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={handleSaveAsAiDraft}
              className="px-4 py-2.5 rounded-lg bg-white border border-[#D9DFE1] hover:bg-[#EEF1F2] text-xs font-medium text-[#16232B] transition-colors"
            >
              Save as AI Draft Only
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEditingFields(true);
                firstInputRef.current?.focus();
              }}
              className="px-4 py-2.5 rounded-lg bg-[#EEF1F2] hover:bg-[#E0E6E8] text-xs font-semibold text-[#16232B] transition-colors"
            >
              Edit Fields
            </button>

            <button
              type="button"
              onClick={handleApproveAndSave}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#2F6F6B] hover:bg-[#255A56] text-white text-xs font-semibold transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Approve &amp; Save</span>
            </button>
          </div>

          {/* Mobile / Tablet Sticky Bottom Action Bar (< 1024px) */}
          <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-[#D9DFE1] px-4 py-2.5 flex items-center gap-2 shadow-lg safe-bottom">
            <button
              type="button"
              onClick={() => setStep('ready')}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-white border border-[#D9DFE1] text-xs font-medium text-[#5C6B72]"
            >
              Discard
            </button>

            <button
              type="button"
              onClick={handleSaveAsAiDraft}
              className="min-h-[44px] px-3 py-2 rounded-lg bg-[#EEF1F2] text-xs font-semibold text-[#16232B]"
            >
              Save Draft
            </button>

            <button
              type="button"
              onClick={handleApproveAndSave}
              className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#2F6F6B] text-white text-xs font-semibold"
            >
              <Check className="w-4 h-4" />
              <span>Approve &amp; Save</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 4: OBSERVATION SAVED (Screenshot 233843) */}
      {step === 'saved' && (
        <div className="py-12 sm:py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-[#E6F2EB] flex items-center justify-center text-[#4C8B67] mb-5">
            <Check className="w-7 h-7" strokeWidth={2} />
          </div>

          <h2 className="font-display text-2xl font-semibold text-[#16232B] mb-2">
            Observation Saved
          </h2>

          <p className="text-base sm:text-sm text-[#5C6B72] leading-relaxed mb-7">
            The structured observation for {patient.name} ({patient.id}) has
            been saved and is now visible in the patient record.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <button
              onClick={() => onNavigate('profile')}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-[#1B3A4E] hover:bg-[#244B63] text-white text-xs font-semibold transition-colors"
            >
              View Patient Profile
            </button>
            <button
              onClick={() => setStep('ready')}
              className="min-h-[44px] px-5 py-2.5 rounded-lg bg-white border border-[#D9DFE1] hover:bg-[#EEF1F2] text-xs font-medium text-[#16232B] transition-colors"
            >
              New Recording
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
