const path = require('node:path');
const { open } = require('node:fs/promises');
const { STORAGE_DIRECTORY } = require('../config/storage');

async function createReadStream(storageName) {
  if (typeof storageName !== 'string' || !storageName || path.basename(storageName) !== storageName) {
    throw new Error('Nome interno de arquivo inválido.');
  }

  const filePath = path.resolve(STORAGE_DIRECTORY, storageName);
  const relativePath = path.relative(STORAGE_DIRECTORY, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error('Caminho de arquivo fora do diretório de armazenamento.');
  }

  const handle = await open(filePath, 'r');
  return handle.createReadStream();
}

module.exports = { createReadStream };