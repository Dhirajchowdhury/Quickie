const { coerceBoolean, coerceString } = require('./coerce');
const resolveEntities = require('./resolveEntities');

/**
 * parseConfig — the single entry point for all config processing.
 *
 * Accepts any JSON shape. Never throws except for truly unrecoverable input
 * (not a JSON string, not an object).
 *
 * Returns:
 *   { appName, entities, pages, ui, auth, warnings }
 */
function parseConfig(raw) {
  const warnings = [];

  // ── 1. Parse string input ────────────────────────────────────────────────
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

  // ── 2. appName ───────────────────────────────────────────────────────────
  const appName = coerceString(
    config.appName ?? config.name ?? config.title,
    'Untitled App'
  );
  if (appName === 'Untitled App') {
    warnings.push('No "appName" provided — defaulting to "Untitled App"');
  }

  // ── 3. entities — multi-format resolution ────────────────────────────────
  const { entities, warnings: entityWarnings } = resolveEntities(config, warnings);

  // ── 4. pages — auto-generate if missing ─────────────────────────────────
  let pages = [];
  if (Array.isArray(config.pages) && config.pages.length > 0) {
    pages = config.pages
      .map((p, i) => {
        if (!p || typeof p !== 'object') {
          warnings.push(`Page at index ${i} is not an object — skipped`);
          return null;
        }
        const name   = coerceString(p.name ?? p.title, '');
        const entity = coerceString(p.entity ?? p.table ?? p.model, '');
        if (!name || !entity) {
          warnings.push(`Page at index ${i} is missing "name" or "entity" — skipped`);
          return null;
        }
        return { name, entity };
      })
      .filter(Boolean);

    if (pages.length === 0) {
      warnings.push('All pages were invalid — auto-generating from entities');
    }
  }

  if (pages.length === 0) {
    pages = entities.map((e) => ({ name: e.name, entity: e.name }));
  }

  // ── 5. ui block — preserve as-is, just ensure it's an object or null ────
  const ui = (config.ui && typeof config.ui === 'object') ? config.ui : null;

  // ── 6. auth — coerce enabled flag ────────────────────────────────────────
  const auth = config.auth && typeof config.auth === 'object'
    ? { ...config.auth, enabled: coerceBoolean(config.auth.enabled, true) }
    : { enabled: true };

  return { appName, entities, pages, ui, auth, warnings };
}

module.exports = parseConfig;
