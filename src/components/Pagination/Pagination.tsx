import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '../index'
import './Pagination.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type DropdownPhase = 'closed' | 'open' | 'closing'

export interface PaginationProps {
  totalItems:        number
  currentPage:       number
  pageSize:          number
  onPageChange:      (page: number) => void
  onPageSizeChange?: (size: number) => void
  pageSizeOptions?:  number[]
  showSizeControl?:  boolean
  className?:        string
}

// ─── Page-number algorithm ────────────────────────────────────────────────────

type PageItem = number | '...'

function getPageNumbers(current: number, total: number): PageItem[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const pages = new Set<number>()
  pages.add(1)
  pages.add(total)
  if (current - 1 >= 1) pages.add(current - 1)
  pages.add(current)
  if (current + 1 <= total) pages.add(current + 1)

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const result: PageItem[] = []

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) {
      result.push('...')
    }
    result.push(sorted[i])
  }

  return result
}

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
      <path d="M6 1L1.5 5.5L6 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="7" height="11" viewBox="0 0 7 11" fill="none" aria-hidden="true">
      <path d="M1 1L5.5 5.5L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      width="9" height="5" viewBox="0 0 9 5" fill="none" aria-hidden="true"
      className={`pagination__chevron${open ? ' pagination__chevron--up' : ''}`}
    >
      <path d="M1 1L4.5 4L8 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Pagination({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [20, 50, 100],
  showSizeControl = true,
  className,
}: PaginationProps) {
  const totalPages  = Math.max(1, Math.ceil(totalItems / pageSize))
  const pageNumbers = getPageNumbers(currentPage, totalPages)

  // ── Dropdown phase state machine ─────────────────────────────────────────
  const [dropdownPhase, setDropdownPhase] = useState<DropdownPhase>('closed')
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dropdownRef   = useRef<HTMLDivElement>(null)

  const openDropdown = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
    setDropdownPhase('open')
  }, [])

  const closeDropdown = useCallback(() => {
    setDropdownPhase('closing')
    closeTimerRef.current = setTimeout(() => setDropdownPhase('closed'), 120)
  }, [])

  const toggleDropdown = useCallback(() => {
    if (dropdownPhase === 'open') closeDropdown()
    else openDropdown()
  }, [dropdownPhase, openDropdown, closeDropdown])

  // Close on outside click
  useEffect(() => {
    if (dropdownPhase === 'closed') return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        closeDropdown()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [dropdownPhase, closeDropdown])

  // Cleanup timer on unmount
  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current)
  }, [])

  const selectSize = (size: number) => {
    closeDropdown()
    onPageSizeChange?.(size)
    // Reset to page 1 when page size changes
    if (currentPage !== 1) onPageChange(1)
  }

  // ── Nav helpers ──────────────────────────────────────────────────────────
  const goTo = (page: number) => {
    if (page >= 1 && page <= totalPages) onPageChange(page)
  }

  // ── Ellipsis key deduplication ───────────────────────────────────────────
  let ellipsisCount = 0

  return (
    <div className={`pagination${className ? ` ${className}` : ''}`}>

      {/* ── Left: page-size control ─────────────────────────────────────── */}
      {showSizeControl && (
        <div className="pagination__size-control" ref={dropdownRef}>
          <span className="pagination__label">Show</span>

          {/* Wrapper gives the menu an anchor point aligned to the trigger */}
          <div className="pagination__dropdown-wrap">
            <button
              className={`pagination__dropdown${dropdownPhase === 'open' ? ' pagination__dropdown--open' : ''}`}
              onClick={toggleDropdown}
              aria-haspopup="listbox"
              aria-expanded={dropdownPhase === 'open'}
            >
              <span className="pagination__dropdown-value">{pageSize}</span>
              <ChevronDown open={dropdownPhase === 'open'} />
            </button>

            {dropdownPhase !== 'closed' && (
              <div
                className={`pagination__menu pagination__menu--${dropdownPhase}`}
                role="listbox"
              >
                {pageSizeOptions.map(opt => (
                  <button
                    key={opt}
                    role="option"
                    aria-selected={opt === pageSize}
                    className={`pagination__option${opt === pageSize ? ' pagination__option--active' : ''}`}
                    onClick={() => selectSize(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="pagination__label">results per page</span>
        </div>
      )}

      {/* ── Right: page navigation (hidden when only one page) ─────────── */}
      {totalPages > 1 && <div className="pagination__nav" role="navigation" aria-label="Pagination">

        <Button
          showButtonLabel={false}
          showLeftIco={true}
          leftIcon={<ChevronLeft />}
          color="Light grey"
          type="Ghost"
          size="Small"
          state={currentPage === 1 ? 'Deactivated' : 'Normal'}
          onClick={() => goTo(currentPage - 1)}
        />

        {pageNumbers.map(p => {
          if (p === '...') {
            ellipsisCount++
            return (
              <span key={`ellipsis-${ellipsisCount}`} className="pagination__ellipsis">
                …
              </span>
            )
          }
          const isActive = p === currentPage
          return (
            <Button
              key={p}
              buttonLabel={String(p)}
              color={isActive ? 'Blue' : 'Light grey'}
              type={isActive ? 'Default' : 'Ghost'}
              size="Small"
              onClick={() => goTo(p)}
            />
          )
        })}

        <Button
          showButtonLabel={false}
          showRightIco={true}
          rightIcon={<ChevronRight />}
          color="Light grey"
          type="Ghost"
          size="Small"
          state={currentPage === totalPages ? 'Deactivated' : 'Normal'}
          onClick={() => goTo(currentPage + 1)}
        />

      </div>}
    </div>
  )
}
