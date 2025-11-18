#!/usr/bin/env sh
# This file was reverted/disabled. No-op placeholder to avoid accidental runs.
echo "run_migrate.sh disabled in repository (reverted)."
exit 0
#!/usr/bin/env sh
set -e

# Simple wrapper to run the SQL schema against a Postgres URL stored in
# JOB_DATABASE_URL. Meant to be used as a Render Job command or run locally.

if [ -z "$JOB_DATABASE_URL" ]; then
  echo "ERROR: JOB_DATABASE_URL is not set. Export it and re-run."
  echo "Example: export JOB_DATABASE_URL='postgres://user:pass@host:5432/dbname?sslmode=require'"
  exit 2
fi

# If psql complains about SSL, try forcing PGSSLMODE=require
if command -v psql >/dev/null 2>&1; then
  echo "Running psql against JOB_DATABASE_URL..."
  psql "$JOB_DATABASE_URL" -f db/init/01-schema.sql
else
  echo "psql not found in PATH. Use an image that contains psql (for Render Job use postgres:15-alpine)."
  exit 3
fi

echo "Schema applied successfully."
