import { useState, useEffect, useMemo } from "react";
import type { Item, Location } from "./types";
import type { ItemFormPayload } from "./components/ItemModal";
import {
  getItems,
  getLocations,
  createItem,
  updateItem,
  removeItem,
} from "./api";
import { getLocationPath } from "./utils";
import { Sidebar } from "./components/Sidebar";
import { Topbar } from "./components/Topbar";
import { ItemsTable } from "./components/ItemsTable";
import { ItemModal } from "./components/ItemModal";
import { ItemDetailModal } from "./components/ItemDetailModal";
import { EmptyState } from "./components/EmptyState";
import { ToastContainer, useToast } from "./components/Toast";

type ModalState = "new" | Item | null;

// Only send fields that actually changed so PUT stays minimal
function diffItem(prev: Item, next: ItemFormPayload): Partial<ItemFormPayload> {
  const patch: Partial<ItemFormPayload> = {};
  if (next.name !== prev.name) patch.name = next.name;
  if (next.quantity !== prev.quantity) patch.quantity = next.quantity;
  if (next.location_id !== prev.location_id)
    patch.location_id = next.location_id;
  if (next.purchase_price !== prev.purchase_price)
    patch.purchase_price = next.purchase_price;
  if (next.purchase_date !== prev.purchase_date)
    patch.purchase_date = next.purchase_date;
  if ((next.freeText || null) !== (prev.freeText || null))
    patch.freeText = next.freeText;
  return patch;
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeLocationId, setActiveLocationId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [modal, setModal] = useState<ModalState>(null);
  const [detailItem, setDetailItem] = useState<Item | null>(null);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    Promise.all([getItems(), getLocations()])
      .then(([its, locs]) => {
        setItems(its);
        setLocations(locs);
      })
      .catch(() =>
        showToast("Failed to load data. Is the server running?", "error"),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items
      .filter(
        (i) => activeLocationId == null || i.location_id === activeLocationId,
      )
      .filter(
        (i) =>
          !q ||
          i.name.toLowerCase().includes(q) ||
          (i.freeText ?? "").toLowerCase().includes(q),
      )
      .sort((a, b) => b.id - a.id);
  }, [items, activeLocationId, searchQuery]);

  const topbarTitle =
    activeLocationId != null
      ? getLocationPath(activeLocationId, locations)
      : "All Items";

  async function handleSave(payload: ItemFormPayload) {
    if (modal === "new") {
      await createItem(payload);
      showToast("Item added.");
    } else if (modal !== null) {
      const patch = diffItem(modal, payload);
      if (Object.keys(patch).length > 0) await updateItem(modal.id, patch);
      showToast("Item updated.");
    }
    setModal(null);
    setItems(await getItems());
  }

  async function handleDelete(item: Item) {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await removeItem(item.id);
      showToast("Item deleted.");
      setItems(await getItems());
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete.",
        "error",
      );
    }
  }

  return (
    <>
      <Sidebar
        locations={locations}
        activeLocationId={activeLocationId}
        onSelectLocation={(id) => {
          setActiveLocationId(id);
          setSearchQuery("");
        }}
      />

      <main className="main">
        <Topbar
          title={topbarTitle}
          count={visibleItems.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onAdd={() => setModal("new")}
        />
        <div className="content">
          {visibleItems.length > 0 ? (
            <ItemsTable
              items={visibleItems}
              locations={locations}
              onRowClick={(item) => setDetailItem(item)}
              onEdit={(item) => setModal(item)}
              onDelete={handleDelete}
            />
          ) : (
            <EmptyState />
          )}
        </div>
      </main>

      {modal !== null && (
        <ItemModal
          item={modal === "new" ? null : modal}
          locations={locations}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {detailItem !== null && (
        <ItemDetailModal
          item={detailItem}
          locations={locations}
          onClose={() => setDetailItem(null)}
          onEdit={(item) => {
            setDetailItem(null);
            setModal(item);
          }}
        />
      )}

      <ToastContainer toasts={toasts} />
    </>
  );
}
