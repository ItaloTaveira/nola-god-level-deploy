# Deploy no Render — passos rápidos

Este guia mostra os passos mínimos para criar um único Web Service (backend + frontend) e um Job para popular os dados.

1. Criar um banco Postgres no Render (opcional)

   - No painel do Render, clique em "New" → "Postgres" (ou "Databases") e crie a instância.
   - No final do processo copie a connection string (ex: `postgres://USER:PASSWORD@HOST:5432/DBNAME?sslmode=require`).

2. Criar o Web Service (Docker)

   - Método A (recomendado): usar `render.yaml` que já está no repositório.

     - No Console do Render, escolha "New" → "Static Site / Web Service" e selecione "Deploy from Git".
     - Ao configurar, aponte para este repositório e branch `main`.
     - No campo de ambiente escolha `Docker` e informe `backend/Dockerfile` como `Dockerfile Path` e `.` como `Build Context`.
      - Adicione a variável `DATABASE_URL` com a connection string copiada do passo 1 e marque como secret.
      - `VITE_API_URL` — opções:
         - Recomendada: deixe `VITE_API_URL` vazia/unset e sirva o frontend a partir do backend (chamadas serão relativas como `/api/v1/...`). Simples e evita problemas de CORS/URL.
         - Se você precisa que o frontend tenha uma URL absoluta embutida, informe `VITE_API_URL` com o valor exato (ex: `https://nola-god-level-deploy.onrender.com`) tanto em Runtime quanto como Build Arg (ver abaixo).
      - Build-arg (Docker builds): como o Dockerfile monta o frontend na imagem durante o build, se você usar a opção de construir a imagem no Render você precisa passar o build-arg `VITE_API_URL` para que o `npm run build` do frontend receba essa variável. Exemplos abaixo.
     - Health check: `/api/v1/health`.

   - Método B (manual): criar o Web Service via UI e preencher as mesmas configurações acima.

3. Configurar Job para gerar dados

   - No Render, crie um novo Job (Background Job) que rode:

     ```bash
     python generate_data.py --db-url "$JOB_DATABASE_URL"
     ```

   - Defina `JOB_DATABASE_URL` com a mesma connection string do banco (secret).

4. Ajustes de runtime

   - Se quiser que o serviço falhe quando o DB estiver down, defina `HEALTH_FAIL_ON_DB=true` nas env vars.
   - Caso prefira que o serviço continue respondendo (mas reportando `db: down`), deixe `HEALTH_FAIL_ON_DB=false`.

5. Deploy

   - Commit e push do `render.yaml` (já incluído) — Render irá detectar e aplicar as configurações se você usar o fluxo `render.yaml`.
   - Se usar UI, depois do deploy abra os logs e verifique `GET /api/v1/health`.

6. Observações e troubleshooting
   - Se o backend logar `ECONNREFUSED`, verifique se a `DATABASE_URL` está correta e se o banco permite conexões externas (mesma VPC/privacidade).
   - Para bancos com SSL obrigatório adicione `?sslmode=require` no `DATABASE_URL`.
   - Se preferir rodar um banco gerenciado fora do Render (ex: ElephantSQL, DigitalOcean), cole a connection string no `DATABASE_URL`.

Se quiser, eu posso gerar um `render.yaml` mais completo (com secrets placeholders, planos e region) ou montar os comandos `curl` para criar os serviços via API do Render — diga qual opção prefere.

### Build-arg (exemplo de comando se usar Docker build manualmente)

```bash
# no host local (exemplo)
docker build --build-arg VITE_API_URL='https://nola-god-level-deploy.onrender.com' -f backend/Dockerfile -t myimage .
```

No painel do Render você pode definir Build Args nas configurações avançadas do serviço (campo de Build environment / Build args). Se não definir o build-arg e `VITE_API_URL` contiver placeholders (ex: `<...>`), o frontend pode embutir uma URL inválida.
