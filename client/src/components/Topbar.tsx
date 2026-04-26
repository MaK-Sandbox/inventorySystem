interface TopbarProps {
  title: string;
  count: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAdd: () => void;
}

export function Topbar({ title, count, searchQuery, onSearchChange, onAdd }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-title-area">
        <div className="topbar-title">{title}</div>
        <div className="topbar-count">
          {count} {count === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="topbar-actions">
        <div className="search-wrapper">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 001.415-1.414l-3.85-3.85a1.007 1.007 0 00-.115-.099zm-5.242 1.156a5.5 5.5 0 110-11 5.5 5.5 0 010 11z" />
          </svg>
          <input
            className="search-input"
            type="search"
            placeholder="Search items…"
            autoComplete="off"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
          />
        </div>

        <button className="btn btn-primary" onClick={onAdd}>
          <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13">
            <path d="M8 2a.75.75 0 01.75.75v4.5h4.5a.75.75 0 010 1.5h-4.5v4.5a.75.75 0 01-1.5 0v-4.5h-4.5a.75.75 0 010-1.5h4.5v-4.5A.75.75 0 018 2z" />
          </svg>
          New Item
        </button>
      </div>
    </header>
  );
}
