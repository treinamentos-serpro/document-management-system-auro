const { after, before, test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const app = require('../src/app');

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

const storagePath = path.join(__dirname, '../storage');
let server;
let baseUrl;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

test('upload, listagem e download de documento', async (t) => {
  const filesBeforeUpload = new Set(fs.readdirSync(storagePath));
  t.after(() => {
    for (const file of fs.readdirSync(storagePath)) {
      if (!filesBeforeUpload.has(file)) {
        fs.unlinkSync(path.join(storagePath, file));
      }
    }
  });

  const form = new FormData();
  form.append('file', new Blob(['conteúdo de teste']), 'documento.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    body: form,
  });
  assert.equal(uploadResponse.status, 201);
  const document = await uploadResponse.json();
  assert.equal(document.originalName, 'documento.txt');
  assert.equal(document.size, 18);
  assert.ok(document.id);
  assert.ok(document.uploadedAt);
  assert.equal(Object.hasOwn(document, 'storedName'), false);

  const listResponse = await fetch(`${baseUrl}/documents`);
  assert.equal(listResponse.status, 200);
  const listedDocuments = await listResponse.json();
  assert.ok(listedDocuments.some(({ id }) => id === document.id));

  const downloadResponse = await fetch(
    `${baseUrl}/documents/${document.id}/download`,
  );
  assert.equal(downloadResponse.status, 200);
  assert.equal(await downloadResponse.text(), 'conteúdo de teste');
  assert.match(downloadResponse.headers.get('content-disposition'), /documento\.txt/);
});

test('upload sem arquivo retorna erro de validação', async () => {
  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
  });
  assert.equal(uploadResponse.status, 400);
});

test('download de documento inexistente retorna 404', async () => {
  const downloadResponse = await fetch(`${baseUrl}/documents/inexistente/download`);
  assert.equal(downloadResponse.status, 404);
});
