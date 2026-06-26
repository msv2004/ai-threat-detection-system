# AI Threat Detection System - PROJECT_ANALYSIS.md

This document explains the full architecture of the AI Threat Detection System across frontend, backend, and deployment components.

---

## 1. Frontend Architecture

### Framework Running
The frontend runs on **React 19** powered by **Vite** build tool.
*   **Routing**: React Router DOM v7 (configured in `frontend/src/App.tsx`).
*   **State Management**: Zustand v5 (e.g., auth, threat alerts, socket connections).
*   **Data Fetching/Caching**: TanStack React Query v5.

### Production Directory
The directory used for production is **`frontend/dist`**, created by running `npm run build` in the `frontend` folder.

### Files Controlling the UI
*   **Entry Points**:
    *   `frontend/index.html`
    *   `frontend/src/main.tsx`
    *   `frontend/src/App.tsx` (routing & context configuration)
*   **CSS Style Sheets**:
    *   `frontend/src/index.css` (primary style sheet containing design tokens and Tailwind theme overrides)
*   **Layout Component**:
    *   `frontend/src/layouts/SOCLayout.tsx` (renders sidebar, breadcrumbs, socket connection banner, and wraps dashboard pages)
*   **Pages (UI Views)**:
    *   `Landing.tsx` (Homepage / Hero Page / Varonis style UI)
    *   `Dashboard.tsx` (Core operations center with threat widgets & Recharts telemetry)
    *   `Datasets.tsx` (File uploading & preprocessing console)
    *   `Threats.tsx` (Threat feed / logs database)
    *   `Training.tsx` (Model training workspace)
    *   `Models.tsx` (Model registry & management dashboard)
    *   `Analytics.tsx` (Accuracy / ROC curves analysis)
    *   `Settings.tsx` (Configuration options & user details)
    *   `Login.tsx` / `Register.tsx` / `ForgotPassword.tsx` (Authentication workflow)

### CSS Files Active
*   **`frontend/src/index.css`** (Tailwind v4 theme layout with glowing cyberpunk configurations).
*   *Note: `frontend/src/App.css` is active but empty to prevent style collisions.*

### Component Library Used
No external component framework like Tailwind UI or Material UI is used. The UI uses pure CSS custom classes, standard HTML components, and **Tailwind CSS v4** utilities combined with **Lucide React** for icons, **Recharts** for plotting, and **Framer Motion** for micro-animations.

### Files No Longer Used
*   `frontend/src/App.css` (retained as empty, but styles are entirely in `index.css`).

---

## 2. Backend Architecture

### API Routes & Endpoints

| Category | Method | Path | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/register` | Register new user |
| | `POST` | `/api/v1/login` | Authenticate user & get JWT |
| | `POST` | `/api/v1/refresh` | Refresh JWT using refresh token |
| | `POST` | `/api/v1/logout` | Revoke tokens & sign out |
| **Datasets** | `POST` | `/api/v1/datasets/upload` | Upload CSV/PCAP network packet captures |
| | `GET` | `/api/v1/datasets` | List user's uploaded datasets |
| | `GET` | `/api/v1/datasets/{id}` | Get status/details of specific dataset |
| | `DELETE` | `/api/v1/datasets/{id}` | Permanently delete dataset (files & database) |
| **Preprocessing** | `POST` | `/api/v1/preprocessing/start` | Trigger asynchronous dataset preprocessing |
| | `GET` | `/api/v1/preprocessing/jobs` | List all preprocessing tasks |
| | `GET` | `/api/v1/preprocessing/jobs/{id}` | Get preprocessing task status |
| | `GET` | `/api/v1/preprocessing/report/{ds_id}` | Get dataset profiling metadata reports |
| **Training** | `POST` | `/api/v1/models/train` | Train a machine learning model |
| | `GET` | `/api/v1/models/jobs` | List model training jobs |
| | `GET` | `/api/v1/models/jobs/{id}` | Get training job status |
| | `GET` | `/api/v1/models/registry` | List trained model registry |
| | `PUT` | `/api/v1/models/registry/{id}/activate` | Set model active for live prediction |
| | `DELETE` | `/api/v1/models/registry/{id}` | Delete trained model |
| **Detection** | `POST` | `/api/v1/predict` | Single threat classification (on-the-fly) |
| | `POST` | `/api/v1/predict/batch` | Batch threat detection on uploaded dataset |
| | `GET` | `/api/v1/predictions/report/{id}` | Get threat distribution prediction report |
| | `GET` | `/api/v1/predictions` | List past prediction query audits |
| | `GET` | `/api/v1/threats` | List detected high-threat incidents |
| | `PUT` | `/api/v1/threats/{id}/status` | Update incident resolution status |
| **WebSocket** | `WS` | `/ws/alerts` | Live WebSocket alerts subscription |
| **Health** | `GET` | `/health` | Core database & storage status check |
| | `GET` | `/health/metrics` | System telemetry endpoints |

### Database Models (PostgreSQL / Supabase)
All models are defined inside `backend/app/models/`:
*   `User`: User accounts (username, password hash, role_id, etc.).
*   `Role`: System roles (`Admin`, `Security Analyst`, `Viewer`).
*   `Dataset`: Uploaded dataset records (file metadata, status, storage paths).
*   `ProcessedDataset`: Preprocessing output split references and metrics.
*   `PreprocessingJob`: Preprocessing logs & job status updates.
*   `DatasetProfile`: CSV row counts, columns, missing values profiling reports.
*   `TrainingJob`: ML model training logs & configuration parameters.
*   `TrainedModel`: Trained model parameters, metadata, scoring, active flags.
*   `PredictionJob`: Batch inference metadata.
*   `PredictionHistory`: Single-row network flow prediction inputs & threat ratings.
*   `Threat`: Aggregated threat incidents and investigator responses.
*   `SystemEvent`: Audit log of event triggers.
*   `RefreshToken`: Persisted JWT session states.

### Storage Locations (Physical)
All files are saved inside directories relative to the execution root:
*   **Uploaded Raw Datasets**: `datasets/{user_id}/[filename]`
*   **Processed Parquet Splits**: `datasets/{user_id}/processed/{job_id}_X_train.parquet`, etc.
*   **Preprocessor States**: `datasets/{user_id}/processed/{job_id}_preprocessor.joblib`
*   **Trained Model Binaries**: `models/{user_id}/{model_name}/v{version}/model.joblib`
*   **Batch Prediction Output Logs**: `datasets/{user_id}/predictions/{job_id}_predictions.csv`

---

## 3. Deployment Configuration

### Git Branch Deployed
The production branch is **`main`**.

### Folder Build Directories
*   **Vercel Build Target**: `frontend`
    *   **Build Command**: `npm run build`
    *   **Output Folder**: `dist`
*   **Render Build Target**: `backend` (configured with `backend/Dockerfile` using Docker engine).

### Active Environment Variables
*   **Frontend (Vercel)**:
    *   `VITE_API_URL`: Points to the Render backend domain (e.g. `https://ai-threat-detection-system-h9bo.onrender.com`).
*   **Backend (Render)**:
    *   `DATABASE_URL`: Supabase Pooler URI connection string.
    *   `SECRET_KEY`: Secured cryptographic signature for JSON Web Tokens.
    *   `ALGORITHM`: `HS256`.

---

## 4. Key Production Caveat: Ephemeral Render Disk vs. Persistent Supabase DB

Since the backend is hosted on a free Render container:
1.  **Container Spin Down / Recycling**: Render restarts the container after inactivity (15 mins) or redeployments, wiping the local ephemeral filesystem (`/app/datasets/` and `/app/models/`).
2.  **Persistent Database (Supabase)**: The database is remote and does not wipe. The records (indicating dataset files exist) remain in Supabase.
3.  **Path Resolution Error**: When preprocessing or training is re-triggered on these records, the backend crashes with a `[Errno 2] No such file or directory` since the files have been wiped from Render's disk but not from Supabase.
4.  **Mitigation**: We implement dynamic path mapping to check files and return a 400 Bad Request error cleanly requesting user re-upload, preventing server crashes and infinite loading loops.
