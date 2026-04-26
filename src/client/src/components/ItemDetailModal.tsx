import { useState, useEffect, useRef } from 'react';
import type { Item, Location, Document } from '../types';
import { getItemDocuments, uploadDocuments, deleteDocument } from '../api';
import { fmtDate, fmtPrice, getLocationPath } from '../utils';

const DownloadIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
    <path d="M2.75 14A1.75 1.75 0 011 12.25v-2.5a.75.75 0 011.5 0v2.5c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25v-2.5a.75.75 0 011.5 0v2.5A1.75 1.75 0 0113.25 14H2.75z" />
    <path d="M7.25 7.689V2a.75.75 0 011.5 0v5.689l1.97-1.97a.75.75 0 111.06 1.06l-3.25 3.25a.75.75 0 01-1.06 0L4.22 6.78a.75.75 0 011.06-1.06l1.97 1.97z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
    <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.575l.66-6.6a.75.75 0 00-1.492-.15l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z" />
  </svg>
);

interface ItemDetailModalProps {
  item: Item;
  locations: Location[];
  onClose: () => void;
  onEdit: (item: Item) => void;
}

export function ItemDetailModal({ item, locations, onClose, onEdit }: ItemDetailModalProps) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    setLoadingDocs(true);
    getItemDocuments(item.id)
      .then(setDocs)
      .catch(() => setError('Failed to load documents.'))
      .finally(() => setLoadingDocs(false));
  }, [item.id]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const created = await uploadDocuments(item.id, files);
      setDocs(prev => [...prev, ...created]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.name}"?`)) return;
    try {
      await deleteDocument(doc.id);
      setDocs(prev => prev.filter(d => d.id !== doc.id));
    } catch {
      setError('Failed to delete document.');
    }
  }

  const locPath = getLocationPath(item.location_id, locations);

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal modal-detail" role="dialog" aria-modal aria-labelledby="detail-title">
        <div className="modal-header">
          <h3 id="detail-title">{item.name}</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          <dl className="detail-grid">
            <div className="detail-row">
              <dt>Quantity</dt>
              <dd>{item.quantity ?? 0}</dd>
            </div>
            {locPath && (
              <div className="detail-row">
                <dt>Location</dt>
                <dd>{locPath}</dd>
              </div>
            )}
            {item.purchase_price != null && (
              <div className="detail-row">
                <dt>Price</dt>
                <dd>{fmtPrice(item.purchase_price)}</dd>
              </div>
            )}
            {item.purchase_date && (
              <div className="detail-row">
                <dt>Purchased</dt>
                <dd>{fmtDate(item.purchase_date)}</dd>
              </div>
            )}
            {item.freeText && (
              <div className="detail-row detail-row-full">
                <dt>Notes</dt>
                <dd>{item.freeText}</dd>
              </div>
            )}
          </dl>

          <div className="detail-section">
            <div className="detail-section-header">
              <h4>Documents</h4>
              <label className={`btn btn-secondary btn-sm${uploading ? ' btn-disabled' : ''}`}>
                {uploading ? 'Uploading…' : 'Upload'}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleUpload}
                  disabled={uploading}
                />
              </label>
            </div>

            {error && <p className="form-error">{error}</p>}

            {loadingDocs ? (
              <p className="detail-empty">Loading…</p>
            ) : docs.length === 0 ? (
              <p className="detail-empty">No documents attached.</p>
            ) : (
              <ul className="doc-list">
                {docs.map(doc => (
                  <li key={doc.id} className="doc-item">
                    <span className="doc-name" title={doc.name}>{doc.name}</span>
                    <div className="doc-actions">
                      <a
                        className="btn-icon"
                        href={`/api/v1/documents/${doc.id}/download`}
                        download={doc.name}
                        title="Download"
                        onClick={e => e.stopPropagation()}
                      >
                        <DownloadIcon />
                      </a>
                      <button
                        className="btn-icon danger"
                        title="Delete"
                        onClick={() => handleDelete(doc)}
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" className="btn btn-primary" onClick={() => { onClose(); onEdit(item); }}>
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
