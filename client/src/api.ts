import type { Item, Location, Document } from './types';

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

export const getItemDocuments = (itemId: number) =>
  apiFetch<Document[]>(`/api/v1/documents/item/${itemId}`);

export const uploadDocuments = async (itemId: number, files: FileList): Promise<Document[]> => {
  const form = new FormData();
  for (const file of Array.from(files)) form.append('files', file);
  const res = await fetch(`/api/v1/documents/item/${itemId}`, { method: 'POST', body: form });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
};

export const deleteDocument = (docId: number) =>
  apiFetch<{ deleted: number }>(`/api/v1/documents/${docId}`, { method: 'DELETE' });
