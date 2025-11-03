# Decisões Arquiteturais — nola-god-level-deploy

Data: 2025-11-03

Este documento explica, de forma direta, por que organizei o projeto do jeito que está e o que isso significa na prática. 

Resumo rápido
- O frontend é uma SPA em React + Vite (pasta `frontend/`).
- O backend é Node.js + Express (pasta `backend/src`) e expõe a API em `/api/v1`.
- O banco é PostgreSQL; scripts de inicialização ficam em `db/init/`.
- Foi fornecido um gerador de dados em Python (`generate_data.py`) para popular a base quando preciso de muitos registros.
- Para facilitar deploy único, o `backend/Dockerfile` faz um build multi-stage: compila o frontend e coloca os arquivos estáticos dentro do backend, que os serve com Express.

Decisões principais e por que
- Monorepo simples (frontend + backend): facilita desenvolvimento local e deploys coordenados.
- React + Vite: rápido para desenvolver e compilar — é o que escolhi por produtividade e familiaridade.
- Servir o build do frontend pelo backend: evita problemas de CORS e simplifica o deploy (uma única imagem). A consequência é que, se trocar só o frontend, preciso rebuildar a imagem.
- PostgreSQL: escolha óbvia para dados relacionais; uso de scripts em `db/init/` para facilitar a criação do esquema no container.
- Gerador em Python (Faker): rápido e legível para criar muitos registros; por isso preferi Python em vez de uma solução em JS aqui.

Como o app roda (prático)
- Desenvolvimento local: `docker compose up -d --build` — sobe o banco, o backend e o gerador (quando necessário).
- Health check: `GET /api/v1/health` (retorna se o DB responde).
- Deploy no Render (config recomendada):
  - Dockerfile path: `backend/Dockerfile`
  - Build context: `.` (raiz do repositório) — isso é importante para que o Dockerfile possa copiar `frontend/`.
  - Included Paths: `backend/**` e `frontend/**` (para que apenas mudanças nessas pastas disparem build).
  - Build env var: `VITE_API_URL` (para o build do frontend). Runtime env: `DATABASE_URL`.

Notas importantes
- A aplicação aceita `DATABASE_URL` (quando deployo em PaaS) e também funciona com variáveis separadas (`DB_HOST`, etc.) no desenvolvimento.
- Em ambientes gerenciados eu permiti um comportamento de SSL mais tolerante para facilitar a conexão (isso pode ser ajustado se quiser validação mais rígida).
- Para não vazar segredos nos logs, o app agora mascara a senha da `DATABASE_URL` quando imprime a string para debug.

Trade-offs resumidos
- Pró: deploy mais simples (uma imagem que serve tudo), menos configuração de CDN/CORS.
- Contra: imagem maior e rebuild necessário mesmo para mudanças apenas do frontend.
- Porém eu não consegui fazer o deploy.
