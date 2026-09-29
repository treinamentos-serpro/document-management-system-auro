const { randomUUID } = require('node:crypto');
const { mkdir } = require('node:fs/promises');
const multer = require('multer');
const { MAX_UPLOAD_SIZE_BYTES, STORAGE_DIRECTORY } = require('./storage');

const storage = multer.diskStorage({
  destination(_request, _file, callback) {
    mkdir(STORAGE_DIRECTORY, { recursive: true })
      .then(() => callback(null, STORAGE_DIRECTORY))
      .catch(callback);
  },
  filename(_request, _file, callback) {
    callback(null, randomUUID());
  },
});

module.exports = multer({
  storage,
  limits: {
    fileSize: MAX_UPLOAD_SIZE_BYTES,
    files: 1,
    fields: 0,
  },
});