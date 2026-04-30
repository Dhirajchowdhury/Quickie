import React, { useState, useRef } from 'react';
import api from '../api';
import Button from './ui/Button';

export default function ConfigUpload({ onConfig }) {
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [warnings, setWarnings] = useState([]); // non-blocking issues from server
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const fileRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setWarnings([]);

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      setError('Invalid JSON — check your syntax and try again');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/config', parsed);
      // Show any non-blocking warnings before handing off to the app
      if (res.data.warnings?.length) {
        setWarnings(res.data.warnings);
        // Small delay so the user can read the warnings, then proceed
        setTimeout(() => onConfig(res.data.config), 1800);
      } else {
        onConfig(res.data.config);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save config');
    } finally {
      setLoading(false);
    }
  }

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setText(ev.target.result);
    reader.readAsText(file);
  }

  const hasContent = text.trim().length > 0;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-5 shadow-lg shadow-indigo-200">
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Upload your JSON config</h1>
          <p className="text-slate-500 text-sm">
            Paste your config or upload a <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono">.json</code> file to generate your app instantly.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* File upload zone */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Upload file
              </label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl px-6 py-8 text-center hover:border-indigo-300 hover:bg-indigo-50/30 transition-all duration-200 group"
              >
                <svg className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 mx-auto mb-3 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                {fileName ? (
                  <p className="text-sm font-medium text-indigo-600">{fileName}</p>
                ) : (
                  <>
                    <p className="text-sm font-medium text-slate-600">Click to upload</p>
                    <p className="text-xs text-slate-400 mt-1">JSON files only</p>
                  </>
                )}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".json"
                onChange={handleFile}
                className="hidden"
              />
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-100" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">or paste JSON</span>
              <div className="flex-1 h-px bg-slate-100" />
            </div>

            {/* Textarea */}
            <div>
              <textarea
                rows={10}
                value={text}
                onChange={(e) => { setText(e.target.value); setError(''); setWarnings([]); }}
                placeholder={`{\n  "appName": "My App",\n  "entities": [...]\n}`}
                className={`
                  w-full border rounded-xl px-4 py-3 text-sm font-mono
                  bg-slate-50 text-slate-800 placeholder:text-slate-300
                  resize-none transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-offset-0 focus:bg-white
                  ${error
                    ? 'border-red-300 focus:ring-red-500/20 focus:border-red-400'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-400 hover:border-slate-300'
                  }
                `}
              />
            </div>

            {/* Hard error — blocks submission */}
            {error && (
              <div className="flex items-center gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Warnings — non-blocking, app will still load */}
            {warnings.length > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-amber-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    Config warnings — app will still load
                  </span>
                </div>
                <ul className="space-y-1">
                  {warnings.map((w, i) => (
                    <li key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                      <span className="mt-0.5 flex-shrink-0">•</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !hasContent}
              className="w-full shadow-md shadow-indigo-100"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generating app...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate App
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Example hint */}
        <p className="text-center text-xs text-slate-400 mt-5">
          Need an example?{' '}
          <button
            type="button"
            onClick={() => setText(JSON.stringify({
              appName: 'School CRM',
              entities: [
                { name: 'students', fields: [
                  { name: 'name', type: 'text', required: true },
                  { name: 'email', type: 'email', required: true },
                  { name: 'age', type: 'number' },
                ]},
              ],
            }, null, 2))}
            className="text-indigo-500 hover:text-indigo-700 font-medium underline underline-offset-2 transition-colors"
          >
            Load sample config
          </button>
        </p>
      </div>
    </div>
  );
}
