# Variáveis de ambiente — Backend (Banco)

O backend agora suporta múltivas formas de configurar a conexão com Postgres:

- Preferência por `DATABASE_URL` (ou `DATABASE_PUBLIC_URL`)
- Caso não haja URL, usa variáveis por parâmetro na ordem: `DB_*` → `PG*` → `POSTGRES_*`
- Em `DATABASE_URL`/`DATABASE_PUBLIC_URL` é aplicado `ssl: { rejectUnauthorized: false }`. No modo por parâmetros (`host`, `port`, etc.) SSL não é aplicado por padrão.

## Suportadas

- `DATABASE_URL`
- `DATABASE_PUBLIC_URL`
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
- `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

Não utilizadas pelo backend:

- `PGDATA`, `RAILWAY_DEPLOYMENT_DRAINING_SECONDS`, `SSL_CERT_DAYS`

## Exemplos de .env

### Usando URL (Railway/Render/Heroku)

```
DATABASE_URL=postgres://user:pass@host:5432/dbname?sslmode=require
# ou
DATABASE_PUBLIC_URL=postgres://user:pass@host:5432/dbname
```

### Usando parâmetros (local/Docker Compose/Railway PG\*)

```
# DB_*
DB_HOST=localhost
DB_PORT=5432
DB_USER=challenge
DB_PASSWORD=secret
DB_NAME=challenge_db

# Alternativamente PG*
PGHOST=localhost
PGPORT=5432
PGUSER=challenge
PGPASSWORD=secret
PGDATABASE=challenge_db

# Alternativamente POSTGRES_*
POSTGRES_USER=challenge
POSTGRES_PASSWORD=secret
POSTGRES_DB=challenge_db
```
