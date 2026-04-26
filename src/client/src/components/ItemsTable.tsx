import type { Item, Location } from "../types";
import { fmtDate, fmtPrice, getLocationPath } from "../utils";

function qtyClass(qty: number) {
  if (qty === 0) return "qty-zero";
  if (qty <= 2) return "qty-low";
  return "qty-ok";
}

const EditIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
    <path d="M11.013 1.427a1.75 1.75 0 012.474 0l1.086 1.086a1.75 1.75 0 010 2.474l-8.61 8.61c-.21.21-.47.364-.756.445l-3.251.93a.75.75 0 01-.927-.928l.929-3.25c.081-.286.235-.547.445-.758l8.61-8.61zm1.414 1.06a.25.25 0 00-.354 0L10.811 3.75l1.439 1.44 1.263-1.263a.25.25 0 000-.354l-1.086-1.086zM11.189 6.25L9.75 4.81 3.23 11.33a.25.25 0 00-.064.108l-.558 1.953 1.953-.558a.25.25 0 00.108-.064l6.52-6.52z" />
  </svg>
);

const TrashIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14">
    <path d="M6.5 1.75a.25.25 0 01.25-.25h2.5a.25.25 0 01.25.25V3h-3V1.75zm4.5 0V3h2.25a.75.75 0 010 1.5H2.75a.75.75 0 010-1.5H5V1.75C5 .784 5.784 0 6.75 0h2.5C10.216 0 11 .784 11 1.75zM4.496 6.675a.75.75 0 10-1.492.15l.66 6.6A1.75 1.75 0 005.405 15h5.19c.9 0 1.652-.681 1.741-1.575l.66-6.6a.75.75 0 00-1.492-.15l-.66 6.6a.25.25 0 01-.249.225h-5.19a.25.25 0 01-.249-.225l-.66-6.6z" />
  </svg>
);

interface ItemsTableProps {
  items: Item[];
  locations: Location[];
  onRowClick: (item: Item) => void;
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
}

export function ItemsTable({
  items,
  locations,
  onRowClick,
  onEdit,
  onDelete,
}: ItemsTableProps) {
  return (
    <div className="table-card">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>Location</th>
            <th>Price</th>
            <th>Date</th>
            <th>Notes</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const qty = item.quantity ?? 0;
            const locPath = getLocationPath(item.location_id, locations);
            return (
              <tr
                key={item.id}
                className="clickable-row"
                onClick={() => onRowClick(item)}
              >
                <td className="col-name">{item.name}</td>
                <td>
                  <span className={`qty-badge ${qtyClass(qty)}`}>{qty}</span>
                </td>
                <td className="col-location" title={locPath}>
                  {locPath}
                </td>
                <td>{fmtPrice(item.purchase_price)}</td>
                <td>{fmtDate(item.purchase_date)}</td>
                <td className="col-notes" title={item.freeText ?? ""}>
                  {item.freeText || "—"}
                </td>
                <td>
                  <div className="col-actions">
                    <button
                      className="btn-icon"
                      title="Edit"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(item);
                      }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="btn-icon danger"
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(item);
                      }}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
