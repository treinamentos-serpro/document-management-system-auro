const API_PREFIX = '/api';

async function readJson(response) {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Não foi possível concluir a solicitação.');
  }
  return payload;
}

export async function listDocuments(ownerId) {
  const response = await fetch(`${API_PREFIX}/documents`, {
    headers: { 'X-User-Id': ownerId },
  });
  const payload = await readJson(response);
  return payload.documents;
}

export async function uploadDocument(file, ownerId) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_PREFIX}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': ownerId },
    body: formData,
  });
  const payload = await readJson(response);
  return payload.document;
}

export async function downloadDocument(documentId, originalName, ownerId) {
  const response = await fetch(
    `${API_PREFIX}/documents/${encodeURIComponent(documentId)}/download`,
    { headers: { 'X-User-Id': ownerId } },
  );

  if (!response.ok) {
    await readJson(response);
    return;
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = originalName;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}