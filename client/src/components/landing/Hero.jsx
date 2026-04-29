import React from 'react';
import Button from '../ui/Button';

export default function Hero({ onGetStartedClick }) {
  return (
    <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto text-center">
      <div className="max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
          />
          JSON → Working App in seconds
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
          Build internal tools{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            at lightspeed
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-500 mb-10 leading-relaxed max-w-2xl mx-auto">
          Upload a JSON config and instantly get a fully functional app — forms, tables, CRUD, auth. No code required.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto"
            onClick={onGetStartedClick}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Start building free
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto">
            View docs
          </Button>
        </div>
      </div>

      {/* Mock dashboard preview */}
      <div className="mt-20 relative mx-auto max-w-5xl">
        {/* Glow behind the card */}
        <div
          className="absolute inset-x-10 top-4 h-full rounded-3xl blur-3xl opacity-20 -z-10"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6,#06b6d4)' }}
        />

        <div className="rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          {/* Browser chrome */}
          <div className="h-11 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4">
              <div className="h-5 bg-slate-200 rounded-md w-48 mx-auto" />
            </div>
          </div>

          {/* Mock app shell */}
          <div className="flex h-72">
            {/* Sidebar */}
            <div className="w-44 border-r border-slate-100 p-3 hidden md:flex flex-col gap-1.5">
              <div className="h-3 bg-slate-100 rounded w-16 mb-2" />
              {/* Active item */}
              <div
                className="h-8 rounded-lg flex items-center px-2.5 gap-2"
                style={{ background: 'linear-gradient(135deg,#eef2ff,#ede9fe)', borderLeft: '2px solid #6366f1' }}
              >
                <div className="w-3 h-3 rounded bg-indigo-300" />
                <div className="h-2.5 bg-indigo-200 rounded w-14" />
              </div>
              <div className="h-8 rounded-lg flex items-center px-2.5 gap-2">
                <div className="w-3 h-3 rounded bg-slate-200" />
                <div className="h-2.5 bg-slate-200 rounded w-12" />
              </div>
              <div className="h-8 rounded-lg flex items-center px-2.5 gap-2">
                <div className="w-3 h-3 rounded bg-slate-200" />
                <div className="h-2.5 bg-slate-200 rounded w-16" />
              </div>
            </div>

            {/* Main area */}
            <div className="flex-1 p-5 bg-[#f5f6fa] flex flex-col gap-3">
              {/* Stats row */}
              <div className="flex gap-3">
                {[['#eef2ff','#6366f1'], ['#f0fdf4','#22c55e'], ['#fff7ed','#f97316']].map(([bg, fg], i) => (
                  <div key={i} className="flex-1 bg-white rounded-xl border border-slate-200 p-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg" style={{ background: bg }} />
                    <div className="flex flex-col gap-1">
                      <div className="h-1.5 rounded w-10" style={{ background: fg, opacity: 0.4 }} />
                      <div className="h-2.5 rounded w-6" style={{ background: fg }} />
                    </div>
                  </div>
                ))}
              </div>
              {/* Form card */}
              <div className="bg-white rounded-xl border border-slate-200 p-3 flex gap-3">
                <div className="flex-1 h-7 bg-slate-100 rounded-lg" />
                <div className="flex-1 h-7 bg-slate-100 rounded-lg" />
                <div
                  className="w-20 h-7 rounded-lg"
                  style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                />
              </div>
              {/* Table card */}
              <div className="bg-white rounded-xl border border-slate-200 flex-1 overflow-hidden">
                <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-3">
                  {[40, 28, 36, 24].map((w, i) => (
                    <div key={i} className="h-2 bg-slate-200 rounded" style={{ width: w }} />
                  ))}
                </div>
                {[1,2,3].map((r) => (
                  <div key={r} className={`h-8 flex items-center px-3 gap-3 ${r % 2 === 0 ? 'bg-slate-50/50' : ''}`}>
                    {[40, 28, 36, 24].map((w, i) => (
                      <div key={i} className="h-2 bg-slate-100 rounded" style={{ width: w }} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
