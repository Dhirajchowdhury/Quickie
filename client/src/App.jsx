import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ConfigUpload from './components/ConfigUpload';
import EntityApp from './components/EntityApp';
import Toast from './components/Toast';
import LandingPage from './components/landing/LandingPage';
import Logo from './components/ui/Logo';
import useToast from './hooks/useToast';
import api from './api';

// ── Config normalizer ──────────────────────────────────────────────────────
function normalizeConfig(cfg) {
  if (!cfg) return null;

  const entities = Array.isArray(cfg.entities) ? cfg.entities : [];
  const pages =
    Array.isArray(cfg.pages) && cfg.pages.length > 0
      ? cfg.pages
      : entities.map((e) => ({ name: e.name, entity: e.name }));

  return {
    ...cfg,
    appName: typeof cfg.appName === 'string' && cfg.appName ? cfg.appName : 'Untitled App',
    entities,
    pages,
    // Preserve ui block exactly as-is — never overwrite it
    ui: cfg.ui && typeof cfg.ui === 'object' ? cfg.ui : null,
  };
}

// ── Sidebar icon ───────────────────────────────────────────────────────────
function TableIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18M10 3v18M6 3h12a3 3 0 013 3v12a3 3 0 01-3 3H6a3 3 0 01-3-3V6a3 3 0 013-3z" />
    </svg>
  );
}

// ── Safe UI renderer — never crashes, always shows something ───────────────
function SafeUI({ ui }) {
  if (!ui || typeof ui !== 'object') return null;

  const type = typeof ui.type === 'string' ? ui.type : null;

  if (!type) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-8 py-6 max-w-sm text-center">
          <p className="text-sm font-semibold text-amber-700">UI config is missing a <code>type</code> field.</p>
        </div>
      </div>
    );
  }

  if (type === 'form') {
    return (
      <div className="max-w-2xl mx-auto px-6 py-7">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Form UI</h2>
          <pre className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 overflow-auto">
            {JSON.stringify(ui.fields || [], null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-7">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Table UI</h2>
          <pre className="text-xs text-slate-600 bg-slate-50 rounded-xl p-4 overflow-auto">
            {JSON.stringify(ui.fields || [], null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Unknown type — show fallback instead of crashing
  return (
    <div className="flex items-center justify-center h-full p-8">
      <div className="bg-red-50 border border-red-200 rounded-2xl px-8 py-6 max-w-sm text-center">
        <p className="text-sm font-semibold text-red-700">
          Unsupported component: <code className="bg-red-100 px-1 rounded">{type}</code>
        </p>
        <p className="text-xs text-red-500 mt-1">Check your config&apos;s <code>ui.type</code> value.</p>
      </div>
    </div>
  );
}

// ── Main content area — decides what to render ─────────────────────────────
function MainContent({ uiConfig, activeEntity, toast }) {
  if (uiConfig) {
    return <SafeUI ui={uiConfig} />;
  }

  if (activeEntity) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-7 space-y-5 animate-slide-up">
        <EntityApp entity={activeEntity} toast={toast} />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'linear-gradient(135deg, #eef2ff, #ede9fe)' }}
      >
        <TableIcon className="w-8 h-8 text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">Select an entity</h3>
      <p className="text-sm text-slate-400 mt-1.5 max-w-xs leading-relaxed">
        Choose an entity from the sidebar to view and manage its records.
      </p>
    </div>
  );
}

// ── Root component ─────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [config, setConfig] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const { toasts, toast } = useToast();

  useEffect(() => {
    if (!token) return;
    api.get('/config')
      .then((res) => {
        if (res.data.config) {
          const normalized = normalizeConfig(res.data.config);
          setConfig(normalized);
          setActivePage(normalized.pages[0] || null);
        }
      })
      .catch(() => {});
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

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (!token) {
    if (showAuth) {
      return <Auth onLogin={handleLogin} onBack={() => setShowAuth(false)} />;
    }
    return (
      <LandingPage
        onLogin={() => setShowAuth(true)}
        onSignup={() => setShowAuth(true)}
      />
    );
  }

  const activeEntity = config?.entities?.find((e) => e.name === activePage?.entity) || null;
  const uiConfig = config?.ui || null;

  // ── Authenticated shell ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f6fa] flex flex-col font-sans text-slate-900 antialiased">

      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200/80 px-5 flex items-center justify-between flex-shrink-0 z-20 relative">
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

      {/* Body */}
      {!config ? (
        <ConfigUpload onConfig={handleConfig} />
      ) : (
        <div className="flex flex-1 overflow-hidden">

          {/* Sidebar */}
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
                        ? 'sidebar-active pl-[10px]'
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

          {/* Main */}
          <main className="flex-1 overflow-y-auto bg-[#f5f6fa]">
            <MainContent
              uiConfig={uiConfig}
              activeEntity={activeEntity}
              toast={toast}
            />
          </main>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}
