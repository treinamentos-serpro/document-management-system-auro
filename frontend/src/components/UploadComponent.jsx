import { useRef, useState } from 'react';
import { uploadDocument } from '../services/api.js';

export default function UploadComponent({ ownerId, onUploaded }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);

  function selectFile(file) {
    if (!file) return;
    setSelectedFile(file);
    setError('');
    setSuccess('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedFile || isUploading) return;

    setIsUploading(true);
    setError('');
    setSuccess('');
    try {
      const document = await uploadDocument(selectedFile, ownerId);
      onUploaded(document);
      setSelectedFile(null);
      if (inputRef.current) inputRef.current.value = '';
      setSuccess('Arquivo enviado.');
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form className="upload-form" onSubmit={handleSubmit}>
      <div
        className={`drop-zone${isDragging ? ' drop-zone-active' : ''}${selectedFile ? ' drop-zone-selected' : ''}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          selectFile(event.dataTransfer.files[0]);
        }}
      >
        <input
          ref={inputRef}
          className="file-input"
          id="document-file"
          type="file"
          onChange={(event) => selectFile(event.target.files[0])}
          disabled={isUploading}
        />
        <label className="drop-zone-label" htmlFor="document-file">
          <span className="upload-symbol" aria-hidden="true">↑</span>
          <span className="drop-copy">
            <strong>{selectedFile ? selectedFile.name : 'Solte um arquivo aqui'}</strong>
            <span>{selectedFile ? formatFileSize(selectedFile.size) : 'ou escolha no dispositivo'}</span>
          </span>
          <span className="choose-file">Escolher arquivo</span>
        </label>
      </div>

      <div className="upload-actions">
        <div className="upload-feedback" aria-live="polite">
          {error && <span className="feedback-error" role="alert">{error}</span>}
          {success && <span className="feedback-success" role="status">{success}</span>}
          {!error && !success && <span>Todos os formatos · Até 10 MB</span>}
        </div>
        <button className="primary-button" type="submit" disabled={!selectedFile || isUploading}>
          {isUploading ? <><span className="button-spinner" aria-hidden="true" /> Enviando</> : 'Enviar arquivo'}
          {!isUploading && <span aria-hidden="true">↗</span>}
        </button>
      </div>
    </form>
  );
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}