import type { Location, LocationNode } from "./types";

export function buildTree(locations: Location[]): LocationNode[] {
  const map = new Map(
    locations.map((l) => [l.id, { ...l, children: [] as LocationNode[] }]),
  );
  const roots: LocationNode[] = [];
  map.forEach((node) => {
    if (node.parent_id != null && map.has(node.parent_id)) {
      map.get(node.parent_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

export function getLocationPath(
  id: number | null,
  locations: Location[],
): string {
  if (id === null) return "—";
  const parts: string[] = [];
  let cur = locations.find((l) => l.id === id) ?? null;
  while (cur) {
    parts.unshift(cur.name);
    const pid = cur.parent_id;
    cur = pid != null ? (locations.find((l) => l.id === pid) ?? null) : null;
  }
  return parts.join(" → ") || "—";
}

export function fmtDate(raw: string | null | undefined): string {
  if (!raw) return "—";
  const d = new Date(raw.replace(" ", "T"));
  return isNaN(d.getTime())
    ? raw
    : d.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
}

export function fmtPrice(val: number | null | undefined): string {
  if (val == null) return "—";
  return (val / 100).toLocaleString(undefined, {
    style: "currency",
    currency: "EUR",
  });
}
