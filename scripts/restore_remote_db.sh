#!/usr/bin/env bash
set -euo pipefail

# Uso:
#  1) Defina DATABASE_URL="postgresql://user:pass@host:port/db" (público do Railway)
#  2) Rode: scripts/restore_remote_db.sh
#  Ou: scripts/restore_remote_db.sh "postgresql://user:pass@host:port/db"
#
# Obs: Railway normalmente exige SSL. Este script adiciona sslmode=require
#      automaticamente se não estiver presente.

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
DUMP_GZ="$REPO_ROOT/db/dumps/challenge_db.sql.gz"

if [ ! -f "$DUMP_GZ" ]; then
  echo "Erro: dump não encontrado em $DUMP_GZ"
  echo "Dumps disponíveis:" && ls -lh "$REPO_ROOT/db/dumps" || true
  exit 1
fi

# Pega URL do arg1 ou da env DATABASE_URL
URL=${1:-${DATABASE_URL:-}}
if [ -z "$URL" ]; then
  echo "Erro: informe a DATABASE_URL (arg1 ou variável de ambiente)."
  exit 1
fi

# Garante sslmode=require se não estiver presente
if [[ "$URL" != *"sslmode="* ]]; then
  if [[ "$URL" == *"?"* ]]; then
    URL="${URL}&sslmode=require"
  else
    URL="${URL}?sslmode=require"
  fi
fi

echo "Importando dump para: $URL"

# Testa conexão antes (sem executar nada)
if ! psql "$URL" -c "SELECT 1;" >/dev/null 2>&1; then
  echo "Aviso: não foi possível conectar para teste. Verifique host, porta e SSL."
  echo "Dica: pegue a conexão PÚBLICA no painel do Railway (Settings → Connect)."
fi

# Executa a restauração do dump completo
echo "Restaurando banco a partir de $DUMP_GZ ..."
# Remove comandos de mudança de OWNER que costumam falhar em provedores gerenciados
# Mantém o owner padrão como o usuário da conexão
gunzip -c "$DUMP_GZ" | sed -E '/OWNER TO [^;]+/d' | psql "$URL"

echo "Restauração concluída com sucesso."
