# Backend (API) — Nola God Level

Este diretório contém uma API inicial em FastAPI para começar a trabalhar com o projeto.

Funcionalidades iniciais:

- Endpoint de health check: `GET /api/v1/health/` — verifica conectividade com o banco Postgres

`````markdown
# Backend (API) — Nola God Level

Este diretório contém uma API inicial em Node.js + Express para começar a trabalhar com o projeto.

Funcionalidades iniciais:

- Endpoint de health check: `GET /api/v1/health/` — verifica conectividade com o banco Postgres

Como usar (local):

````markdown
# Backend (API) — Nola God Level

Este diretório contém uma API inicial em Node.js + Express para o projeto.

Funcionalidades iniciais:

- Endpoint de health check: `GET /api/v1/health` — verifica conectividade com o banco Postgres
- Endpoints de métricas: `GET /api/v1/metrics/*` (revenue, top-products, sales-by-channel)

Como usar (local):

1. Instale dependências:

```bash
cd backend
npm install
```
````
`````

2. Crie um arquivo `.env` na raiz do `backend/` (ou copie `.env.example`) com as variáveis de conexão do Postgres.

3. Rode a aplicação em desenvolvimento:

```bash
npm run dev
```

Teste de health:

```bash
curl http://localhost:8000/api/v1/health
```

Endpoints implementados (inicial):

- `GET /api/v1/metrics/revenue?start=YYYY-MM-DD&end=YYYY-MM-DD`

  - Retorna faturamento agregado por dia no intervalo. Se não passar `start`/`end`, usa últimos 30 dias.
  - Response: `{ ok: true, data: [{ day: '2024-01-01', revenue: 12345.67, sales: 234 }, ...] }`

- `GET /api/v1/metrics/top-products?start=&end=&limit=10`

  - Retorna produtos mais vendidos no período (qty e revenue).

- `GET /api/v1/metrics/sales-by-channel?start=&end=`
  - Retorna número de vendas e receita por canal.

Rodando testes:

```bash
npm test
```

Importar para Insomnia / Postman

Você pode importar a coleção pronta do Insomnia em `backend/insomnia_collection.json` ou apontar o Insomnia/Postman para o OpenAPI JSON exposto em `/openapi.json`.

- Import via arquivo (Insomnia): Arquivo -> Import -> From File -> selecione `backend/insomnia_collection.json`.
- Import via URL: em Insomnia/Postman, escolha importar OpenAPI/Swagger e use: `http://localhost:8000/openapi.json` (depois de rodar `npm run dev`).

Próximos passos sugeridos:

- Mapear o schema (`database-schema.sql`) para repositórios/queries específicas
- Adicionar caches para queries pesadas (Redis)
- Adicionar autenticação (JWT) e controle de acesso
- Criar endpoints de agregação adicionais (p90 delivery, ticket médio, churn)

```

```

```

```
