import React from 'react';

interface ChipProps {
  label: string;
  subtext?: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  subtext,
  selected = false,
  onClick,
  icon,
  size = 'md',
  className = '',
}) => {
  const sizeStyles = {
    sm: 'px-3 py-1 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3.5 text-base gap-3',
  }[size];

  const stateStyles = selected
    ? 'bg-[#3A2E2C] text-[#FBF6F3] border-[#3A2E2C] shadow-md scale-[1.01]'
    : 'bg-[#F6ECE7] text-[#3A2E2C] border-[#EDE0DA] hover:bg-[#E8D5CE] hover:border-[#D9A8A0]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex flex-col text-left rounded-2xl border transition-all duration-300 cursor-pointer active:scale-[0.98] ${sizeStyles} ${stateStyles} ${className}`}
    >
      <div className="inline-flex items-center gap-2 font-medium">
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{label}</span>
      </div>
      {subtext && (
        <span
          className={`text-xs mt-0.5 ${
            selected ? 'text-[#E8D5CE]' : 'text-[#3A2E2C]/70'
          }`}
        >
          {subtext}
        </span>
      )}
    </button>
  );
};
