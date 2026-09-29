const path = require('node:path');
const { open } = require('node:fs/promises');
const { STORAGE_DIRECTORY } = require('../config/storage');

async function createReadStream(storageName) {
  const filePath = path.join(STORAGE_DIRECTORY, storageName);
  const handle = await open(filePath, 'r');
  return handle.createReadStream();
}

module.exports = { createReadStream };