interface MongoDuplicateKeyError {
  code: 11000;
  keyValue: Record<string, unknown>;
}

export function isDuplicateKey(err: unknown): err is MongoDuplicateKeyError {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}
