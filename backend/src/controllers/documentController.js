const path = require('node:path');
const documentService = require('../services/documentService');

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'Um arquivo é obrigatório.' });
  }

  const document = documentService.createDocument(req.file);
  const { storedName, ...responseDocument } = document;
  return res.status(201).json(responseDocument);
}

function list(_req, res) {
  return res.json(documentService.listDocuments());
}

function download(req, res) {
  const document = documentService.findDocument(req.params.id);
  if (!document) {
    return res.status(404).json({ error: 'Documento não encontrado.' });
  }

  return res.download(
    path.join(__dirname, '../../storage', document.storedName),
    document.originalName,
  );
}

module.exports = { upload, list, download };
