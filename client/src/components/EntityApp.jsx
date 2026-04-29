import React, { useState, useEffect, useCallback } from 'react';
import DynamicForm from './DynamicForm';
import RecordTable from './RecordTable';
import api from '../api';

/** Small stat pill used in the summary bar */
function StatPill({ label, value, accent }) {
  return (
    <div className="flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-card">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: accent || 'linear-gradient(135deg,#eef2ff,#ede9fe)' }}
      >
        <span className="text-indigo-600 text-xs font-bold">{typeof value === 'number' ? value : '—'}</span>
      </div>
      <div>
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider leading-none">{label}</p>
        <p className="text-sm font-bold text-slate-800 mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}

export default function EntityApp({ entity, toast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [search, setSearch] = useState('');

  const fetchRecords = useCallback(async (q = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/${entity.name}`, { params: q ? { search: q } : {} });
      setRecords(res.data);
    } catch (err) {
      toast(err.response?.data?.error || 'Failed to load records', 'error');
    } finally {
      setLoading(false);
    }
  }, [entity.name]);

  useEffect(() => {
    setEditRecord(null);
    setSearch('');
    fetchRecords();
  }, [entity.name]);

  useEffect(() => {
    const t = setTimeout(() => fetchRecords(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  async function handleSubmit(payload, id) {
    if (id) {
      await api.put(`/${entity.name}/${id}`, payload);
      toast('Record updated');
      setEditRecord(null);
    } else {
      await api.post(`/${entity.name}`, payload);
      toast('Record added');
    }
    fetchRecords(search);
  }

  async function handleDelete(id) {
    try {
      await api.delete(`/${entity.name}/${id}`);
      toast('Record deleted');
      fetchRecords(search);
    } catch (err) {
      toast(err.response?.data?.error || 'Delete failed', 'error');
    }
  }

  return (
    <div className="space-y-4">

      {/* ── Stats summary bar ── */}
      <div className="flex flex-wrap gap-3">
        <StatPill label="Total records" value={records.length} />
        <StatPill label="Fields" value={entity.fields.length} />
        <StatPill label="Entity" value={entity.name} />
      </div>

      {/* ── Form ── */}
      <DynamicForm
        entity={entity}
        onSubmit={handleSubmit}
        editRecord={editRecord}
        onCancelEdit={() => setEditRecord(null)}
      />

      {/* ── Search ── */}
      <div className="relative">
        <svg
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder={`Search ${entity.name}...`}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 shadow-card transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 hover:border-slate-300"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Table / Spinner ── */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-card p-12 flex flex-col items-center justify-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#eef2ff,#ede9fe)' }}
          >
            <svg className="animate-spin h-5 w-5 text-indigo-500" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          </div>
          <span className="text-sm text-slate-400 font-medium">Loading records…</span>
        </div>
      ) : (
        <RecordTable
          fields={entity.fields}
          records={records}
          onEdit={setEditRecord}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
