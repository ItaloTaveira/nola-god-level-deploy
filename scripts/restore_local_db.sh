#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "$0")/.." && pwd)
DUMP_GZ="$REPO_ROOT/db/dumps/challenge_db.sql.gz"
DB_NAME=${1:-challenge_db}

if [ ! -f "$DUMP_GZ" ]; then
  echo "Erro: dump não encontrado em $DUMP_GZ"
  exit 1
fi

echo "Restaurando dump $DUMP_GZ para database '$DB_NAME'"

# Try sudo -u postgres first (most common on Linux)
if command -v sudo >/dev/null 2>&1 && sudo -n true 2>/dev/null; then
  echo "Tentando restaurar com sudo -u postgres..."
  sudo -u postgres psql -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" || true
  sudo -u postgres psql -c "CREATE DATABASE \"$DB_NAME\";"
  gunzip -c "$DUMP_GZ" | sudo -u postgres psql "$DB_NAME"
  echo "Restauração concluída com sudo -u postgres."
  exit 0
fi

# Try psql -U postgres (may prompt for password)
if command -v psql >/dev/null 2>&1; then
  echo "Tentando restaurar com psql -U postgres (pode pedir senha)..."
  if psql -U postgres -c "SELECT 1;" >/dev/null 2>&1; then
    psql -U postgres -c "DROP DATABASE IF EXISTS \"$DB_NAME\";" || true
    psql -U postgres -c "CREATE DATABASE \"$DB_NAME\";"
    gunzip -c "$DUMP_GZ" | psql -U postgres -d "$DB_NAME"
    echo "Restauração concluída com psql -U postgres."
    exit 0
  else
    echo "Conexão com psql -U postgres falhou (provavelmente senha necessária)."
  fi
fi

echo "Não foi possível restaurar automaticamente. Opções:"
echo "  1) Execute este script como root/sudo, ou configure um usuário postgres local." 
echo "  2) Restaure manualmente:"
echo "       createdb -U <superuser> $DB_NAME"
echo "       gunzip -c $DUMP_GZ | psql -U <superuser> -d $DB_NAME"
echo "  3) Se preferir, rode um container temporário Postgres e restaure no container."
exit 1
