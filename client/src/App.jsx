import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ConfigUpload from './components/ConfigUpload';
import EntityApp from './components/EntityApp';
import api from './api';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [config, setConfig] = useState(null);
  const [activeEntity, setActiveEntity] = useState(null);

  // Load saved config on login
  useEffect(() => {
    if (!token) return;
    api.get('/config').then((res) => {
      if (res.data.config) {
        setConfig(res.data.config);
        setActiveEntity(res.data.config.entities[0]?.name || null);
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
    setActiveEntity(null);
  }

  function handleConfig(cfg) {
    setConfig(cfg);
    setActiveEntity(cfg.entities[0]?.name || null);
  }

  if (!token) return <Auth onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          {config ? config.appName : 'Quickie'}
        </h1>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">
          Logout
        </button>
      </header>

      <main className="max-w-4xl mx-auto p-6 space-y-6">
        {!config ? (
          <ConfigUpload onConfig={handleConfig} />
        ) : (
          <>
            {/* Entity tabs */}
            {config.entities.length > 1 && (
              <div className="flex gap-2">
                {config.entities.map((e) => (
                  <button
                    key={e.name}
                    onClick={() => setActiveEntity(e.name)}
                    className={`px-4 py-1.5 rounded text-sm font-medium border ${
                      activeEntity === e.name
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {e.name}
                  </button>
                ))}
              </div>
            )}

            {activeEntity && (
              <EntityApp
                entity={config.entities.find((e) => e.name === activeEntity)}
              />
            )}

            <button
              onClick={() => setConfig(null)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Upload a different config
            </button>
          </>
        )}
      </main>
    </div>
  );
}
