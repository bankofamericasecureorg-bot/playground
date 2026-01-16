'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'link' | 'blue';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}, ref) => {
  const baseStyles = `
    inline-flex items-center justify-center gap-2 font-semibold
    transition-all duration-200 ease-in-out
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-60 disabled:cursor-not-allowed
    rounded-md
  `;

  const variants = {
    primary: `
      bg-bofa-navy text-white border-2 border-bofa-navy
      hover:bg-bofa-navy-dark hover:border-bofa-navy-dark
      focus:ring-bofa-navy
    `,
    secondary: `
      bg-transparent text-bofa-navy border-2 border-bofa-navy
      hover:bg-bofa-navy hover:text-white
      focus:ring-bofa-navy
    `,
    danger: `
      bg-bofa-red text-white border-2 border-bofa-red
      hover:bg-bofa-red-dark hover:border-bofa-red-dark
      focus:ring-bofa-red
    `,
    ghost: `
      bg-transparent text-bofa-gray-700 border-2 border-transparent
      hover:bg-bofa-gray-100
      focus:ring-bofa-gray-300
    `,
    link: `
      bg-transparent text-bofa-blue border-0 underline-offset-2
      hover:text-bofa-blue-dark hover:underline
      focus:ring-bofa-blue p-0
    `,
    blue: `
      bg-bofa-blue text-white border border-bofa-blue
      hover:bg-[#005a9e] hover:border-[#005a9e]
      focus:ring-bofa-blue
    `,
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-sm px-4 py-2.5',
    lg: 'text-base px-6 py-3',
  };

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variants[variant]} ${variant !== 'link' ? sizes[size] : ''} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
