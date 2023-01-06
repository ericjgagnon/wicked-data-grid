/**
 * @format
 */
function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function stringContainsNumber(value: unknown): value is number {
  return isString(value) && !isNaN(Number.parseInt(value));
}

function stringContainsBool(value: unknown): value is boolean {
  return isString(value) && (value === 'true' || value === 'false');
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number';
}

function isBool(value: unknown): value is boolean {
  return typeof value === 'boolean';
}

export { isBool, isNumber, isString, stringContainsBool, stringContainsNumber };
