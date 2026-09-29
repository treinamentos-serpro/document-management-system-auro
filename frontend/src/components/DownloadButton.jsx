import { useState } from 'react';
import { downloadDocument } from '../services/api.js';

export default function DownloadButton({ documentId, originalName, ownerId }) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    if (isDownloading) return;
    setIsDownloading(true);
    setError('');
    try {
      await downloadDocument(documentId, originalName, ownerId);
    } catch (downloadError) {
      setError(downloadError.message);
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <div className="download-cell">
      <button
        className="download-button"
        type="button"
        onClick={handleDownload}
        disabled={isDownloading}
        aria-label={`Baixar ${originalName}`}
        title={error || `Baixar ${originalName}`}
      >
        <span aria-hidden="true">{isDownloading ? '…' : '↓'}</span>
        <span>{isDownloading ? 'Baixando' : 'Baixar'}</span>
      </button>
      {error && <span className="download-error" role="alert">{error}</span>}
    </div>
  );
}