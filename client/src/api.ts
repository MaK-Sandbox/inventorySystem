import type { Item, Location } from './types';

async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> =
    init.body != null ? { 'Content-Type': 'application/json' } : {};
  const res = await fetch(path, { ...init, headers });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json() as Promise<T>;
}

export type ItemPayload = Omit<Item, 'id'>;
export type ItemPatch = Partial<ItemPayload>;

export const getItems = () => apiFetch<Item[]>('/api/v1/items');
export const getLocations = () => apiFetch<Location[]>('/api/v1/locations');

export const createItem = (body: ItemPayload) =>
  apiFetch<Item>('/api/v1/items', { method: 'POST', body: JSON.stringify(body) });

export const updateItem = (id: number, body: ItemPatch) =>
  apiFetch<Item>(`/api/v1/items/${id}`, { method: 'PUT', body: JSON.stringify(body) });

export const removeItem = (id: number) =>
  apiFetch<Item>(`/api/v1/items/${id}`, { method: 'DELETE' });
