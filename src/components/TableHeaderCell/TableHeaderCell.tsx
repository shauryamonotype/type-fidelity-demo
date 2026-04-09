import React from 'react'
import './TableHeaderCell.css'

export type SortState = 'none' | 'asc' | 'desc'

export interface TableHeaderCellProps {
  label:           React.ReactNode
  /** Show sort icon and enable sort toggle on click */
  sortable?:       boolean
  /** Current sort direction */
  sortState?:      SortState
  /** Called when user clicks the cell to cycle sort */
  onSort?:         () => void
  /** Resize handle drag start — supplied by Table via TanStack */
  onResizeStart?:  (e: React.MouseEvent | React.TouchEvent) => void
  /** Whether this column is actively being dragged */
  isResizing?:     boolean
  /** Pixel width — written by Table colgroup; also set as inline style */
  width?:          number
  className?:      string
}

// ─── Sort icon ─────────────────────────────────────────────────────────────────
// Same two-arrow design as the existing Table SortIcon — up arrow left, down right.
// Active direction renders at full opacity; inactive at 0.35.

function SortIcon({ state }: { state: SortState }) {
  const upOp   = state === 'asc'  ? 1 : 0.35
  const downOp = state === 'desc' ? 1 : 0.35

  return (
    <svg
      className="thc__sort-icon"
      width="16"
      height="16"
      viewBox="0 0 12.9192 11.8385"
      fill="none"
      aria-hidden
    >
      <path
        d="M3.45962 0.919239V10.9192M3.45962 0.919239L0.459619 3.91924M3.45962 0.919239L6.45962 3.91924"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeMiterlimit="10"
        opacity={upOp}
      />
      <path
        d="M9.45962 10.9192V0.919239M9.45962 10.9192L6.45962 7.91924M9.45962 10.9192L12.4596 7.91924"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeMiterlimit="10"
        opacity={downOp}
      />
    </svg>
  )
}

// ─── TableHeaderCell ──────────────────────────────────────────────────────────

export function TableHeaderCell({
  label,
  sortable    = false,
  sortState   = 'none',
  onSort,
  onResizeStart,
  isResizing  = false,
  width,
  className,
}: TableHeaderCellProps) {
  const thClass = [
    'thc',
    sortable   && 'thc--sortable',
    isResizing && 'thc--resizing',
    className,
  ].filter(Boolean).join(' ')

  const ariaSort =
    sortState === 'asc'  ? 'ascending'  :
    sortState === 'desc' ? 'descending' : undefined

  return (
    <th
      className={thClass}
      style={width !== undefined ? { width, minWidth: width } : undefined}
      onClick={sortable ? onSort : undefined}
      aria-sort={ariaSort}
    >
      <div className="thc__inner">
        <span className="thc__label">{label}</span>

        {sortable && (
          <span className={`thc__sort${sortState !== 'none' ? ' thc__sort--active' : ''}`}>
            <SortIcon state={sortState} />
          </span>
        )}
      </div>

      {/* Resize handle — only rendered when a drag handler is provided */}
      {onResizeStart && (
        <div
          className={`thc__resizer${isResizing ? ' thc__resizer--active' : ''}`}
          onMouseDown={e => { e.stopPropagation(); onResizeStart(e) }}
          onTouchStart={e => { e.stopPropagation(); onResizeStart(e) }}
          aria-hidden
        />
      )}
    </th>
  )
}
