import React from 'react';
import { PatientStatus, ReferralStatus } from '../types/carebridge';

export const BridgeArcSymbol: React.FC<{
  className?: string;
  color?: string;
  animate?: boolean;
}> = ({ className = 'w-7 h-4', color = '#2F6F6B', animate = false }) => (
  <svg
    viewBox="0 0 36 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M5 15 A 13 13 0 0 1 31 15"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
      className={animate ? 'animate-arc' : ''}
    />
    <circle cx="5" cy="15" r="3.2" fill={color} />
    <circle cx="31" cy="15" r="3.2" fill={color} />
  </svg>
);

export const CareBridgeLogo: React.FC<{
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
}> = ({ variant = 'light', size = 'md' }) => {
  const textColor = variant === 'light' ? 'text-white' : 'text-[#1B3A4E]';
  const textSize =
    size === 'lg' ? 'text-[17px]' : size === 'sm' ? 'text-[13px]' : 'text-[15px]';
  const iconSize =
    size === 'lg' ? 'w-6 h-3.5' : size === 'sm' ? 'w-4 h-2.5' : 'w-5 h-3';
  const gapSize = size === 'sm' ? 'gap-1' : 'gap-1.5';

  return (
    <div className={`inline-flex items-center ${gapSize} select-none`}>
      <BridgeArcSymbol className={iconSize} color="#2F6F6B" />
      <span
        className={`font-display font-semibold tracking-tight leading-none ${textColor} ${textSize}`}
      >
        CareBridge
      </span>
    </div>
  );
};

export const AiDraftedBadge: React.FC<{ label?: string }> = ({
  label = 'AI-drafted',
}) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#DCEAE7] text-[#1B3A4E] border border-[#BED4D0] whitespace-normal sm:whitespace-nowrap">
    <svg
      viewBox="0 0 24 14"
      fill="none"
      className="w-3.5 h-2.5 shrink-0"
      aria-hidden="true"
    >
      <path
        d="M3.5 10.5 A 8.5 8.5 0 0 1 20.5 10.5"
        stroke="#2F6F6B"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="3.5" cy="10.5" r="2.2" fill="#2F6F6B" />
      <circle cx="20.5" cy="10.5" r="2.2" fill="#2F6F6B" />
    </svg>
    <span>{label}</span>
  </span>
);

export const ClinicianVerifiedBadge: React.FC<{ label?: string }> = ({
  label = 'Clinician-verified',
}) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#E6F2EB] text-[#35694B] border border-[#C2DFCE] whitespace-normal sm:whitespace-nowrap">
    <span aria-hidden="true" className="shrink-0">✓</span>
    <span>{label}</span>
  </span>
);

export const PatientStatusBadge: React.FC<{ status: PatientStatus }> = ({
  status,
}) => {
  if (status === 'Attention') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#FDF3DF] text-[#966217] whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C98A2E]" />
        Attention
      </span>
    );
  }
  if (status === 'Monitoring') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6EFF5] text-[#2E5B78] whitespace-nowrap">
        <span className="w-1.5 h-1.5 rounded-full bg-[#3F6E8C]" />
        Monitoring
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[#E6F2EB] text-[#35694B] whitespace-nowrap">
      <span className="w-1.5 h-1.5 rounded-full bg-[#4C8B67]" />
      Stable
    </span>
  );
};

export const REFERRAL_LIFECYCLE_STEPS: ReferralStatus[] = [
  'Draft',
  'Submitted',
  'Under Review',
  'Information Requested',
  'Accepted',
  'Transfer Pending',
  'En Route',
  'Arrived',
  'Admitted',
];

export const ReferralStatusBadge: React.FC<{ status: ReferralStatus }> = ({
  status,
}) => {
  const styles: Record<ReferralStatus, string> = {
    Draft: 'bg-[#EEF1F2] text-[#5C6B72] border-[#D9DFE1]',
    Submitted: 'bg-[#E6EFF5] text-[#2E5B78] border-[#C5DCE8]',
    'Under Review': 'bg-[#FDF3DF] text-[#966217] border-[#E6C687]',
    'Information Requested': 'bg-[#FDF3DF] text-[#966217] border-[#E6C687]',
    Accepted: 'bg-[#E6F2EB] text-[#35694B] border-[#C2DFCE]',
    Declined: 'bg-[#FCEEE9] text-[#B4432F] border-[#F2C6B8]',
    'Transfer Pending': 'bg-[#E6EFF5] text-[#2E5B78] border-[#C5DCE8]',
    'En Route': 'bg-[#FCEFE8] text-[#B85D2B] border-[#EFC7B0]',
    Arrived: 'bg-[#E6F2EB] text-[#2F6F6B] border-[#B8D4CE]',
    Admitted: 'bg-[#E6F2EB] text-[#35694B] border-[#4C8B67]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
        styles[status] || styles.Draft
      }`}
    >
      {status}
    </span>
  );
};
