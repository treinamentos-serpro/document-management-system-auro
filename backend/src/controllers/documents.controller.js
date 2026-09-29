const documentsService = require('../services/documents.service');

function requireOwner(request, response, next) {
  const owner = request.get('X-User-Id')?.trim();

  if (!owner) {
    return response.status(400).json({
      error: { code: 'USER_ID_REQUIRED', message: 'O cabeçalho X-User-Id é obrigatório.' },
    });
  }

  request.ownerId = owner;
  return next();
}

function upload(request, response) {
  if (!request.file) {
    return response.status(400).json({
      error: { code: 'FILE_REQUIRED', message: 'Envie um arquivo no campo "file".' },
    });
  }

  const document = documentsService.createDocument({
    owner: request.ownerId,
    file: request.file,
  });
  return response.status(201).json({ document });
}

function list(request, response) {
  const documents = documentsService.listDocuments(request.ownerId);
  return response.status(200).json({ documents });
}

async function download(request, response, next) {
  const { document, stream } = await documentsService.getDocumentForDownload(
    request.params.id,
    request.ownerId,
  );

  response.setHeader('Content-Type', 'application/octet-stream');
  response.attachment(document.originalName);
  stream.on('error', (error) => {
    if (response.headersSent) {
      response.destroy(error);
    } else {
      next(error);
    }
  });
  stream.pipe(response);
}

module.exports = { requireOwner, upload, list, download };