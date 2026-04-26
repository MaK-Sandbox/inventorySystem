import { useState } from "react";
import type { Location, LocationNode } from "../types";
import { buildTree } from "../utils";

// ─── Tree node ───────────────────────────────────────────────────────────────

interface TreeNodeProps {
  node: LocationNode;
  activeId: number | null;
  onSelect: (id: number) => void;
  depth: number;
}

function TreeNode({ node, activeId, onSelect, depth }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(false);
  const hasChildren = node.children.length > 0;

  function handleClick() {
    if (hasChildren) setExpanded((e) => !e);
    onSelect(node.id);
  }

  return (
    <li className="location-tree-item">
      <div
        className={`loc-label${activeId === node.id ? " active" : ""}`}
        style={{ paddingLeft: `${18 + depth * 14}px` }}
        onClick={handleClick}
      >
        <span
          className={`loc-toggle${expanded ? " expanded" : ""}${!hasChildren ? " leaf" : ""}`}
        >
          <svg viewBox="0 0 6 9" fill="currentColor">
            <path d="M0 0l6 4.5L0 9z" />
          </svg>
        </span>
        <span className="loc-name">{node.name}</span>
      </div>

      {hasChildren && expanded && (
        <ul className="loc-children expanded">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              activeId={activeId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────

interface SidebarProps {
  locations: Location[];
  activeLocationId: number | null;
  onSelectLocation: (id: number | null) => void;
}

export function Sidebar({
  locations,
  activeLocationId,
  onSelectLocation,
}: SidebarProps) {
  const tree = buildTree(locations);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <div className="sidebar-title">Inventory</div>
          <div className="sidebar-subtitle">Home System</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div
          className={`nav-item${activeLocationId === null ? " active" : ""}`}
          onClick={() => onSelectLocation(null)}
        >
          <svg className="nav-icon" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 2.5A1.5 1.5 0 012.5 1h3A1.5 1.5 0 017 2.5v3A1.5 1.5 0 015.5 7h-3A1.5 1.5 0 011 5.5v-3zm8 0A1.5 1.5 0 0110.5 1h3A1.5 1.5 0 0115 2.5v3A1.5 1.5 0 0113.5 7h-3A1.5 1.5 0 019 5.5v-3zm-8 8A1.5 1.5 0 012.5 9h3A1.5 1.5 0 017 10.5v3A1.5 1.5 0 015.5 15h-3A1.5 1.5 0 011 13.5v-3zm8 0A1.5 1.5 0 0110.5 9h3a1.5 1.5 0 011.5 1.5v3a1.5 1.5 0 01-1.5 1.5h-3A1.5 1.5 0 019 13.5v-3z" />
          </svg>
          All Items
        </div>

        <div className="nav-section-label">Locations</div>
        <ul className="location-tree">
          {tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              activeId={activeLocationId}
              onSelect={onSelectLocation}
              depth={0}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
}
