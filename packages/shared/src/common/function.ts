function isFunction(target: unknown): target is Function {
  return typeof target === 'function';
}

export { isFunction };
