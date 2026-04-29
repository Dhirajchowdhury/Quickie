import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ConfigUpload from './components/ConfigUpload';
import EntityApp from './components/EntityApp';
import Toast from './components/Toast';
import LandingPage from './components/landing/LandingPage';
import Logo from './components/ui/Logo';
import useToast from './hooks/useToast';
import api from './api';

function normalizeConfig(cfg) {
  if (!cfg) return null;
  const entities = cfg.entities || [];
  const pages =
    cfg.pages && cfg.pages.length > 0
      ? cfg.pages
      : entities.map((e) => ({ name: e.name, entity: e.name }));
  return { ...cfg, entities, pages };
}

// Sidebar nav icon
function TableIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z" />
    </svg>
  );
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [config, setConfig] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const { toasts, toast } = useToast();

  useEffect(() => {
    if (!token) return;
    api.get('/config').then((res) => {
      if (res.data.config) {
        const normalized = normalizeConfig(res.data.config);
        setConfig(normalized);
        setActivePage(normalized.pages[0] || null);
      }
    }).catch(() => {});
  }, [token]);

  function handleLogin(t) {
    localStorage.setItem('token', t);
    setToken(t);
  }

  function handleLogout() {
    localStorage.removeItem('token');
    setToken(null);
    setConfig(null);
    setActivePage(null);
  }

  function handleConfig(cfg) {
    const normalized = normalizeConfig(cfg);
    setConfig(normalized);
    setActivePage(normalized.pages[0] || null);
  }

  if (!token) {
    if (showAuth) return <Auth onLogin={handleLogin} onBack={() => setShowAuth(false)} />;
    return <LandingPage onLogin={() => setShowAuth(true)} onSignup={() => setShowAuth(true)} />;
  }

  const activeEntity = config?.entities?.find((e) => e.name === activePage?.entity) || null;

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col font-sans text-slate-900 antialiased">

      {/* ── Header ── */}
      <header className="h-14 bg-white border-b border-slate-200/80 px-5 flex items-center justify-between flex-shrink-0 z-20 relative">
        {/* Subtle gradient line at very bottom of header */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px] opacity-60"
          style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)' }}
        />

        <div className="flex items-center gap-3">
          <Logo size="md" showText />
          {config && (
            <>
              <span className="text-slate-300 text-sm">/</span>
              <span className="text-sm font-semibold text-slate-700 truncate max-w-[180px]">
                {config.appName}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {config && (
            <button
              onClick={() => { setConfig(null); setActivePage(null); }}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-100"
            >
              Change config
            </button>
          )}
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-all bg-slate-100 hover:bg-slate-200 px-3.5 py-1.5 rounded-xl"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Body ── */}
      {!config ? (
        <ConfigUpload onConfig={handleConfig} />
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* ── Sidebar ── */}
          <aside className="w-56 bg-white border-r border-slate-200/80 flex-shrink-0 flex flex-col">
            <div className="px-4 pt-5 pb-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.12em]">
                Entities
              </p>
            </div>

            <nav className="flex-1 overflow-y-auto px-2.5 pb-4 space-y-0.5 scrollbar-thin">
              {config.pages.map((page) => {
                const isActive = activePage?.entity === page.entity;
                return (
                  <button
                    key={page.entity}
                    onClick={() => setActivePage(page)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-xl text-sm
                      flex items-center gap-2.5 transition-all duration-150
                      ${isActive
                        ? 'sidebar-active pl-[10px]'   /* pl-[10px] = 12px - 2px border */
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium'
                      }
                    `}
                  >
                    <TableIcon
                      className={`w-4 h-4 flex-shrink-0 transition-colors ${
                        isActive ? 'text-indigo-500' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate capitalize">{page.name}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-500 flex-shrink-0" />
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar footer */}
            <div className="p-3 border-t border-slate-100">
              <div className="flex items-center gap-2 px-2 py-1.5">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
                >
                  {config.appName?.[0]?.toUpperCase() || 'A'}
                </div>
                <span className="text-xs font-medium text-slate-600 truncate">{config.appName}</span>
              </div>
            </div>
          </aside>

          {/* ── Main ── */}
          <main className="flex-1 overflow-y-auto bg-[#f5f6fa]">
            {activeEntity ? (
              <div className="max-w-4xl mx-auto px-6 py-7 space-y-5 animate-slide-up">

                {/* Page header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-lg font-bold text-slate-900 capitalize tracking-tight">
                      {activePage?.name}
                    </h1>
                    <p className="text-xs text-slate-400 mt-0.5 font-medium">
                      {config.appName} · {activePage?.name?.toLowerCase()} records
                    </p>
                  </div>
                </div>

                <EntityApp entity={activeEntity} toast={toast} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 shadow-glow-brand"
                  style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}
                >
                  <TableIcon className="w-8 h-8 text-indigo-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-800">Select an entity</h3>
                <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">
                  Choose an entity from the sidebar to view and manage its records.
                </p>
              </div>
            )}
          </main>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
