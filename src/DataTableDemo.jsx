/**
 * DataTable usage examples — IDP App Listing
 */
import React, { useState } from 'react';
import DataTable from './DataTable';

// ── Sample data matching the screenshot ───────────────────

const APPS = [
  { id: 1, name: 'Achieve3000',       type: 'Browser Extension', updatedAt: '2025-07-01, 11:38', icon: '🟥' },
  { id: 2, name: 'Addthis',           type: 'Browser Extension', updatedAt: '2025-07-01, 11:39', icon: '➕' },
  { id: 3, name: 'asdfadfsdfs',       type: 'Password Less',     updatedAt: '2025-07-01, 11:38', icon: '⏱' },
  { id: 4, name: 'Default API App',   type: 'Desktop',           updatedAt: '2025-01-29, 07:21', icon: '⏱' },
  { id: 5, name: 'Evernote',          type: 'Browser Extension', updatedAt: '2025-08-04, 08:20', icon: '📗' },
  { id: 6, name: 'Google Apps',       type: 'SAML',              updatedAt: '2025-07-01, 11:33', icon: '📧' },
  { id: 7, name: 'hNfkasdflaskdjff', type: 'JWT',               updatedAt: '2025-07-04, 10:41', icon: '🔴' },
  { id: 8, name: 'My Apps',           type: 'JWT',               updatedAt: '2025-07-01, 11:39', icon: '⏱' },
  { id: 9, name: 'new aps',           type: 'JWT',               updatedAt: '2025-07-01, 11:40', icon: '📊' },
  { id: 10, name: 'sadfsadfsdafsf',   type: 'Provisioning',      updatedAt: '2025-09-27, 04:44', icon: '⏱' },
];

// ── Column definitions ─────────────────────────────────────

const COLUMNS = [
  {
    field: 'name',
    headerName: 'Application Name',
    flex: 1,
    minWidth: 200,
    pinned: 'left',
    renderCell: ({ row }) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{
          width: 30, height: 30, borderRadius: 6,
          background: '#f3f4f6', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontSize: 16, flexShrink: 0,
        }}>
          {row.icon}
        </span>
        <span style={{ fontWeight: 500 }}>{row.name}</span>
      </div>
    ),
  },
  {
    field: 'type',
    headerName: 'App Type',
    width: 200,
    renderCell: ({ value }) => (
      <span style={{ color: '#6b7280' }}>{value}</span>
    ),
  },
  {
    field: 'updatedAt',
    headerName: 'Last Updated',
    width: 200,
    renderCell: ({ value }) => (
      <span style={{ color: '#6b7280' }}>{value}</span>
    ),
  },
  {
    field: 'actions',
    headerName: 'Actions',
    width: 100,
    sortable: false,
    hideable: false,
    align: 'center',
    headerAlign: 'center',
    pinned: 'right',
    renderCell: ({ row }) => (
      <button
        onClick={e => { e.stopPropagation(); alert(`Actions for ${row.name}`); }}
        style={{
          border: 'none', background: 'none', cursor: 'pointer',
          padding: '4px 8px', borderRadius: 4, fontSize: 18,
          color: '#9ca3af', lineHeight: 1,
        }}
        title="More actions"
      >
        ⋮
      </button>
    ),
  },
];

// ── Example 1: Basic (matches screenshot) ─────────────────

export function BasicExample() {
  return (
    <DataTable
      rows={APPS}
      columns={COLUMNS}
      checkboxSelection
      pagination
      defaultPageSize={10}
      pageSizeOptions={[5, 10, 25]}
      onRowClick={({ row }) => console.log('clicked', row.name)}
    />
  );
}

// ── Example 2: Highlighted rows + column highlight ────────

export function HighlightExample() {
  return (
    <DataTable
      rows={APPS}
      columns={[
        ...COLUMNS.slice(0, 2),
        { ...COLUMNS[2], highlight: true }, // highlight "Last Updated" column
        COLUMNS[3],
      ]}
      highlightedRows={[2, 5, 9]} // highlight rows by id
      checkboxSelection
      pagination
      defaultPageSize={10}
    />
  );
}

// ── Example 3: Infinite scroll ─────────────────────────────

export function InfiniteScrollExample() {
  const [rows, setRows] = useState(APPS);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const batch = React.useRef(1);

  const loadMore = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800)); // simulate fetch
    const next = APPS.map(r => ({ ...r, id: r.id + batch.current * 100, name: `${r.name} (batch ${batch.current})` }));
    batch.current++;
    setRows(prev => [...prev, ...next]);
    if (batch.current > 3) setHasMore(false);
    setLoading(false);
  };

  return (
    <div style={{ height: 400, display: 'flex', flexDirection: 'column' }}>
      <DataTable
        rows={rows}
        columns={COLUMNS}
        infiniteScroll
        onLoadMore={loadMore}
        hasMore={hasMore}
        loading={loading}
        hideFooter={false}
        style={{ flex: 1 }}
      />
    </div>
  );
}

// ── Example 4: Controlled selection across pages ──────────

export function ControlledSelectionExample() {
  const [selection, setSelection] = useState(new Set());

  return (
    <div>
      <p style={{ fontFamily: 'sans-serif', fontSize: 13, marginBottom: 8 }}>
        Selected IDs: {[...selection].join(', ') || 'none'}
      </p>
      <DataTable
        rows={APPS}
        columns={COLUMNS}
        checkboxSelection
        selectionModel={selection}
        onSelectionChange={setSelection}
        pagination
        defaultPageSize={5}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
}

// ── Example 5: Custom theme via sx ─────────────────────────

export function ThemedExample() {
  return (
    <DataTable
      rows={APPS}
      columns={COLUMNS}
      checkboxSelection
      pagination
      defaultPageSize={10}
      sx={{
        accent: '#3b82f6',          // blue instead of red
        headerBg: '#1e3a5f',
        '--dt-header-fg': '#ffffff',
        rowSelected: '#eff6ff',
        borderRadius: '12px',
      }}
    />
  );
}

// ── Example 6: Row-level conditional styling ──────────────

export function ConditionalStylingExample() {
  return (
    <DataTable
      rows={APPS}
      columns={COLUMNS}
      getRowClassName={({ row }) => row.type === 'JWT' ? 'my-jwt-row' : ''}
      getRowStyle={({ row }) =>
        row.type === 'SAML' ? { fontWeight: 600 } : undefined
      }
      pagination
      defaultPageSize={10}
    />
  );
}

// ── Default export: full demo ──────────────────────────────

export default function Demo() {
  const [tab, setTab] = useState(0);
  const tabs = ['Basic', 'Highlights', 'Infinite Scroll', 'Controlled Selection', 'Custom Theme'];
  const examples = [
    <BasicExample />,
    <HighlightExample />,
    <InfiniteScrollExample />,
    <ControlledSelectionExample />,
    <ThemedExample />,
  ];

  return (
    <div style={{ padding: 32, fontFamily: 'sans-serif', background: '#f9fafb', minHeight: '100vh' }}>
      <h2 style={{ margin: '0 0 24px', fontSize: 20, fontWeight: 700, color: '#111827' }}>
        DataTable Demo
      </h2>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tabs.map((t, i) => (
          <button
            key={t}
            onClick={() => setTab(i)}
            style={{
              padding: '6px 14px', borderRadius: 6, border: '1px solid #e5e7eb',
              background: i === tab ? '#111827' : '#fff',
              color: i === tab ? '#fff' : '#374151',
              cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            }}
          >
            {t}
          </button>
        ))}
      </div>
      {examples[tab]}
    </div>
  );
}
