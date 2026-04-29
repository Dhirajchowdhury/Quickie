import React from 'react';

export default function Logo({ showText = true, size = 'md' }) {
  const isLg = size === 'lg';

  return (
    <div className="flex items-center gap-2.5">
      {/* Gradient icon mark */}
      <div
        className={`
          flex items-center justify-center rounded-xl flex-shrink-0
          ${isLg ? 'w-9 h-9' : 'w-7 h-7'}
        `}
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
      >
        <svg
          className={`text-white ${isLg ? 'w-5 h-5' : 'w-4 h-4'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      {showText && (
        <span
          className={`font-bold tracking-tight ${isLg ? 'text-xl' : 'text-base'}`}
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          Quickie
        </span>
      )}
    </div>
  );
}
