import React, { useState } from 'react';
import Button from './ui/Button';

function displayValue(field, value) {
  if (value === undefined || value === null || value === '') {
    return <span className="text-slate-300 select-none">—</span>;
  }
  if (field.type === 'boolean') {
    const isTrue = value === true || value === 'true';
    return (
      <span className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold
        ${isTrue
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80'
          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200/80'
        }
      `}>
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isTrue ? 'bg-emerald-500' : 'bg-slate-400'}`} />
        {isTrue ? 'Yes' : 'No'}
      </span>
    );
  }
  if (field.type === 'password') {
    return <span className="text-slate-400 tracking-widest text-xs font-mono">••••••••</span>;
  }
  return <span className="text-slate-700">{String(value)}</span>;
}

export default function RecordTable({ fields, records, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-14 text-center">
        {/* Illustration */}
        <div className="relative w-16 h-16 mx-auto mb-5">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#eef2ff,#ede9fe)' }}
          >
            <svg className="w-8 h-8 text-indigo-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          {/* Plus badge */}
          <div
            className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          >
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
        <h3 className="text-sm font-semibold text-slate-800 mb-1">No records yet</h3>
        <p className="text-xs text-slate-400 max-w-[200px] mx-auto leading-relaxed">
          Start by adding your first record using the form above.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200 shadow-card overflow-hidden">
        {/* Table header bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Records
            </span>
          </div>
          <span
            className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', color: '#6366f1' }}
          >
            {records.length} {records.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-slate-100">
                {fields.map((f) => (
                  <th key={f.name} className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {f.label || f.name}
                  </th>
                ))}
                <th className="px-5 py-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {records.map((row, i) => (
                <tr
                  key={row.id}
                  className={`
                    border-b border-slate-50 last:border-0
                    transition-colors duration-150 hover:bg-indigo-50/20
                    ${i % 2 !== 0 ? 'bg-slate-50/30' : 'bg-white'}
                  `}
                >
                  {fields.map((f) => (
                    <td key={f.name} className="px-5 py-3.5 whitespace-nowrap text-sm">
                      {displayValue(f, row.data[f.name])}
                    </td>
                  ))}
                  <td className="px-5 py-3.5 whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(row)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition-all duration-150"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        onClick={() => setConfirmId(row.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-all duration-150"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-sm p-6 animate-slide-up">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Delete record?</h3>
                <p className="text-sm text-slate-500 mt-1 leading-relaxed">
                  This is permanent and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2.5 justify-end">
              <Button variant="secondary" size="sm" onClick={() => setConfirmId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => { onDelete(confirmId); setConfirmId(null); }}
              >
                Delete record
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
