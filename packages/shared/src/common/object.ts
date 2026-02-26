const hasOwnProperty = Object.prototype.hasOwnProperty;
const assign = Object.assign;

function isObject(target: unknown): target is Record<string, any> {
  return typeof target === 'object' && target !== null;
}

function isPlainObject(target: unknown): target is Record<keyof any, any> {
  if (!isObject(target)) {
    return false;
  }
  const proto = Object.getPrototypeOf(target);
  return proto === Object.prototype || proto === null;
}

export { hasOwnProperty, assign, isPlainObject };
