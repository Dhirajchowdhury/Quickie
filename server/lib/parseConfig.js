const VALID_TYPES = ['text', 'number'];

/**
 * Parse and validate a Quickie JSON config.
 * Returns { appName, entities } with defaults applied.
 */
function parseConfig(raw) {
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

  if (!config.appName || typeof config.appName !== 'string') {
    throw new Error('Config must have a string "appName"');
  }

  if (!Array.isArray(config.entities) || config.entities.length === 0) {
    throw new Error('Config must have a non-empty "entities" array');
  }

  const entities = config.entities.map((entity, ei) => {
    if (!entity.name || typeof entity.name !== 'string') {
      throw new Error(`Entity at index ${ei} must have a string "name"`);
    }

    if (!Array.isArray(entity.fields) || entity.fields.length === 0) {
      throw new Error(`Entity "${entity.name}" must have a non-empty "fields" array`);
    }

    const fields = entity.fields.map((field, fi) => {
      if (!field.name || typeof field.name !== 'string') {
        throw new Error(`Field at index ${fi} in entity "${entity.name}" must have a string "name"`);
      }

      const type = field.type || 'text';
      if (!VALID_TYPES.includes(type)) {
        throw new Error(`Field "${field.name}" has unsupported type "${type}". Allowed: ${VALID_TYPES.join(', ')}`);
      }

      return {
        name: field.name,
        type,
        required: field.required === true,
      };
    });

    return { name: entity.name, fields };
  });

  return { appName: config.appName, entities };
}

module.exports = parseConfig;
