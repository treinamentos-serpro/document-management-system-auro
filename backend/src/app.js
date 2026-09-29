// Seed do servidor backend do Document Management System.
//
// Este arquivo é apenas um ponto de partida mínimo. Ao longo do workshop você
// vai usar o Agent Mode do GitHub Copilot para construir as camadas:
//   - routes/       (definição das rotas)
//   - controllers/  (entrada HTTP e validação)
//   - services/     (regras de negócio)
//   - repositories/ (persistência: arquivos locais + metadados em memória)
//
// Restrição do projeto: uploads são gravados no filesystem local da aplicação
// usando multer com diskStorage. Não utilize provedores externos.

const express = require('express');
const documentRoutes = require('./routes/documents.routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(documentRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use((req, res) => {
  res.status(404).json({
    error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' },
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  const uploadErrors = {
    LIMIT_FILE_SIZE: {
      status: 413,
      code: 'FILE_TOO_LARGE',
      message: 'O arquivo excede o tamanho máximo permitido.',
    },
    LIMIT_UNEXPECTED_FILE: {
      status: 400,
      code: 'INVALID_FILE_FIELD',
      message: 'Envie um único arquivo no campo "file".',
    },
  };
  const mappedError = uploadErrors[error.code];
  const status = mappedError?.status || error.status || 500;
  const code = mappedError?.code || (status >= 500 ? 'INTERNAL_ERROR' : error.code);
  const message = mappedError?.message
    || (status >= 500 ? 'Erro interno do servidor.' : error.message);

  if (status >= 500) {
    console.error(error);
  }

  return res.status(status).json({ error: { code, message } });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`DMS backend ouvindo na porta ${PORT}`);
  });
}

module.exports = app;
