import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import type {
  ColumnDef,
  ColumnSizingState,
  OnChangeFn,
  SortingState,
  RowSelectionState,
} from '@tanstack/react-table'
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { MoreHorizontal } from 'lucide-react'
import { Checkbox } from '../Checkbox/Checkbox'
import { TableHeaderCell } from '../TableHeaderCell/TableHeaderCell'
import { TableRowCell } from '../TableRow/TableRow'
import './Table.css'


// ── StatusBadge ──────────────────────────────────────────────────────────────

export type StatusValue = 'Active' | 'Inactive' | 'Deactivated' | 'Invited'

export interface StatusBadgeProps {
  status: StatusValue
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorMap: Record<StatusValue, string> = {
    Active:      'green',
    Inactive:    'orange',
    Deactivated: 'orange',
    Invited:     'blue',
  }
  return (
    <span className={`table-badge table-badge--${colorMap[status]}`}>
      {status}
    </span>
  )
}


// ── UserCell ─────────────────────────────────────────────────────────────────

export type UserRowStatus = 'active' | 'deactivated' | 'invited'

export interface UserCellProps {
  name:       string
  email:      string
  avatarUrl?: string
  /** Fallback initials when no avatarUrl. Defaults to first letter of name. */
  initials?:  string
  isNew?:     boolean
  userStatus?: UserRowStatus
}

export function UserCell({
  name,
  email,
  avatarUrl,
  initials,
  isNew,
  userStatus = 'active',
}: UserCellProps) {
  const isInvited = userStatus === 'invited'
  const initial   = (initials ?? name[0] ?? '?').toUpperCase()

  return (
    <div className="table-user-cell">
      <div className={`table-user-avatar${isInvited ? ' table-user-avatar--invited' : ''}`}>
        {avatarUrl && !isInvited
          ? <img src={avatarUrl} alt="" className="table-user-avatar__img" />
          : <span className="table-user-avatar__initials">{initial}</span>
        }
      </div>

      <div className="table-user-info">
        <div className="table-user-info__row">
          <span className={`table-user-info__name${isInvited ? ' table-user-info__name--muted' : ''}`}>
            {name}
          </span>
          {isNew && <span className="table-badge table-badge--blue">New</span>}
        </div>
        <span className="table-user-info__email">{email}</span>
      </div>
    </div>
  )
}


// ── KebabMenu ────────────────────────────────────────────────────────────────

export function KebabMenu({ onClick }: { onClick?: () => void }) {
  return (
    <button className="table-kebab" onClick={onClick} aria-label="More actions">
      <MoreHorizontal size={16} strokeWidth={1.5} />
    </button>
  )
}


// ── Table ────────────────────────────────────────────────────────────────────

export interface TableProps<TData> {
  data:        TData[]
  columns:     ColumnDef<TData, any>[]
  selectable?: boolean
  resizable?:  boolean
  className?:  string
}

export function Table<TData>({
  data,
  columns,
  selectable = true,
  resizable  = true,
  className,
}: TableProps<TData>) {
  const [sorting,      setSorting]      = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnSizing, setColumnSizing] = useState<ColumnSizingState>({})
  const [wrapperWidth, setWrapperWidth] = useState(0)
  const [isScrolled,   setIsScrolled]   = useState(false)
  const wrapperRef     = useRef<HTMLDivElement>(null)
  // Tracks whether a resize drag just finished so the resulting click event
  // on the <th> doesn't accidentally trigger sort.
  const wasResizingRef = useRef(false)

  // ── Scroll-aware header border ────────────────────────────────────────────
  // IntersectionObserver fires regardless of which ancestor is the scroll
  // container — works with both window scroll and overflow:auto containers.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return
    const sentinel = document.createElement('div')
    sentinel.style.cssText = 'position:absolute;top:0;height:1px;width:1px;pointer-events:none'
    wrapper.prepend(sentinel)
    const obs = new IntersectionObserver(
      ([entry]) => setIsScrolled(!entry.isIntersecting),
      { threshold: 0 }
    )
    obs.observe(sentinel)
    return () => { obs.disconnect(); sentinel.remove() }
  }, [])

  // ── Select column ─────────────────────────────────────────────────────────
  // Memoized so cell/header function references stay stable across renders —
  // prevents React from unmounting/remounting the Checkbox on every state
  // update (which would kill the CSS stroke-dashoffset transition).
  const selectCol = useMemo<ColumnDef<TData, any>>(() => ({
    id:             '__select',
    enableSorting:  false,
    enableResizing: false,
    size:           48,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected()  ? true
          : table.getIsSomeRowsSelected() ? 'indeterminate'
          : false
        }
        onChange={() => table.toggleAllRowsSelected()}
        showLabel={false}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onChange={() => row.toggleSelected()}
        showLabel={false}
      />
    ),
  }), [])

  const allCols = useMemo(
    () => (selectable ? [selectCol, ...columns] : columns),
    [selectable, columns, selectCol],
  )

  // ── Fixed vs. resizable columns ───────────────────────────────────────────
  // "Fixed" = enableResizing === false (the select col + the action col).
  // "Middle" = everything else; these always share the available space.

  // IDs of resizable middle columns
  const middleColIds = useMemo(
    () =>
      columns
        .filter((col) => (col as any).enableResizing !== false)
        .map((col) => String((col as any).id ?? (col as any).accessorKey))
        .filter(Boolean),
    [columns],
  )

  // Pixel sum of fixed columns: select col (48px) + any user-defined fixed cols
  const fixedWidth = useMemo(() => {
    let total = selectable ? 48 : 0
    columns.forEach((col) => {
      if (
        (col as any).enableResizing === false &&
        Object.prototype.hasOwnProperty.call(col, 'size')
      ) {
        total += (col as any).size
      }
    })
    return total
  }, [columns, selectable])

  // ── Wrapper width tracking + middle column balancing ──────────────────────
  // On first mount: distribute middle columns equally across available space.
  // On wrapper resize: redistribute proportionally so they always fill exactly.
  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const balance = (w: number) => {
      setWrapperWidth(w)
      if (middleColIds.length === 0) return
      setColumnSizing((prev) => {
        const totalMiddle = w - fixedWidth
        const currentTotal = middleColIds.reduce((sum, id) => sum + (prev[id] ?? 0), 0)
        const next = { ...prev }

        if (currentTotal <= 0) {
          // First mount — equal distribution
          const each = Math.max(50, totalMiddle / middleColIds.length)
          middleColIds.forEach((id) => { next[id] = each })
        } else {
          // Wrapper resize — preserve proportions
          let allocated = 0
          middleColIds.forEach((id, i) => {
            if (i === middleColIds.length - 1) {
              next[id] = Math.max(50, totalMiddle - allocated)
            } else {
              const ratio = (prev[id] ?? 0) / currentTotal
              const size  = Math.max(50, Math.round(totalMiddle * ratio))
              next[id] = size
              allocated += size
            }
          })
        }

        return next
      })
    }

    balance(wrapper.getBoundingClientRect().width)
    const obs = new ResizeObserver(([entry]) => balance(entry.contentRect.width))
    obs.observe(wrapper)
    return () => obs.disconnect()
  }, [middleColIds, fixedWidth])

  // ── Column resize handler ──────────────────────────────────────────────────
  // When the user drags a middle column, redistribute the remaining space
  // proportionally among the other middle columns so the table never overflows.
  const handleColumnSizingChange: OnChangeFn<ColumnSizingState> = useCallback(
    (updaterOrValue) => {
      setColumnSizing((prev) => {
        const raw =
          typeof updaterOrValue === 'function' ? updaterOrValue(prev) : updaterOrValue

        if (wrapperWidth === 0 || middleColIds.length < 2) return raw

        // Find which column moved
        const changedId = middleColIds.find((id) => raw[id] !== prev[id])
        if (!changedId) return raw

        const changedSize = Math.max(50, raw[changedId] ?? 50)
        const othersIds   = middleColIds.filter((id) => id !== changedId)
        const totalMiddle = wrapperWidth - fixedWidth
        // Ensure others collectively have at least 50px each
        const remaining   = Math.max(othersIds.length * 50, totalMiddle - changedSize)
        const othersTotal = othersIds.reduce((sum, id) => sum + (prev[id] ?? 50), 0)

        const next: ColumnSizingState = { ...raw, [changedId]: changedSize }

        if (othersTotal <= 0) {
          const each = Math.max(50, remaining / othersIds.length)
          othersIds.forEach((id) => { next[id] = each })
        } else {
          let allocated = 0
          othersIds.forEach((id, i) => {
            if (i === othersIds.length - 1) {
              next[id] = Math.max(50, remaining - allocated)
            } else {
              const ratio = (prev[id] ?? 50) / othersTotal
              const size  = Math.max(50, Math.round(remaining * ratio))
              next[id] = size
              allocated += size
            }
          })
        }

        return next
      })
    },
    [wrapperWidth, middleColIds, fixedWidth],
  )

  const table = useReactTable({
    data,
    columns:              allCols,
    state:                { sorting, rowSelection, columnSizing },
    onSortingChange:      setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnSizingChange: handleColumnSizingChange,
    getCoreRowModel:      getCoreRowModel(),
    getSortedRowModel:    getSortedRowModel(),
    enableRowSelection:   selectable,
    enableColumnResizing: resizable,
    columnResizeMode:     'onChange',
  })

  const isResizing = !!table.getState().columnSizingInfo.isResizingColumn

  // Colgroup shared between header and body tables — both must render identical
  // column widths so the header cells align with the body cells perfectly.
  const colgroup = (
    <colgroup>
      {table.getAllColumns().map((col) => (
        <col key={col.id} style={{ width: col.getSize(), minWidth: col.getSize() }} />
      ))}
    </colgroup>
  )

  return (
    <>
      {/* ── Sticky header — sibling of .table-outer, NOT a child ─────────────
          CSS sticky is bounded by the element's parent. When the header lived
          inside .table-outer, it would exit as .table-outer scrolled away.
          As a sibling, the sticky boundary becomes the parent wrapper in
          App.tsx (.table-with-pagination or .dev-content directly), which
          spans the full table + pagination section — so the header stays
          pinned for the entire scroll range. */}
      <div className={`table-sticky-header${isScrolled ? ' table-sticky-header--scrolled' : ''}`}>
        <table
          className={`table${selectable ? ' table--selectable' : ''}`}
          style={wrapperWidth > 0 ? { width: wrapperWidth } : undefined}
        >
          {colgroup}
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="table__head-row">
                {hg.headers.map((header) => {
                  const canSort = header.column.getCanSort()
                  const sorted  = header.column.getIsSorted()
                  return (
                    <TableHeaderCell
                      key={header.id}
                      label={header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      sortable={canSort}
                      sortState={sorted === 'asc' ? 'asc' : sorted === 'desc' ? 'desc' : 'none'}
                      onSort={canSort ? () => {
                        if (wasResizingRef.current) { wasResizingRef.current = false; return }
                        header.column.toggleSorting()
                      } : undefined}
                      onResizeStart={resizable && header.column.getCanResize() ? (e) => {
                        wasResizingRef.current = true
                        header.getResizeHandler()(e)
                      } : undefined}
                      isResizing={header.column.getIsResizing()}
                    />
                  )
                })}
              </tr>
            ))}
          </thead>
        </table>
      </div>

      <div className={`table-outer${className ? ` ${className}` : ''}`}>
      {/* ── Body — inside the clipped wrapper ───────────────────────────────
          overflow: hidden clips rows to the rounded bottom corners.
          Safe here because there is no sticky descendant. */}
      <div ref={wrapperRef} className="table-wrapper">
        <table
          className={`table${selectable ? ' table--selectable' : ''}${isResizing ? ' table--resizing' : ''}`}
          style={wrapperWidth > 0 ? { width: wrapperWidth } : undefined}
        >
          {colgroup}
          <tbody>
            {table.getRowModel().rows.map((row, rowIndex) => (
              <tr
                key={row.id}
                className={`table-row${row.getIsSelected() ? ' table-row--selected' : ''}`}
                style={{ '--row-index': rowIndex } as React.CSSProperties}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableRowCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableRowCell>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      </div>
    </>
  )
}
