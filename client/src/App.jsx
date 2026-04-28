// import React, { useState, useEffect } from 'react';
// import Auth from './components/Auth';
// import ConfigUpload from './components/ConfigUpload';
// import EntityApp from './components/EntityApp';
// import Toast from './components/Toast';
// import useToast from './hooks/useToast';
// import api from './api';

// export default function App() {
//   const [token, setToken] = useState(localStorage.getItem('token'));
//   const [config, setConfig] = useState(null);
//   const [activePage, setActivePage] = useState(null); // { name, entity }
//   const { toasts, toast } = useToast();

//   // Load saved config on login
//   useEffect(() => {
//     if (!token) return;
//     api.get('/config').then((res) => {
//       if (res.data.config) {
//         setConfig(res.data.config);
//         setActivePage(res.data.config.pages?.[0] || null);
//       }
//     }).catch(() => {});
//   }, [token]);

//   function handleLogin(t) {
//     localStorage.setItem('token', t);
//     setToken(t);
//   }

//   function handleLogout() {
//     localStorage.removeItem('token');
//     setToken(null);
//     setConfig(null);
//     setActivePage(null);
//   }

//   function handleConfig(cfg) {
//     setConfig(cfg);
//     setActivePage(cfg.pages?.[0] || null);
//   }

//   if (!token) return <Auth onLogin={handleLogin} />;

//   const activeEntity = config?.entities.find((e) => e.name === activePage?.entity);

//   return (
//     <div className="min-h-screen bg-gray-50 flex flex-col">
//       {/* Top nav */}
//       <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
//         <h1 className="text-xl font-semibold text-gray-800">
//           {config ? config.appName : 'Quickie'}
//         </h1>
//         <div className="flex items-center gap-4">
//           {config && (
//             <button
//               onClick={() => { setConfig(null); setActivePage(null); }}
//               className="text-xs text-gray-400 hover:text-gray-600 underline"
//             >
//               Change config
//             </button>
//           )}
//           <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-800">
//             Logout
//           </button>
//         </div>
//       </header>

//       {!config ? (
//         <main className="max-w-2xl mx-auto p-6 w-full">
//           <ConfigUpload onConfig={handleConfig} />
//         </main>
//       ) : (
//         <div className="flex flex-1 overflow-hidden">
//           {/* Sidebar navigation */}
//           <aside className="w-48 bg-white border-r flex-shrink-0 py-4">
//             <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
//               Pages
//             </p>
//             <nav className="flex flex-col">
//               {config.pages.map((page) => (
//                 <button
//                   key={page.entity}
//                   onClick={() => setActivePage(page)}
//                   className={`text-left px-4 py-2 text-sm capitalize transition-colors ${
//                     activePage?.entity === page.entity
//                       ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
//                       : 'text-gray-600 hover:bg-gray-50'
//                   }`}
//                 >
//                   {page.name}
//                 </button>
//               ))}
//             </nav>
//           </aside>

//           {/* Main content */}
//           <main className="flex-1 overflow-y-auto p-6">
//             {activeEntity ? (
//               <div className="max-w-3xl mx-auto space-y-5">
//                 <h2 className="text-lg font-semibold text-gray-700 capitalize">
//                   {activePage.name}
//                 </h2>
//                 <EntityApp entity={activeEntity} toast={toast} />
//               </div>
//             ) : (
//               <p className="text-sm text-gray-400">Select a page from the sidebar.</p>
//             )}
//           </main>
//         </div>
//       )}

//       <Toast toasts={toasts} />
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ConfigUpload from './components/ConfigUpload';
import EntityApp from './components/EntityApp';
import Toast from './components/Toast';
import useToast from './hooks/useToast';
import api from './api';

// 🔥 Normalize config on frontend (CRITICAL FIX)
function normalizeConfig(cfg) {
  if (!cfg) return null;

  const entities = cfg.entities || [];

  const pages =
    cfg.pages && cfg.pages.length > 0
      ? cfg.pages
      : entities.map((e) => ({
          name: e.name,
          entity: e.name,
        }));

  return {
    ...cfg,
    entities,
    pages,
  };
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [config, setConfig] = useState(null);
  const [activePage, setActivePage] = useState(null);
  const { toasts, toast } = useToast();

  // ✅ Load config after login
  useEffect(() => {
    if (!token) return;

    api
      .get('/config')
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

  if (!token) return <Auth onLogin={handleLogin} />;

  // ✅ SAFE ACCESS
  const activeEntity =
    config?.entities?.find((e) => e.name === activePage?.entity) || null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-800">
          {config ? config.appName : 'Quickie'}
        </h1>

        <div className="flex items-center gap-4">
          {config && (
            <button
              onClick={() => {
                setConfig(null);
                setActivePage(null);
              }}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Change config
            </button>
          )}

          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-800"
          >
            Logout
          </button>
        </div>
      </header>

      {!config ? (
        <main className="max-w-2xl mx-auto p-6 w-full">
          <ConfigUpload onConfig={handleConfig} />
        </main>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside className="w-48 bg-white border-r flex-shrink-0 py-4">
            <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Pages
            </p>

            <nav className="flex flex-col">
              {(config?.pages || []).map((page) => (
                <button
                  key={page.entity}
                  onClick={() => setActivePage(page)}
                  className={`text-left px-4 py-2 text-sm capitalize transition-colors ${
                    activePage?.entity === page.entity
                      ? 'bg-blue-50 text-blue-700 font-medium border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {page.name}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="flex-1 overflow-y-auto p-6">
            {activeEntity ? (
              <div className="max-w-3xl mx-auto space-y-5">
                <h2 className="text-lg font-semibold text-gray-700 capitalize">
                  {activePage?.name}
                </h2>

                <EntityApp entity={activeEntity} toast={toast} />
              </div>
            ) : (
              <p className="text-sm text-gray-400">
                Select a page from the sidebar.
              </p>
            )}
          </main>
        </div>
      )}

      <Toast toasts={toasts} />
    </div>
  );
}