# Especificação - Document Management System

## 1. Objetivo

Oferecer uma interface web simples para usuários enviarem, listarem e baixarem seus documentos, armazenados localmente pela aplicação.

## 2. Escopo

### Dentro do escopo

- Upload de um documento por requisição.
- Listagem dos documentos do usuário identificado na requisição.
- Download de um documento pertencente ao usuário.
- Metadados mantidos em memória durante a execução do backend.
- Interface React para upload, listagem e download.
- Armazenamento dos arquivos no filesystem local com Multer `diskStorage`.

### Fora do escopo

- Autenticação, cadastro ou gestão de credenciais de usuários.
- Armazenamento externo, em nuvem ou serviços de terceiros.
- Persistência de metadados em banco de dados.
- Versionamento, edição, compartilhamento ou exclusão de documentos.
- Busca, paginação e categorização de documentos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário pode enviar um arquivo usando o formulário de upload. |
| RF-02 | O backend valida que um arquivo foi enviado e rejeita arquivos acima do limite configurado. |
| RF-03 | O sistema gera um identificador único e um nome interno seguro para cada arquivo. |
| RF-04 | O sistema registra nome original, tamanho, data de upload e dono nos metadados. |
| RF-05 | O usuário pode listar somente os documentos associados ao seu identificador. |
| RF-06 | O usuário pode baixar um documento pelo identificador, se ele pertencer a esse usuário. |
| RF-07 | A interface apresenta estados de carregamento, sucesso e erro para upload e listagem. |
| RF-08 | A interface permite iniciar o download de cada documento listado. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend usa Node.js, Express e CommonJS; o frontend usa React, Vite e ESM. |
| RNF-02 | Os arquivos são gravados em `backend/storage` por padrão, usando Multer `diskStorage`. |
| RNF-03 | Os arquivos usam nomes internos gerados pelo sistema; o nome original não determina o caminho salvo. |
| RNF-04 | Metadados são mantidos em memória e podem ser perdidos ao reiniciar o backend. |
| RNF-05 | Porta, diretório de armazenamento e limite de upload são configuráveis por variáveis de ambiente. |
| RNF-06 | O tamanho máximo padrão é 10 MiB, configurável por `MAX_UPLOAD_SIZE_BYTES`. |
| RNF-07 | Erros HTTP têm resposta JSON consistente e não expõem caminhos locais nem detalhes internos. |
| RNF-08 | O backend é testado com `node:test`; a solução evita dependências além das já presentes, salvo necessidade justificada. |

## 5. Modelo de dados

| Campo | Tipo | Descrição |
| --- | --- | --- |
| `id` | string (UUID) | Identificador público e único do documento. |
| `originalName` | string | Nome fornecido pelo cliente, usado para exibição e download. |
| `size` | number | Tamanho do arquivo em bytes. |
| `uploadedAt` | string (ISO 8601 UTC) | Data e hora de conclusão do upload. |
| `owner` | string | Identificador do usuário associado à requisição. |
| `storageName` | string | Nome interno aleatório do arquivo no filesystem; nunca retornado pela API. |

Os metadados são mantidos em memória. O caminho completo do arquivo é derivado do diretório configurado e do `storageName`, não de entrada do usuário.

## 6. Contratos de API

A API do backend expõe os caminhos abaixo. No frontend, as chamadas usam o prefixo `/api`; o proxy do Vite o remove antes de encaminhar ao backend.

### Identificação do usuário

As requisições de upload, listagem e download devem incluir `X-User-Id` com um identificador não vazio. Nesta versão, o cabeçalho identifica o dono, mas não autentica sua identidade; não deve ser tratado como mecanismo seguro de autorização.

### `POST /upload`

- Entrada: `multipart/form-data`, campo `file`; cabeçalho `X-User-Id`.
- Sucesso: `201 Created`, corpo `{ "document": { ...metadados públicos... } }`.
- Erros: `400` para arquivo ausente ou inválido; `413` para arquivo acima do limite; `500` para falha inesperada de armazenamento.

### `GET /documents`

- Entrada: cabeçalho `X-User-Id`.
- Sucesso: `200 OK`, corpo `{ "documents": [ ...metadados públicos... ] }`.
- A lista contém somente documentos do usuário identificado e pode ser vazia.
- Erros: `400` se o cabeçalho estiver ausente ou vazio; `500` para falha inesperada.

### `GET /documents/:id/download`

- Entrada: identificador do documento na URL e cabeçalho `X-User-Id`.
- Sucesso: `200 OK`, conteúdo binário com `Content-Disposition: attachment` e nome original seguro.
- Erros: `400` para identificador inválido ou cabeçalho ausente; `404` para documento inexistente, arquivo ausente ou documento de outro usuário; `500` para falha inesperada de leitura.

### Formato de erro

Respostas de erro usam `{ "error": { "code": "CODIGO", "message": "Descrição" } }`. As mensagens destinadas à interface são em português; detalhes internos ficam apenas nos logs do servidor.

## 7. Decisões arquiteturais e riscos

- Fluxo do backend: `routes -> controllers -> services -> repositories`. Rotas conectam middleware e controllers; controllers validam a entrada HTTP; services aplicam as regras; repositories encapsulam metadados e acesso aos arquivos.
- Multer com `diskStorage` grava uploads no diretório local configurado. A configuração do upload fica isolada e é aplicada na rota; não se usa armazenamento externo.
- A identidade vem de `X-User-Id` apenas como convenção de MVP. Sem autenticação, o cliente pode declarar outro identificador; não há garantia real de isolamento entre usuários.
- Como os metadados são voláteis, reiniciar o processo pode deixar arquivos sem referência no diretório. Recuperação, limpeza automática e persistência não fazem parte desta versão.
- O frontend usa `fetch` e o prefixo `/api`, conforme o proxy existente no Vite.

## 8. Plano de execução

O único artefato desta etapa de planejamento é `docs/specs/dms-spec.md`. As etapas abaixo descrevem trabalho futuro; não incluem implementar agora os arquivos de backend ou frontend.

1. **Consolidar a especificação**
   - Arquivos: `docs/specs/dms-spec.md`.
   - Aceite: escopo, requisitos, modelo, contratos, decisões, riscos e etapas estão documentados e coerentes com as restrições do projeto.

2. **Implementar upload e persistência local**
   - Arquivos futuros: `backend/src/routes/`, `controllers/`, `services/`, `repositories/` e configuração de upload; `backend/test/`.
   - Aceite: upload válido grava em `backend/storage` via `diskStorage`, registra metadados em memória e cobre validações e erros com testes.

3. **Implementar listagem e download**
   - Arquivos futuros: camadas correspondentes em `backend/src/` e testes em `backend/test/`.
   - Aceite: listagem respeita o dono; download transmite o arquivo correto; acesso inexistente ou de outro dono retorna `404`.

4. **Construir a interface**
   - Arquivos futuros: `frontend/src/App.jsx`, `frontend/src/components/`, `frontend/src/pages/` e `frontend/src/services/`.
   - Aceite: usuário consegue enviar, consultar e baixar documentos; estados de carregamento e erros são apresentados.

5. **Integrar e validar o fluxo**
   - Arquivos futuros: testes de backend e arquivos de configuração/documentação somente se necessário.
   - Aceite: frontend comunica-se com o backend pelo proxy `/api`; testes e build do frontend passam; configuração de ambiente e limitações do MVP estão documentadas.