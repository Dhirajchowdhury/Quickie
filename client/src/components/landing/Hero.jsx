import React from 'react';
import Button from '../ui/Button';

export default function Hero({ onGetStartedClick }) {
  return (
    <section className="pt-32 pb-24 px-6 max-w-7xl mx-auto">
      {/* Two-column layout: text left, preview right */}
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">

        {/* ── Left: copy ── */}
        <div className="flex-1 text-center lg:text-left max-w-xl mx-auto lg:mx-0">
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

          <p className="text-lg text-slate-500 mb-10 leading-relaxed">
            Upload a JSON config and instantly get a fully functional app — forms, tables, CRUD, auth. No code required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
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

        {/* ── Right: dashboard preview ── */}
        <div className="flex-1 w-full max-w-2xl mx-auto lg:mx-0 relative">

          {/* Glow — vivid, not faded */}
          <div
            className="absolute -inset-4 rounded-3xl blur-2xl opacity-30 -z-10"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)' }}
          />

          {/* Preview card */}
          <div
            className="
              relative bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden
              transition-transform duration-300 hover:scale-[1.02]
            "
            style={{ transform: 'rotate(0.5deg)' }}
          >
            {/* Rainbow top bar — matches the app's own header accent */}
            <div
              className="h-[3px] w-full"
              style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6,#06b6d4)' }}
            />

            {/* Browser chrome */}
            <div className="h-10 bg-slate-50 border-b border-slate-200 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <div className="flex-1 mx-4">
                <div className="h-5 bg-slate-200 rounded-md w-40 mx-auto" />
              </div>
            </div>

            {/* App shell */}
            <div className="flex h-80">

              {/* Sidebar */}
              <div className="w-40 border-r border-slate-100 bg-white p-3 flex flex-col gap-1.5">
                {/* Logo row */}
                <div className="flex items-center gap-2 px-1 mb-3">
                  <div
                    className="w-6 h-6 rounded-lg flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  />
                  <div className="h-3 bg-slate-200 rounded w-16" />
                </div>
                <div className="h-2.5 bg-slate-100 rounded w-12 mb-1 ml-1" />
                {/* Active nav item */}
                <div
                  className="h-8 rounded-lg flex items-center px-2.5 gap-2"
                  style={{
                    background: 'linear-gradient(135deg,#eef2ff,#ede9fe)',
                    borderLeft: '2px solid #6366f1',
                  }}
                >
                  <div className="w-3 h-3 rounded bg-indigo-400 flex-shrink-0" />
                  <div className="h-2.5 bg-indigo-300 rounded w-14" />
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500" />
                </div>
                {/* Inactive items */}
                {[14, 18, 12].map((w, i) => (
                  <div key={i} className="h-8 rounded-lg flex items-center px-2.5 gap-2">
                    <div className="w-3 h-3 rounded bg-slate-200 flex-shrink-0" />
                    <div className="h-2.5 bg-slate-200 rounded" style={{ width: w * 4 }} />
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-4 bg-[#f5f6fa] flex flex-col gap-3 overflow-hidden">

                {/* Page title */}
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-slate-300 rounded w-28" />
                  <div className="h-3 bg-slate-200 rounded w-20" />
                </div>

                {/* Stats pills */}
                <div className="flex gap-2.5">
                  {[
                    ['#eef2ff', '#6366f1', '#c7d2fe', 24],
                    ['#f0fdf4', '#22c55e', '#bbf7d0', 12],
                    ['#fff7ed', '#f97316', '#fed7aa', 8],
                  ].map(([bg, fg, bar, val], i) => (
                    <div
                      key={i}
                      className="flex-1 bg-white rounded-xl border border-slate-200 p-2.5 flex items-center gap-2"
                    >
                      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: bg }}>
                        <span className="text-[10px] font-bold" style={{ color: fg }}>{val}</span>
                      </div>
                      <div className="flex flex-col gap-1 min-w-0">
                        <div className="h-1.5 rounded w-10" style={{ background: bar }} />
                        <div className="h-2 rounded w-6" style={{ background: fg }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form card */}
                <div className="bg-white rounded-xl border border-slate-200 p-3 flex gap-2.5 items-center">
                  <div className="flex-1 h-7 bg-slate-100 rounded-lg border border-slate-200" />
                  <div className="flex-1 h-7 bg-slate-100 rounded-lg border border-slate-200" />
                  <div
                    className="w-20 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}
                  >
                    <div className="w-8 h-2 bg-white/60 rounded" />
                  </div>
                </div>

                {/* Table card */}
                <div className="bg-white rounded-xl border border-slate-200 flex-1 overflow-hidden">
                  {/* Table header */}
                  <div className="h-8 bg-slate-50 border-b border-slate-100 flex items-center px-3 gap-4">
                    {[36, 28, 40, 20].map((w, i) => (
                      <div key={i} className="h-2 bg-slate-300 rounded" style={{ width: w }} />
                    ))}
                    <div className="ml-auto h-2 bg-slate-200 rounded w-12" />
                  </div>
                  {/* Table rows */}
                  {[
                    ['#6366f1', '#22c55e'],
                    ['#8b5cf6', '#f97316'],
                    ['#06b6d4', '#6366f1'],
                  ].map(([c1, c2], r) => (
                    <div
                      key={r}
                      className={`h-9 flex items-center px-3 gap-4 ${r % 2 !== 0 ? 'bg-slate-50/60' : ''}`}
                    >
                      <div className="h-2 bg-slate-200 rounded w-9" />
                      <div className="h-2 bg-slate-200 rounded w-7" />
                      <div className="h-2 bg-slate-200 rounded w-10" />
                      {/* Colored badge */}
                      <div
                        className="h-5 rounded-full px-2 flex items-center"
                        style={{ background: c1 + '18' }}
                      >
                        <div className="h-1.5 rounded w-8" style={{ background: c1 }} />
                      </div>
                      {/* Action buttons */}
                      <div className="ml-auto flex gap-1.5">
                        <div className="h-5 w-8 rounded bg-indigo-100" />
                        <div className="h-5 w-8 rounded bg-red-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
