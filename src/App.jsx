import React, { useState, useCallback, useRef, useMemo } from 'react';
import DataTable from './DataTable';

// ═══════════════════════════════════════════════════════════════════════════
// Syntax highlighter (zero deps)
// ═══════════════════════════════════════════════════════════════════════════

const TOKEN_RE = new RegExp(
  [
    '(?<comment>\\/\\/[^\\n]*)',
    '(?<str>"(?:[^"\\\\]|\\\\.)*"|\'(?:[^\'\\\\]|\\\\.)*\'|`(?:[^`\\\\]|\\\\.)*`)',
    '(?<comp><\\/?[A-Z]\\w*)',
    '(?<tag><[a-z]\\w*|<\\/[a-z]\\w*|\\/?>)',
    '(?<kw>\\b(?:const|let|var|function|return|async|await|import|from|export|default|new|if|else|for|of|in)\\b)',
    '(?<bool>\\b(?:true|false|null|undefined)\\b)',
    '(?<num>\\b\\d+(?:\\.\\d+)?\\b)',
    '(?<other>[\\s\\S])',
  ].join('|'),
  'g'
);

const TOKEN_COLOR = {
  comment: '#6b7280',
  str:     '#86efac',
  comp:    '#60a5fa',
  tag:     '#f9a8d4',
  kw:      '#c084fc',
  bool:    '#fb923c',
  num:     '#fbbf24',
  other:   '#e2e8f0',
};

function tokenize(src) {
  const out = [];
  TOKEN_RE.lastIndex = 0;
  let m;
  while ((m = TOKEN_RE.exec(src)) !== null) {
    const type = Object.keys(m.groups).find(k => m.groups[k] !== undefined);
    const last = out[out.length - 1];
    if (type === 'other' && last?.type === 'other') {
      last.text += m[0];
    } else {
      out.push({ type, text: m[0] });
    }
  }
  return out;
}

function Highlighted({ code }) {
  const tokens = useMemo(() => tokenize(code), [code]);
  return (
    <>
      {tokens.map((t, i) => (
        <span key={i} style={{ color: TOKEN_COLOR[t.type], fontStyle: t.type === 'comment' ? 'italic' : 'normal' }}>
          {t.text}
        </span>
      ))}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// CodeBlock — collapsible dark code panel with copy button
// ═══════════════════════════════════════════════════════════════════════════

function CodeBlock({ code }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '5px 12px', border: '1px solid #e5e7eb', borderRadius: 6,
          background: open ? '#1e293b' : '#fff', color: open ? '#94a3b8' : '#6b7280',
          cursor: 'pointer', fontSize: 12, fontFamily: 'inherit',
          transition: 'all .15s',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6">
          <polyline points={open ? '3,9 7,5 11,9' : '3,5 7,9 11,5'} />
        </svg>
        {open ? 'Hide code' : 'View code'}
      </button>

      {open && (
        <div style={{
          marginTop: 8, borderRadius: 8, overflow: 'hidden',
          border: '1px solid #1e293b',
        }}>
          {/* Header bar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '7px 14px', background: '#0f172a', borderBottom: '1px solid #1e293b',
          }}>
            <span style={{ fontSize: 11, color: '#475569', fontFamily: 'monospace', letterSpacing: '.04em' }}>JSX</span>
            <button
              onClick={copy}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '3px 10px', border: '1px solid #334155', borderRadius: 4,
                background: copied ? '#166534' : '#1e293b', color: copied ? '#86efac' : '#94a3b8',
                cursor: 'pointer', fontSize: 11, fontFamily: 'inherit', transition: 'all .15s',
              }}
            >
              {copied
                ? <><svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1,6 4,9 11,3"/></svg> Copied</>
                : <><svg width="11" height="11" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="5" y="1" width="8" height="10" rx="1"/><rect x="1" y="3" width="8" height="10" rx="1" fill="#1e293b"/></svg> Copy</>
              }
            </button>
          </div>
          {/* Code body */}
          <pre style={{
            margin: 0, padding: '16px 18px', background: '#0f172a',
            fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace",
            fontSize: 13, lineHeight: 1.7, overflowX: 'auto',
            color: '#e2e8f0', whiteSpace: 'pre',
          }}>
            <Highlighted code={code} />
          </pre>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Sample data
// ═══════════════════════════════════════════════════════════════════════════

const BASE_APPS = [
  { id: 1,  name: 'Achieve3000',      type: 'Browser Extension', status: 'Active',   users: 1240, updatedAt: '2025-07-01, 11:38' },
  { id: 2,  name: 'Addthis',          type: 'Browser Extension', status: 'Active',   users: 380,  updatedAt: '2025-07-01, 11:39' },
  { id: 3,  name: 'asdfadfsdfs',      type: 'Password Less',     status: 'Inactive', users: 0,    updatedAt: '2025-07-01, 11:38' },
  { id: 4,  name: 'Default API App',  type: 'Desktop',           status: 'Active',   users: 56,   updatedAt: '2025-01-29, 07:21' },
  { id: 5,  name: 'Evernote',         type: 'Browser Extension', status: 'Active',   users: 920,  updatedAt: '2025-08-04, 08:20' },
  { id: 6,  name: 'Google Apps',      type: 'SAML',              status: 'Active',   users: 4500, updatedAt: '2025-07-01, 11:33' },
  { id: 7,  name: 'hNfkasdflaskdjff', type: 'JWT',               status: 'Error',    users: 12,   updatedAt: '2025-07-04, 10:41' },
  { id: 8,  name: 'My Apps',          type: 'JWT',               status: 'Active',   users: 200,  updatedAt: '2025-07-01, 11:39' },
  { id: 9,  name: 'new aps',          type: 'JWT',               status: 'Inactive', users: 0,    updatedAt: '2025-07-01, 11:40' },
  { id: 10, name: 'sadfsadfsdafsf',   type: 'Provisioning',      status: 'Active',   users: 88,   updatedAt: '2025-09-27, 04:44' },
  { id: 11, name: 'Salesforce',       type: 'SAML',              status: 'Active',   users: 3200, updatedAt: '2025-06-15, 09:00' },
  { id: 12, name: 'Slack',            type: 'OAuth',             status: 'Active',   users: 2800, updatedAt: '2025-05-20, 14:22' },
  { id: 13, name: 'Dropbox',          type: 'OAuth',             status: 'Inactive', users: 0,    updatedAt: '2025-03-10, 07:15' },
  { id: 14, name: 'Jira',             type: 'SAML',              status: 'Active',   users: 1800, updatedAt: '2025-07-30, 16:45' },
  { id: 15, name: 'Confluence',       type: 'SAML',              status: 'Active',   users: 1500, updatedAt: '2025-07-30, 16:50' },
  { id: 16, name: 'Zoom',             type: 'OAuth',             status: 'Active',   users: 3600, updatedAt: '2025-08-12, 10:00' },
  { id: 17, name: 'GitHub',           type: 'OAuth',             status: 'Active',   users: 980,  updatedAt: '2025-06-01, 08:30' },
  { id: 18, name: 'Trello',           type: 'OAuth',             status: 'Inactive', users: 0,    updatedAt: '2025-02-28, 11:00' },
  { id: 19, name: 'Zendesk',          type: 'SAML',              status: 'Active',   users: 640,  updatedAt: '2025-07-05, 13:00' },
  { id: 20, name: 'HubSpot',          type: 'JWT',               status: 'Error',    users: 75,   updatedAt: '2025-08-01, 09:30' },
];

// ═══════════════════════════════════════════════════════════════════════════
// Shared cell components
// ═══════════════════════════════════════════════════════════════════════════

const APP_ICONS = {
  'Browser Extension': '🔌', 'Password Less': '🔑', Desktop: '🖥️',
  SAML: '🔐', JWT: '🎫', OAuth: '🔗', Provisioning: '⚙️',
};
const STATUS_COLORS = {
  Active:   { bg: '#dcfce7', fg: '#16a34a' },
  Inactive: { bg: '#f3f4f6', fg: '#6b7280' },
  Error:    { bg: '#fee2e2', fg: '#dc2626' },
};

function AppNameCell({ row }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{
        width: 32, height: 32, borderRadius: 6, background: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 16, flexShrink: 0,
      }}>
        {APP_ICONS[row.type] ?? '📦'}
      </span>
      <span style={{ fontWeight: 500, color: '#111827' }}>{row.name}</span>
    </div>
  );
}

function StatusBadge({ value }) {
  const c = STATUS_COLORS[value] ?? STATUS_COLORS.Inactive;
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 999, fontSize: 12,
      fontWeight: 600, background: c.bg, color: c.fg,
    }}>
      {value}
    </span>
  );
}

function ActionsMenu({ row }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={e => { e.stopPropagation(); setOpen(v => !v); }}
        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '4px 10px', borderRadius: 4, fontSize: 20, color: '#9ca3af', lineHeight: 1 }}
      >⋮</button>
      {open && (
        <div style={{ position: 'absolute', right: 0, top: '100%', zIndex: 100, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,.12)', minWidth: 140, padding: '4px 0' }}>
          {['Edit', 'Duplicate', 'Disable', 'Delete'].map(a => (
            <button key={a} onClick={e => { e.stopPropagation(); alert(`${a}: ${row.name}`); setOpen(false); }}
              style={{ display: 'block', width: '100%', padding: '8px 14px', border: 'none', background: 'none', textAlign: 'left', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: a === 'Delete' ? '#dc2626' : '#374151' }}
            >{a}</button>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Base columns
// ═══════════════════════════════════════════════════════════════════════════

const BASE_COLS = [
  { field: 'name', headerName: 'Application Name', flex: 1, minWidth: 220, pinned: 'left', renderCell: ({ row }) => <AppNameCell row={row} /> },
  { field: 'type', headerName: 'App Type', width: 180, renderCell: ({ value }) => <span style={{ color: '#6b7280' }}>{value}</span> },
  { field: 'status', headerName: 'Status', width: 120, renderCell: ({ value }) => <StatusBadge value={value} /> },
  { field: 'users', headerName: 'Users', width: 110, align: 'right', headerAlign: 'right', renderCell: ({ value }) => <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value.toLocaleString()}</span> },
  { field: 'updatedAt', headerName: 'Last Updated', width: 190, renderCell: ({ value }) => <span style={{ color: '#6b7280' }}>{value}</span> },
  { field: 'actions', headerName: 'Actions', width: 90, sortable: false, hideable: false, resizable: false, align: 'center', headerAlign: 'center', pinned: 'right', renderCell: ({ row }) => <ActionsMenu row={row} /> },
];

// ═══════════════════════════════════════════════════════════════════════════
// Section wrapper
// ═══════════════════════════════════════════════════════════════════════════

function Section({ title, desc, code, children }) {
  return (
    <div style={{ marginBottom: 48 }}>
      <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#111827' }}>{title}</h3>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#6b7280' }}>{desc}</p>
      {code && <CodeBlock code={code} />}
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Demos
// ═══════════════════════════════════════════════════════════════════════════

function DemoBasic() {
  const snippet = `<DataTable
  rows={rows}
  columns={[
    {
      field: 'name',
      headerName: 'Application Name',
      flex: 1,
      minWidth: 220,
      pinned: 'left',                  // sticky left
      renderCell: ({ row }) => <AppNameCell row={row} />,
    },
    { field: 'type',      headerName: 'App Type',     width: 180 },
    { field: 'status',    headerName: 'Status',       width: 120 },
    { field: 'updatedAt', headerName: 'Last Updated', width: 190 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 90,
      sortable: false,
      hideable: false,
      pinned: 'right',                 // sticky right
      renderCell: ({ row }) => <ActionsMenu row={row} />,
    },
  ]}
/>`;
  return (
    <Section title="Basic Table" desc="Click column headers to sort. Drag column edges to resize. Use the Columns button to show/hide columns." code={snippet}>
      <DataTable rows={BASE_APPS} columns={BASE_COLS} />
    </Section>
  );
}

function DemoSelection() {
  const [sel, setSel] = useState(new Set());
  const snippet = `const [selection, setSelection] = useState(new Set());

<DataTable
  rows={rows}
  columns={columns}
  checkboxSelection                    // show checkbox column
  selectionModel={selection}           // controlled
  onSelectionChange={setSelection}     // fires with full Set of IDs
  pagination
  defaultPageSize={5}
  pageSizeOptions={[5, 10, 20]}
/>

// Selection persists across pages — IDs are stored in a Set,
// not tied to the visible page.`;
  return (
    <Section title="Checkbox Selection — persists across pages" desc="Select rows on page 1 → go to page 2 → come back. Selection survives pagination. Select-all targets current page only." code={snippet}>
      <div style={{ marginBottom: 10, fontSize: 13, color: '#6b7280' }}>
        Selected IDs: <strong style={{ color: '#111' }}>{sel.size ? [...sel].join(', ') : 'none'}</strong>
        {sel.size > 0 && (
          <button onClick={() => setSel(new Set())} style={{ marginLeft: 10, padding: '2px 10px', border: '1px solid #e5e7eb', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Clear all</button>
        )}
      </div>
      <DataTable rows={BASE_APPS} columns={BASE_COLS} checkboxSelection selectionModel={sel} onSelectionChange={setSel} pagination defaultPageSize={5} pageSizeOptions={[5, 10, 20]} />
    </Section>
  );
}

function DemoPagination() {
  const snippet = `<DataTable
  rows={rows}
  columns={columns}
  checkboxSelection
  showRowNumbers                       // adds a # column
  pagination                           // enable pagination footer
  defaultPageSize={5}                  // initial page size
  pageSizeOptions={[3, 5, 10, 20]}     // rows-per-page dropdown
/>

// Server-side pagination:
<DataTable
  rows={currentPageRows}               // only the current page's data
  columns={columns}
  pagination
  rowCount={totalRowsFromServer}       // total count for page calc
  page={page}                          // controlled (0-indexed)
  onPageChange={p => setPage(p)}
  defaultPageSize={25}
/>`;
  return (
    <Section title="Pagination + Row Numbers" desc="First/Prev/ellipsis/Next/Last, rows-per-page selector, row index column." code={snippet}>
      <DataTable rows={BASE_APPS} columns={BASE_COLS} checkboxSelection pagination defaultPageSize={5} pageSizeOptions={[3, 5, 10, 20]} showRowNumbers />
    </Section>
  );
}

function DemoInfiniteScroll() {
  const [rows, setRows] = useState(BASE_APPS.slice(0, 5));
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const batch = useRef(1);

  const loadMore = useCallback(async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 900));
    const next = BASE_APPS.slice(0, 5).map(r => ({ ...r, id: r.id + batch.current * 100, name: `${r.name} (batch ${batch.current})` }));
    batch.current++;
    setRows(prev => [...prev, ...next]);
    if (batch.current > 4) setHasMore(false);
    setLoading(false);
  }, []);

  const snippet = `const [rows, setRows] = useState(initialRows);
const [hasMore, setHasMore] = useState(true);
const [loading, setLoading] = useState(false);

const loadMore = async () => {
  setLoading(true);
  const next = await fetchNextBatch();  // your fetch
  setRows(prev => [...prev, ...next]);
  if (noMoreData) setHasMore(false);
  setLoading(false);
};

// Wrap in a height-constrained container so it scrolls internally:
<div style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
  <DataTable
    rows={rows}
    columns={columns}
    infiniteScroll              // enables IntersectionObserver sentinel
    onLoadMore={loadMore}       // fired when sentinel enters viewport
    hasMore={hasMore}
    loading={loading}
    style={{ flex: 1 }}
  />
</div>`;
  return (
    <Section title="Infinite Scroll" desc="Scroll to the bottom — IntersectionObserver triggers onLoadMore. Batches append to rows." code={snippet}>
      <div style={{ height: 380, display: 'flex', flexDirection: 'column' }}>
        <DataTable rows={rows} columns={BASE_COLS} infiniteScroll onLoadMore={loadMore} hasMore={hasMore} loading={loading} style={{ flex: 1 }} />
      </div>
    </Section>
  );
}

function DemoHighlights() {
  const [hlRows, setHlRows] = useState(new Set([5, 7, 20]));
  const toggleHL = id => setHlRows(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const hlCols = BASE_COLS.map(c => c.field === 'users' ? { ...c, highlight: true } : c);

  const snippet = `// 1. Row highlights — pass a Set (or Array) of row IDs
<DataTable
  rows={rows}
  columns={columns}
  highlightedRows={new Set([5, 7, 20])}   // yellow background
  onRowClick={({ row }) => toggleRowHL(row.id)}
  pagination
  defaultPageSize={10}
/>

// 2. Column highlight — set highlight:true on the column def
const columns = [
  { field: 'name', headerName: 'Name', ... },
  {
    field: 'users',
    headerName: 'Users',
    highlight: true,                // entire column gets blue tint
  },
  ...
];`;
  return (
    <Section title="Row & Column Highlights" desc="Yellow rows = highlighted IDs (click any row to toggle). Blue column = highlight:true on the column def." code={snippet}>
      <DataTable rows={BASE_APPS} columns={hlCols} highlightedRows={hlRows} onRowClick={({ row }) => toggleHL(row.id)} pagination defaultPageSize={10} />
    </Section>
  );
}

function DemoCustomCells() {
  const richCols = [
    { field: 'name', headerName: 'Application Name', flex: 1, minWidth: 220, pinned: 'left', renderCell: ({ row }) => <AppNameCell row={row} /> },
    {
      field: 'type', headerName: 'App Type', width: 180,
      renderCell: ({ value }) => <span style={{ padding: '3px 10px', borderRadius: 6, fontSize: 12, fontWeight: 500, background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#374151' }}>{value}</span>,
    },
    { field: 'status', headerName: 'Status', width: 130, renderCell: ({ value }) => <StatusBadge value={value} /> },
    {
      field: 'users', headerName: 'Users', width: 220,
      renderCell: ({ value }) => {
        const max = Math.max(...BASE_APPS.map(r => r.users));
        const pct = max ? (value / max) * 100 : 0;
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
            <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ width: `${pct}%`, height: '100%', background: '#ef4444', borderRadius: 3 }} />
            </div>
            <span style={{ fontSize: 12, color: '#6b7280', width: 44, textAlign: 'right' }}>{value.toLocaleString()}</span>
          </div>
        );
      },
    },
    { field: 'actions', headerName: 'Actions', width: 90, sortable: false, hideable: false, align: 'center', headerAlign: 'center', pinned: 'right', renderCell: ({ row }) => <ActionsMenu row={row} /> },
  ];

  const snippet = `const columns = [
  {
    field: 'name',
    headerName: 'Application Name',
    renderCell: ({ row, value, rowIndex }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={row.iconUrl} width={28} height={28} style={{ borderRadius: 6 }} />
        <strong>{value}</strong>
      </div>
    ),
  },
  {
    field: 'users',
    headerName: 'Users',
    renderCell: ({ value }) => (
      // Progress bar example
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%' }}>
        <div style={{ flex: 1, height: 6, background: '#f3f4f6', borderRadius: 3 }}>
          <div style={{ width: \`\${(value / maxUsers) * 100}%\`, height: '100%', background: '#ef4444', borderRadius: 3 }} />
        </div>
        <span>{value.toLocaleString()}</span>
      </div>
    ),
  },
  {
    field: 'status',
    renderCell: ({ value }) => <StatusBadge status={value} />,  // any component
  },
];`;
  return (
    <Section title="Custom Cell Rendering" desc="renderCell receives { row, value, rowIndex } — return any JSX: badges, progress bars, avatars, dropdowns." code={snippet}>
      <DataTable rows={BASE_APPS} columns={richCols} pagination defaultPageSize={10} />
    </Section>
  );
}

function DemoSorting() {
  const [sortModel, setSortModel] = useState([{ field: 'users', sort: 'desc' }]);
  const snippet = `// Uncontrolled (internal state):
<DataTable
  rows={rows}
  columns={columns}
  defaultSortModel={[{ field: 'name', sort: 'asc' }]}
/>

// Controlled sort:
const [sortModel, setSortModel] = useState([{ field: 'users', sort: 'desc' }]);

<DataTable
  rows={rows}
  columns={columns}
  sortModel={sortModel}
  onSortModelChange={setSortModel}
  multiSort               // allow sorting by multiple columns simultaneously
  pagination
  defaultPageSize={10}
/>

// Custom sort comparator per column:
const columns = [
  {
    field: 'updatedAt',
    sortComparator: (a, b) => new Date(a) - new Date(b),
  },
];`;
  return (
    <Section title="Sorting — controlled + multi-column" desc={`Active sort: ${sortModel.map(s => `${s.field} ${s.sort}`).join(', ') || 'none'}. multiSort enabled — click more headers to stack.`} code={snippet}>
      <DataTable rows={BASE_APPS} columns={BASE_COLS} sortModel={sortModel} onSortModelChange={setSortModel} multiSort pagination defaultPageSize={10} />
    </Section>
  );
}

function DemoRowStyles() {
  const snippet = `<DataTable
  rows={rows}
  columns={columns}
  // Add a CSS class name to specific rows:
  getRowClassName={({ row, rowIndex }) =>
    row.status === 'Error' ? 'my-error-row' : ''
  }
  // Add inline styles to specific rows:
  getRowStyle={({ row, rowIndex }) => {
    if (row.status === 'Inactive') return { opacity: 0.45 };
    if (row.status === 'Error')    return { boxShadow: 'inset 3px 0 0 #ef4444' };
    return undefined;
  }}
  pagination
  defaultPageSize={10}
/>`;
  return (
    <Section title="Conditional Row Styling" desc="Error rows get a red left border. Inactive rows are dimmed via opacity. Both getRowClassName and getRowStyle are supported." code={snippet}>
      <DataTable
        rows={BASE_APPS} columns={BASE_COLS}
        getRowClassName={({ row }) => row.status === 'Error' ? 'row-error' : ''}
        getRowStyle={({ row }) =>
          row.status === 'Inactive' ? { opacity: 0.45 }
          : row.status === 'Error'   ? { boxShadow: 'inset 3px 0 0 #ef4444' }
          : undefined
        }
        pagination defaultPageSize={10}
      />
    </Section>
  );
}

function DemoDensity() {
  const [density, setDensity] = useState('comfortable');
  const snippet = `// Preset density controls row height + font size globally
<DataTable
  rows={rows}
  columns={columns}
  density="compact"     // 'compact' | 'comfortable' | 'spacious'
  pagination
  defaultPageSize={8}
/>

// Compact:    row height 36px, font 13px
// Comfortable: row height 52px, font 14px  (default)
// Spacious:   row height 68px, font 14px

// Or override exactly via sx:
<DataTable sx={{ rowHeight: '44px', fontSize: '13px' }} ... />`;
  return (
    <Section title="Density Modes" desc="Switch row height and font size. Three presets or exact override via sx." code={snippet}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        {['compact', 'comfortable', 'spacious'].map(d => (
          <button key={d} onClick={() => setDensity(d)} style={{ padding: '5px 16px', borderRadius: 6, cursor: 'pointer', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: 13, background: density === d ? '#111827' : '#fff', color: density === d ? '#fff' : '#374151' }}>{d}</button>
        ))}
      </div>
      <DataTable rows={BASE_APPS} columns={BASE_COLS} density={density} pagination defaultPageSize={8} />
    </Section>
  );
}

function DemoTheme() {
  const themes = {
    'Default (Red)': {},
    'Blue':    { accent: '#3b82f6', '--dt-row-selected': '#eff6ff' },
    'Green':   { accent: '#16a34a', '--dt-row-selected': '#f0fdf4' },
    'Purple':  { accent: '#7c3aed', '--dt-row-selected': '#f5f3ff' },
    'Dark Header': { '--dt-header-bg': '#1e293b', '--dt-header-fg': '#f8fafc' },
  };
  const [theme, setTheme] = useState('Default (Red)');
  const snippet = `// sx accepts shorthand keys (mapped to CSS variables)
// or raw CSS variable names as keys.
<DataTable
  rows={rows}
  columns={columns}
  sx={{
    accent: '#3b82f6',               // shorthand → --dt-accent
    '--dt-header-bg': '#1e293b',     // raw CSS variable
    '--dt-header-fg': '#f8fafc',
    '--dt-row-selected': '#eff6ff',
    borderRadius: '12px',            // shorthand → --dt-radius
  }}
/>

// All shorthand keys:
// accent, borderColor, headerBg, rowBg, rowHover,
// rowSelected, text, fontSize, rowHeight,
// headerHeight, borderRadius`;
  return (
    <Section title="Custom Theming via sx prop" desc="Override any CSS variable. Use shorthand keys or pass --dt-* variables directly." code={snippet}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {Object.keys(themes).map(t => (
          <button key={t} onClick={() => setTheme(t)} style={{ padding: '5px 14px', borderRadius: 6, cursor: 'pointer', border: '1px solid #e5e7eb', fontFamily: 'inherit', fontSize: 13, background: theme === t ? '#111827' : '#fff', color: theme === t ? '#fff' : '#374151' }}>{t}</button>
        ))}
      </div>
      <DataTable rows={BASE_APPS} columns={BASE_COLS} checkboxSelection pagination defaultPageSize={8} sx={themes[theme]} />
    </Section>
  );
}

function DemoToolbar() {
  const [search, setSearch] = useState('');
  const filtered = BASE_APPS.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.type.toLowerCase().includes(search.toLowerCase())
  );
  const snippet = `// toolbarContent renders in the left slot of the built-in toolbar.
// The built-in "Columns" visibility button remains on the right.
const [search, setSearch] = useState('');
const filtered = rows.filter(r =>
  r.name.toLowerCase().includes(search.toLowerCase())
);

<DataTable
  rows={filtered}
  columns={columns}
  toolbarContent={
    <input
      className="dt-input"           // use built-in input style
      placeholder="Search apps…"
      value={search}
      onChange={e => setSearch(e.target.value)}
      style={{ width: 240 }}
    />
  }
  checkboxSelection
  pagination
  defaultPageSize={8}
/>

// toolbar={false} to hide the toolbar entirely.`;
  return (
    <Section title="Toolbar Slot + Live Search" desc="toolbarContent renders inside the toolbar. Here a live search filter is wired client-side." code={snippet}>
      <DataTable
        rows={filtered} columns={BASE_COLS}
        checkboxSelection pagination defaultPageSize={8}
        toolbarContent={
          <input className="dt-input" placeholder="Search by name or type…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 240 }} />
        }
      />
    </Section>
  );
}

function DemoColumnPinning() {
  const extraCols = Array.from({ length: 5 }, (_, i) => ({
    field: `extra${i}`, headerName: `Extra Col ${String.fromCharCode(65 + i)}`, width: 180,
    renderCell: () => <span style={{ color: '#9ca3af' }}>Data {String.fromCharCode(65 + i)}</span>,
  }));
  const wideCols = [BASE_COLS[0], ...extraCols, BASE_COLS[2], BASE_COLS[3], BASE_COLS[5]];
  const snippet = `const columns = [
  {
    field: 'name',
    headerName: 'Application Name',
    flex: 1,
    pinned: 'left',          // sticky on the left
  },
  { field: 'colA', headerName: 'Col A', width: 200 },
  { field: 'colB', headerName: 'Col B', width: 200 },
  { field: 'colC', headerName: 'Col C', width: 200 },
  { field: 'colD', headerName: 'Col D', width: 200 },
  { field: 'colE', headerName: 'Col E', width: 200 },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 90,
    pinned: 'right',         // sticky on the right
  },
];

<DataTable rows={rows} columns={columns} checkboxSelection />

// Multiple columns can be pinned on either side.
// Pinned order follows column definition order.`;
  return (
    <Section title="Column Pinning + Horizontal Scroll" desc="Name pinned left, Actions pinned right. Scroll the table horizontally — pinned columns stay fixed." code={snippet}>
      <DataTable rows={BASE_APPS} columns={wideCols} checkboxSelection pagination defaultPageSize={8} />
    </Section>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Props Reference tab
// ═══════════════════════════════════════════════════════════════════════════

const MONO = { fontFamily: "'Fira Code','Cascadia Code','Consolas',monospace" };

function Tag({ children, color }) {
  return (
    <span style={{ ...MONO, fontSize: 11, padding: '1px 7px', borderRadius: 4, background: color + '22', color, border: `1px solid ${color}44`, whiteSpace: 'nowrap' }}>
      {children}
    </span>
  );
}

function PropTable({ rows: propRows }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ background: '#f8fafc' }}>
          {['Prop', 'Type', 'Default', 'Description'].map(h => (
            <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb', whiteSpace: 'nowrap', fontSize: 12 }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {propRows.map((row, i) => (
          <tr key={row.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb', verticalAlign: 'top' }}>
            <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
              <span style={{ ...MONO, fontWeight: 600, fontSize: 13, color: '#111827' }}>{row.name}</span>
              {row.required && <span style={{ marginLeft: 6, fontSize: 10, fontWeight: 700, color: '#dc2626', background: '#fee2e2', padding: '1px 5px', borderRadius: 3, verticalAlign: 'middle' }}>REQ</span>}
            </td>
            <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}>
              <Tag color="#3b82f6">{row.type}</Tag>
            </td>
            <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
              {row.def ? <Tag color="#16a34a">{row.def}</Tag> : <span style={{ color: '#9ca3af' }}>—</span>}
            </td>
            <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9', color: '#4b5563', lineHeight: 1.6 }}>{row.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

const DT_PROP_GROUPS = [
  {
    label: 'Core',
    rows: [
      { name: 'rows',    type: 'object[]',                   required: true, desc: 'Array of data objects to render.' },
      { name: 'columns', type: 'ColumnDef[]',                required: true, desc: 'Column definitions. See "Column Definition" section.' },
      { name: 'rowKey',  type: "string | (row) => string",   def: "'id'",    desc: 'Field name or function to produce a unique row ID.' },
    ],
  },
  {
    label: 'Selection',
    rows: [
      { name: 'checkboxSelection',  type: 'boolean',               def: 'false', desc: 'Adds a checkbox column on the left edge.' },
      { name: 'selectionModel',     type: 'Set<id>',                            desc: 'Controlled selection state. Pass a Set of row IDs.' },
      { name: 'onSelectionChange',  type: '(ids: Set) => void',                  desc: 'Fired whenever selection changes. Receives full Set.' },
    ],
  },
  {
    label: 'Sorting',
    rows: [
      { name: 'defaultSortModel',   type: 'SortItem[]',                          desc: 'Initial sort (uncontrolled). SortItem = { field, sort: "asc"|"desc" }.' },
      { name: 'sortModel',          type: 'SortItem[]',                          desc: 'Controlled sort model.' },
      { name: 'onSortModelChange',  type: '(model: SortItem[]) => void',         desc: 'Fires on sort change.' },
      { name: 'multiSort',          type: 'boolean',               def: 'false', desc: 'Allow sorting by multiple columns simultaneously.' },
    ],
  },
  {
    label: 'Pagination',
    rows: [
      { name: 'pagination',       type: 'boolean',    def: 'false',               desc: 'Enable the pagination footer.' },
      { name: 'defaultPageSize',  type: 'number',     def: '25',                  desc: 'Initial rows-per-page (uncontrolled).' },
      { name: 'pageSizeOptions',  type: 'number[]',   def: '[10,25,50,100]',      desc: 'Options shown in the rows-per-page dropdown.' },
      { name: 'rowCount',         type: 'number',                                 desc: 'Total row count for server-side pagination (overrides rows.length).' },
      { name: 'page',             type: 'number',                                 desc: 'Controlled current page (0-indexed).' },
      { name: 'onPageChange',     type: '(page: number) => void',                 desc: 'Fires on page navigation.' },
    ],
  },
  {
    label: 'Infinite Scroll',
    rows: [
      { name: 'infiniteScroll', type: 'boolean',           def: 'false', desc: 'Enable IntersectionObserver-based auto-load at bottom.' },
      { name: 'onLoadMore',     type: '() => void',                       desc: 'Called when the bottom sentinel enters the viewport.' },
      { name: 'hasMore',        type: 'boolean',           def: 'true',  desc: 'Set to false to stop triggering onLoadMore.' },
      { name: 'loading',        type: 'boolean',           def: 'false', desc: 'Shows a spinner overlay and prevents double-load.' },
    ],
  },
  {
    label: 'Row Appearance',
    rows: [
      { name: 'getRowClassName',  type: '({row, rowIndex}) => string',  desc: 'Return a CSS class name to add to a row.' },
      { name: 'getRowStyle',      type: '({row, rowIndex}) => object',  desc: 'Return an inline style object to apply to a row.' },
      { name: 'highlightedRows',  type: 'Set | Array',                  desc: 'Row IDs that receive the highlighted row background.' },
    ],
  },
  {
    label: 'Features',
    rows: [
      { name: 'columnResizing',  type: 'boolean',    def: 'true',          desc: 'Show resize handles on column headers.' },
      { name: 'showRowNumbers',  type: 'boolean',    def: 'false',         desc: 'Add a sticky row-number column on the far left.' },
      { name: 'toolbar',         type: 'boolean',    def: 'true',          desc: 'Show the built-in toolbar (Columns button + toolbarContent slot).' },
      { name: 'toolbarContent',  type: 'ReactNode',                        desc: 'JSX rendered in the left slot of the toolbar.' },
      { name: 'density',         type: "'compact'|'comfortable'|'spacious'", def: "'comfortable'", desc: 'Row height + font size preset.' },
    ],
  },
  {
    label: 'Callbacks',
    rows: [
      { name: 'onRowClick',   type: '({row, event}) => void',          desc: 'Row click handler. Adds cursor:pointer to rows.' },
      { name: 'onCellClick',  type: '({row, column, event}) => void',  desc: 'Cell click handler (stops propagation from row click).' },
    ],
  },
  {
    label: 'Styling',
    rows: [
      { name: 'sx',         type: 'object',   desc: 'CSS variable overrides. Accepts shorthand keys (accent, headerBg…) or raw --dt-* variable names.' },
      { name: 'className',  type: 'string',   desc: 'Extra class added to the root element.' },
      { name: 'style',      type: 'object',   desc: 'Inline style on the root element.' },
    ],
  },
  {
    label: 'Misc',
    rows: [
      { name: 'hideFooter',   type: 'boolean',  def: 'false',               desc: 'Hide the footer bar entirely (row count or pagination).' },
      { name: 'noRowsText',   type: 'string',   def: "'No rows to display'", desc: 'Empty-state message.' },
      { name: 'loadingText',  type: 'string',   def: "'Loading…'",           desc: 'Text shown next to the loading spinner.' },
    ],
  },
];

const COL_DEF_ROWS = [
  { name: 'field',           type: 'string',                           required: true, desc: 'Key in the row data object (or used by valueGetter).' },
  { name: 'headerName',      type: 'string',                           desc: 'Column header label. Defaults to field.' },
  { name: 'width',           type: 'number',                           desc: 'Fixed width in px. Use flex for flexible columns.' },
  { name: 'flex',            type: 'number',                           desc: 'CSS flex-grow factor. Makes the column expand to fill space.' },
  { name: 'minWidth',        type: 'number',         def: '60',         desc: 'Minimum width in px (also applies to flex columns).' },
  { name: 'maxWidth',        type: 'number',                           desc: 'Maximum width in px.' },
  { name: 'pinned',          type: "'left'|'right'|false", def: 'false', desc: 'Pin column to left or right edge with position:sticky.' },
  { name: 'sortable',        type: 'boolean',        def: 'true',      desc: 'Enable sort on this column. Set false to disable.' },
  { name: 'hideable',        type: 'boolean',        def: 'true',      desc: 'Allow this column to be hidden in the column panel.' },
  { name: 'hidden',          type: 'boolean',        def: 'false',     desc: 'Initially hidden.' },
  { name: 'highlight',       type: 'boolean',        def: 'false',     desc: 'Apply column highlight background (blue tint) to entire column.' },
  { name: 'resizable',       type: 'boolean',        def: 'true',      desc: 'Show resize handle on this column.' },
  { name: 'align',           type: "'left'|'center'|'right'", def: "'left'", desc: 'Cell content alignment.' },
  { name: 'headerAlign',     type: "'left'|'center'|'right'", desc: 'Header label alignment. Defaults to align.' },
  { name: 'renderCell',      type: '({row, value, rowIndex}) => ReactNode', desc: 'Custom cell renderer. Return any JSX.' },
  { name: 'renderHeader',    type: '({column}) => ReactNode',  desc: 'Custom header renderer.' },
  { name: 'valueGetter',     type: '({row}) => any',           desc: 'Compute cell value from row (used for sorting/display when field doesn\'t map directly).' },
  { name: 'sortComparator',  type: '(a, b) => number',         desc: 'Custom sort function for this column. Return negative/0/positive.' },
  { name: 'description',     type: 'string',                   desc: 'Tooltip shown on the column header (title attribute).' },
];

const SX_ROWS = [
  { name: 'accent',        type: 'color', def: '#ef4444', desc: 'Primary accent color — sort icons, checkboxes, active page button, focus rings.' },
  { name: 'borderColor',   type: 'color', def: '#e5e7eb', desc: 'Border color for table, rows, and toolbar.' },
  { name: 'headerBg',      type: 'color', def: '#f3f4f6', desc: 'Column header background.' },
  { name: 'rowBg',         type: 'color', def: '#ffffff', desc: 'Default row background.' },
  { name: 'rowHover',      type: 'color', def: '#f9fafb', desc: 'Row background on hover.' },
  { name: 'rowSelected',   type: 'color', def: '#fff5f5', desc: 'Row background when selected via checkbox.' },
  { name: 'text',          type: 'color', def: '#374151', desc: 'Default cell text color.' },
  { name: 'fontSize',      type: 'string', def: '14px',  desc: 'Base font size (overridden by density preset).' },
  { name: 'rowHeight',     type: 'string', def: '52px',  desc: 'Row height (overridden by density preset).' },
  { name: 'headerHeight',  type: 'string', def: '46px',  desc: 'Header row height.' },
  { name: 'borderRadius',  type: 'string', def: '8px',   desc: 'Border radius of the table card.' },
];

const RAW_VAR_ROWS = [
  { name: '--dt-accent',       desc: 'Primary accent color' },
  { name: '--dt-border',       desc: 'Border color' },
  { name: '--dt-header-bg',    desc: 'Header background' },
  { name: '--dt-header-fg',    desc: 'Header text color' },
  { name: '--dt-row-bg',       desc: 'Row background' },
  { name: '--dt-row-hover',    desc: 'Row hover background' },
  { name: '--dt-row-selected', desc: 'Selected row background' },
  { name: '--dt-row-hl',       desc: 'Highlighted row background (highlightedRows)' },
  { name: '--dt-col-hl',       desc: 'Highlighted column background (column highlight:true)' },
  { name: '--dt-text',         desc: 'Default text color' },
  { name: '--dt-muted',        desc: 'Muted/secondary text color' },
  { name: '--dt-fz',           desc: 'Font size' },
  { name: '--dt-rh',           desc: 'Row height' },
  { name: '--dt-hh',           desc: 'Header height' },
  { name: '--dt-radius',       desc: 'Card border radius' },
];

function DemoProps() {
  const [sub, setSub] = useState(0);
  const subs = ['DataTable Props', 'Column Definition', 'sx / CSS Variables'];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ margin: '0 0 4px', fontSize: 17, fontWeight: 700, color: '#111827' }}>Props Reference</h3>
        <p style={{ margin: '0 0 16px', fontSize: 13, color: '#6b7280' }}>Complete API for the DataTable component and its column definitions.</p>
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #e5e7eb', paddingBottom: 0 }}>
          {subs.map((s, i) => (
            <button key={s} onClick={() => setSub(i)} style={{
              padding: '7px 16px', border: 'none', cursor: 'pointer',
              background: 'none', fontFamily: 'inherit', fontSize: 13,
              fontWeight: i === sub ? 600 : 400,
              color: i === sub ? '#111827' : '#6b7280',
              borderBottom: i === sub ? '2px solid #111827' : '2px solid transparent',
              marginBottom: -1,
            }}>{s}</button>
          ))}
        </div>
      </div>

      {sub === 0 && (
        <div>
          {DT_PROP_GROUPS.map(group => (
            <div key={group.label} style={{ marginBottom: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#6b7280', textTransform: 'uppercase' }}>{group.label}</span>
                <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
              </div>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
                <PropTable rows={group.rows} />
              </div>
            </div>
          ))}
        </div>
      )}

      {sub === 1 && (
        <div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
            Shape of each object in the <code style={{ ...MONO, fontSize: 12, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>columns</code> array.
          </p>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <PropTable rows={COL_DEF_ROWS} />
          </div>
        </div>
      )}

      {sub === 2 && (
        <div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 20 }}>
            Pass overrides via the <code style={{ ...MONO, fontSize: 12, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>sx</code> prop.
            Use shorthand keys (mapped by the component) or raw <code style={{ ...MONO, fontSize: 12, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>--dt-*</code> variable names directly.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#6b7280', textTransform: 'uppercase' }}>Shorthand Keys</span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          </div>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden', marginBottom: 32 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Key', 'Type', 'Default', 'Description'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SX_ROWS.map((r, i) => (
                  <tr key={r.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}><span style={{ ...MONO, fontWeight: 600, fontSize: 13, color: '#111827' }}>{r.name}</span></td>
                    <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}><Tag color="#3b82f6">{r.type}</Tag></td>
                    <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9' }}><Tag color="#16a34a">{r.def}</Tag></td>
                    <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9', color: '#4b5563' }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.06em', color: '#6b7280', textTransform: 'uppercase' }}>Raw CSS Variables</span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          </div>
          <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 12 }}>These can be passed directly as keys in <code style={{ ...MONO, fontSize: 12, background: '#f1f5f9', padding: '1px 6px', borderRadius: 4 }}>sx</code> or set in your own CSS on any ancestor element.</p>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  {['Variable', 'Description'].map(h => (
                    <th key={h} style={{ padding: '8px 14px', textAlign: 'left', fontWeight: 600, color: '#374151', borderBottom: '2px solid #e5e7eb', fontSize: 12 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RAW_VAR_ROWS.map((r, i) => (
                  <tr key={r.name} style={{ background: i % 2 === 0 ? '#fff' : '#f9fafb' }}>
                    <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}><span style={{ ...MONO, fontSize: 12, color: '#7c3aed', fontWeight: 600 }}>{r.name}</span></td>
                    <td style={{ padding: '9px 14px', borderBottom: '1px solid #f1f5f9', color: '#4b5563' }}>{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 24, padding: '14px 18px', background: '#0f172a', borderRadius: 8, border: '1px solid #1e293b' }}>
            <p style={{ margin: '0 0 8px', fontSize: 11, color: '#475569', ...MONO, letterSpacing: '.04em' }}>USAGE EXAMPLE</p>
            <pre style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: '#e2e8f0', ...MONO, overflowX: 'auto' }}>
              <Highlighted code={`<DataTable
  rows={rows}
  columns={columns}
  sx={{
    accent: '#3b82f6',            // shorthand
    '--dt-header-bg': '#1e293b',  // raw CSS variable
    '--dt-header-fg': '#f8fafc',
    '--dt-row-selected': '#eff6ff',
    borderRadius: '12px',
  }}
/>`} />
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// App shell
// ═══════════════════════════════════════════════════════════════════════════

const TABS = [
  { label: 'Basic',           component: DemoBasic },
  { label: 'Checkboxes',      component: DemoSelection },
  { label: 'Pagination',      component: DemoPagination },
  { label: 'Infinite Scroll', component: DemoInfiniteScroll },
  { label: 'Highlights',      component: DemoHighlights },
  { label: 'Custom Cells',    component: DemoCustomCells },
  { label: 'Sorting',         component: DemoSorting },
  { label: 'Row Styles',      component: DemoRowStyles },
  { label: 'Density',         component: DemoDensity },
  { label: 'Theming',         component: DemoTheme },
  { label: 'Toolbar/Search',  component: DemoToolbar },
  { label: 'Column Pinning',  component: DemoColumnPinning },
  { label: '📋 Props',        component: DemoProps },
];

export default function App() {
  const [activeTab, setActiveTab] = useState(0);
  const ActiveDemo = TABS[activeTab].component;

  return (
    <div style={{ background: '#f9fafb', minHeight: '100vh', fontFamily: "'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" }}>
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px', position: 'sticky', top: 0, zIndex: 30 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingTop: 16, paddingBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#fff', fontWeight: 700, flexShrink: 0 }}>T</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>DataTable Demo</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>All features · zero dependencies · IDP-ready</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginTop: 2 }}>
            {TABS.map((tab, i) => (
              <button key={tab.label} onClick={() => setActiveTab(i)} style={{
                padding: '8px 14px', border: 'none',
                borderBottom: i === activeTab ? '2px solid #ef4444' : '2px solid transparent',
                background: 'none', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
                fontWeight: i === activeTab ? 600 : 400,
                color: i === activeTab ? '#ef4444' : '#6b7280',
                whiteSpace: 'nowrap', transition: 'color .15s',
              }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 32px 80px' }}>
        <ActiveDemo />
      </div>
    </div>
  );
}
