FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for PyMuPDF and other packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    libmupdf-dev \
    mupdf-tools \
    gcc \
    python3-dev \
    libffi-dev \
    postgresql-client \
    dos2unix \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Convert line endings and make entrypoint script executable
RUN dos2unix entrypoint.sh && chmod +x entrypoint.sh

# Expose FastAPI port
EXPOSE 8000

# Use entrypoint script
ENTRYPOINT ["./entrypoint.sh"]
