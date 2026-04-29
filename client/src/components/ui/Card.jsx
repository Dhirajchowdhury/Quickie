import React from 'react';

/**
 * Card — base container.
 * variant="static"  → no hover effect (default for dashboard panels)
 * variant="hover"   → lifts on hover (for landing page feature cards)
 */
export default function Card({ children, className = '', variant = 'static' }) {
  const base = 'bg-white rounded-2xl border border-slate-200 shadow-sm';
  const hoverStyle =
    variant === 'hover'
      ? 'hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300'
      : '';

  return (
    <div className={`${base} ${hoverStyle} p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardIcon({ children }) {
  return (
    <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-5 text-indigo-600">
      {children}
    </div>
  );
}

export function CardTitle({ children }) {
  return (
    <h3 className="text-lg font-semibold text-slate-900 mb-2">{children}</h3>
  );
}

export function CardDescription({ children }) {
  return (
    <p className="text-slate-500 text-sm leading-relaxed">{children}</p>
  );
}
