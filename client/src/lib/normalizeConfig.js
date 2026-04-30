/**
 * Client-side config normalization.
 *
 * Mirrors the server's resolveEntities logic so the frontend can handle
 * configs that arrive from the backend already normalized, OR raw configs
 * that bypass the server (e.g. pasted directly into ConfigUpload).
 *
 * Never throws. Always returns a safe object.
 */

const VALID_TYPES = ['text', 'number', 'email', 'password', 'date', 'boolean'];
const TYPE_ALIASES = { string: 'text', int: 'number', integer: 'number', float: 'number', bool: 'boolean' };

/**
 * Normalize a name for case-insensitive, whitespace-tolerant matching.
 * "Users" === "users" === " users " → all become "users"
 */
export function normalizeName(str) {
  return String(str ?? '').trim().toLowerCase();
}

// ── Coercion helpers ─────────────────────────────────────────────────────

export function coerceBoolean(value, defaultValue = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number')  return value !== 0;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    if (['true', 'yes', '1', 'on', 'enabled'].includes(lower))  return true;
    if (['false', 'no', '0', 'off', 'disabled'].includes(lower)) return false;
  }
  return defaultValue;
}

function coerceString(value, fallback = '') {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (value !== null && value !== undefined)     return String(value).trim() || fallback;
  return fallback;
}

function coerceArray(value) {
  if (Array.isArray(value)) return value;
  if (value !== null && value !== undefined) return [value];
  return [];
}

function normalizeType(raw) {
  if (typeof raw !== 'string') return 'text';
  const lower = raw.trim().toLowerCase();
  if (TYPE_ALIASES[lower]) return TYPE_ALIASES[lower];
  if (VALID_TYPES.includes(lower)) return lower;
  return 'text';
}

// ── Field normalization ──────────────────────────────────────────────────

export function normalizeField(field) {
  if (!field || typeof field !== 'object') {
    return { name: '_unknown', type: 'text', required: false, label: 'Unknown Field' };
  }
  const rawName = field.name ?? field.key ?? field.column;
  const name    = coerceString(rawName, '_unknown');
  return {
    name,
    type:     normalizeType(field.type ?? field.dataType ?? field.data_type),
    required: coerceBoolean(field.required ?? field.notNull ?? field.not_null, false),
    label:    coerceString(field.label ?? field.displayName ?? field.display_name, name),
  };
}

// ── Entity normalization ─────────────────────────────────────────────────

function normalizeEntity(raw) {
  if (!raw || typeof raw !== 'object') return null;
  const rawName = raw.name ?? raw.table ?? raw.model ?? raw.collection;
  const name    = coerceString(rawName, '');
  if (!name) return null;

  const rawFields = raw.fields ?? raw.columns ?? raw.attributes ?? raw.properties ?? [];
  const fields    = coerceArray(rawFields).map(normalizeField);

  return { name, fields };
}

// ── Entity resolution — tries multiple config shapes ────────────────────

function resolveEntities(config) {
  const candidates = [
    config?.entities,
    config?.database?.tables,
    config?.models,
    config?.schema,
  ];

  for (const candidate of candidates) {
    if (candidate !== undefined && candidate !== null) {
      const arr      = coerceArray(candidate);
      const entities = arr.map(normalizeEntity).filter(Boolean);
      if (entities.length > 0) return entities;
    }
  }
  return [];
}

// ── Main export ──────────────────────────────────────────────────────────

/**
 * Normalize any config object into the standard Quickie shape.
 * Safe to call with null, undefined, {}, or any partial config.
 */
export default function normalizeConfig(cfg) {
  if (!cfg || typeof cfg !== 'object') return null;

  const entities = resolveEntities(cfg);

  // Build a case-insensitive lookup map: "Users" → entity named "users"
  const entityMap = Object.fromEntries(
    entities.map((e) => [normalizeName(e.name), e])
  );

  let pages = [];
  if (Array.isArray(cfg.pages) && cfg.pages.length > 0) {
    pages = cfg.pages
      .map((p) => {
        if (!p || typeof p !== 'object') return null;
        const name        = coerceString(p.name ?? p.title, '');
        const entityKey   = coerceString(p.entity ?? p.table ?? p.model, '');
        const resolvedKey = normalizeName(entityKey);
        // Only include page if we can match it to a known entity
        if (!name || !resolvedKey) return null;
        // Use the canonical entity name from the map (preserves original casing)
        const matched = entityMap[resolvedKey];
        return { name, entity: matched ? matched.name : entityKey };
      })
      .filter(Boolean);
  }

  // Fall back to auto-generating one page per entity
  if (pages.length === 0) {
    pages = entities.map((e) => ({ name: e.name, entity: e.name }));
  }

  return {
    appName:  coerceString(cfg.appName ?? cfg.name ?? cfg.title, 'Untitled App'),
    entities,
    pages,
    ui:       (cfg.ui && typeof cfg.ui === 'object') ? cfg.ui : null,
    auth:     cfg.auth && typeof cfg.auth === 'object'
                ? { ...cfg.auth, enabled: coerceBoolean(cfg.auth.enabled, true) }
                : { enabled: true },
    warnings: Array.isArray(cfg.warnings) ? cfg.warnings : [],
  };
}
