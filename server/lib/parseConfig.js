const VALID_TYPES = ['text', 'number', 'email', 'password', 'date', 'boolean'];

/**
 * Sanitize a single field definition.
 * Never throws — always returns a safe object.
 */
function sanitizeField(field, entityName, index, warnings) {
  // field.name is the only hard requirement — without it we can't key the field
  if (!field || typeof field.name !== 'string' || !field.name.trim()) {
    warnings.push(`Entity "${entityName}": field at index ${index} has no name — skipped`);
    return null; // caller filters nulls out
  }

  const rawType = field.type;
  let type = 'text';

  if (rawType === undefined || rawType === null) {
    // No type provided — silently default
    type = 'text';
  } else if (typeof rawType !== 'string') {
    warnings.push(`Entity "${entityName}" › field "${field.name}": type is not a string — defaulting to "text"`);
    type = 'text';
  } else if (!VALID_TYPES.includes(rawType)) {
    warnings.push(`Entity "${entityName}" › field "${field.name}": unknown type "${rawType}" — defaulting to "text"`);
    type = 'text';
  } else {
    type = rawType;
  }

  return {
    name:     field.name.trim(),
    type,
    required: field.required === true,
    label:    typeof field.label === 'string' && field.label.trim()
                ? field.label.trim()
                : field.name.trim(),
  };
}

/**
 * Sanitize a single entity definition.
 * Returns null (with a warning) if the entity has no usable name.
 */
function sanitizeEntity(entity, index, warnings) {
  if (!entity || typeof entity.name !== 'string' || !entity.name.trim()) {
    warnings.push(`Entity at index ${index} has no name — skipped`);
    return null;
  }

  const name = entity.name.trim();

  if (!Array.isArray(entity.fields) || entity.fields.length === 0) {
    warnings.push(`Entity "${name}" has no fields — it will render with an empty form`);
    return { name, fields: [] };
  }

  const fields = entity.fields
    .map((f, fi) => sanitizeField(f, name, fi, warnings))
    .filter(Boolean); // remove nulls from skipped fields

  if (fields.length === 0) {
    warnings.push(`Entity "${name}": all fields were invalid — it will render with an empty form`);
  }

  return { name, fields };
}

/**
 * Parse and validate a Quickie JSON config.
 *
 * Returns { appName, entities, pages, warnings }
 *
 * Throws ONLY for unrecoverable errors:
 *   - Input is not valid JSON (when passed as a string)
 *   - Input is not an object
 *
 * Everything else produces a warning and degrades gracefully.
 */
function parseConfig(raw) {
  const warnings = [];

  // ── 1. Parse JSON string if needed ──────────────────────────────────────
  let config;
  if (typeof raw === 'string') {
    try {
      config = JSON.parse(raw);
    } catch {
      throw new Error('Invalid JSON: could not parse config string');
    }
  } else {
    config = raw;
  }

  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    throw new Error('Config must be a JSON object');
  }

  // ── 2. appName — warn and default, never throw ───────────────────────────
  let appName;
  if (!config.appName || typeof config.appName !== 'string' || !config.appName.trim()) {
    warnings.push('No "appName" provided — defaulting to "Untitled App"');
    appName = 'Untitled App';
  } else {
    appName = config.appName.trim();
  }

  // ── 3. entities — optional, default to [] ───────────────────────────────
  let entities = [];
  if (!Object.prototype.hasOwnProperty.call(config, 'entities')) {
    warnings.push('No "entities" key found — app will have no data entities');
  } else if (!Array.isArray(config.entities)) {
    warnings.push('"entities" is not an array — treating as empty');
  } else if (config.entities.length === 0) {
    warnings.push('"entities" array is empty — app will have no data entities');
  } else {
    entities = config.entities
      .map((e, i) => sanitizeEntity(e, i, warnings))
      .filter(Boolean);

    if (entities.length === 0) {
      warnings.push('All entities were invalid and were skipped');
    }
  }

  // ── 4. pages — auto-generate from entities if not provided ──────────────
  let pages = [];
  if (Array.isArray(config.pages) && config.pages.length > 0) {
    pages = config.pages
      .map((p, i) => {
        if (!p || typeof p.name !== 'string' || typeof p.entity !== 'string') {
          warnings.push(`Page at index ${i} is missing "name" or "entity" — skipped`);
          return null;
        }
        return { name: p.name.trim(), entity: p.entity.trim() };
      })
      .filter(Boolean);

    if (pages.length === 0) {
      warnings.push('All pages were invalid — falling back to auto-generated pages');
      pages = entities.map((e) => ({ name: e.name, entity: e.name }));
    }
  } else {
    // Auto-generate one page per entity
    pages = entities.map((e) => ({ name: e.name, entity: e.name }));
  }

  return { appName, entities, pages, warnings };
}

module.exports = parseConfig;
