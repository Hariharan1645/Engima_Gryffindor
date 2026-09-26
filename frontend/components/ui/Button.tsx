import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-widest transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#C27B66]/40 cursor-pointer active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'px-4 py-2 text-[11px] gap-1.5',
    md: 'px-6 py-3 text-xs gap-2',
    lg: 'px-8 py-4 text-sm gap-2.5 shadow-md hover:shadow-lg',
  }[size];

  const variantStyles = {
    primary:
      'bg-[#3A2E2C] text-[#FBF6F3] hover:bg-[#C27B66] hover:text-[#FFFFFF] shadow-[0_4px_16px_rgba(58,46,44,0.12)]',
    secondary:
      'bg-[#E8D5CE] text-[#3A2E2C] hover:bg-[#D9A8A0] border border-[#EDE0DA]',
    outline:
      'bg-transparent text-[#3A2E2C] border border-[#3A2E2C]/30 hover:border-[#C27B66] hover:text-[#C27B66] hover:bg-[#E8D5CE]/30',
    ghost:
      'bg-transparent text-[#3A2E2C] hover:bg-[#E8D5CE]/40 hover:text-[#C27B66]',
  }[variant];

  return (
    <button
      className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
