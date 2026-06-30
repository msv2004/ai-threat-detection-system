FROM python:3.11-slim

# Install system dependencies for packet capture (scapy) and database (psycopg)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap-dev \
    libpq-dev \
    tcpdump \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run migrations then start FastAPI app
CMD ["sh", "-c", "alembic upgrade head && uvicorn app.main:app --host 0.0.0.0 --port 8000"]
