import React, { useState, useEffect, useCallback } from 'react';
import DynamicForm from './DynamicForm';
import RecordTable from './RecordTable';
import api from '../api';

/**
 * EntityApp — manages the full CRUD lifecycle for one entity.
 * Props:
 *   entity — { name, fields }
 *   toast  — (message, type?) => void
 */
export default function EntityApp({ entity, toast }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRecord, setEditRecord] = useState(null); // null = create mode
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

  // Reset state when switching entities
  useEffect(() => {
    setEditRecord(null);
    setSearch('');
    fetchRecords();
  }, [entity.name]);

  // Debounced search
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
    <div className="space-y-5">
      <DynamicForm
        entity={entity}
        onSubmit={handleSubmit}
        editRecord={editRecord}
        onCancelEdit={() => setEditRecord(null)}
      />

      {/* Search */}
      <input
        type="text"
        placeholder={`Search ${entity.name}...`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 py-4">
          <svg className="animate-spin h-4 w-4 text-blue-500" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Loading...
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
