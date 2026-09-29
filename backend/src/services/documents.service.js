const { randomUUID } = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');
const fileRepository = require('../repositories/fileRepository');
const createHttpError = require('./httpError');

function toPublicDocument(document) {
  const { id, originalName, size, uploadedAt, owner } = document;
  return { id, originalName, size, uploadedAt, owner };
}

function createDocument({ owner, file }) {
  const document = documentsRepository.save({
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
  });

  return toPublicDocument(document);
}

function listDocuments(owner) {
  return documentsRepository.findByOwner(owner).map(toPublicDocument);
}

async function getDocumentForDownload(id, owner) {
  if (!/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(id)) {
    throw createHttpError(400, 'INVALID_DOCUMENT_ID', 'Identificador de documento inválido.');
  }

  const document = documentsRepository.findById(id);

  if (!document || document.owner !== owner) {
    throw createHttpError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
  }

  try {
    const stream = await fileRepository.createReadStream(document.storageName);
    return { document: toPublicDocument(document), stream };
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createHttpError(404, 'DOCUMENT_NOT_FOUND', 'Documento não encontrado.');
    }
    throw error;
  }
}

module.exports = { createDocument, listDocuments, getDocumentForDownload };