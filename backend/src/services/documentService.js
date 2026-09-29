const { randomUUID } = require('node:crypto');
const documentRepository = require('../repositories/documentRepository');

function createDocument(file, owner = null) {
  return documentRepository.create({
    id: randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storedName: file.filename,
  });
}

function listDocuments() {
  return documentRepository.findAll();
}

function findDocument(id) {
  return documentRepository.findById(id);
}

module.exports = { createDocument, listDocuments, findDocument };
