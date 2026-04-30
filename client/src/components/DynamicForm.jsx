import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';

const VALID_FIELD_TYPES = ['text', 'number', 'email', 'password', 'date', 'boolean'];

// Map incoming type aliases to canonical types
const FIELD_TYPE_ALIASES = {
  string:   'text',
  str:      'text',
  int:      'number',
  integer:  'number',
  float:    'number',
  bool:     'boolean',
  checkbox: 'boolean',
};

/**
 * Sanitize a field definition before rendering.
 * Ensures the form never crashes on malformed config data.
 */
function sanitizeField(field) {
  if (!field || typeof field !== 'object') {
    return { name: '_unknown', type: 'text', required: false, label: 'Unknown Field' };
  }
  const rawName = field.name ?? field.key ?? field.column;
  const name    = typeof rawName === 'string' && rawName.trim() ? rawName.trim() : '_unknown';

  const rawType = typeof field.type === 'string' ? field.type.trim().toLowerCase() : '';
  const type    = FIELD_TYPE_ALIASES[rawType] ??
                  (VALID_FIELD_TYPES.includes(rawType) ? rawType : 'text');

  return {
    name,
    type,
    required: field.required === true,
    label:    typeof field.label === 'string' && field.label
                ? field.label
                : (name !== '_unknown' ? name : 'Unnamed Field'),
  };
}

function FieldInput({ field, value, onChange, error }) {
  if (field.type === 'boolean') {
    const checked = value === true || value === 'true';
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 select-none">
          {field.label || field.name}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          onClick={() => onChange(field.name, !checked)}
          className={`
            relative inline-flex h-6 w-11 items-center rounded-full
            transition-all duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2
            ${checked ? 'shadow-glow-indigo' : ''}
          `}
          style={checked
            ? { background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }
            : { background: '#e2e8f0' }
          }
        >
          <span
            className={`
              inline-block h-4 w-4 transform rounded-full bg-white shadow-sm
              transition-transform duration-200
              ${checked ? 'translate-x-6' : 'translate-x-1'}
            `}
          />
        </button>
        <div className="min-h-[18px]">
          {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        </div>
      </div>
    );
  }

  const typeMap = { text: 'text', number: 'number', email: 'email', password: 'password', date: 'date' };

  // Safe fallback — unknown types render as plain text input
  const htmlType = typeMap[field.type] ?? 'text';

  return (
    <Input
      label={
        <span>
          {field.label || field.name}
          {field.required && <span className="text-red-400 ml-1">*</span>}
        </span>
      }
      type={htmlType}
      value={value ?? ''}
      onChange={(e) => onChange(field.name, e.target.value)}
      error={error}
    />
  );
}

function validateField(field, value) {
  const isEmpty = value === undefined || value === null || String(value).trim() === '';
  if (field.required && isEmpty) return 'This field is required';
  if (isEmpty) return null;
  if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)))
    return 'Must be a valid email address';
  if (field.type === 'number' && isNaN(Number(value)))
    return 'Must be a valid number';
  if (field.type === 'date' && isNaN(Date.parse(String(value))))
    return 'Must be a valid date';
  return null;
}

export default function DynamicForm({ entity, onSubmit, editRecord, onCancelEdit }) {
  const isEditing = !!editRecord;

  // Sanitize all fields before any rendering or state initialization
  const safeFields = (entity?.fields ?? []).map(sanitizeField);

  const emptyState = () =>
    Object.fromEntries(safeFields.map((f) => [f.name, f.type === 'boolean' ? false : '']));

  const [values, setValues] = useState(emptyState);
  const [fieldErrors, setFieldErrors] = useState({});
  const [serverErrors, setServerErrors] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setValues(editRecord ? { ...emptyState(), ...editRecord.data } : emptyState());
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

    const errors = {};
    for (const field of safeFields) {
      const err = validateField(field, values[field.name]);
      if (err) errors[field.name] = err;
    }
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    const payload = {};
    for (const field of safeFields) {
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
      const errs = err.response?.data?.errors || [err.response?.data?.error || 'Submission failed'];
      setServerErrors(errs);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`
        bg-white rounded-2xl border shadow-card p-6 transition-all duration-200
        ${isEditing
          ? 'border-indigo-200 ring-1 ring-indigo-100'
          : 'border-slate-200'
        }
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          {/* Accent dot */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isEditing
              ? 'linear-gradient(135deg,#fef3c7,#fde68a)'
              : 'linear-gradient(135deg,#eef2ff,#ede9fe)'
            }}
          >
            {isEditing ? (
              <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 capitalize">
              {isEditing ? `Edit ${entity.name}` : `New ${entity.name}`}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEditing ? 'Update the fields below' : 'Fill in the details to create a record'}
            </p>
          </div>
        </div>
        {isEditing && (
          <button
            onClick={onCancelEdit}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
            aria-label="Cancel edit"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-0.5">
          {safeFields.map((field) => (
            <FieldInput
              key={field.name}
              field={field}
              value={values[field.name]}
              onChange={handleChange}
              error={fieldErrors[field.name]}
            />
          ))}
        </div>

        {serverErrors.length > 0 && (
          <div className="mt-4 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
            <ul className="list-disc list-inside space-y-0.5">
              {serverErrors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        )}

        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100">
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Saving…
              </>
            ) : isEditing ? 'Update record' : 'Create record'}
          </Button>
          {isEditing && (
            <Button type="button" variant="secondary" onClick={onCancelEdit}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
