import { useEffect, useRef, useState } from 'react';
import DocumentList from './components/DocumentList.jsx';
import UploadComponent from './components/UploadComponent.jsx';
import { listDocuments } from './services/api.js';
import formatFileSize from './utils/formatFileSize.js';
import './App.css';

export default function App() {
  const [ownerId, setOwnerId] = useState('demo-user');
  const [ownerDraft, setOwnerDraft] = useState('demo-user');
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const ownerIdRef = useRef(ownerId);

  useEffect(() => {
    let isCurrent = true;

    setIsLoading(true);
    setLoadError('');
    listDocuments(ownerId)
      .then((result) => {
        if (isCurrent) setDocuments(result);
      })
      .catch((error) => {
        if (isCurrent) {
          setDocuments([]);
          setLoadError(error.message);
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [ownerId]);

  function handleOwnerSubmit(event) {
    event.preventDefault();
    const nextOwner = ownerDraft.trim();
    if (nextOwner && nextOwner !== ownerId) {
      ownerIdRef.current = nextOwner;
      setOwnerId(nextOwner);
      setDocuments([]);
      setIsLoading(true);
      setLoadError('');
    }
  }

  function handleUploaded(document, uploadedOwnerId) {
    if (uploadedOwnerId !== ownerIdRef.current) return;

    setDocuments((currentDocuments) => [
      document,
      ...currentDocuments.filter((item) => item.id !== document.id),
    ]);
  }

  const totalBytes = documents.reduce((total, document) => total + document.size, 0);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#main" aria-label="DMS, início">
          <span className="brand-mark">D</span>
          <span className="brand-name">dms<span>.</span></span>
        </a>

        <div className="workspace-label">ESPAÇO DE TRABALHO</div>
        <nav className="primary-nav" aria-label="Navegação principal">
          <a className="nav-item nav-item-active" href="#documents" aria-current="page">
            <span className="nav-glyph" aria-hidden="true">▤</span>
            <span>Documentos</span>
            <span className="nav-count">{documents.length}</span>
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="identity-heading">IDENTIFICAÇÃO</div>
          <form className="identity-form" onSubmit={handleOwnerSubmit}>
            <label htmlFor="owner-id">ID do usuário</label>
            <div className="identity-input-row">
              <input
                id="owner-id"
                aria-label="ID do usuário"
                value={ownerDraft}
                onChange={(event) => setOwnerDraft(event.target.value)}
                maxLength={80}
                autoComplete="off"
              />
              <button type="submit" aria-label="Aplicar identificador" title="Aplicar">
                ↵
              </button>
            </div>
          </form>
          <div className="identity-note">Sessão local</div>
        </div>
      </aside>

      <main className="main-content" id="main">
        <header className="topbar">
          <div className="breadcrumbs"><span>Biblioteca</span><span>/</span><strong>Documentos</strong></div>
          <div className="current-user">
            <span className="user-avatar" aria-hidden="true">{ownerId.slice(0, 1).toUpperCase()}</span>
            <span>{ownerId}</span>
          </div>
        </header>

        <div className="page-content">
          <section className="page-heading" id="documents">
            <div>
              <div className="eyebrow">BIBLIOTECA PESSOAL</div>
              <h1>Documentos</h1>
            </div>
            <div className="heading-stats" aria-live="polite">
              <div className="heading-stat">
                <span className="stat-value">{documents.length}</span>
                <span className="stat-label">arquivos</span>
              </div>
              <span className="stat-divider" aria-hidden="true" />
              <div className="heading-stat">
                <span className="stat-value">{formatFileSize(totalBytes)}</span>
                <span className="stat-label">armazenados</span>
              </div>
            </div>
          </section>

          <section className="upload-section" aria-labelledby="upload-heading">
            <div className="section-heading">
              <div>
                <span className="section-index">01</span>
                <h2 id="upload-heading">Adicionar arquivo</h2>
              </div>
              <span className="section-meta">UPLOAD</span>
            </div>
            <UploadComponent key={ownerId} ownerId={ownerId} onUploaded={handleUploaded} />
          </section>

          <section className="documents-section" aria-labelledby="list-heading">
            <div className="section-heading list-heading">
              <div>
                <span className="section-index">02</span>
                <h2 id="list-heading">Seus arquivos</h2>
              </div>
              <span className="section-meta">{documents.length} ITENS</span>
            </div>
            <DocumentList
              documents={documents}
              ownerId={ownerId}
              isLoading={isLoading}
              error={loadError}
            />
          </section>

          <footer className="page-footer">
            <span>ARQUIVOS NO ARMAZENAMENTO LOCAL</span>
            <span>METADADOS ATIVOS NESTA SESSÃO</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
