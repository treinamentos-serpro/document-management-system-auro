---
description: Gera testes automatizados para um módulo do frontend React.
name: gerar-teste-frontend
argument-hint: caminho do modulo ou componente (ex. frontend/src/components/DocumentList.jsx)
agent: agent
---

# Gerar testes do frontend

Gere testes automatizados para o módulo `${input:modulo:caminho do modulo ou componente}` do frontend React.

Antes de escrever os testes, confira o `package.json` e a configuração existentes para reutilizar o runner e as ferramentas já adotadas. Se o projeto ainda não tiver infraestrutura de testes, use Vitest e React Testing Library, configure o necessário e adicione um script `test` ao `package.json` do frontend.

Requisitos:

- Cubra os principais casos de sucesso, erro e estados relevantes, como carregamento e conteúdo vazio quando aplicável.
- Para componentes, teste o comportamento e as interações observáveis pelo usuário, priorizando consultas acessíveis; evite testar detalhes internos de implementação.
- Para serviços, isole chamadas de rede e APIs do navegador com mocks; não dependa do backend nem de serviços externos.
- Mantenha os testes isolados, determinísticos e legíveis, limpando mocks e estado entre os casos.
- Coloque os testes em `frontend/test`, seguindo as convenções já existentes no projeto.
- Execute os testes adicionados e informe o comando e o resultado.
