import React from 'react';

const icons = {
  success: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
};

export default function Toast({ toasts }) {
  if (!toasts.length) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-50 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            pointer-events-auto
            animate-in slide-in-from-bottom-2 fade-in duration-200
            ${t.type === 'error'
              ? 'bg-red-600 text-white'
              : 'bg-slate-900 text-white'
            }
          `}
        >
          <span className={t.type === 'error' ? 'text-red-200' : 'text-emerald-400'}>
            {icons[t.type] || icons.success}
          </span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
