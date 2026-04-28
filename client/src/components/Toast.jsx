import React from 'react';

export default function Toast({ toasts }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-5 right-5 flex flex-col gap-2 z-50">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`px-4 py-3 rounded shadow text-sm text-white ${
            t.type === 'error' ? 'bg-red-500' : 'bg-green-600'
          }`}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
