import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  variant?: 'default' | 'surface' | 'highlight' | 'outlined';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverable = false,
  variant = 'default',
  ...props
}) => {
  const variantStyles = {
    default: 'bg-white/90 backdrop-blur-xs border border-[#EDE0DA] text-[#3A2E2C]',
    surface: 'bg-[#F9F1ED] border border-[#EDE0DA] text-[#3A2E2C]',
    highlight: 'bg-[#F5E6E1] border border-[#D9A8A0]/40 text-[#3A2E2C]',
    outlined: 'bg-transparent border border-[#EDE0DA] text-[#3A2E2C]',
  }[variant];

  const hoverStyles = hoverable
    ? 'hover:shadow-[0_8px_30px_rgba(58,46,44,0.09)] hover:-translate-y-0.5 transition-all duration-300'
    : '';

  return (
    <div
      className={`rounded-3xl p-6 shadow-[0_4px_20px_rgba(58,46,44,0.04)] ${variantStyles} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
