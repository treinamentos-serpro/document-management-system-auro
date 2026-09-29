import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from '../src/App.jsx';
import { listDocuments, uploadDocument } from '../src/services/api.js';

vi.mock('../src/services/api.js', () => ({
  listDocuments: vi.fn(),
  uploadDocument: vi.fn(),
}));

afterEach(cleanup);

beforeEach(() => {
  listDocuments.mockResolvedValue([]);
  uploadDocument.mockReset();
});

describe('App', () => {
  it('mantém a lista ao reaplicar o identificador atual', async () => {
    render(<App />);
    await screen.findByText('Nenhum documento por aqui.');

    fireEvent.click(screen.getByRole('button', { name: 'Aplicar identificador' }));

    expect(screen.getByText('Nenhum documento por aqui.')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
    expect(listDocuments).toHaveBeenCalledOnce();
  });

  it('ignora a conclusão de um upload após a troca de usuário', async () => {
    let resolveUpload;
    uploadDocument.mockImplementation(() => new Promise((resolve) => {
      resolveUpload = resolve;
    }));

    render(<App />);
    await screen.findByText('Nenhum documento por aqui.');

    const fileInput = document.querySelector('input[type="file"]');
    fireEvent.change(fileInput, {
      target: { files: [new File(['conteúdo'], 'privado.txt', { type: 'text/plain' })] },
    });
    fireEvent.click(screen.getByRole('button', { name: /Enviar arquivo/ }));
    await waitFor(() => expect(uploadDocument).toHaveBeenCalledOnce());

    fireEvent.change(screen.getByRole('textbox', { name: 'ID do usuário' }), {
      target: { value: 'outro-usuario' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar identificador' }));
    await waitFor(() => expect(listDocuments).toHaveBeenLastCalledWith('outro-usuario'));

    await act(async () => {
      resolveUpload({
        id: 'documento-antigo',
        originalName: 'privado.txt',
        owner: 'demo-user',
        size: 8,
        uploadedAt: '2026-01-15T12:00:00.000Z',
      });
      await Promise.resolve();
    });

    expect(screen.queryByText('privado.txt')).not.toBeInTheDocument();
    expect(screen.getByText('Nenhum documento por aqui.')).toBeInTheDocument();
  });
});