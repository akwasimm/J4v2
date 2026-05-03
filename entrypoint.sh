#!/bin/sh
set -e

echo "=========================================="
echo "JobFor Backend Entrypoint Script"
echo "=========================================="

# Create uploads directory if it doesn't exist
mkdir -p /app/uploads

# Wait for postgres to be ready
echo "Waiting for PostgreSQL to be ready..."
max_retries=30
retry_count=0

while ! pg_isready -h "${POSTGRES_HOST:-postgres}" -p "${POSTGRES_PORT:-5432}" -U "${POSTGRES_USER:-jobfor_user}" > /dev/null 2>&1; do
    retry_count=$((retry_count + 1))
    if [ $retry_count -ge $max_retries ]; then
        echo "ERROR: PostgreSQL did not become ready after $max_retries attempts"
        echo "Starting server anyway, but database connections may fail..."
        break
    fi
    echo "PostgreSQL not ready yet... attempt $retry_count/$max_retries"
    sleep 2
done

if [ $retry_count -lt $max_retries ]; then
    echo "PostgreSQL is ready!"
fi

# Run Alembic migrations with retry logic
echo "Running database migrations..."
migration_retries=3
migration_attempt=0
migration_success=false

while [ $migration_attempt -lt $migration_retries ] && [ "$migration_success" = false ]; do
    migration_attempt=$((migration_attempt + 1))
    echo "Migration attempt $migration_attempt/$migration_retries"
    
    if alembic upgrade head; then
        echo "Migrations completed successfully!"
        migration_success=true
    else
        echo "Migration attempt $migration_attempt failed"
        if [ $migration_attempt -lt $migration_retries ]; then
            echo "Retrying in 5 seconds..."
            sleep 5
        fi
    fi
done

if [ "$migration_success" = false ]; then
    echo "WARNING: Migrations failed after $migration_retries attempts"
    echo "Starting server anyway - application may not work correctly"
fi

echo "=========================================="
echo "Starting Uvicorn server..."
echo "=========================================="

# Run the server with hot reload for development
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload