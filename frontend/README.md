# Frontend — Nola Dashboard

Pequeno dashboard em React (Vite) para visualizar rapidamente as métricas do backend.

Como rodar:

```bash
cd frontend
npm install
npm run dev
```

Tailwind setup notes:

If you add Tailwind dev dependencies, Vite will process Tailwind in dev mode automatically. For production build, run:

```bash
npm run build
```

A aplicação consome a variável `VITE_API_URL` (ex: `http://localhost:8000`). Por padrão usa `http://localhost:8000`.

Endpoints usados:

- GET /api/v1/metrics/revenue
- GET /api/v1/metrics/top-products
- GET /api/v1/metrics/sales-by-channel

Observações:

- Esse é um dashboard inicial. Para produção adicionar rate-limit, CORS restrito e autenticação.
- Se o backend estiver rodando via docker-compose, use `VITE_API_URL=http://localhost:8000`.
