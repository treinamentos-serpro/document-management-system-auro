import DownloadButton from './DownloadButton.jsx';
import formatFileSize from '../utils/formatFileSize.js';

export default function DocumentList({ documents, ownerId, isLoading, error }) {
  if (isLoading) {
    return <div className="list-state" role="status">Carregando documentos<span className="loading-dots">...</span></div>;
  }

  if (error) {
    return <div className="list-state list-state-error" role="alert">{error}</div>;
  }

  if (documents.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-mark" aria-hidden="true"><span /><span /><span /></div>
        <p>Nenhum documento por aqui.</p>
        <span>Os arquivos enviados aparecerão nesta lista.</span>
      </div>
    );
  }

  return (
    <div className="document-list" role="list">
      <div className="document-list-header" aria-hidden="true">
        <span>ARQUIVO</span>
        <span>TAMANHO</span>
        <span>DATA DE ENVIO</span>
        <span />
      </div>
      {documents.map((document) => (
        <div className="document-row" role="listitem" key={document.id}>
          <div className="document-name-cell">
            <span className="file-badge" aria-hidden="true">{getExtension(document.originalName)}</span>
            <span className="document-name" title={document.originalName}>{document.originalName}</span>
          </div>
          <span className="document-size">{formatFileSize(document.size)}</span>
          <time className="document-date" dateTime={document.uploadedAt}>
            {formatDate(document.uploadedAt)}
          </time>
          <DownloadButton
            documentId={document.id}
            originalName={document.originalName}
            ownerId={ownerId}
          />
        </div>
      ))}
    </div>
  );
}

function getExtension(fileName) {
  const extension = fileName.split('.').pop();
  return extension && extension !== fileName ? extension.slice(0, 4).toUpperCase() : 'FILE';
}

function formatDate(value) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}