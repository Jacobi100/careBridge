import React, { useState } from 'react';
import { User, LayoutGrid, Zap, Home, Heart, Network, X } from 'lucide-react';
import { Role } from '../types/carebridge';
import { BridgeArcSymbol, CareBridgeLogo } from './BrandElements';

interface RoleLoginScreenProps {
  onSelectRole: (role: Role) => void;
}

export const RoleLoginScreen: React.FC<RoleLoginScreenProps> = ({
  onSelectRole,
}) => {
  const [showIntegrationModal, setShowIntegrationModal] = useState(false);

  const roles: {
    id: Role;
    title: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      id: 'nurse',
      title: 'Nurse',
      description:
        'Document, monitor, and coordinate patient care across your shift',
      icon: <User className="w-5 h-5 text-[#2F6F6B]" strokeWidth={1.75} />,
    },
    {
      id: 'management',
      title: 'Hospital Management',
      description:
        'Monitor ward capacity, bed availability, and resource allocation in real time',
      icon: <LayoutGrid className="w-5 h-5 text-[#2F6F6B]" strokeWidth={1.75} />,
    },
    {
      id: 'emergency',
      title: 'Emergency Team',
      description:
        'Capture patient condition at the scene and find the right receiving hospital',
      icon: <Zap className="w-5 h-5 text-[#2F6F6B]" strokeWidth={1.75} />,
    },
    {
      id: 'receiving',
      title: 'Receiving Hospital',
      description:
        'Review incoming patients, request specific records, and prepare before arrival',
      icon: <Home className="w-5 h-5 text-[#2F6F6B]" strokeWidth={1.75} />,
    },
    {
      id: 'patient',
      title: 'Patient',
      description:
        'Follow your own care journey, medications, and connect with your care team',
      icon: <Heart className="w-5 h-5 text-[#2F6F6B]" strokeWidth={1.75} />,
    },
  ];

  return (
    <div className="min-h-dvh bg-[#1B3A4E] text-white flex flex-col justify-between px-4 sm:px-8 py-4 sm:py-6 safe-top safe-bottom">
      {/* Top Bar */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <CareBridgeLogo variant="light" size="md" />
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <button
            onClick={() => setShowIntegrationModal(true)}
            className="min-h-[44px] sm:min-h-0 text-xs text-[#9CB0BC] hover:text-white transition-colors inline-flex items-center gap-1.5 px-3 py-2 sm:py-1.5 rounded-lg border border-white/10 bg-white/5"
          >
            <Network className="w-3.5 h-3.5 text-[#2F6F6B] shrink-0" />
            <span>EMR / HIS Architecture</span>
          </button>
          <span className="hidden sm:inline text-xs font-mono-data text-[#8CA2B0]">
            Demo Environment · v2.4.1
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center max-w-5xl w-full mx-auto my-6 sm:my-8">
        <div className="mb-4 sm:mb-5">
          <BridgeArcSymbol className="w-14 h-8" color="#2F6F6B" animate />
        </div>

        <h1 className="font-display text-3xl sm:text-4xl md:text-[46px] font-semibold text-center leading-[1.12] tracking-tight text-white mb-4">
          Every piece of care,
          <br />
          connected.
        </h1>

        <p className="text-[#9CB0BC] text-center text-base sm:text-[15px] leading-relaxed max-w-lg mb-8 sm:mb-12">
          CareBridge coordinates healthcare information across teams, facilities,
          and patients — so nothing falls through the gaps.
        </p>

        <p className="text-xs sm:text-[11px] font-semibold tracking-[0.14em] text-[#7D97A6] uppercase mb-4 sm:mb-5">
          SELECT YOUR ROLE TO CONTINUE
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 w-full">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => onSelectRole(role.id)}
              className="group text-left bg-[#214257]/90 hover:bg-[#274D65] border border-[#32576E] hover:border-[#2F6F6B] rounded-xl p-5 transition-all duration-150 flex flex-col min-h-[140px] lg:min-h-[210px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2F6F6B]"
            >
              <div className="mb-3 sm:mb-4">{role.icon}</div>
              <h2 className="font-display text-base sm:text-[15px] font-semibold text-white mb-1.5 sm:mb-2 group-hover:text-white">
                {role.title}
              </h2>
              <p className="text-sm sm:text-xs text-[#8CA2B0] leading-relaxed">
                {role.description}
              </p>
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-[#6B8596] py-2">
        Demo only — no authentication required · Data is illustrative
      </footer>

      {/* Production EMR/HIS Integration Architecture Modal (Full-width bottom sheet on mobile) */}
      {showIntegrationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF8F5] text-[#16232B] rounded-t-2xl sm:rounded-xl max-w-3xl w-full max-h-[90dvh] sm:max-h-[85dvh] overflow-y-auto p-5 sm:p-6 border border-[#D9DFE1] shadow-xl safe-bottom">
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#D9DFE1] mb-5">
              <div>
                <span className="text-xs font-mono-data uppercase tracking-wider text-[#2F6F6B]">
                  Architecture Boundary
                </span>
                <h2 className="font-display text-lg sm:text-xl font-semibold text-[#16232B]">
                  Prototype Simulation vs. Future Production EMR / HIS Integration
                </h2>
              </div>
              <button
                onClick={() => setShowIntegrationModal(false)}
                aria-label="Close Architecture Note"
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-[#5C6B72] hover:text-[#16232B] hover:bg-[#EEF1F2] shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-base sm:text-sm">
              <div className="p-4 rounded-lg bg-[#EAF1F0] border-l-4 border-[#2F6F6B]">
                <p className="font-medium text-[#1B3A4E]">
                  Core Principle: The information should move ahead of the patient.
                </p>
                <p className="text-sm sm:text-xs text-[#5C6B72] mt-1 leading-relaxed">
                  This prototype uses an in-memory clinical state store designed around HL7 FHIR R4 resource boundaries so live hospital feeds can replace simulated state without changing the clinical workflow or human-review guardrails.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-lg bg-white border border-[#D9DFE1]">
                  <h3 className="font-semibold text-[#1B3A4E] text-xs uppercase tracking-wider mb-1.5">
                    1. Medical Device & Vital Feeds
                  </h3>
                  <p className="text-sm sm:text-xs text-[#5C6B72] leading-relaxed">
                    <strong>Prototype:</strong> Simulated observation series & Gemini voice-to-JSON structuring with mandatory Nurse Approve action.
                    <br />
                    <strong>Production:</strong> HL7 v2 ORU^R01 / FHIR <code className="font-mono-data">Observation</code> streams from bedside multiparameter monitors & pulse oximeters via hospital integration engine (Mirth / Redox).
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-[#D9DFE1]">
                  <h3 className="font-semibold text-[#1B3A4E] text-xs uppercase tracking-wider mb-1.5">
                    2. Hospital Bed Capacity (HIS / ADT)
                  </h3>
                  <p className="text-sm sm:text-xs text-[#5C6B72] leading-relaxed">
                    <strong>Prototype:</strong> Live in-app Admission / Discharge / Transfer state updating ward bed counters.
                    <br />
                    <strong>Production:</strong> Bi-directional HL7 v2 ADT (A01 Admit, A02 Transfer, A03 Discharge) & FHIR <code className="font-mono-data">Location</code> / <code className="font-mono-data">Encounter</code> listeners synced with hospital PAS/HIS.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-[#D9DFE1]">
                  <h3 className="font-semibold text-[#1B3A4E] text-xs uppercase tracking-wider mb-1.5">
                    3. Facility Network & Capability Registry
                  </h3>
                  <p className="text-sm sm:text-xs text-[#5C6B72] leading-relaxed">
                    <strong>Prototype:</strong> 3 regional hospital capability profiles evaluated against patient requirements via explainable checklist.
                    <br />
                    <strong>Production:</strong> Regional HIE (Health Information Exchange) FHIR <code className="font-mono-data">HealthcareService</code> & live ICU/equipment telemetry directory.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-white border border-[#D9DFE1]">
                  <h3 className="font-semibold text-[#1B3A4E] text-xs uppercase tracking-wider mb-1.5">
                    4. Inter-Hospital Referral & Document Exchange
                  </h3>
                  <p className="text-sm sm:text-xs text-[#5C6B72] leading-relaxed">
                    <strong>Prototype:</strong> Shared state machine (<code className="font-mono-data">Draft → Admitted</code>) & granular per-document approval lock.
                    <br />
                    <strong>Production:</strong> FHIR <code className="font-mono-data">ServiceRequest</code>, <code className="font-mono-data">Task</code>, and <code className="font-mono-data">DocumentReference</code> / IHE XDS.b cross-enterprise document sharing with OAuth2 SMART-on-FHIR audit trails.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowIntegrationModal(false)}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-0 px-4 py-2.5 sm:py-2 rounded-lg bg-[#1B3A4E] text-white text-sm sm:text-xs font-medium hover:bg-[#244B63]"
              >
                Close Architecture Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
