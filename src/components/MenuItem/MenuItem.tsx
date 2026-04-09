import React from 'react'
import './MenuItem.css'
import { Typography } from '../Typography/Typography'

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Multi-select checkbox visual ─────────────────────────────────────────────
// Rendered as a <span> — cannot use the <Checkbox> component (it's a <button>)

function MenuItemCheckbox({ checked }: { checked: boolean | 'indeterminate' }) {
  const isChecked = checked === true
  const isPartial = checked === 'indeterminate'
  const boxClass = [
    'menu-item__cb',
    (isChecked || isPartial) ? 'menu-item__cb--filled' : '',
    isChecked                ? 'menu-item__cb--checked' : '',
    isPartial                ? 'menu-item__cb--partial' : '',
  ].filter(Boolean).join(' ')
  return (
    <span className={boxClass} aria-hidden="true">
      <svg className="menu-item__cb-icon menu-item__cb-check" viewBox="0 0 16 16" fill="none">
        <path d="M3.5 8.5L6 11.25L12.5 4.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <svg className="menu-item__cb-icon menu-item__cb-dash" viewBox="0 0 16 16" fill="none">
        <path d="M3 8H13" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </span>
  )
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface MenuItemProps {
  /** The item label */
  label: string
  /** Icon rendered on the left — only shown when showIcon is true */
  icon?: React.ReactNode
  /** Whether to render the icon slot (default true) */
  showIcon?: boolean
  /** Marks this item as the active/current selection */
  selected?: boolean
  /**
   * Secondary text shown below the label (Dual info type).
   * Renders in M1/Regular style in muted colour.
   */
  subhead?: string
  /**
   * Value shown on the right side (Dual info type).
   * When provided the chevron is hidden by default.
   */
  value?: string
  /** Whether to show the right-pointing chevron (default: true, false when value is set) */
  showChevron?: boolean
  /**
   * Multi-select type: when provided, renders an animated checkbox visual
   * on the left and hides the chevron. Pass `true`, `false`, or `'indeterminate'`.
   */
  checked?: boolean | 'indeterminate'
  /**
   * Visual variant:
   * - `'default'`  Standard item (default)
   * - `'danger'`   Red text and icon; red-tinted hover
   * - `'disabled'` Muted appearance; not clickable
   */
  variant?: 'default' | 'danger' | 'disabled'
  /** Keyboard shortcut hint shown on the right (e.g. '⌘K') */
  shortcut?: string
  /**
   * ARIA role override. Pass `"menuitem"` when rendering inside a Menu.
   * Injected automatically by MenuSection — not needed for standalone use.
   */
  role?: string
  /**
   * Called after onClick fires. Injected by MenuSection so the Menu closes
   * after a non-sub-menu item is activated. Not needed for standalone use.
   */
  onClose?: () => void
  /**
   * Mouse enter handler — injected by Menu for slide highlight + sub-menu tracking.
   * Not needed for standalone use.
   */
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /** Mouse leave handler — injected by Menu. Not needed for standalone use. */
  onMouseLeave?: () => void
  onClick?: () => void
  className?: string
}

// ─── Component ───────────────────────────────────────────────────────────────

export function MenuItem({
  label,
  icon,
  showIcon     = true,
  selected     = false,
  subhead,
  value,
  showChevron,
  checked,
  variant      = 'default',
  shortcut,
  role,
  onClose,
  onMouseEnter,
  onMouseLeave,
  onClick,
  className,
}: MenuItemProps) {
  const isMultiSelect  = checked !== undefined
  const isDisabled     = variant === 'disabled'
  // Auto-apply selected background when checkbox is ticked
  const isSelected     = selected || (isMultiSelect && checked === true)
  // Chevron hidden for multi-select; otherwise hidden when value is shown
  const chevronVisible = isMultiSelect ? false : (showChevron ?? !value)
  // Label weight: medium when selected, checked, or indeterminate
  const labelWeight    = (isSelected || checked === 'indeterminate') ? 'medium' : 'regular'

  const handleClick = () => {
    if (isDisabled) return
    onClick?.()
    onClose?.()
  }

  const classes = [
    'menu-item',
    isSelected           ? 'menu-item--selected'  : '',
    subhead              ? 'menu-item--dual-info'  : '',
    variant === 'danger' ? 'menu-item--danger'     : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  return (
    <button
      className={classes}
      onClick={handleClick}
      disabled={isDisabled}
      role={role}
      aria-current={isSelected ? 'page' : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <span className="menu-item__left">
        {isMultiSelect ? (
          <MenuItemCheckbox checked={checked!} />
        ) : (
          showIcon && icon && (
            <span className="menu-item__icon" aria-hidden="true">{icon}</span>
          )
        )}
        <span className="menu-item__text">
          <Typography
            variant="b2"
            weight={labelWeight}
            className="menu-item__label"
          >
            {label}
          </Typography>
          {subhead && (
            <span className="menu-item__subhead">{subhead}</span>
          )}
        </span>
      </span>

      <span className="menu-item__right" aria-hidden="true">
        {value    && <span className="menu-item__value">{value}</span>}
        {shortcut && <span className="menu-item__shortcut">{shortcut}</span>}
        {chevronVisible && <ChevronRight />}
      </span>
    </button>
  )
}
