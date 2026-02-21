import E_CODE_RECORD from './code.js';

type ECodeRecord = typeof E_CODE_RECORD;
type EType = keyof ECodeRecord;

class BaseError<T extends EType> extends Error {
  code: number;
  type: EType;

  constructor(type: T, sign: keyof ECodeRecord[T], message?: string) {
    super(message);
    this.code = E_CODE_RECORD[type][sign] as number;
    this.name = type + 'Error';
    this.type = type;
  }
}

export { BaseError };
