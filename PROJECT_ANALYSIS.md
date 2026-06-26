# Project Architecture Analysis

This document outlines the architecture, components, and rendering pipeline of the AI Threat Detection System to ensure accurate modifications moving forward.

## 1. Frontend Architecture

### Frameworks & Libraries
- **Core Framework**: React 19 (using TypeScript).
- **Build Tool**: Vite.
- **Routing**: `react-router-dom` (v7).
- **State Management**: Zustand (global state like Auth, Socket) & React Query (data fetching & caching).
- **Styling**: Tailwind CSS (v4) with `clsx` and `tailwind-merge` for dynamic classes.
- **UI Components**: Radix UI primitives and Lucide React icons.
- **Forms & Validation**: React Hook Form with Zod resolvers.
- **Charts**: Recharts.
- **Animations**: Framer Motion.

### Directory Structure & Rendering Pipeline
- **`frontend/package.json`**: Entry point for scripts (`npm run dev`, `npm run build`).
- **`frontend/src/main.tsx`** (Implicit): Mounts the React application.
- **`frontend/src/App.tsx`**: The main rendering pipeline and router setup.
  - Defines public routes (`/`, `/login`, `/register`).
  - Defines protected routes wrapping a `SOCLayout` component.
- **`frontend/src/layouts/SOCLayout.tsx`**: The main layout wrapper for authenticated users. It likely contains the Sidebar, Header, and a `<Outlet />` for rendering pages.
- **`frontend/src/pages/`**: Contains the page-level components corresponding to routes:
  - `Landing.tsx`
  - `Dashboard.tsx`
  - `Threats.tsx`
  - `Datasets.tsx`
  - `Models.tsx`
  - `Training.tsx`
  - `Analytics.tsx`
  - `Settings.tsx`
- **`frontend/src/components/ui/`**: Reusable base UI components (Buttons, Cards, Inputs, etc.).

**Crucial Note on Frontend Modifications**:
To properly update the UI and ensure changes reach the production build, we must modify the actual files used in the `App.tsx` router (i.e., `src/pages/*` and `src/layouts/SOCLayout.tsx`), and rely on `src/components/ui` for styled primitives. Modifications to unused legacy components or standalone HTML files will have no effect.

---

## 2. Backend Architecture

### Frameworks & Libraries
- **Core Framework**: FastAPI (Python).
- **Database**: PostgreSQL with SQLAlchemy ORM and Alembic for migrations.
- **Machine Learning**: Scikit-learn (implied via ML pipeline context), Pandas for data processing.
- **Background Tasks**: FastAPI's `BackgroundTasks` (or potentially Celery/RQ, though direct service execution is evident).

### Directory Structure & Pipeline
- **`backend/app/main.py`** (Implicit): FastAPI application entry point.
- **`backend/app/routers/`**: API endpoints defined here (e.g., `datasets.py`, `preprocessing.py`, `training.py`, `prediction.py`).
- **`backend/app/services/`**: Core business logic and background processing:
  - `dataset_service.py`
  - `preprocessing_service.py`, `preprocessing_tasks.py`
  - `training_service.py`, `training_tasks.py`
  - `prediction_service.py`, `prediction_tasks.py`
- **`backend/app/repositories/`**: Database access layer (e.g., `dataset_repository.py`, `training_repository.py`).
- **`backend/app/models/`**: SQLAlchemy database models.
- **`backend/app/schemas/`**: Pydantic models for request/response validation.
- **`backend/app/utils/`**: Utility functions (e.g., `file_parser.py`, `path_resolver.py`).

**Crucial Note on Backend Modifications**:
The ML pipeline executes sequentially. Uploaded files must be durably stored and resolvable across the pipeline (Upload -> Preprocess -> Train). Absolute file paths saved during preprocessing can cause `FileNotFoundError` if the backend container resets or the path structure differs. Path resolution utilities must be robust.

---

## 3. Deployment Context

- **Git Repository**: Branch `main`.
- **Frontend**: Likely deployed via Vercel (indicated by `vercel.json`).
- **Backend**: Deployed via Render (indicated by ephemeral storage behavior and context).

Any changes must be committed and pushed to `origin/main` to trigger the CI/CD deployment sync.
