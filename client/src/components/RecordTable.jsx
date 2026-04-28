import React, { useState } from 'react';

function displayValue(field, value) {
  if (value === undefined || value === null || value === '') return '—';
  if (field.type === 'boolean') return value === true || value === 'true' ? 'Yes' : 'No';
  if (field.type === 'password') return '••••••••';
  return String(value);
}

/**
 * RecordTable — renders rows from the API.
 * Props:
 *   fields   — field definitions from config
 *   records  — array of record rows
 *   onEdit   — called with full row object
 *   onDelete — called with record id
 */
export default function RecordTable({ fields, records, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center text-sm text-gray-400">
        No records yet. Submit the form above to add one.
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              {fields.map((f) => (
                <th key={f.name} className="px-4 py-3 font-medium text-gray-700 capitalize">
                  {f.label || f.name}
                </th>
              ))}
              <th className="px-4 py-3 font-medium text-gray-700">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-gray-50">
                {fields.map((f) => (
                  <td key={f.name} className="px-4 py-3 text-gray-800">
                    {displayValue(f, row.data[f.name])}
                  </td>
                ))}
                <td className="px-4 py-3 flex gap-3">
                  <button
                    onClick={() => onEdit(row)}
                    className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setConfirmId(row.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Delete confirmation modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <p className="text-gray-800 font-medium mb-1">Delete this record?</p>
            <p className="text-sm text-gray-500 mb-5">This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => { onDelete(confirmId); setConfirmId(null); }}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
