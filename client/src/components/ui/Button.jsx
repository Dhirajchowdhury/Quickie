import React from 'react';

/**
 * Button — design system primitive.
 * variant: primary | secondary | ghost | danger
 * size:    sm | md | lg
 */

const variants = {
  primary: 'btn-gradient',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-card active:scale-[0.98] focus-visible:ring-slate-400',
  ghost:
    'text-slate-600 hover:text-slate-900 bg-transparent hover:bg-slate-100 active:scale-[0.98] focus-visible:ring-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md active:scale-[0.98] focus-visible:ring-red-500',
};

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-7 py-3 text-sm',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) {
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl font-semibold
        transition-all duration-200
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:pointer-events-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
