import React from 'react'
import { Checkbox } from '../Checkbox/Checkbox'
import './TableRow.css'

export interface TableRowProps {
  /** <td> elements wrapping TableCell components */
  children:    React.ReactNode
  /** Controlled selected state */
  selected?:   boolean
  /** Callback when checkbox is toggled */
  onSelect?:   (selected: boolean) => void
  /** Show checkbox column as first cell */
  selectable?: boolean
  /** Optional row-level click handler */
  onClick?:    () => void
  className?:  string
}

export function TableRow({
  children,
  selected  = false,
  onSelect,
  selectable = false,
  onClick,
  className,
}: TableRowProps) {
  const rowClass = [
    'table-row',
    selected  && 'table-row--selected',
    onClick   && 'table-row--clickable',
    className,
  ].filter(Boolean).join(' ')

  return (
    <tr className={rowClass} onClick={onClick}>

      {/* Checkbox cell — only when selectable */}
      {selectable && (
        <td className="table-row__cell table-row__cell--checkbox">
          <div className="table-row__checkbox-wrap">
            <Checkbox
              checked={selected}
              onChange={checked => onSelect?.(!!checked)}
              showLabel={false}
            />
          </div>
        </td>
      )}

      {/* Data cells — caller provides <td> elements */}
      {children}

    </tr>
  )
}

/**
 * Thin <td> wrapper so consumers don't write bare <td> elements.
 * Usage:
 *   <TableRow selectable selected={sel} onSelect={setSelected}>
 *     <TableRowCell><TableCell type="text" text="Jane" /></TableRowCell>
 *     <TableRowCell><TableCell type="status" status="Active" /></TableRowCell>
 *   </TableRow>
 */
export interface TableRowCellProps {
  children:   React.ReactNode
  /** Pixel width — passed down from the parent Table's colgroup */
  width?:     number
  className?: string
}

export function TableRowCell({ children, width, className }: TableRowCellProps) {
  return (
    <td
      className={['table-row__cell', className].filter(Boolean).join(' ')}
      style={width !== undefined ? { width, minWidth: width } : undefined}
    >
      {children}
    </td>
  )
}
