import { createClient } from './supabase';

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

async function getToken(): Promise<string> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? '';
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${BACKEND}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Request failed');
  }

  return res.json();
}

// ─── Tenant ──────────────────────────────────────────────
export const getTenant = () => request<any>('/api/auth/tenant');

export const createTenant = (name: string) =>
  request<any>('/api/auth/tenant', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const updateTenant = (data: Partial<{ name: string; bot_name: string; bot_greeting: string }>) =>
  request<any>('/api/auth/tenant', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const regenerateToken = () =>
  request<{ api_token: string }>('/api/auth/tenant/regenerate-token', { method: 'POST' });

// ─── Documents ───────────────────────────────────────────
export const getDocuments = () => request<any[]>('/api/documents');

export async function uploadDocument(file: File): Promise<any> {
  const token = await getToken();
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BACKEND}/api/documents`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error ?? 'Upload failed');
  }

  return res.json();
}

export const deleteDocument = (id: string) =>
  request<any>(`/api/documents/${id}`, { method: 'DELETE' });

// ─── Analytics ───────────────────────────────────────────
export const getStats = () => request<any>('/api/analytics/stats');
export const getChartData = () => request<any[]>('/api/analytics/chart');
export const getRecentQueries = (page = 0) =>
  request<any>(`/api/analytics/queries?page=${page}&limit=20`);
