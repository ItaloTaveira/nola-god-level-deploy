**Configuração Render (Frontend, Backend, Postgres)**

- **Objetivo:** implantar 3 serviços separados no Render: um Postgres gerenciado,
  um Backend Node/Express e o Frontend (Vite) como static site.

- **Pré-requisitos:** ter conta no Render e permissões para criar serviços.

- **Passo a passo (resumo):**

  - **1) Criar o Postgres (Managed Database)**

    - No Render Dashboard → New → Database → PostgreSQL
    - Escolha plano (free para testes), região (escolha mesma região do backend)
    - Crie a DB; após a criação copie a _External Database URL_ (formato
      postgres://USER:PASSWORD@HOST:PORT/DBNAME?sslmode=require). Guarde em segredo.

  - **2) Criar o Backend (Web Service)**

    - New → Web Service → Connect with GitHub → selecione o repositório
    - Branch: `main` (ou sua branch)
    - Environment: `Node` (alternativa: `Docker` se preferir usar o Dockerfile)
    - Root Directory: `backend`
    - Build Command: `npm ci`
    - Start Command: `npm start`
    - Health Check Path: `/api/v1/health`
    - Env Vars / Secrets: adicione um secret `DATABASE_URL` e cole a External DB URL.
    - OPTIONAL: adicione `HEALTH_FAIL_ON_DB=false` se quiser que a rota de
      health não faça o fail quando o DB estiver inacessível momentaneamente.

  - **3) Criar o Frontend (Static Site)**

    - New → Static Site → Connect with GitHub → selecione o repositório
    - Root Directory: `frontend`
    - Build Command: `npm ci && npm run build`
    - Publish Directory: `frontend/dist`
    - Env Vars: `VITE_API_URL` → `https://<SEU_BACKEND_URL>` (opcional). Se
      preferir usar caminhos relativos e servir as APIs pelo backend, deixe em branco.

  - **4) Jobs (opcional)**
    - Use os Jobs para rodar `tools/test_db_connection.js` ou `generate_data.py`.
    - Crie jobs que recebam `JOB_DATABASE_URL` como secret (cole a mesma string).

- **Checklist de deploy e troubleshooting:**

  - [ ] Backend tem `DATABASE_URL` corretamente configurado (não deixe placeholder).
  - [ ] Backend e DB estão na mesma região para melhor latência e networking.
  - [ ] Se usar Render managed DB, copie a _External Database URL_ e não a
        _Internal_ (ou vice versa, dependendo da rede). Geralmente a External URL
        funciona para o backend público.
  - [ ] Rode o Job `db-connection-test` (ou `npm run test-db` localmente) para
        verificar conectividade antes de abrir o serviço.
  - [ ] Se a aplicação falhar na inicialização com erro sobre `DATABASE_URL`,
        verifique que o valor está no formato `postgres://...` e não contém
        placeholders como `<HOST>` ou `<PASSWORD>`.
  - [ ] Por segurança: se alguma credencial foi exposta em logs/commit, gere
        uma nova senha no painel do Postgres (rotate password).

- **Observações técnicas e dicas:**
  - O backend agora aceita `DATABASE_URL` com SSL para conexões remotas
    (usa `ssl: { rejectUnauthorized: false }` internamente). Para conexões
    locais (127.0.0.1) o SSL fica desabilitado automaticamente.
  - Para builds do frontend que precisam de um `VITE_API_URL` setado no build
    time, coloque `VITE_API_URL` como Environment Variable no site estático
    (ou use `env: docker` e passe como build-arg). Preferível: usar caminhos
    relativos e servir a SPA a partir do backend (menos configuração).
  - Para popular a DB com `generate_data.py`, crie um Job com `JOB_DATABASE_URL`
    e rode o Job uma vez; evite expor credenciais em código.

Se quiser, eu gero os comandos exatos para criar os recursos via `render` CLI
ou eu atualizo `render.yaml` com os nomes e segredos que você indicar.
