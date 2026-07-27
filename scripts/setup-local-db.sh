#!/usr/bin/env bash
set -euo pipefail

# Sets up PostgreSQL for Refer Me when Docker is not used.
# Works with Homebrew Postgres on macOS (connects as the current OS user).

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_NAME="referme"
DB_USER="referme"
DB_PASS="referme"

echo "Setting up local PostgreSQL for Refer Me..."

psql -h localhost -p 5432 -d postgres -v ON_ERROR_STOP=1 <<SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${DB_USER}') THEN
    CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
  END IF;
END
\$\$;
SELECT 'CREATE DATABASE ${DB_NAME} OWNER ${DB_USER}'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}')\\gexec
GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

psql -h localhost -p 5432 -d "${DB_NAME}" -v ON_ERROR_STOP=1 -c \
  "GRANT ALL ON SCHEMA public TO ${DB_USER}; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${DB_USER};"

cd "${ROOT}/server"
npx prisma migrate deploy
npx tsx prisma/seed.ts

echo ""
echo "Database ready. Start the app with: npm run dev"
echo "Demo login: seeker1@example.com / password123"
