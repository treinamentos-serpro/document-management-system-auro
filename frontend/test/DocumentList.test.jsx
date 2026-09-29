import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, describe, expect, it } from 'vitest';
import DocumentList from '../src/components/DocumentList.jsx';

afterEach(cleanup);

describe('DocumentList', () => {
  it('exibe o estado de carregamento', () => {
    render(<DocumentList documents={[]} isLoading />);

    expect(screen.getByRole('status')).toHaveTextContent('Carregando documentos');
  });

  it('exibe uma mensagem de erro', () => {
    render(<DocumentList documents={[]} error="Falha ao carregar documentos." />);

    expect(screen.getByRole('alert')).toHaveTextContent('Falha ao carregar documentos.');
  });

  it('informa quando não há documentos', () => {
    render(<DocumentList documents={[]} />);

    expect(screen.getByText('Nenhum documento por aqui.')).toBeInTheDocument();
  });

  it('lista documentos com tamanho, data e ação de download', () => {
    render(
      <DocumentList
        documents={[
          {
            id: 'document-1',
            originalName: 'relatorio.pdf',
            size: 1536,
            uploadedAt: '2026-01-15T12:00:00.000Z',
          },
        ]}
        ownerId="owner-1"
      />,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(1);
    expect(screen.getByText('relatorio.pdf')).toBeInTheDocument();
    expect(screen.getByText('PDF')).toBeInTheDocument();
    expect(screen.getByText('1.5 KB')).toBeInTheDocument();
    expect(screen.getByRole('time')).toHaveAttribute('datetime', '2026-01-15T12:00:00.000Z');
    expect(screen.getByRole('button', { name: 'Baixar relatorio.pdf' })).toBeInTheDocument();
  });
});