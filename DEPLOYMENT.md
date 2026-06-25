# Production Deployment & Operations Guide

This guide provides instructions to deploy, monitor, and maintain the AI Threat Detection System in a production-ready environment.

---

## 1. System Architecture

The production environment consists of the following components:

*   **Frontend**: Built with React 19 + TypeScript + Tailwind CSS, hosted on **Vercel** or served from an Nginx static volume.
*   **Backend**: Python FastAPI application running under Uvicorn, hosted on **Render** (Web Service), AWS ECS, or as a Docker container.
*   **Database**: Managed **Supabase PostgreSQL** instance.
*   **Reverse Proxy**: **Nginx** acting as reverse proxy, routing incoming HTTP traffic, terminating SSL/HTTPS, and handling WebSocket upgrade connections to `/ws/alerts`.

---

## 2. Step-by-Step Deployment

### A. Managed Cloud Deployment (Recommended)

#### 1. Database (Supabase)
1. Sign up on [Supabase](https://supabase.com/).
2. Create a new project named `ai-threat-detection`.
3. Locate the Connection String under **Project Settings > Database > Connection string > Transaction / Session URI**.
4. Use this URI for `postgresql://postgres:[AithreatDetectio]@db.zmoqbamqdnjtepevgrol.supabase.co:5432/postgres` in the Backend settings.

#### 2. Backend (Render)
1. Sign up on [Render](https://render.com/).
2. Create a new **Web Service** and connect the repository.
3. Choose the **Docker runtime** (it will auto-detect `backend/Dockerfile` if context is set to `backend`).
4. Set the following Environment Variables in Render:
   *   `DATABASE_URL`: `postgresql://postgres:[AithreatDetectio]@db.zmoqbamqdnjtepevgrol.supabase.co:5432/postgres` (your Supabase string)
   *   `SECRET_KEY`: `[YOUR_GENERATED_SECURE_SECRET]`
   *   `ALGORITHM`: `HS256`
   *   `ACCESS_TOKEN_EXPIRE_MINUTES`: `30`
   *   `LOG_FORMAT`: `JSON`
5. Deploy. Render automatically provisions an HTTPS endpoint (e.g. `https://ai-threat-backend.onrender.com`).

#### 3. Frontend (Vercel)
1. Sign up on [Vercel](https://vercel.com/).
2. Create a new project, select the repository, and set the root directory to `frontend`.
3. Set the build commands:
   *   Build Command: `npm run build`
   *   Output Directory: `dist`
4. Deploy. Vercel provisions a global HTTPS endpoint (e.g. `https://ai-threat-soc.vercel.app`).

---

### B. Single-Server Docker Compose Deployment

To deploy the entire stack on a single Virtual Private Server (VPS):

1. Clone the repository on the target server.
2. Copy `.env.example` to `.env` and fill in secure passwords/keys:
   ```bash
   cp .env.example .env
   # Edit .env using vim or nano
   ```
3. Start the entire system in detached mode:
   ```bash
   docker compose up --build -d
   ```
4. Verify all containers are running:
   ```bash
   docker compose ps
   ```

---

## 3. Backup Strategy

Data safety is critical for threat history auditing and model retraining.

### A. PostgreSQL Database Backups
- **Supabase**: Automatically takes daily backups with 7-day retention for free tiers (up to 30 days on Pro).
- **Self-Hosted / Docker Compose**:
  Configure a cron job on the host server to export SQL dumps daily:
  ```bash
  # Daily cron job (runs at 2:00 AM)
  0 2 * * * docker compose exec -t db pg_dumpall -U postgres | gzip > /backups/db/db_$(date +\%F).sql.gz
  ```

### B. Machine Learning Models & Datasets Backups
Trained models (`models/`) and preprocessed datasets (`datasets/`) are stored on persistent volumes.
- Back up these files using an incremental synchronization tool (e.g., `rclone` or `aws s3 sync` to cloud object storage):
  ```bash
  # Sync models directory to S3 daily
  0 3 * * * rclone sync /var/lib/docker/volumes/ai-threat-detection_models_volume/_data s3:ai-threat-models-backup/
  ```

---

## 4. System Metrics & Monitoring

Monitor the performance and health of the system via:
1.  **Health Check Endpoint**: `GET /health` returns database connectivity status, active model file validations, and disk writable status.
2.  **System Metrics Endpoint**: `GET /health/metrics` returns:
    *   **WebSocket**: Active connection count.
    *   **Detection**: Running packet sniff status.
    *   **Training**: Running and queued machine learning training jobs.
    *   **System Usage**: Active Process CPU/Memory footprints.

Use Prometheus / Grafana or monitoring webhooks to alert on resource exhaustion or service degradation.

---

## 5. Release Versioning Plan

The project follows [Semantic Versioning (SemVer)](https://semver.org/):

*   **Format**: `vMAJOR.MINOR.PATCH`
*   **Rules**:
    *   `MAJOR` version bump: Major architectural changes (e.g. replacing DB engine, rewrite of frontend routing/core API contracts).
    *   `MINOR` version bump: New functional features added (e.g., adding threat intelligence enrichment, live network sniffing).
    *   `PATCH` version bump: Bug fixes, dependency updates, documentation improvements.
*   **Tagging Releases**:
    ```bash
    git tag -a v1.0.0 -m "Production Release version 1.0.0"
    git push origin v1.0.0
    ```
