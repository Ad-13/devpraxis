interface MongoDuplicateKeyError {
  code: 11000;
  keyValue: Record<string, unknown>;
}
interface MongooseCastError {
  name: 'CastError';
  path: string;
  value: unknown;
}

export function isMongooseCastError(err: unknown): err is MongooseCastError {
  return typeof err === 'object' && err !== null && 'name' in err && err.name === 'CastError';
}

export function isDuplicateKey(err: unknown): err is MongoDuplicateKeyError {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 11000;
}
