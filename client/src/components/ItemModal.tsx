import { useState, useEffect, useRef } from 'react';
import type { Item, Location } from '../types';
import { getLocationPath } from '../utils';

export interface ItemFormPayload {
  name: string;
  quantity: number;
  location_id: number | null;
  purchase_price: number | null;
  purchase_date: string | null;
  freeText: string | null;
  currency_id: number;
}

interface FormState {
  name: string;
  quantity: string;
  location_id: string;
  purchase_price: string;
  purchase_date: string;
  freeText: string;
}

function initForm(item: Item | null): FormState {
  if (!item) {
    return { name: '', quantity: '1', location_id: '', purchase_price: '', purchase_date: '', freeText: '' };
  }
  return {
    name: item.name,
    quantity: String(item.quantity ?? 1),
    location_id: item.location_id != null ? String(item.location_id) : '',
    purchase_price: item.purchase_price != null ? String(item.purchase_price / 100) : '',
    purchase_date: item.purchase_date
      ? item.purchase_date.replace(' ', 'T').split('T')[0]
      : '',
    freeText: item.freeText ?? '',
  };
}

function toPayload(form: FormState): ItemFormPayload {
  return {
    name: form.name.trim(),
    quantity: parseInt(form.quantity) || 0,
    location_id: form.location_id ? parseInt(form.location_id) : null,
    purchase_price: form.purchase_price !== '' ? Math.round(parseFloat(form.purchase_price) * 100) : null,
    purchase_date: form.purchase_date ? `${form.purchase_date} 00:00:00` : null,
    freeText: form.freeText.trim() || null,
    currency_id: 1,
  };
}

interface ItemModalProps {
  item: Item | null;
  locations: Location[];
  onSave: (payload: ItemFormPayload) => Promise<void>;
  onClose: () => void;
}

export function ItemModal({ item, locations, onSave, onClose }: ItemModalProps) {
  const [form, setForm] = useState<FormState>(() => initForm(item));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mounted.current = true;
    setForm(initForm(item));
    setError(null);
    setTimeout(() => nameRef.current?.focus(), 50);
    return () => { mounted.current = false; };
  }, [item]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function set(field: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required.'); return; }
    setSaving(true);
    setError(null);
    try {
      await onSave(toPayload(form));
    } catch (err) {
      if (mounted.current) setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      if (mounted.current) setSaving(false);
    }
  }

  const sortedLocations = [...locations]
    .map(loc => ({ id: loc.id, path: getLocationPath(loc.id, locations) }))
    .sort((a, b) => a.path.localeCompare(b.path));

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" role="dialog" aria-modal aria-labelledby="modal-title">
        <div className="modal-header">
          <h3 id="modal-title">{item ? 'Edit Item' : 'Add Item'}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>

        <form className="modal-body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="f-name">
              Name <span className="required">*</span>
            </label>
            <input
              id="f-name"
              ref={nameRef}
              type="text"
              value={form.name}
              onChange={set('name')}
              placeholder="e.g. Black Couch"
              autoComplete="off"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="f-qty">
                Quantity <span className="required">*</span>
              </label>
              <input
                id="f-qty"
                type="number"
                min="0"
                value={form.quantity}
                onChange={set('quantity')}
              />
            </div>
            <div className="form-group">
              <label htmlFor="f-location">Location</label>
              <select id="f-location" value={form.location_id} onChange={set('location_id')}>
                <option value="">— No location —</option>
                {sortedLocations.map(({ id, path }) => (
                  <option key={id} value={id}>{path}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="f-price">Price (€)</label>
              <input
                id="f-price"
                type="number"
                min="0"
                step="0.01"
                value={form.purchase_price}
                onChange={set('purchase_price')}
                placeholder="0.00"
              />
            </div>
            <div className="form-group">
              <label htmlFor="f-date">Purchase Date</label>
              <input
                id="f-date"
                type="date"
                value={form.purchase_date}
                onChange={set('purchase_date')}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="f-notes">Notes</label>
            <textarea
              id="f-notes"
              rows={3}
              value={form.freeText}
              onChange={set('freeText')}
              placeholder="Any additional details…"
            />
          </div>

          {error && <p className="form-error">{error}</p>}
        </form>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
            onClick={handleSubmit}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
