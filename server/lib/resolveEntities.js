/**
 * resolveEntities — extract a normalized entity list from ANY config shape.
 *
 * Supported input formats:
 *   config.entities          → standard format
 *   config.database.tables   → alternative DB-centric format
 *   config.models            → ORM-style format
 *   config.schema            → schema-first format
 *   (none of the above)      → returns []
 *
 * Always returns:
 *   Array<{ name: string, fields: Array<{ name, type, required, label }> }>
 */

const { coerceBoolean, coerceString, coerceArray } = require('./coerce');

const VALID_TYPES = ['text', 'number', 'email', 'password', 'date', 'boolean', 'string'];

// Normalize "string" → "text" for UI compatibility
const TYPE_ALIASES = { string: 'text', int: 'number', integer: 'number', float: 'number', bool: 'boolean' };

/**
 * Normalize a name for case-insensitive, whitespace-tolerant matching.
 * "Users" === "users" === " users " → all become "users"
 */
function normalizeName(str) {
  return String(str ?? '').trim().toLowerCase();
}

function normalizeType(raw) {
  if (typeof raw !== 'string') return 'text';
  const lower = raw.trim().toLowerCase();
  if (TYPE_ALIASES[lower]) return TYPE_ALIASES[lower];
  if (VALID_TYPES.includes(lower)) return lower;
  return 'text'; // unknown type → safe default
}

function normalizeField(field, entityName, index, warnings) {
  if (!field || typeof field !== 'object') {
    warnings.push(`Entity "${entityName}": field at index ${index} is not an object — skipped`);
    return null;
  }

  // Accept field.name OR field.key OR field.column
  const rawName = field.name ?? field.key ?? field.column;
  const name = coerceString(rawName, '');

  if (!name) {
    warnings.push(`Entity "${entityName}": field at index ${index} has no name — skipped`);
    return null;
  }

  return {
    name,
    type:     normalizeType(field.type ?? field.dataType ?? field.data_type),
    required: coerceBoolean(field.required ?? field.notNull ?? field.not_null, false),
    label:    coerceString(field.label ?? field.displayName ?? field.display_name, name),
  };
}

function normalizeEntity(raw, index, warnings) {
  if (!raw || typeof raw !== 'object') {
    warnings.push(`Entity at index ${index} is not an object — skipped`);
    return null;
  }

  // Accept entity.name OR entity.table OR entity.model OR entity.collection
  const rawName = raw.name ?? raw.table ?? raw.model ?? raw.collection;
  const name = coerceString(rawName, '');

  if (!name) {
    warnings.push(`Entity at index ${index} has no name — skipped`);
    return null;
  }
  // Accept entity.fields OR entity.columns OR entity.attributes OR entity.properties
  const rawFields = raw.fields ?? raw.columns ?? raw.attributes ?? raw.properties ?? [];
  const fields = coerceArray(rawFields)
    .map((f, fi) => normalizeField(f, name, fi, warnings))
    .filter(Boolean);

  return { name, fields };
}

/**
 * Extract entities from any config shape.
 * Returns { entities, warnings }.
 */
function resolveEntities(config, existingWarnings = []) {
  const warnings = existingWarnings;

  // Try each known location in priority order
  const candidates = [
    { path: 'entities',         value: config?.entities },
    { path: 'database.tables',  value: config?.database?.tables },
    { path: 'models',           value: config?.models },
    { path: 'schema',           value: config?.schema },
  ];

  for (const { path, value } of candidates) {
    if (value !== undefined && value !== null) {
      const arr = coerceArray(value);
      if (arr.length > 0) {
        const entities = arr
          .map((e, i) => normalizeEntity(e, i, warnings))
          .filter(Boolean);

        if (entities.length > 0) {
          if (path !== 'entities') {
            warnings.push(`Entities resolved from "${path}" instead of "entities"`);
          }
          return { entities, warnings };
        }
      }
    }
  }

  warnings.push('No entities found in config — app will have no data entities');
  return { entities: [], warnings };
}

module.exports = resolveEntities;
module.exports.normalizeName = normalizeName;
