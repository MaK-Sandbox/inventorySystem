'use strict';

// Same origin — Express serves both the static files and the API
const API = '';

// ─── State ───
let allItems = [];
let allLocations = [];
let activeLocationId = null;
let editingId = null;

// ─── Utilities ───

function esc(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmtDate(raw) {
  if (!raw) return '—';
  const d = new Date(raw.replace(' ', 'T'));
  return isNaN(d) ? raw : d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtPrice(val) {
  if (val == null || val === '') return '—';
  return `€${val}`;
}

function locationName(id) {
  const loc = allLocations.find(l => l.id === id);
  return loc ? loc.name : '—';
}

function getLocationPath(id) {
  const parts = [];
  let cur = allLocations.find(l => l.id === id);
  while (cur) {
    parts.unshift(cur.name);
    cur = cur.parent_id != null ? allLocations.find(l => l.id === cur.parent_id) : null;
  }
  return parts.join(' → ');
}

// ─── Toast ───

function toast(msg, type = 'success') {
  const container = document.getElementById('toast-container');
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.innerHTML = `<span class="toast-dot"></span>${esc(msg)}`;
  container.appendChild(el);
  setTimeout(() => {
    el.style.animation = 'fade-out 0.25s ease forwards';
    setTimeout(() => el.remove(), 250);
  }, 3000);
}

// ─── API ───

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: opts.body != null ? { 'Content-Type': 'application/json' } : {},
    ...opts,
    body: opts.body != null ? JSON.stringify(opts.body) : undefined,
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  return res.json();
}

const fetchItems     = ()         => apiFetch('/api/v1/items');
const fetchLocations = ()         => apiFetch('/api/v1/locations');
const createItem     = body       => apiFetch('/api/v1/items',      { method: 'POST',   body });
const updateItem     = (id, body) => apiFetch(`/api/v1/items/${id}`, { method: 'PUT',   body });
const deleteItem     = id         => apiFetch(`/api/v1/items/${id}`, { method: 'DELETE' });

// ─── Location Tree ───

function buildTree(locs) {
  const map = new Map(locs.map(l => [l.id, { ...l, children: [] }]));
  const roots = [];
  map.forEach(l => {
    if (l.parent_id && map.has(l.parent_id)) {
      map.get(l.parent_id).children.push(l);
    } else {
      roots.push(l);
    }
  });
  return roots;
}

function makeTreeNode(node, depth) {
  const hasChildren = node.children.length > 0;

  const li = document.createElement('li');
  li.className = 'location-tree-item';

  const label = document.createElement('div');
  label.className = 'loc-label';
  label.style.paddingLeft = `${18 + depth * 14}px`;
  label.dataset.locId = node.id;

  const toggle = document.createElement('span');
  toggle.className = `loc-toggle${hasChildren ? '' : ' leaf'}`;
  toggle.innerHTML = `<svg viewBox="0 0 6 9" fill="currentColor"><path d="M0 0l6 4.5L0 9z"/></svg>`;

  const name = document.createElement('span');
  name.className = 'loc-name';
  name.textContent = node.name;

  label.appendChild(toggle);
  label.appendChild(name);
  li.appendChild(label);

  let childrenUl = null;
  if (hasChildren) {
    childrenUl = document.createElement('ul');
    childrenUl.className = 'loc-children';
    node.children.forEach(c => childrenUl.appendChild(makeTreeNode(c, depth + 1)));
    li.appendChild(childrenUl);
  }

  label.addEventListener('click', () => {
    if (childrenUl) {
      const open = childrenUl.classList.toggle('expanded');
      toggle.classList.toggle('expanded', open);
    }
    document.querySelectorAll('.loc-label').forEach(el => el.classList.remove('active'));
    document.getElementById('all-items-nav').classList.remove('active');
    label.classList.add('active');
    activeLocationId = node.id;
    renderItems();
  });

  return li;
}

function renderTree() {
  const ul = document.getElementById('location-tree');
  ul.innerHTML = '';
  buildTree(allLocations).forEach(node => ul.appendChild(makeTreeNode(node, 0)));
}

function populateLocationSelect() {
  const sel = document.getElementById('f-location');
  sel.innerHTML = '<option value="">— No location —</option>';
  [...allLocations]
    .map(loc => ({ id: loc.id, path: getLocationPath(loc.id) }))
    .sort((a, b) => a.path.localeCompare(b.path))
    .forEach(({ id, path }) => {
      const opt = document.createElement('option');
      opt.value = id;
      opt.textContent = path;
      sel.appendChild(opt);
    });
}

// ─── Items Rendering ───

function getVisible() {
  const q = (document.getElementById('search-input').value || '').trim().toLowerCase();
  let items = allItems;

  if (activeLocationId != null) {
    items = items.filter(i => i.location_id === activeLocationId);
  }

  if (q) {
    items = items.filter(i =>
      (i.name || '').toLowerCase().includes(q) ||
      (i.freeText || '').toLowerCase().includes(q)
    );
  }

  return [...items].sort((a, b) => b.id - a.id);
}

function renderItems() {
  const items = getVisible();
  const tbody = document.getElementById('items-tbody');
  const tableCard = document.getElementById('table-card');
  const emptyState = document.getElementById('empty-state');

  document.getElementById('topbar-title').textContent =
    activeLocationId != null ? locationName(activeLocationId) : 'All Items';
  document.getElementById('topbar-count').textContent =
    `${items.length} ${items.length === 1 ? 'item' : 'items'}`;

  if (items.length === 0) {
    tableCard.classList.add('hide');
    emptyState.classList.remove('hide');
    return;
  }

  tableCard.classList.remove('hide');
  emptyState.classList.add('hide');
  tbody.innerHTML = '';

  items.forEach(item => {
    const qty = item.quantity ?? 0;
    const qtyClass = qty === 0 ? 'qty-zero' : qty <= 2 ? 'qty-low' : 'qty-ok';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td class="col-name">${esc(item.name)}</td>
      <td><span class="qty-badge ${qtyClass}">${qty}</span></td>
      <td>${esc(locationName(item.location_id))}</td>
      <td>${esc(fmtPrice(item.purchase_price))}</td>
      <td>${esc(fmtDate(item.purchase_date))}</td>
      <td class="col-notes" title="${esc(item.freeText || '')}">${esc(item.freeText || '—')}</td>
      <td>
        <div class="col-actions">
          <button class="btn-icon js-edit" data-id="${item.id}" title="Edit">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.23 11.33a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.25.25 0 00.108-.064l6.52-6.52z"/>
            </svg>
          </button>
          <button class="btn-icon danger js-del" data-id="${item.id}" title="Delete">
            <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
              <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.575l.66-6.6a.75.75 0 00-1.492-.15l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z"/>
            </svg>
          </button>
        </div>
      </td>`;

    tr.querySelector('.js-edit').addEventListener('click', () => openEdit(item.id));
    tr.querySelector('.js-del').addEventListener('click', () => handleDelete(item.id));
    tbody.appendChild(tr);
  });
}

// ─── Modal ───

function openAdd() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Add Item';
  document.getElementById('f-name').value = '';
  document.getElementById('f-quantity').value = '1';
  document.getElementById('f-location').value = '';
  document.getElementById('f-price').value = '';
  document.getElementById('f-date').value = '';
  document.getElementById('f-notes').value = '';
  showModal();
}

function openEdit(id) {
  const item = allItems.find(i => i.id === id);
  if (!item) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Edit Item';
  document.getElementById('f-name').value = item.name ?? '';
  document.getElementById('f-quantity').value = item.quantity ?? 1;
  document.getElementById('f-location').value = item.location_id ?? '';
  document.getElementById('f-price').value = item.purchase_price ?? '';
  if (item.purchase_date) {
    const d = new Date(item.purchase_date.replace(' ', 'T'));
    document.getElementById('f-date').value = isNaN(d) ? '' : d.toISOString().slice(0, 10);
  } else {
    document.getElementById('f-date').value = '';
  }
  document.getElementById('f-notes').value = item.freeText ?? '';
  showModal();
}

function showModal() {
  document.getElementById('modal-backdrop').classList.remove('hide');
  document.getElementById('f-name').focus();
}

function closeModal() {
  document.getElementById('modal-backdrop').classList.add('hide');
  editingId = null;
}

async function handleSave() {
  const name = document.getElementById('f-name').value.trim();
  if (!name) { toast('Name is required.', 'error'); return; }

  const quantity     = parseInt(document.getElementById('f-quantity').value) || 0;
  const locVal       = document.getElementById('f-location').value;
  const location_id  = locVal ? parseInt(locVal) : null;
  const priceVal     = document.getElementById('f-price').value.trim();
  const purchase_price = priceVal !== '' ? parseInt(priceVal) : null;
  const dateVal      = document.getElementById('f-date').value;
  const purchase_date = dateVal ? `${dateVal} 00:00:00` : null;
  const freeText     = document.getElementById('f-notes').value.trim() || null;

  const saveBtn = document.getElementById('modal-save-btn');
  saveBtn.disabled = true;
  saveBtn.textContent = 'Saving…';

  try {
    if (editingId) {
      const prev = allItems.find(i => i.id === editingId);
      const updates = {};
      if (name !== prev.name) updates.name = name;
      if (quantity !== prev.quantity) updates.quantity = quantity;
      if (location_id !== prev.location_id) updates.location_id = location_id;
      if (purchase_price !== prev.purchase_price) updates.purchase_price = purchase_price;
      if (purchase_date !== prev.purchase_date) updates.purchase_date = purchase_date;
      if (freeText !== (prev.freeText || null)) updates.freeText = freeText;
      if (Object.keys(updates).length) await updateItem(editingId, updates);
      toast('Item updated.');
    } else {
      // POST requires all 7 fields — send them all even if null
      await createItem({ name, quantity, location_id, purchase_price, currency_id: 1, purchase_date, freeText });
      toast('Item added.');
    }
    closeModal();
    allItems = await fetchItems();
    renderItems();
  } catch (err) {
    toast(err.message || 'Something went wrong.', 'error');
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = 'Save';
  }
}

async function handleDelete(id) {
  const item = allItems.find(i => i.id === id);
  if (!confirm(`Delete "${item ? item.name : `item #${id}`}"?`)) return;
  try {
    await deleteItem(id);
    toast('Item deleted.');
    allItems = await fetchItems();
    renderItems();
  } catch (err) {
    toast(err.message || 'Failed to delete.', 'error');
  }
}

// ─── Init ───

async function init() {
  try {
    [allItems, allLocations] = await Promise.all([fetchItems(), fetchLocations()]);
  } catch {
    toast('Failed to load data. Is the server running?', 'error');
    return;
  }

  renderTree();
  populateLocationSelect();
  renderItems();

  document.getElementById('all-items-nav').addEventListener('click', () => {
    document.querySelectorAll('.loc-label').forEach(el => el.classList.remove('active'));
    document.getElementById('all-items-nav').classList.add('active');
    activeLocationId = null;
    renderItems();
  });

  document.getElementById('add-item-btn').addEventListener('click', openAdd);
  document.getElementById('modal-close-btn').addEventListener('click', closeModal);
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('modal-save-btn').addEventListener('click', handleSave);

  document.getElementById('modal-backdrop').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.getElementById('search-input').addEventListener('input', renderItems);

  document.addEventListener('keydown', e => {
    const modalOpen = !document.getElementById('modal-backdrop').classList.contains('hide');
    if (e.key === 'Escape' && modalOpen) closeModal();
    if (e.key === 'Enter' && modalOpen && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      handleSave();
    }
  });
}

document.addEventListener('DOMContentLoaded', init);
