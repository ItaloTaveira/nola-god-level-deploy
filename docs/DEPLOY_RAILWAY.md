# Deploy no Railway (Frontend + Backend)

Este projeto tem duas imagens Docker distintas:

- App Web (API + frontend): definido por `Dockerfile`. Roda `node src/index.js`.
- Gerador de dados: definido por `Dockerfile.data-generator`. Roda `python generate_data.py`.

Para deploy APENAS do front+back:

1. Crie um serviço no Railway a partir deste repositório e selecione `Dockerfile` (não use `Dockerfile.data-generator`).
2. Configure a variável de ambiente `DATABASE_URL` com a conexão pública do Postgres (ex.: `postgresql://USER:PASS@HOST:PORT/railway`). O backend já usa SSL automaticamente (`ssl: { rejectUnauthorized: false }`).
3. O Railway define `PORT` automaticamente; o `Dockerfile` respeita `PORT` na execução (`CMD ["sh", "-lc", "PORT=${PORT:-8000} node src/index.js"]`).

Para popular dados (opcional e separado):

- Crie outro serviço (ou execute um job único) usando `Dockerfile.data-generator`.
- Configure `DATABASE_URL` (ou as variáveis `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`).
- Execute apenas uma vez e depois pare/pausa o serviço para não reprocessar em cada deploy.
- Em provedores com pouco disco, use parâmetros pequenos (`--months 0 --daily-base 10 --stddev 2 --batch-size 50`).

Dicas:

- Este repositório inclui `.dockerignore` para garantir que arquivos do gerador não entrem na imagem do app web.
- Se quiser rodar local com docker-compose, use `docker-compose.yml` (Postgres + app) e o gerador via perfil `tools`.
