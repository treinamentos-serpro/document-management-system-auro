const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { once } = require('node:events');

const storageDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'dms-test-'));
process.env.STORAGE_DIR = storageDirectory;
process.env.MAX_UPLOAD_SIZE_BYTES = '64';
const app = require('../src/app');
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await once(server, 'listening');
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  await fs.promises.rm(storageDirectory, { recursive: true, force: true });
});

test('faz upload, lista somente documentos do dono e baixa o arquivo', async () => {
  const form = new FormData();
  form.append('file', new Blob(['conteúdo de teste']), 'documento.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'usuario-a' },
    body: form,
  });

  assert.equal(uploadResponse.status, 201);
  const { document } = await uploadResponse.json();
  assert.deepEqual(Object.keys(document).sort(), [
    'id', 'originalName', 'owner', 'size', 'uploadedAt',
  ]);
  assert.equal(document.originalName, 'documento.txt');
  assert.equal(document.owner, 'usuario-a');
  assert.equal(document.size, Buffer.byteLength('conteúdo de teste'));
  assert.equal(Number.isNaN(Date.parse(document.uploadedAt)), false);
  assert.equal(fs.readdirSync(storageDirectory).length, 1);

  const listResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'usuario-a' },
  });
  assert.deepEqual(await listResponse.json(), { documents: [document] });

  const otherUserResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'usuario-b' },
  });
  assert.deepEqual(await otherUserResponse.json(), { documents: [] });

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'usuario-a' },
  });
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'conteúdo de teste');
  assert.match(downloadResponse.headers.get('content-disposition'), /documento\.txt/);

  const unauthorizedResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': 'usuario-b' },
  });
  assert.equal(unauthorizedResponse.status, 404);
  assert.deepEqual(await unauthorizedResponse.json(), {
    error: { code: 'DOCUMENT_NOT_FOUND', message: 'Documento não encontrado.' },
  });
});

test('retorna erros JSON para identidade ou arquivo ausentes', async () => {
  const missingOwnerResponse = await fetch(`${baseUrl}/documents`);
  assert.equal(missingOwnerResponse.status, 400);
  assert.deepEqual(await missingOwnerResponse.json(), {
    error: { code: 'USER_ID_REQUIRED', message: 'O cabeçalho X-User-Id é obrigatório.' },
  });

  const form = new FormData();
  const missingFileResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'usuario-a' },
    body: form,
  });
  assert.equal(missingFileResponse.status, 400);
  assert.deepEqual(await missingFileResponse.json(), {
    error: { code: 'FILE_REQUIRED', message: 'Envie um arquivo no campo "file".' },
  });
});

test('rejeita arquivos acima do limite e não deixa arquivo parcial', async () => {
  const form = new FormData();
  form.append('file', new Blob(['x'.repeat(65)]), 'grande.txt');

  const response = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': 'usuario-a' },
    body: form,
  });

  assert.equal(response.status, 413);
  assert.deepEqual(await response.json(), {
    error: {
      code: 'FILE_TOO_LARGE',
      message: 'O arquivo excede o tamanho máximo permitido.',
    },
  });
  assert.equal(fs.readdirSync(storageDirectory).length, 1);
});
