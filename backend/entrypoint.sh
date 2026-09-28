#!/bin/sh
set -e

echo "=========================================="
echo "JobFor Backend Entrypoint Script"
echo "=========================================="

# Create uploads directory if it doesn't exist
mkdir -p /app/uploads

# Wait for the database the app actually uses.
# This used to poll a local postgres service (${POSTGRES_HOST:-postgres}),
# which the app does not connect to - it reads DATABASE_URL, which points
# at Neon. That check therefore passed or failed independently of whether
# the real database was reachable, and after the local service was removed
# it just burned 60s of retries on a host that never existed.
echo "Waiting for the database to be ready..."
max_retries=30
retry_count=0

while ! pg_isready -d "$DATABASE_URL" > /dev/null 2>&1; do
    retry_count=$((retry_count + 1))
    if [ $retry_count -ge $max_retries ]; then
        echo "ERROR: Database not ready after $max_retries attempts"
        echo "Starting server anyway, but database connections may fail..."
        break
    fi
    echo "Database not ready yet... attempt $retry_count/$max_retries"
    sleep 2
done

if [ $retry_count -lt $max_retries ]; then
    echo "Database is ready!"
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
