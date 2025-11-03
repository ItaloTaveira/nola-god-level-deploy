# Nola God Level — Projeto

README completo para desenvolvimento, build e deploy desta aplicação (backend + frontend) e uso com Docker / DigitalOcean.

---

## Visão geral

Este repositório contém uma aplicação fullstack composta por:

- `backend/` — API Node.js (Express/Node) (porta 8000 no dev). Possui `Dockerfile`.
- `frontend/` — SPA React + Vite (dev com Vite). Possui script de build (`npm run build`).
- `docker-compose.yml` — orquestra serviços para desenvolvimento (Postgres, backend, ferramentas de suporte).
- `docker-compose.prod.yml` — compose preparado para produção (usa imagens do registry DigitalOcean).
- `generate_data.py` + `Dockerfile` (root) — script/container para popular a base de dados (usado no perfil `tools`).
- `.github/workflows/publish.yml` — workflow que builda e envia imagens para o DigitalOcean Container Registry (DOCR).

O objetivo deste README é centralizar o que você precisa para rodar localmente e para fazer deploy na DigitalOcean.

---

## Requisitos locais

- Git
- Node.js (v18/20 recomendado) e npm
- Python 3.11 (para o script `generate_data.py` se for rodar localmente)
- Docker e Docker Compose (para executar containers)
- (Opcional) `doctl` e `gh` para facilitar operações com DigitalOcean e GitHub

---

## Estrutura principal

```
./
├─ backend/                # API Node.js
├─ frontend/               # App React + Vite
├─ docker-compose.yml      # Compose para desenvolvimento
├─ docker-compose.prod.yml # Compose para produção (usa imagens do registry)
├─ Dockerfile              # container para geração de dados (generate_data.py)
├─ generate_data.py        # script para popular o banco
└─ .github/workflows/...    # CI: build/push para DOCR
```

---

## Como rodar localmente (desenvolvimento)

Pré-requisitos: instale dependências do backend e frontend se quiser rodar fora do Docker.

Backend (local sem Docker):

```bash
cd backend
npm install
npm run start   # ou npm run dev se tiver script dev
```

Frontend (dev com Vite):

```bash
cd frontend
npm install
npm run dev
```

Rodando tudo com Docker Compose (recomendado para replicar ambiente):

```bash
# a partir da raiz do repo
docker compose up --build

# opcional: rodar em background
docker compose up -d --build
# ver logs
docker compose logs -f
```

Observações:

- O `docker-compose.yml` contém um serviço `postgres` e o `backend` usa as variáveis de ambiente padrão definidas no compose.
- Há um serviço `data-generator` no perfil `tools` que usa o `generate_data.py`. Para rodá-lo use:

```bash
docker compose --profile tools up --build
```

---

## Variáveis de ambiente

Há um `.env.example` no root. Para produção copie para `.env` e ajuste os valores:

```bash
cp .env.example .env
# depois edite .env
```

Não comite `.env` com segredos.

---

## Build e deploy (imagens Docker)

O projeto já contém um workflow de GitHub Actions (`.github/workflows/publish.yml`) que faz build e push das imagens do `backend` e (quando houver) do `frontend` para o DigitalOcean Container Registry.

Secrets necessários no GitHub (Settings → Secrets → Actions):

- `DO_API_TOKEN` — token da DigitalOcean (crie em Control Panel → API → Tokens/Keys).
- `DOCR_NAME` — nome do seu registry na DigitalOcean (ex.: `nolagodlevel`).

Se preferir buildar e enviar localmente:

```bash
# autentique-se no registry (opcional via doctl)
doctl auth init --access-token <SEU_TOKEN>
doctl registry login

# build and push (exemplo backend)
docker build -t registry.digitalocean.com/nolagodlevel/backend:latest ./backend
docker push registry.digitalocean.com/nolagodlevel/backend:latest
```

> Substitua `nolagodlevel` pelo nome do seu registry.

### docker-compose.prod.yml

Use o `docker-compose.prod.yml` para rodar imagens já publicadas no registry. Exemplo (no Droplet):

```bash
# no servidor (Droplet) autenticado no DO registry
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## Deploy na DigitalOcean — opções

1. App Platform (gerenciado)

- Vantagens: HTTPS automático, builds integrados ao GitHub, menos manutenção.
- Escolha criar um App e apontar para as imagens no registry (ou deixar a App Platform buildar a partir do repo). Cada serviço vira um componente.

2. Droplet + Docker Compose (controle)

- Vantagens: controle total, mais barato para pequenas cargas.
- Passos:
  - Criar Droplet (Ubuntu 22.04+), adicionar SSH key.
  - Instalar Docker e plugin compose.
  - Copiar `docker-compose.prod.yml` para o Droplet e rodar `docker compose up -d`.
  - Usar nginx/Traefik/Load Balancer e certbot para SSL (se não usar App Platform).

Recomendações: para o banco de dados, prefira o Managed Database da DigitalOcean em produção.

---

## CI/CD (o que já há)

- Workflow `.github/workflows/publish.yml` builda e publica as imagens para o registry usando `DO_API_TOKEN` e `DOCR_NAME`.
- Se você preferir que eu altere o workflow para inserir `nolagodlevel` direto no arquivo (em vez de usar `DOCR_NAME`), posso ajustar.

---

## Como subir para o GitHub (passos rápidos)

Exemplo via HTTPS (se ainda não fez):

```bash
git init
git add .
git commit -m "Initial commit — project and DO deploy files"
git branch -M main
git remote add origin https://github.com/YOUR_USER/nola-god-level-deploy.git
git push -u origin main
```

Depois configure os `Secrets` no GitHub (veja acima) e o workflow de Actions rodará no push para `main`.

---

## Troubleshooting rápido

- Favicon do Vite aparecendo no dev: limpe cache ou adicione `/public/favicon.svg` e `<link rel="icon" href="/favicon.svg">` no `frontend/index.html`.
- Se o GitHub Actions falhar: verifique Secrets, permissões do token e logs do job.
- Se o Docker Compose falhar no servidor: rode `docker compose logs -f` e `docker compose ps` para inspecionar.

---

## Próximos passos que eu posso fazer por você

- Subir o repo para o GitHub (se autorizar, posso executar os comandos locais aqui).
- Preencher `DOCR_NAME` no workflow e commitar (se preferir não usar secret para o nome).
- Criar script `deploy-droplet.sh` para facilitar deploy no Droplet.

Se quiser que eu gere algum desses artefatos ou execute o push para o GitHub localmente, diga qual opção prefere.

---

Obrigado — boa sorte no deploy! Se quiser, eu posso agora: (A) executar `git init` + commit e gerar comandos de push, (B) preparar script de deploy, ou (C) esperar você criar o repo e configurar Secrets e então testar a Action.
