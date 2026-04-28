// const VALID_TYPES = ['text', 'number', 'email', 'password', 'date', 'boolean'];

// /**
//  * Parse and validate a Quickie JSON config.
//  * Returns { appName, entities, pages } with defaults applied.
//  */
// function parseConfig(raw) {
//   let config;

//   if (typeof raw === 'string') {
//     try {
//       config = JSON.parse(raw);
//     } catch {
//       throw new Error('Invalid JSON: could not parse config string');
//     }
//   } else {
//     config = raw;
//   }

//   if (!config.appName || typeof config.appName !== 'string') {
//     throw new Error('Config must have a string "appName"');
//   }

//   if (!Array.isArray(config.entities) || config.entities.length === 0) {
//     throw new Error('Config must have a non-empty "entities" array');
//   }

//   const entities = config.entities.map((entity, ei) => {
//     if (!entity.name || typeof entity.name !== 'string') {
//       throw new Error(`Entity at index ${ei} must have a string "name"`);
//     }

//     if (!Array.isArray(entity.fields) || entity.fields.length === 0) {
//       throw new Error(`Entity "${entity.name}" must have a non-empty "fields" array`);
//     }

//     const fields = entity.fields.map((field, fi) => {
//       if (!field.name || typeof field.name !== 'string') {
//         throw new Error(`Field at index ${fi} in entity "${entity.name}" must have a string "name"`);
//       }

//       const type = field.type || 'text';
//       if (!VALID_TYPES.includes(type)) {
//         throw new Error(
//           `Field "${field.name}" has unsupported type "${type}". Allowed: ${VALID_TYPES.join(', ')}`
//         );
//       }

//       return {
//         name: field.name,
//         type,
//         required: field.required === true,
//         label: field.label || field.name,
//       };
//     });

//     return { name: entity.name, fields };
//   });

//   // pages defaults to one page per entity if not provided
//   const pages = Array.isArray(config.pages)
//     ? config.pages.map((p) => ({ name: p.name, entity: p.entity }))
//     : entities.map((e) => ({ name: e.name, entity: e.name }));

//   return { appName: config.appName, entities, pages };
// }

// module.exports = parseConfig;
const VALID_TYPES = ['text', 'number', 'email', 'password', 'date', 'boolean'];

/**
 * Parse and validate a Quickie JSON config.
 * Returns normalized config with:
 * { appName, entities, pages }
 */
function parseConfig(raw) {
  let config;

  // ✅ Parse JSON if string
  if (typeof raw === 'string') {
    try {
      config = JSON.parse(raw);
    } catch {
      throw new Error('Invalid JSON: could not parse config string');
    }
  } else {
    config = raw;
  }

  // ✅ Validate appName
  if (!config.appName || typeof config.appName !== 'string') {
    throw new Error('Config must have a string "appName"');
  }

  // ✅ Validate entities
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
        throw new Error(
          `Field at index ${fi} in entity "${entity.name}" must have a string "name"`
        );
      }

      const type = field.type || 'text';

      if (!VALID_TYPES.includes(type)) {
        throw new Error(
          `Field "${field.name}" has unsupported type "${type}". Allowed: ${VALID_TYPES.join(', ')}`
        );
      }

      return {
        name: field.name,
        type,
        required: field.required === true,
        label: field.label || field.name,
      };
    });

    return {
      name: entity.name,
      fields,
    };
  });

  // ✅ ALWAYS ENSURE PAGES EXIST (CRITICAL FIX)
  let pages = [];

  if (Array.isArray(config.pages) && config.pages.length > 0) {
    pages = config.pages.map((p, pi) => {
      if (!p.name || !p.entity) {
        throw new Error(`Page at index ${pi} must have "name" and "entity"`);
      }

      return {
        name: p.name,
        entity: p.entity,
      };
    });
  } else {
    // 🔥 Auto-generate pages
    pages = entities.map((e) => ({
      name: e.name,
      entity: e.name,
    }));
  }

  return {
    appName: config.appName,
    entities,
    pages,
  };
}

module.exports = parseConfig;