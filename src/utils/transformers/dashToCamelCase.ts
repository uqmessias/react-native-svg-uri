/**
 * Transforms a dash-case string to camelCase
 * @param {string} value
 */
const dashToCamelCase = (value: string): string =>
  value
    .replace(/(-){2,}/g, '-')
    .replace(/^-(.*)$/g, '$1')
    .replace(/^(.*)-$/g, '$1')
    .replace(/-([a-zA-Z])/g, g => g[1].toUpperCase());

export default dashToCamelCase;
