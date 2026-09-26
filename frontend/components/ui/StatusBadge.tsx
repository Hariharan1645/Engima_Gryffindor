import React from 'react';
import { SafetyVerdict } from '@/lib/types';
import { ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';

interface StatusBadgeProps {
  verdict: SafetyVerdict;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  verdict,
  label,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const getBadgeStyle = (v: SafetyVerdict) => {
    switch (v) {
      case 'safe':
        return {
          bg: 'bg-[#8FA382]',
          text: 'text-[#3A4432]',
          border: 'border-[#7E9272]/30',
          defaultLabel: 'Safe',
          icon: ShieldCheck,
        };
      case 'caution':
        return {
          bg: 'bg-[#C9973E]',
          text: 'text-[#5C4420]',
          border: 'border-[#B8872E]/30',
          defaultLabel: 'Caution',
          icon: AlertTriangle,
        };
      case 'risk':
        return {
          bg: 'bg-[#9B4A38]',
          text: 'text-[#FBF6F3]',
          border: 'border-[#8A3F2E]/30',
          defaultLabel: 'Risk',
          icon: AlertCircle,
        };
      case 'unknown':
      default:
        return {
          bg: 'bg-[#A39285]',
          text: 'text-[#3A2E2C]',
          border: 'border-[#928275]/30',
          defaultLabel: 'Unknown',
          icon: HelpCircle,
        };
    }
  };

  const config = getBadgeStyle(verdict);
  const IconComponent = config.icon;

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[10px] gap-1 tracking-wider',
    md: 'px-3.5 py-1 text-xs gap-1.5 tracking-widest',
    lg: 'px-5 py-2 text-sm gap-2 tracking-widest',
  }[size];

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 18,
  }[size];

  return (
    <span
      className={`inline-flex items-center font-bold uppercase rounded-full border shadow-xs transition-all ${config.bg} ${config.text} ${config.border} ${sizeClasses} ${className}`}
    >
      {showIcon && <IconComponent size={iconSizes} className="shrink-0 stroke-[2.5]" />}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
