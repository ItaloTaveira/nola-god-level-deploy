#!/usr/bin/env sh
set -e

# Wrapper to run the Python data generator pointing to JOB_DATABASE_URL.
# Intended for Render Job (image: python:3.11-slim) or local usage.

if [ -z "$JOB_DATABASE_URL" ]; then
  echo "ERROR: JOB_DATABASE_URL is not set. Export it and re-run."
  echo "Example: export JOB_DATABASE_URL='postgres://user:pass@host:5432/dbname?sslmode=require'"
  exit 2
fi

echo "Installing Python requirements..."
if command -v python3 >/dev/null 2>&1; then
  python3 -m pip install --upgrade pip
  python3 -m pip install -r requirements.txt
else
  echo "Python3 not found in PATH. Use a Python image (e.g. python:3.11-slim) in the Render Job."
  exit 3
fi

echo "Running generate_data.py against JOB_DATABASE_URL..."
python3 generate_data.py --db-url "$JOB_DATABASE_URL" "$@"

echo "Data generation finished (check logs for inserted rows)."
