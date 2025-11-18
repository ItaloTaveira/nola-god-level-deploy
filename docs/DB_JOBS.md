**Como aplicar schema e popular o banco (rápido)**

Resumo: você tem 3 opções fáceis — a recomendada é usar Jobs do Render com `JOB_DATABASE_URL` (interno).

- Opção recomendada (Render Jobs, segura e direta):

  - Crie um Secret `JOB_DATABASE_URL` no Render com a Internal Database URL.
  - Crie um Job `migrate` com a imagem `postgres:15-alpine` e comando:
    - `sh -lc './tools/run_migrate.sh'`
  - Crie um Job `data-generator` com a imagem `python:3.11-slim` e comando:
    - `sh -lc './tools/run_data_generator.sh --months 3'`
  - Rode primeiro o `migrate`, verifique logs; depois rode o `data-generator`.

- Opção alternativa (local, usando External URL):

  - Copie a External DB URL do painel do Render (contains host reachable from your laptop).
  - No terminal local:
    ```bash
    export JOB_DATABASE_URL='postgres://USER:PASS@HOST:5432/DBNAME?sslmode=require'
    ./tools/run_migrate.sh
    ./tools/run_data_generator.sh --months 1
    ```

- Opção rápida única (se você quiser evitar Jobs): adicionar um endpoint administrativo para rodar a migração (posso implementar, menos seguro).

Notas:

- Comece com `--months 1` ou `--months 3` no `data-generator` para validar antes de gerar grandes volumes.
- Se `psql` reclamar de SSL, use `PGSSLMODE=require psql "$JOB_DATABASE_URL" -f db/init/01-schema.sql`.
- Se o usuário no connection string não tiver permissão para criar tabelas, use o `postgres` user ou um usuário com permissão suficiente.
