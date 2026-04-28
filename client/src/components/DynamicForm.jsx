import React, { useState, useEffect } from 'react';

/** Render the right input element per field type */
function FieldInput({ field, value, onChange }) {
  const base =
    'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  if (field.type === 'boolean') {
    const checked = value === true || value === 'true';
    return (
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`field-${field.name}`}
          checked={checked}
          onChange={(e) => onChange(field.name, e.target.checked)}
          className="w-4 h-4 accent-blue-600"
        />
        <label htmlFor={`field-${field.name}`} className="text-sm text-gray-600">
          {checked ? 'Yes' : 'No'}
        </label>
      </div>
    );
  }

  const typeMap = { text: 'text', number: 'number', email: 'email', password: 'password', date: 'date' };

  return (
    <input
      type={typeMap[field.type] || 'text'}
      value={value ?? ''}
      onChange={(e) => onChange(field.name, e.target.value)}
      className={base}
    />
  );
}

/** Client-side validation for a single field */
function validateField(field, value) {
  const isEmpty = value === undefined || value === null || String(value).trim() === '';
  if (field.required && isEmpty) return `"${field.label || field.name}" is required`;
  if (isEmpty) return null;
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)))
    return `"${field.label || field.name}" must be a valid email`;
  if (field.type === 'number' && isNaN(Number(value)))
    return `"${field.label || field.name}" must be a number`;
  if (field.type === 'date' && isNaN(Date.parse(String(value))))
    return `"${field.label || field.name}" must be a valid date`;
  return null;
}

/**
 * DynamicForm — handles both create and edit mode.
 * Props:
 *   entity       — { name, fields }
 *   onSubmit     — async (payload, id?) => void
 *   editRecord   — row object when editing, null for create
 *   onCancelEdit — called when user cancels edit
 */
export default function DynamicForm({ entity, onSubmit, editRecord, onCancelEdit }) {
  const isEditing = !!editRecord;

  const emptyState = () =>
    Object.fromEntries(
      entity.fields.map((f) => [f.name, f.type === 'boolean' ? false : ''])
    );

  const [values, setValues] = useState(emptyState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Pre-fill when entering edit mode, reset when leaving
  useEffect(() => {
    if (editRecord) {
      setValues({ ...emptyState(), ...editRecord.data });
    } else {
      setValues(emptyState());
    }
    setFieldErrors({});
    setServerErrors([]);
  }, [editRecord, entity.name]);

  function handleChange(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: null }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerErrors([]);

    // Validate all fields
    const errors = {};
    for (const field of entity.fields) {
      const err = validateField(field, values[field.name]);
      if (err) errors[field.name] = err;
    }
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      return;
    }

    // Cast types before sending
    const payload = {};
    for (const field of entity.fields) {
      if (field.type === 'number') payload[field.name] = Number(values[field.name]);
      else if (field.type === 'boolean')
        payload[field.name] = values[field.name] === true || values[field.name] === 'true';
      else payload[field.name] = values[field.name];
    }

    setSubmitting(true);
    try {
      await onSubmit(payload, editRecord?.id);
      if (!isEditing) setValues(emptyState());
      setFieldErrors({});
    } catch (err) {
      const errs = err.response?.data?.errors || [
        err.response?.data?.error || 'Submission failed',
      ];
      setServerErrors(errs);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800 capitalize">
          {isEditing ? `Edit ${entity.name}` : `Add ${entity.name}`}
        </h2>
        {isEditing && (
          <button onClick={onCancelEdit} className="text-sm text-gray-400 hover:text-gray-700">
            ✕ Cancel
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {entity.fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
              {field.label || field.name}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <FieldInput field={field} value={values[field.name]} onChange={handleChange} />
            {fieldErrors[field.name] && (
              <p className="text-red-500 text-xs mt-1">{fieldErrors[field.name]}</p>
            )}
          </div>
        ))}

        {serverErrors.length > 0 && (
          <ul className="text-red-500 text-sm space-y-1 list-disc list-inside">
            {serverErrors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-5 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEditing ? 'Update' : 'Submit'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-5 py-2 rounded text-sm font-medium border border-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
