import { useAuthStore } from '../stores/authStore';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = `${BASE_URL}/api/v1`;

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

// Keep track of refresh requests to prevent infinite loops
let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

async function apiFetch(path: string, options: FetchOptions = {}): Promise<any> {
  const { skipAuth, ...init } = options;
  const url = `${API_PREFIX}${path}`;

  // Add Auth headers if not skipped
  const headers = new Headers(init.headers || {});
  
  if (!skipAuth) {
    const accessToken = useAuthStore.getState().accessToken;
    if (accessToken) {
      headers.set('Authorization', `Bearer ${accessToken}`);
    }
  }

  const response = await fetch(url, {
    ...init,
    headers,
  });

  if (response.status === 401 && !skipAuth) {
    // Attempt Token Refresh
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken && !isRefreshing) {
      isRefreshing = true;
      try {
        const refreshResponse = await fetch(`${API_PREFIX}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const newTokens = await refreshResponse.json();
          // Find user profile
          const profileResponse = await fetch(`${API_PREFIX}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${newTokens.access_token}`,
            }
          });
          const user = profileResponse.ok ? await profileResponse.json() : null;
          
          useAuthStore.getState().setAuth(user, newTokens.access_token, newTokens.refresh_token);
          isRefreshing = false;

          // Resolve pending queries
          refreshQueue.forEach((cb) => cb(newTokens.access_token));
          refreshQueue = [];

          // Retry original request with new token
          headers.set('Authorization', `Bearer ${newTokens.access_token}`);
          const retriedResponse = await fetch(url, { ...init, headers });
          return handleResponse(retriedResponse);
        } else {
          // Refresh token expired/revoked
          isRefreshing = false;
          refreshQueue = [];
          useAuthStore.getState().clearAuth();
          throw new Error('Session expired. Please log in again.');
        }
      } catch (err) {
        isRefreshing = false;
        refreshQueue = [];
        useAuthStore.getState().clearAuth();
        throw err;
      }
    } else if (isRefreshing) {
      // Wait for refresh to complete
      return new Promise((resolve) => {
        refreshQueue.push((newToken) => {
          headers.set('Authorization', `Bearer ${newToken}`);
          resolve(fetch(url, { ...init, headers }).then(handleResponse));
        });
      });
    }
  }

  return handleResponse(response);
}

async function handleResponse(response: Response) {
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { detail: text };
  }

  if (!response.ok) {
    const errorMsg = data?.detail || response.statusText || 'API request failed';
    throw new Error(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
  }

  return data;
}

export const authService = {
  async login(email: string, password: string) {
    // FastAPI OAuth2 password flow expects urlencoded form body
    const body = new URLSearchParams();
    body.append('username', email);
    body.append('password', password);

    const tokenData = await apiFetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      skipAuth: true,
    });

    // Fetch user profile info
    const user = await apiFetch('/auth/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
      skipAuth: true,
    });

    useAuthStore.getState().setAuth(user, tokenData.access_token, tokenData.refresh_token);
    return user;
  },

  async register(email: string, password: string) {
    return apiFetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  },

  async logout() {
    const refreshToken = useAuthStore.getState().refreshToken;
    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
          skipAuth: true,
        });
      } catch (err) {
        console.error('Logout error on backend:', err);
      }
    }
    useAuthStore.getState().clearAuth();
  },

  async getMe() {
    return apiFetch('/auth/me');
  },
};

export const datasetService = {
  async list() {
    return apiFetch('/datasets/');
  },

  async get(id: string) {
    return apiFetch(`/datasets/${id}`);
  },

  async upload(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return apiFetch('/datasets/upload', {
      method: 'POST',
      body: formData,
    });
  },

  async delete(id: string) {
    return apiFetch(`/datasets/${id}`, {
      method: 'DELETE',
    });
  },
};

export const preprocessingService = {
  async start(config: {
    dataset_id: string;
    target_column: string;
    missing_value_strategy: string;
    scaling_strategy: string;
    encoding_strategy: string;
    test_size: number;
    random_state: number;
  }) {
    return apiFetch('/preprocessing/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
  },

  async listJobs() {
    return apiFetch('/preprocessing/jobs');
  },

  async getJob(id: string) {
    return apiFetch(`/preprocessing/jobs/${id}`);
  },

  async getReport(datasetId: string) {
    return apiFetch(`/preprocessing/report/${datasetId}`);
  },
};

export const modelService = {
  async list() {
    return apiFetch('/models');
  },

  async get(id: string) {
    return apiFetch(`/models/${id}`);
  },

  async compare() {
    return apiFetch('/models/compare');
  },

  async activate(id: string) {
    return apiFetch(`/models/${id}/activate`, {
      method: 'POST',
    });
  },

  async delete(id: string) {
    return apiFetch(`/models/${id}`, {
      method: 'DELETE',
    });
  },

  async train(config: {
    dataset_id: string;
    processed_dataset_id: string;
    algorithm: string;
  }) {
    return apiFetch('/models/train', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
  },

  async listJobs() {
    return apiFetch('/training/jobs');
  },

  async getJob(id: string) {
    return apiFetch(`/training/jobs/${id}`);
  },
};

export const threatService = {
  async list(status?: string) {
    const path = status ? `/threats?status=${status}` : '/threats';
    return apiFetch(path);
  },

  async updateStatus(id: string, status: string) {
    return apiFetch(`/threats/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ resolution_status: status }),
    });
  },

  async listPredictions(skip = 0, limit = 100) {
    return apiFetch(`/predictions?skip=${skip}&limit=${limit}`);
  },
};

export const detectionService = {
  async start(config: {
    interface: string;
    mode: 'live' | 'offline';
    file_path?: string;
    replay_speed?: number;
  }) {
    return apiFetch('/detection/start', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
  },

  async stop() {
    return apiFetch('/detection/stop', {
      method: 'POST',
    });
  },

  async status() {
    return apiFetch('/detection/status');
  },

  async listSessions() {
    return apiFetch('/detection/sessions');
  },

  async getSession(id: string) {
    return apiFetch(`/detection/sessions/${id}`);
  },

  async statistics() {
    return apiFetch('/detection/statistics');
  },
};

export const analyticsService = {
  async overview() {
    return apiFetch('/analytics/overview');
  },

  async threats() {
    return apiFetch('/analytics/threats');
  },

  async timeline(range = 'this_week', startDate?: string, endDate?: string) {
    let path = `/analytics/threats/timeline?range=${range}`;
    if (startDate) path += `&start_date=${startDate}`;
    if (endDate) path += `&end_date=${endDate}`;
    return apiFetch(path);
  },

  async models() {
    return apiFetch('/analytics/models');
  },

  async monitoring() {
    return apiFetch('/analytics/models/monitoring');
  },

  async datasets() {
    return apiFetch('/analytics/datasets');
  },

  async auditLogs(eventType?: string, skip = 0, limit = 50) {
    let path = `/analytics/audit-logs?skip=${skip}&limit=${limit}`;
    if (eventType) path += `&event_type=${eventType}`;
    return apiFetch(path);
  },
};
