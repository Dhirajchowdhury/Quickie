import React, { useState } from 'react';

export default function DynamicForm({ entity, onSubmit }) {
  const emptyState = () =>
    Object.fromEntries(entity.fields.map((f) => [f.name, '']));

  const [values, setValues] = useState(emptyState);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Client-side required check
    for (const field of entity.fields) {
      if (field.required && !String(values[field.name]).trim()) {
        setError(`"${field.name}" is required`);
        return;
      }
    }

    // Cast number fields
    const payload = {};
    for (const field of entity.fields) {
      payload[field.name] =
        field.type === 'number' ? Number(values[field.name]) : values[field.name];
    }

    setSubmitting(true);
    try {
      await onSubmit(payload);
      setValues(emptyState());
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4 capitalize">
        Add {entity.name}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {entity.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              value={values[field.name]}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ))}

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-600 text-sm">Record added.</p>}

        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Saving...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}
