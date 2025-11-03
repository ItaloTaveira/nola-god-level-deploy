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

# Nola — Plataforma de Analytics para Restaurantes

Este repositório contém uma solução minimalista e prática para analytics de restaurantes — backend em Node.js (Express) e frontend em React (Vite). O foco é permitir consultas analíticas rápidas e customizáveis para proprietários (como a persona "Maria") tomarem decisões operacionais e comerciais.

Este README foi reescrito para oferecer uma visão profissional, explicitar as regras de negócio suportadas, descrever a API disponível, explicar como rodar localmente e como fazer deploy na DigitalOcean.

---

## Sumário

- Visão geral e objetivo
- Regras de negócio e casos de uso
- Arquitetura e estrutura do repositório
- API (endpoints, parâmetros e exemplos)
- Como rodar localmente (dev + docker)
- Build, CI e deploy (DigitalOcean)
- Operação e troubleshooting

---

## Visão geral e objetivo

Objetivo: fornecer um backoffice de analytics específico para restaurantes que permita perguntas do tipo:

- "Quais são os 10 produtos mais vendidos no delivery no mês passado?"
- "O ticket médio caiu — é por canal ou por loja?"
- "Quais clientes compraram 3+ vezes mas não voltam há 30 dias?"

O sistema oferece endpoints analíticos (revenue, top-products, delivery-times, ticket-average, entre outros) que suportam filtros por período, canal, loja, dia da semana e faixa horária, além de funções para decomposição temporal e identificação de clientes perdidos.

Requisitos obrigatórios do desafio: o banco de dados é PostgreSQL (fornecido) e deve ser usado para as consultas analíticas.

---

## Regras de negócio (resumidas)

1. Métricas temporais: todas as consultas que aceitam intervalo (`start`, `end`) limitam o período máximo a 365 dias (limite de segurança para evitar scans longos).
2. Agregações definidas:
   - Receita total por período (`/metrics/revenue`).
   - Top produtos por receita/quantidade (`/metrics/top-products`).
   - Vendas por canal (`/metrics/sales-by-channel`).
   - Ticket médio agrupado por `channel` ou `store` (`/metrics/ticket-average`).
   - Tempos de entrega agregados por canal/loja (`/metrics/delivery-times`).
   - Produtos mais vendidos em um determinado dia/horário (`/metrics/top-products-when`).
   - Margem de produto com custo assumido (`/metrics/product-margins`).
   - Detecção de clientes perdidos por tempo desde o último pedido e número mínimo de pedidos (`/metrics/customers-lost`).
   - Consulta de histórico de um cliente por id ou por nome (`/metrics/customer-summary`, `/metrics/customer-summary-by-name`).
3. Formatação amigável: alguns endpoints retornam campos formatados (ex.: valores em BRL, porcentagens) para facilitar consumo por UI.
4. Segurança e validação: todas as entradas são validadas (datas em ISO8601, inteiros com limites) e erros retornam payloads padronizados `{ ok: false, error: "..." }`.

---

## Estrutura do repositório

```
./
├─ backend/                # API Node.js (src/controllers, src/services, src/repositories)
├─ frontend/               # App React + Vite
├─ docker-compose.yml      # Para desenvolvimento local
├─ docker-compose.prod.yml # Para produção (usa imagens no registry)
├─ .github/workflows       # CI que builda e envia imagens para DOCR
├─ generate_data.py        # Script para popular DB (containerizável)
└─ PROBLEMA.md             # Descrição do problema e regras de negócio
```

---

## API — endpoints principais

Base path: `/api/v1/metrics`

Observação: todas as respostas têm o formato `{ ok: true, data: ... }` em caso de sucesso.

Endpoints (resumo):

- GET /revenue?start=YYYY-MM-DD&end=YYYY-MM-DD

  - Total de receita no período.

- GET /top-products?start=&end=&limit=

  - Lista dos produtos ordenados por receita; retorna `revenue`, `qty`, `revenue_fmt` (BRL) e `avg_price_fmt`.

- GET /sales-by-channel?start=&end=

  - Receita/volume por canal.

- GET /ticket-average?group=channel|store&start=&end=

  - Ticket médio agrupado por canal ou loja.

- GET /delivery-times?start=&end=&channel_id=&store_id=

  - Estatísticas de tempos (preparo, entrega) filtráveis por canal/loja.

- GET /top-products-when?start=&end=&channel_id=&dow=&hour_start=&hour_end=&limit=

  - Top produtos em dia da semana (`dow`: 0=domingo .. 6=sábado) e faixa horária.

- GET /product-margins?start=&end=&limit=&assumed_cost_pct=&product_id=

  - Calcula margem de produtos; `assumed_cost_pct` é o custo percentual assumido quando não há custo real.

- GET /product-customers?product_id=&start=&end=&min_orders=&limit=

  - Retorna clientes que compraram um produto, com filtro por número mínimo de pedidos.

- GET /customer-summary?customer_id=&start=&end=&limit=

  - Histórico resumido de um cliente (por id).

- GET /customer-summary-by-name?name=&start=&end=&limit=

  - Busca por nome (útil quando não se tem id do cliente).

- GET /customer-last-order-by-name?name=

  - Último pedido de um cliente por nome.

- GET /customers-lost?min_orders=&since_days=&limit=&fallback=

  - Identifica clientes considerados "lost" (p.ex. compraram >= `min_orders` mas não compram há `since_days`). Se `fallback=true` usa um algoritmo alternativo.

- GET /channels

  - Lista de canais disponíveis (iFood, Rappi, balcão, etc.).

- POST /decompose { group, a_start, a_end, b_start, b_end }
  - Decomposição de variação entre dois períodos (A vs B) agrupada por `channel` ou `store`.

Para ver a definição completa de parâmetros, consulte `backend/src/routes/metrics.js`.

Exemplo (curl):

```bash
curl "http://localhost:8000/api/v1/metrics/top-products?start=2025-01-01&end=2025-01-31&limit=10"
```

---

## Como rodar localmente

1. Prerequisitos

- Docker & Docker Compose instalado
- Node.js (para rodar apenas o backend localmente) e npm

2. Rodar com Docker Compose (recomendado)

```bash
# Na raiz do projeto
docker compose up --build

# Para rodar o gerador de dados (perfil tools)
docker compose --profile tools up --build
```

3. Rodar apenas backend (dev)

```bash
cd backend
npm install
npm run start
```

4. Rodar frontend (dev)

```bash
cd frontend
npm install
npm run dev
```

---

## Testes e qualidade

O repositório contém testes simples de saúde (`test/`) e logs. Para rodar testes do backend (se existirem):

```bash
cd backend
npm test
```

Adicionei validações de entrada no layer de rota (express-validator) para evitar entradas inválidas.

---

## CI / CD e DigitalOcean (resumo)

- O workflow em `.github/workflows/publish.yml` builda imagens do `backend` e `frontend` e envia para o registry DigitalOcean `registry.digitalocean.com/nolagodlevel` (use secrets `DO_API_TOKEN` e `DOCR_NAME`).
- Após as imagens existirem no registry, você pode:
  - Usar App Platform apontando para cada imagem (componentes independentes); ou
  - Puxar as imagens em um Droplet e rodar `docker compose -f docker-compose.prod.yml up -d`.

---

## Regras operacionais e boas práticas

- Limitar queries longas: não permita ranges maiores que 365 dias via middleware (`rangeLimit`).
- Cache em camadas: para dashboards com alta leitura, posicione cache (Redis ou CDN) sobre endpoints pesados.
- Banco em produção: prefira Managed Database (DO) com backups automatizados.
- Monitoramento: exporte métricas de tempo de resposta e taxa de erros (Prometheus / Grafana ou serviço SaaS).

---

## Próximos passos recomendados (produto)

1. Implementar autenticação básica por usuário/loja para multi-tenant futuro.
2. Criar UI para geração de dashboards ad-hoc (salvar queries, visualizações).
3. Adicionar endpoints de export (CSV/XLSX) para relatórios prontos.
4. Otimizar consultas com índices (veja `backend/db_indexes.sql`).

---

## Próximos passos que eu posso fazer por você

- Subir o repo para o GitHub (se autorizar, posso executar os comandos locais aqui).
- Preencher `DOCR_NAME` no workflow e commitar (se preferir não usar secret para o nome).
- Criar script `deploy-droplet.sh` para facilitar deploy no Droplet.  
  Se quiser que eu gere exemplos reais de responses e um guia de integração para o frontend, eu posso executar requests locais e inserir amostras no README.
