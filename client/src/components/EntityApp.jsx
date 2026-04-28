import React, { useState, useEffect, useCallback } from 'react';
import DynamicForm from './DynamicForm';
import RecordTable from './RecordTable';
import api from '../api';

export default function EntityApp({ entity }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/${entity.name}`);
      setRecords(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load records');
    } finally {
      setLoading(false);
    }
  }, [entity.name]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  async function handleSubmit(formData) {
    await api.post(`/${entity.name}`, formData);
    fetchRecords();
  }

  async function handleDelete(id) {
    await api.delete(`/${entity.name}/${id}`);
    fetchRecords();
  }

  return (
    <div className="space-y-6">
      <DynamicForm entity={entity} onSubmit={handleSubmit} />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      {loading ? (
        <p className="text-sm text-gray-500">Loading records...</p>
      ) : (
        <RecordTable fields={entity.fields} records={records} onDelete={handleDelete} />
      )}
    </div>
  );
}
