/**
 * Validate a data payload against entity field definitions.
 * Returns array of error strings — empty array means valid.
 */
function validateRecord(fields, data) {
  const errors = [];

  for (const field of fields) {
    const value = data[field.name];
    const isEmpty =
      value === undefined || value === null || String(value).trim() === '';

    if (field.required && isEmpty) {
      errors.push(`"${field.label || field.name}" is required`);
      continue;
    }

    if (isEmpty) continue;

    switch (field.type) {
      case 'number':
        if (isNaN(Number(value)))
          errors.push(`"${field.label || field.name}" must be a number`);
        break;
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)))
          errors.push(`"${field.label || field.name}" must be a valid email`);
        break;
      case 'date':
        if (isNaN(Date.parse(String(value))))
          errors.push(`"${field.label || field.name}" must be a valid date`);
        break;
      case 'boolean':
        if (typeof value !== 'boolean' && value !== 'true' && value !== 'false')
          errors.push(`"${field.label || field.name}" must be true or false`);
        break;
      // text, password — no format constraint
    }
  }

  return errors;
}

module.exports = validateRecord;
