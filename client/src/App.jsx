import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import ConfigUpload from './components/ConfigUpload';
import EntityApp from './components/EntityApp';
import Toast from './components/Toast';
import LandingPage from './components/landing/LandingPage';
import useToast from './hooks/useToast';
import api from './api';

function normalizeConfig(cfg) {
if (!cfg) return null;

const entities = Array.isArray(cfg.entities) ? cfg.entities : [];
const pages =
Array.isArray(cfg.pages) && cfg.pages.length > 0
? cfg.pages
: entities.map((e) => ({ name: e.name, entity: e.name }));

return {
...cfg,
appName: typeof cfg.appName === 'string' ? cfg.appName : 'Untitled App',
entities,
pages,
ui: cfg.ui && typeof cfg.ui === 'object' ? cfg.ui : null,
};
}

function SafeUI({ ui }) {
if (!ui) return null;

const type = ui.type;

if (type === 'form') {
return (
<div style={{ padding: 20 }}> <h3>Form UI</h3> <pre>{JSON.stringify(ui.fields || [], null, 2)}</pre> </div>
);
}

if (type === 'table') {
return (
<div style={{ padding: 20 }}> <h3>Table UI</h3> <pre>{JSON.stringify(ui.fields || [], null, 2)}</pre> </div>
);
}

return (
<div style={{ padding: 20, color: 'red', textAlign: 'center' }}>
Unsupported component: {String(type)} </div>
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

```
api.get('/config')
  .then((res) => {
    if (res.data.config) {
      const normalized = normalizeConfig(res.data.config);
      setConfig(normalized);
      setActivePage(normalized.pages[0] || null);
    }
  })
  .catch(() => {});
```

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

const activeEntity =
config?.entities?.find((e) => e.name === activePage?.entity) || null;

const uiConfig = config?.ui || null;

return ( <div>
{!config ? ( <ConfigUpload onConfig={handleConfig} />
) : ( <div>
{uiConfig ? ( <SafeUI ui={uiConfig} />
) : activeEntity ? ( <EntityApp entity={activeEntity} toast={toast} />
) : (
<div style={{ padding: 20, textAlign: 'center' }}>
No UI or entities found </div>
)} </div>
)}

```
  <Toast toasts={toasts} />
</div>


);
}
