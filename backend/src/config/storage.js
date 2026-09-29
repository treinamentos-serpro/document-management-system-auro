const path = require('node:path');

const DEFAULT_MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024;
const configuredMaxUploadSize = process.env.MAX_UPLOAD_SIZE_BYTES;
const MAX_UPLOAD_SIZE_BYTES = configuredMaxUploadSize === undefined
  ? DEFAULT_MAX_UPLOAD_SIZE_BYTES
  : Number(configuredMaxUploadSize);

if (!Number.isSafeInteger(MAX_UPLOAD_SIZE_BYTES) || MAX_UPLOAD_SIZE_BYTES < 1) {
  throw new Error('MAX_UPLOAD_SIZE_BYTES deve ser um inteiro positivo.');
}

const STORAGE_DIRECTORY = path.resolve(
  process.env.STORAGE_DIR || path.join(__dirname, '../../storage'),
);

module.exports = { MAX_UPLOAD_SIZE_BYTES, STORAGE_DIRECTORY };