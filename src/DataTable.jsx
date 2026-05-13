/**
 * DataTable — feature-rich, zero-dependency table for React
 *
 * Column def shape:
 *   { field, headerName, width, flex, minWidth, maxWidth,
 *     pinned: 'left'|'right'|false, sortable, hideable, hidden,
 *     highlight, align, headerAlign, resizable,
 *     renderCell({ row, value, rowIndex }),
 *     renderHeader({ column }),
 *     valueGetter({ row }),
 *     sortComparator(a, b) }
 *
 * DataTable props — see JSDoc on the component.
 */

import React, {
  useState, useCallback, useMemo, useRef, useEffect, memo,
} from 'react';

// ─── Styles (injected once) ────────────────────────────────────────────────

const CSS = `
.dt{--dt-accent:#ef4444;--dt-border:#e5e7eb;--dt-header-bg:#f3f4f6;
--dt-header-fg:#111827;--dt-row-bg:#ffffff;--dt-row-hover:#f9fafb;
--dt-row-selected:#fff5f5;--dt-row-hl:#fffbeb;--dt-col-hl:#f0f9ff;
--dt-text:#374151;--dt-muted:#9ca3af;
--dt-font:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
--dt-fz:14px;--dt-rh:52px;--dt-hh:46px;--dt-radius:8px;
font-family:var(--dt-font);font-size:var(--dt-fz);color:var(--dt-text);
background:var(--dt-row-bg);border:1px solid var(--dt-border);
border-radius:var(--dt-radius);box-shadow:0 1px 3px rgba(0,0,0,.08);
display:flex;flex-direction:column;overflow:hidden;position:relative;}
.dt[data-density=compact]{--dt-rh:36px;--dt-hh:36px;--dt-fz:13px;}
.dt[data-density=spacious]{--dt-rh:68px;--dt-hh:56px;}

.dt-toolbar{display:flex;align-items:center;gap:8px;padding:8px 16px;
border-bottom:1px solid var(--dt-border);flex-shrink:0;position:relative;flex-wrap:wrap;}
.dt-toolbar-left{display:flex;align-items:center;gap:8px;flex:1;}
.dt-toolbar-right{display:flex;align-items:center;gap:8px;margin-left:auto;}

.dt-btn{display:inline-flex;align-items:center;gap:6px;padding:5px 12px;
border:1px solid var(--dt-border);border-radius:6px;background:#fff;
cursor:pointer;font-size:13px;font-family:var(--dt-font);color:var(--dt-text);
transition:background .1s,border-color .1s;white-space:nowrap;line-height:1.4;}
.dt-btn:hover{background:var(--dt-header-bg);border-color:#d1d5db;}
.dt-btn.dt-active{background:var(--dt-accent);color:#fff;border-color:var(--dt-accent);}

.dt-input{padding:5px 10px;border:1px solid var(--dt-border);border-radius:6px;
font-size:13px;font-family:var(--dt-font);color:var(--dt-text);outline:none;
transition:border-color .15s;}
.dt-input:focus{border-color:var(--dt-accent);}

.dt-scroll{flex:1;overflow:auto;position:relative;overscroll-behavior:contain;}
.dt-table{width:100%;border-collapse:separate;border-spacing:0;table-layout:fixed;}
.dt-thead{position:sticky;top:0;z-index:20;}

.dt-th{height:var(--dt-hh);padding:0 16px;background:var(--dt-header-bg);
border-bottom:1px solid var(--dt-border);font-weight:600;font-size:13px;
color:var(--dt-header-fg);text-align:left;white-space:nowrap;overflow:hidden;
text-overflow:ellipsis;position:relative;vertical-align:middle;user-select:none;}
.dt-th.dt-sort{cursor:pointer;}
.dt-th.dt-sort:hover{background:#eaecee;}
.dt-th.dt-sorted{color:var(--dt-accent);}
.dt-th.dt-col-hl{background:var(--dt-col-hl)!important;}
.dt-th-in{display:flex;align-items:center;gap:6px;height:100%;}
.dt-th-lbl{flex:1;overflow:hidden;text-overflow:ellipsis;}
.dt-sort-ic{display:flex;align-items:center;flex-shrink:0;}
.dt-th.dt-a-c .dt-th-in{justify-content:center;}
.dt-th.dt-a-r .dt-th-in{justify-content:flex-end;}

.dt-resize{position:absolute;right:0;top:20%;height:60%;width:4px;
cursor:col-resize;background:var(--dt-border);opacity:0;
transition:opacity .15s;border-radius:2px;}
.dt-th:hover .dt-resize,.dt-resize.dt-rz-active{opacity:1;}
.dt-resize:hover{opacity:1;background:var(--dt-accent);}

.dt-td{height:var(--dt-rh);padding:0 16px;border-bottom:1px solid var(--dt-border);
overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
vertical-align:middle;background:inherit;}
.dt-td-in{display:flex;align-items:center;height:100%;min-height:0;}
.dt-td.dt-a-c .dt-td-in{justify-content:center;}
.dt-td.dt-a-r .dt-td-in{justify-content:flex-end;}
.dt-td.dt-col-hl{background:var(--dt-col-hl)!important;}

.dt-tr{background:var(--dt-row-bg);}
.dt-tr:last-child .dt-td{border-bottom:none;}
.dt-tr:hover .dt-td{background:var(--dt-row-hover);}
.dt-tr.dt-sel .dt-td{background:var(--dt-row-selected);}
.dt-tr.dt-hl .dt-td{background:var(--dt-row-hl);}
.dt-tr.dt-click{cursor:pointer;}

.dt-pin-l{position:sticky;z-index:5;}
.dt-pin-r{position:sticky;z-index:5;}
.dt-pin-l-last,.dt-pin-r-first{transition:box-shadow .2s;}
.dt-scroll[data-sl="1"] .dt-pin-l-last{box-shadow:4px 0 10px -4px rgba(0,0,0,.18);}
.dt-scroll[data-sr="1"] .dt-pin-r-first{box-shadow:-4px 0 10px -4px rgba(0,0,0,.18);}
.dt-thead .dt-pin-l,.dt-thead .dt-pin-r{z-index:21;}

.dt-cb-col{width:48px!important;padding:0 12px;}
.dt-rn-col{width:48px!important;padding:0 8px;color:var(--dt-muted);font-size:12px;}
.dt-checkbox{width:16px;height:16px;cursor:pointer;accent-color:var(--dt-accent);flex-shrink:0;}

.dt-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;
padding:56px 32px;gap:12px;color:var(--dt-muted);}
.dt-spin{width:24px;height:24px;border:2px solid var(--dt-border);
border-top-color:var(--dt-accent);border-radius:50%;
animation:dt-spin .7s linear infinite;}
@keyframes dt-spin{to{transform:rotate(360deg)}}

.dt-footer{display:flex;align-items:center;justify-content:space-between;
padding:8px 16px;border-top:1px solid var(--dt-border);font-size:13px;
color:var(--dt-muted);flex-shrink:0;flex-wrap:wrap;gap:8px;}
.dt-footer-info{flex:1;white-space:nowrap;}
.dt-pg-sz{display:flex;align-items:center;gap:6px;}
.dt-pg-sz select{border:1px solid var(--dt-border);border-radius:4px;
padding:2px 6px;font-size:13px;font-family:var(--dt-font);
color:var(--dt-text);background:#fff;cursor:pointer;}
.dt-pages{display:flex;align-items:center;gap:3px;}
.dt-page-btn{display:inline-flex;align-items:center;justify-content:center;
min-width:30px;height:28px;padding:0 6px;border:1px solid var(--dt-border);
border-radius:4px;background:#fff;cursor:pointer;font-size:12px;
font-family:var(--dt-font);color:var(--dt-text);transition:all .1s;white-space:nowrap;}
.dt-page-btn:hover:not(:disabled){background:var(--dt-header-bg);}
.dt-page-btn.dt-cur{background:var(--dt-accent);color:#fff;border-color:var(--dt-accent);}
.dt-page-btn:disabled{opacity:.35;cursor:not-allowed;}

.dt-col-panel{position:absolute;top:calc(100% + 4px);right:16px;z-index:50;
background:#fff;border:1px solid var(--dt-border);border-radius:8px;
box-shadow:0 4px 20px rgba(0,0,0,.12);min-width:200px;
max-height:320px;overflow-y:auto;padding:6px 0;}
.dt-col-panel-item{display:flex;align-items:center;gap:10px;padding:8px 14px;
cursor:pointer;transition:background .1s;font-size:13px;color:var(--dt-text);user-select:none;}
.dt-col-panel-item:hover{background:var(--dt-header-bg);}
.dt-col-panel-item input{width:14px;height:14px;accent-color:var(--dt-accent);
cursor:pointer;flex-shrink:0;}

.dt-sentinel{height:1px;}
`;

function ensureStyles() {
  if (typeof document === 'undefined') return;
  let el = document.querySelector('style[data-dt]');
  if (!el) {
    el = document.createElement('style');
    el.setAttribute('data-dt', '');
    document.head.appendChild(el);
  }
  el.textContent = CSS; // always sync so HMR picks up changes
}

// ─── Icons ─────────────────────────────────────────────────────────────────

const IcSort = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" style={{ opacity: 0.35 }}>
    <path d="M5 1.5 1.5 6.5h7L5 1.5ZM5 10.5l3.5-5h-7L5 10.5Z" />
  </svg>
);
const IcAsc = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M5 1 1 7h8L5 1Z" />
    <rect x="3" y="9" width="4" height="1.5" rx=".75" opacity=".35" />
  </svg>
);
const IcDesc = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
    <path d="M5 11 9 5H1l4 6Z" />
    <rect x="3" y="1.5" width="4" height="1.5" rx=".75" opacity=".35" />
  </svg>
);
const IcColumns = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.4">
    <rect x="1.5" y="1.5" width="3.5" height="12" rx="1" />
    <rect x="5.75" y="1.5" width="3.5" height="12" rx="1" />
    <rect x="10" y="1.5" width="3.5" height="12" rx="1" />
  </svg>
);
const IcLeft = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M9 3 5 7l4 4" />
  </svg>
);
const IcRight = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M5 3l4 4-4 4" />
  </svg>
);
const IcFirst = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M11 3 7 7l4 4M7 3 3 7l4 4" />
  </svg>
);
const IcLast = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d="M3 3l4 4-4 4M7 3l4 4-4 4" />
  </svg>
);

// ─── Helpers ───────────────────────────────────────────────────────────────

function getRowId(row, rowKey) {
  if (typeof rowKey === 'function') return rowKey(row);
  return row[rowKey];
}

function getCellValue(row, col) {
  if (col.valueGetter) return col.valueGetter({ row });
  return row[col.field];
}

function defaultCompare(a, b, col) {
  if (col.sortComparator) return col.sortComparator(a, b);
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
}

function clamp(v, mn, mx) { return Math.min(Math.max(v, mn), mx); }

function cx(...args) {
  return args.filter(Boolean).join(' ');
}

// ─── ResizeHandle ──────────────────────────────────────────────────────────

function ResizeHandle({ field, onResize }) {
  const ref = useRef(null);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startW = e.currentTarget.closest('th')?.offsetWidth ?? 150;
    ref.current?.classList.add('dt-rz-active');

    const onMove = (me) => {
      onResize(field, clamp(startW + me.clientX - startX, 60, 800));
    };
    const onUp = () => {
      ref.current?.classList.remove('dt-rz-active');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [field, onResize]);

  return <div ref={ref} className="dt-resize" onMouseDown={onMouseDown} />;
}

// ─── ColumnPanel ───────────────────────────────────────────────────────────

const ColumnPanel = memo(function ColumnPanel({ columns, hidden, onToggle, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.closest('.dt-toolbar').contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [onClose]);

  return (
    <div className="dt-col-panel" ref={ref}>
      {columns.filter(c => c.hideable !== false).map(col => (
        <label key={col.field} className="dt-col-panel-item">
          <input
            type="checkbox"
            checked={!hidden.has(col.field)}
            onChange={() => onToggle(col.field)}
          />
          {col.headerName ?? col.field}
        </label>
      ))}
    </div>
  );
});

// ─── Pagination ────────────────────────────────────────────────────────────

function Pagination({ page, pageCount, pageSize, pageSizeOptions, totalRows, selectedCount, onPage, onPageSize }) {
  const from = totalRows === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, totalRows);

  const pageNums = useMemo(() => {
    if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
    const out = [0];
    if (page > 2) out.push('…');
    for (let i = Math.max(1, page - 1); i <= Math.min(pageCount - 2, page + 1); i++) out.push(i);
    if (page < pageCount - 3) out.push('…');
    out.push(pageCount - 1);
    return out;
  }, [page, pageCount]);

  return (
    <div className="dt-footer">
      <span className="dt-footer-info">
        {selectedCount > 0 ? `${selectedCount} selected · ` : ''}
        {totalRows === 0 ? 'No rows' : `${from}–${to} of ${totalRows}`}
      </span>

      {pageSizeOptions?.length > 0 && (
        <div className="dt-pg-sz">
          Rows per page:
          <select value={pageSize} onChange={e => onPageSize(Number(e.target.value))}>
            {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      )}

      <div className="dt-pages">
        <button className="dt-page-btn" onClick={() => onPage(0)} disabled={page === 0}><IcFirst /></button>
        <button className="dt-page-btn" onClick={() => onPage(page - 1)} disabled={page === 0}><IcLeft /></button>
        {pageNums.map((p, i) =>
          typeof p === 'string'
            ? <span key={`e${i}`} style={{ padding: '0 3px', color: 'var(--dt-muted)' }}>…</span>
            : <button key={p} className={cx('dt-page-btn', p === page && 'dt-cur')} onClick={() => onPage(p)}>{p + 1}</button>
        )}
        <button className="dt-page-btn" onClick={() => onPage(page + 1)} disabled={page >= pageCount - 1}><IcRight /></button>
        <button className="dt-page-btn" onClick={() => onPage(pageCount - 1)} disabled={page >= pageCount - 1}><IcLast /></button>
      </div>
    </div>
  );
}

// ─── DataTable ─────────────────────────────────────────────────────────────

/**
 * @param {{
 *   rows: object[],
 *   columns: object[],
 *   rowKey?: string | ((row: object) => string),
 *
 *   checkboxSelection?: boolean,
 *   selectionModel?: Set,
 *   onSelectionChange?: (ids: Set) => void,
 *
 *   defaultSortModel?: Array<{field:string, sort:'asc'|'desc'}>,
 *   sortModel?: Array<{field:string, sort:'asc'|'desc'}>,
 *   onSortModelChange?: (model) => void,
 *   multiSort?: boolean,
 *
 *   pagination?: boolean,
 *   defaultPageSize?: number,
 *   pageSizeOptions?: number[],
 *   rowCount?: number,
 *   page?: number,
 *   onPageChange?: (page: number) => void,
 *
 *   infiniteScroll?: boolean,
 *   onLoadMore?: () => void,
 *   hasMore?: boolean,
 *   loading?: boolean,
 *
 *   getRowClassName?: ({row, rowIndex}) => string,
 *   getRowStyle?: ({row, rowIndex}) => object,
 *   highlightedRows?: Set | Array,
 *
 *   columnResizing?: boolean,
 *   showRowNumbers?: boolean,
 *   toolbar?: boolean,
 *   toolbarContent?: React.ReactNode,
 *   density?: 'compact'|'comfortable'|'spacious',
 *
 *   sx?: object,
 *   className?: string,
 *   style?: object,
 *
 *   onRowClick?: ({row, event}) => void,
 *   onCellClick?: ({row, column, event}) => void,
 *
 *   hideFooter?: boolean,
 *   noRowsText?: string,
 *   loadingText?: string,
 * }} props
 */
export default function DataTable({
  rows = [],
  columns: colDefs = [],
  rowKey = 'id',

  checkboxSelection = false,
  selectionModel: ctrlSel,
  onSelectionChange,

  defaultSortModel,
  sortModel: ctrlSort,
  onSortModelChange,
  multiSort = false,

  pagination = false,
  defaultPageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  rowCount: serverRowCount,
  page: ctrlPage,
  onPageChange,

  infiniteScroll = false,
  onLoadMore,
  hasMore = true,
  loading = false,

  getRowClassName,
  getRowStyle,
  highlightedRows,

  columnResizing = true,
  showRowNumbers = false,
  toolbar = true,
  toolbarContent,
  density = 'comfortable',

  sx,
  className = '',
  style,

  onRowClick,
  onCellClick,

  hideFooter = false,
  noRowsText = 'No rows to display',
  loadingText = 'Loading…',
}) {
  ensureStyles();

  // ── Column widths ───────────────────────────────────────
  const [colWidths, setColWidths] = useState(() =>
    Object.fromEntries(colDefs.map(c => [c.field, c.width ?? (c.flex ? null : 150)]))
  );
  const setColWidth = useCallback((field, w) =>
    setColWidths(prev => ({ ...prev, [field]: w })), []);

  // ── Column visibility ───────────────────────────────────
  const [hiddenCols, setHiddenCols] = useState(() =>
    new Set(colDefs.filter(c => c.hidden).map(c => c.field))
  );
  const [showColPanel, setShowColPanel] = useState(false);
  const toggleCol = useCallback(field =>
    setHiddenCols(prev => {
      const next = new Set(prev);
      next.has(field) ? next.delete(field) : next.add(field);
      return next;
    }), []);

  // ── Sort ────────────────────────────────────────────────
  const [intSort, setIntSort] = useState(defaultSortModel ?? []);
  const sortModel = ctrlSort ?? intSort;

  const handleSort = useCallback((field) => {
    const col = colDefs.find(c => c.field === field);
    if (!col || col.sortable === false) return;
    let next;
    if (multiSort) {
      const ex = sortModel.find(s => s.field === field);
      if (!ex) next = [...sortModel, { field, sort: 'asc' }];
      else if (ex.sort === 'asc') next = sortModel.map(s => s.field === field ? { field, sort: 'desc' } : s);
      else next = sortModel.filter(s => s.field !== field);
    } else {
      const ex = sortModel[0];
      if (!ex || ex.field !== field) next = [{ field, sort: 'asc' }];
      else if (ex.sort === 'asc') next = [{ field, sort: 'desc' }];
      else next = [];
    }
    if (onSortModelChange) onSortModelChange(next);
    else setIntSort(next);
  }, [colDefs, sortModel, multiSort, onSortModelChange]);

  // ── Selection ───────────────────────────────────────────
  const [intSel, setIntSel] = useState(new Set());
  const selection = ctrlSel ?? intSel;
  const updateSel = useCallback((next) => {
    if (onSelectionChange) onSelectionChange(next);
    else setIntSel(next);
  }, [onSelectionChange]);

  const toggleRow = useCallback((id) => {
    const next = new Set(selection);
    next.has(id) ? next.delete(id) : next.add(id);
    updateSel(next);
  }, [selection, updateSel]);

  // ── Pagination ──────────────────────────────────────────
  const [intPage, setIntPage] = useState(0);
  const [pageSize, setPageSize] = useState(defaultPageSize);
  const page = ctrlPage ?? intPage;

  const goPage = useCallback((p) => {
    if (onPageChange) onPageChange(p);
    else setIntPage(p);
  }, [onPageChange]);

  // Reset page on sort change
  useEffect(() => { if (!ctrlPage) setIntPage(0); }, [sortModel, ctrlPage]);

  // ── Derived data ────────────────────────────────────────
  const visCols = useMemo(
    () => colDefs.filter(c => !hiddenCols.has(c.field)),
    [colDefs, hiddenCols]
  );

  // Pinned column offsets
  const pinOffsets = useMemo(() => {
    let leftOff = 0;
    if (checkboxSelection) leftOff += 48;
    if (showRowNumbers) leftOff += 48;
    const offs = {};

    visCols.filter(c => c.pinned === 'left').forEach(col => {
      offs[col.field] = { side: 'left', off: leftOff };
      leftOff += colWidths[col.field] ?? 150;
    });

    let rightOff = 0;
    [...visCols].reverse().filter(c => c.pinned === 'right').forEach(col => {
      offs[col.field] = { side: 'right', off: rightOff };
      rightOff += colWidths[col.field] ?? 150;
    });

    // mark last-left and first-right for shadow
    const leftPinned = visCols.filter(c => offs[c.field]?.side === 'left');
    const rightPinned = visCols.filter(c => offs[c.field]?.side === 'right');
    if (leftPinned.length) offs[leftPinned[leftPinned.length - 1].field].lastLeft = true;
    if (rightPinned.length) offs[rightPinned[0].field].firstRight = true;

    return offs;
  }, [visCols, checkboxSelection, showRowNumbers, colWidths]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!sortModel.length) return rows;
    return [...rows].sort((a, b) => {
      for (const { field, sort } of sortModel) {
        const col = colDefs.find(c => c.field === field);
        if (!col) continue;
        const cmp = defaultCompare(getCellValue(a, col), getCellValue(b, col), col);
        if (cmp !== 0) return sort === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [rows, sortModel, colDefs]);

  const totalRows = serverRowCount ?? sortedRows.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));

  const pagedRows = useMemo(() => {
    if (!pagination) return sortedRows;
    return sortedRows.slice(page * pageSize, (page + 1) * pageSize);
  }, [sortedRows, pagination, page, pageSize]);

  // Select-all state for current page
  const pageIds = useMemo(() => pagedRows.map(r => getRowId(r, rowKey)), [pagedRows, rowKey]);
  const allSel = pageIds.length > 0 && pageIds.every(id => selection.has(id));
  const someSel = !allSel && pageIds.some(id => selection.has(id));

  const toggleAll = useCallback(() => {
    const next = new Set(selection);
    if (allSel) pageIds.forEach(id => next.delete(id));
    else pageIds.forEach(id => next.add(id));
    updateSel(next);
  }, [allSel, pageIds, selection, updateSel]);

  // Highlighted rows set
  const hlSet = useMemo(() =>
    highlightedRows ? new Set(Array.isArray(highlightedRows) ? highlightedRows : [...highlightedRows]) : null,
    [highlightedRows]
  );

  // Infinite scroll
  const sentinelRef = useRef(null);
  const loadingRef = useRef(loading);
  loadingRef.current = loading;

  useEffect(() => {
    if (!infiniteScroll || !onLoadMore || !sentinelRef.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasMore && !loadingRef.current) onLoadMore();
    }, { threshold: 0.1 });
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [infiniteScroll, onLoadMore, hasMore]);

  // Scroll-shadow tracking — mutates data attributes directly, no re-render
  const scrollContainerRef = useRef(null);
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const update = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      el.dataset.sl = el.scrollLeft > 1 ? '1' : '0';
      el.dataset.sr = maxScroll > 1 && el.scrollLeft < maxScroll - 1 ? '1' : '0';
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', update); ro.disconnect(); };
  }, []);

  // CSS variable overrides via sx
  const rootStyle = useMemo(() => {
    if (!sx && !style) return undefined;
    const vars = {};
    if (sx) {
      const VAR_MAP = {
        accent: '--dt-accent', borderColor: '--dt-border', headerBg: '--dt-header-bg',
        rowBg: '--dt-row-bg', rowHover: '--dt-row-hover', rowSelected: '--dt-row-selected',
        text: '--dt-text', fontSize: '--dt-fz', rowHeight: '--dt-rh', headerHeight: '--dt-hh',
        borderRadius: '--dt-radius',
      };
      Object.entries(sx).forEach(([k, v]) => {
        vars[VAR_MAP[k] ?? k] = v;
      });
    }
    return { ...style, ...vars };
  }, [sx, style]);

  const getSortDir = (field) => sortModel.find(s => s.field === field)?.sort ?? null;

  // Shadow falls on the rightmost sticky-left element.
  // When no explicit pinned:'left' columns exist, that's the checkbox or row-number column.
  const hasPinnedLeft = visCols.some(c => c.pinned === 'left');
  const cbColIsLastLeft  = checkboxSelection && !hasPinnedLeft;
  const rnColIsLastLeft  = showRowNumbers && !checkboxSelection && !hasPinnedLeft;

  const hasFlex = visCols.some(c => c.flex);
  const tableMinWidth = visCols.reduce((acc, c) =>
    acc + (c.flex ? (c.minWidth ?? 80) : (colWidths[c.field] ?? 150)), checkboxSelection ? 48 : 0
  );

  // ── Render ──────────────────────────────────────────────
  return (
    <div
      className={cx('dt', className)}
      data-density={density}
      style={rootStyle}
    >
      {/* ── Toolbar ── */}
      {toolbar && (
        <div className="dt-toolbar">
          <div className="dt-toolbar-left">{toolbarContent}</div>
          <div className="dt-toolbar-right">
            {selection.size > 0 && (
              <span style={{ fontSize: 13, color: 'var(--dt-muted)' }}>
                {selection.size} selected
              </span>
            )}
            <button
              className={cx('dt-btn', showColPanel && 'dt-active')}
              onClick={() => setShowColPanel(v => !v)}
              title="Show/hide columns"
            >
              <IcColumns /> Columns
            </button>
          </div>
          {showColPanel && (
            <ColumnPanel
              columns={colDefs}
              hidden={hiddenCols}
              onToggle={toggleCol}
              onClose={() => setShowColPanel(false)}
            />
          )}
        </div>
      )}

      {/* ── Scroll area ── */}
      <div className="dt-scroll" ref={scrollContainerRef}>
        <table
          className="dt-table"
          style={{
            tableLayout: hasFlex ? 'auto' : 'fixed',
            minWidth: tableMinWidth,
          }}
        >
          <colgroup>
            {checkboxSelection && <col style={{ width: 48, minWidth: 48 }} />}
            {showRowNumbers && <col style={{ width: 48, minWidth: 48 }} />}
            {visCols.map(col => (
              <col
                key={col.field}
                style={col.flex
                  ? { minWidth: col.minWidth ?? 80 }
                  : { width: colWidths[col.field] ?? 150, minWidth: col.minWidth ?? 60, maxWidth: col.maxWidth }
                }
              />
            ))}
          </colgroup>

          {/* ── Header ── */}
          <thead className="dt-thead">
            <tr>
              {checkboxSelection && (
                <th className={cx('dt-th dt-cb-col dt-pin-l', cbColIsLastLeft && 'dt-pin-l-last')} style={{ left: 0 }}>
                  <div className="dt-th-in">
                    <input
                      type="checkbox"
                      className="dt-checkbox"
                      checked={allSel}
                      ref={el => { if (el) el.indeterminate = someSel; }}
                      onChange={toggleAll}
                    />
                  </div>
                </th>
              )}
              {showRowNumbers && (
                <th
                  className={cx('dt-th dt-rn-col dt-pin-l', rnColIsLastLeft && 'dt-pin-l-last')}
                  style={{ left: checkboxSelection ? 48 : 0 }}
                >
                  <div className="dt-th-in" style={{ justifyContent: 'flex-end' }}>#</div>
                </th>
              )}
              {visCols.map(col => {
                const pin = pinOffsets[col.field];
                const sortDir = getSortDir(col.field);
                const isSortable = col.sortable !== false;
                const align = col.headerAlign ?? col.align ?? 'left';
                return (
                  <th
                    key={col.field}
                    className={cx(
                      'dt-th',
                      isSortable && 'dt-sort',
                      sortDir && 'dt-sorted',
                      col.highlight && 'dt-col-hl',
                      pin?.side === 'left' && 'dt-pin-l',
                      pin?.side === 'right' && 'dt-pin-r',
                      pin?.lastLeft && 'dt-pin-l-last',
                      pin?.firstRight && 'dt-pin-r-first',
                      align === 'center' && 'dt-a-c',
                      align === 'right' && 'dt-a-r',
                    )}
                    style={pin ? { [pin.side]: pin.off } : undefined}
                    onClick={isSortable ? () => handleSort(col.field) : undefined}
                    title={col.description}
                  >
                    <div className="dt-th-in">
                      <span className="dt-th-lbl">
                        {col.renderHeader ? col.renderHeader({ column: col }) : (col.headerName ?? col.field)}
                      </span>
                      {isSortable && (
                        <span className="dt-sort-ic">
                          {sortDir === 'asc' ? <IcAsc /> : sortDir === 'desc' ? <IcDesc /> : <IcSort />}
                        </span>
                      )}
                    </div>
                    {columnResizing && col.resizable !== false && (
                      <ResizeHandle field={col.field} onResize={setColWidth} />
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          {/* ── Body ── */}
          <tbody>
            {pagedRows.length === 0 && !loading ? (
              <tr>
                <td
                  colSpan={visCols.length + (checkboxSelection ? 1 : 0) + (showRowNumbers ? 1 : 0)}
                  style={{ padding: 0, border: 'none' }}
                >
                  <div className="dt-empty">
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ opacity: 0.4 }}>
                      <rect x="4" y="6" width="24" height="20" rx="2" />
                      <line x1="4" y1="12" x2="28" y2="12" />
                      <line x1="11" y1="6" x2="11" y2="26" />
                    </svg>
                    <span>{noRowsText}</span>
                  </div>
                </td>
              </tr>
            ) : (
              pagedRows.map((row, rowIndex) => {
                const id = getRowId(row, rowKey);
                const isSel = selection.has(id);
                const isHl = hlSet?.has(id);
                const extraCls = getRowClassName?.({ row, rowIndex }) ?? '';
                const extraStyle = getRowStyle?.({ row, rowIndex });

                return (
                  <tr
                    key={id}
                    className={cx(
                      'dt-tr',
                      isSel && 'dt-sel',
                      isHl && 'dt-hl',
                      onRowClick && 'dt-click',
                      extraCls,
                    )}
                    style={extraStyle}
                    onClick={onRowClick ? (e) => onRowClick({ row, event: e }) : undefined}
                  >
                    {checkboxSelection && (
                      <td
                        className={cx('dt-td dt-cb-col dt-pin-l', cbColIsLastLeft && 'dt-pin-l-last')}
                        style={{ left: 0 }}
                        onClick={e => { e.stopPropagation(); toggleRow(id); }}
                      >
                        <div className="dt-td-in">
                          <input
                            type="checkbox"
                            className="dt-checkbox"
                            checked={isSel}
                            onChange={() => toggleRow(id)}
                            onClick={e => e.stopPropagation()}
                          />
                        </div>
                      </td>
                    )}
                    {showRowNumbers && (
                      <td
                        className={cx('dt-td dt-rn-col dt-pin-l', rnColIsLastLeft && 'dt-pin-l-last')}
                        style={{ left: checkboxSelection ? 48 : 0 }}
                      >
                        <div className="dt-td-in" style={{ justifyContent: 'flex-end' }}>
                          {pagination ? page * pageSize + rowIndex + 1 : rowIndex + 1}
                        </div>
                      </td>
                    )}
                    {visCols.map(col => {
                      const pin = pinOffsets[col.field];
                      const value = getCellValue(row, col);
                      const align = col.align ?? 'left';
                      return (
                        <td
                          key={col.field}
                          className={cx(
                            'dt-td',
                            col.highlight && 'dt-col-hl',
                            pin?.side === 'left' && 'dt-pin-l',
                            pin?.side === 'right' && 'dt-pin-r',
                            pin?.lastLeft && 'dt-pin-l-last',
                            pin?.firstRight && 'dt-pin-r-first',
                            align === 'center' && 'dt-a-c',
                            align === 'right' && 'dt-a-r',
                          )}
                          style={pin ? { [pin.side]: pin.off } : undefined}
                          onClick={onCellClick
                            ? e => { e.stopPropagation(); onCellClick({ row, column: col, event: e }); }
                            : undefined
                          }
                        >
                          <div className="dt-td-in">
                            {col.renderCell
                              ? col.renderCell({ row, value, rowIndex })
                              : (value == null ? '—' : String(value))
                            }
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Loading overlay */}
        {loading && (
          <div className="dt-empty">
            <div className="dt-spin" />
            <span>{loadingText}</span>
          </div>
        )}

        {/* Infinite scroll sentinel */}
        {infiniteScroll && <div className="dt-sentinel" ref={sentinelRef} />}
      </div>

      {/* ── Footer ── */}
      {!hideFooter && pagination && (
        <Pagination
          page={page}
          pageCount={pageCount}
          pageSize={pageSize}
          pageSizeOptions={pageSizeOptions}
          totalRows={totalRows}
          selectedCount={selection.size}
          onPage={goPage}
          onPageSize={(s) => { setPageSize(s); goPage(0); }}
        />
      )}
      {!hideFooter && !pagination && rows.length > 0 && (
        <div className="dt-footer">
          <span>
            {selection.size > 0 && `${selection.size} of `}
            {rows.length} row{rows.length !== 1 ? 's' : ''}
            {infiniteScroll && hasMore ? ' · scroll for more' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
