/**
 * Type coercion utilities.
 * Used by both parseConfig and any route that receives user-supplied data.
 */

const TRUTHY  = new Set(['true', 'yes', '1', 'on', 'enabled']);
const FALSY   = new Set(['false', 'no', '0', 'off', 'disabled']);

/**
 * Coerce any value to a boolean.
 * Returns defaultValue when the input is ambiguous.
 */
function coerceBoolean(value, defaultValue = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number')  return value !== 0;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (TRUTHY.has(lower))  return true;
    if (FALSY.has(lower))   return false;
  }
  return defaultValue;
}

/**
 * Coerce any value to a non-empty string, or return the fallback.
 */
function coerceString(value, fallback = '') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value !== null && value !== undefined)     return String(value).trim() || fallback;
  return fallback;
}

/**
 * Coerce any value to an array.
 * If value is already an array, return it. Otherwise wrap in array or return [].
 */
function coerceArray(value) {
  if (Array.isArray(value)) return value;
  if (value !== null && value !== undefined) return [value];
  return [];
}

module.exports = { coerceBoolean, coerceString, coerceArray };
