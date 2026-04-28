import React from 'react';

export default function RecordTable({ fields, records, onDelete }) {
  if (records.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-sm text-gray-500">
        No records yet. Submit the form above to add one.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-gray-50 border-b">
          <tr>
            {fields.map((f) => (
              <th key={f.name} className="px-4 py-3 font-medium text-gray-700 capitalize">
                {f.name}
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
                  {row.data[f.name] ?? '—'}
                </td>
              ))}
              <td className="px-4 py-3">
                <button
                  onClick={() => onDelete(row.id)}
                  className="text-red-500 hover:text-red-700 text-xs"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
