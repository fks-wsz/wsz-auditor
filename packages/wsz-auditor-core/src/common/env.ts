const __DEV__ = process.env.NODE_ENV === 'development';
const __DEBUG__ = process.env.DEBUG === 'true';

globalThis.__DEV__ = __DEV__;
globalThis.__DEBUG__ = __DEBUG__;
