// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { Menu } from '../Menu/Menu'
import type { MenuItemDef } from '../Menu/Menu'
import { InputField } from '../InputField/InputField'
import './Dropdown.css'

// ─── Chevron icon ─────────────────────────────────────────────────────────────

function DropdownChevron() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3.5 6L8 10.5L12.5 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'hidden' | 'visible' | 'exiting'

type BorderState =
  | 'default'
  | 'hovered'
  | 'focused'
  | 'focused-hovered'
  | 'open'
  | 'open-hovered'
  | 'error'
  | 'error-hover'
  | 'error-open'
  | 'disabled'

export type DropdownSize    = 'Large' | 'Medium'
export type DropdownVariant = 'default' | 'inline' | 'cell'

export interface DropdownOption {
  label:     string
  value:     string
  disabled?: boolean
}

export interface DropdownProps {
  /** Label shown above the field — default variant only */
  label?:        string
  /** Shows the mandatory red asterisk — default variant only */
  required?:     boolean
  /** Hint text inside the trigger when nothing is selected */
  placeholder?:  string
  /** The list of selectable options */
  options:       DropdownOption[]
  /** Controlled value — string for single-select, string[] for multi-select */
  value?:        string | string[]
  onChange?:     (value: string | string[]) => void
  /** Allow multiple options to be selected simultaneously */
  multiSelect?:  boolean
  /**
   * Visual context:
   * - `'default'`  Full bordered field with label and error states
   * - `'inline'`   Text + chevron only, inherits surrounding font size, blue text
   * - `'cell'`     Borderless trigger for use inside table cells
   */
  variant?:      DropdownVariant
  /** Trigger height — default variant only */
  size?:         DropdownSize
  disabled?:     boolean
  /** Puts the default variant into its error state */
  error?:        boolean
  /** Message shown below the field when error is true — default variant only */
  errorMessage?: string
  /** Neutral helper text below the field — default variant only */
  helperText?:   string
  /** Show the search input inside the panel. Default: true */
  searchable?:   boolean
  /** Show the left icon slot (default variant only) */
  showLeftIcon?: boolean
  /** Icon to display in the left slot — any React node (e.g. lucide icon at size 16, strokeWidth 1.5) */
  icon?:         React.ReactNode
  className?:    string
}

// ─── Border state helper ──────────────────────────────────────────────────────

function getBorderState(opts: {
  error:    boolean
  disabled: boolean
  isOpen:   boolean
  focused:  boolean
  hovered:  boolean
}): BorderState {
  const { error, disabled, isOpen, focused, hovered } = opts
  if (disabled)           return 'disabled'
  if (isOpen && error)    return 'error-open'
  if (isOpen)             return hovered ? 'open-hovered' : 'open'
  if (error && hovered)   return 'error-hover'
  if (error)              return 'error'
  if (focused && hovered) return 'focused-hovered'
  if (focused)            return 'focused'
  if (hovered)            return 'hovered'
  return 'default'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Dropdown({
  label        = 'Label',
  required     = false,
  placeholder  = 'Select an option',
  options      = [],
  value:         controlledValue,
  onChange,
  multiSelect  = false,
  variant      = 'default',
  size         = 'Large',
  disabled     = false,
  error        = false,
  errorMessage = 'This field is required',
  helperText,
  searchable   = true,
  showLeftIcon = false,
  icon,
  className,
}: DropdownProps) {

  const [internalValue, setInternalValue] = useState<string | string[]>(multiSelect ? [] : '')
  const [panelPhase, setPanelPhase]       = useState<Phase>('hidden')
  const [errorPhase, setErrorPhase]       = useState<Phase>(() => (error && !disabled) ? 'visible' : 'hidden')
  const [isFocused, setIsFocused]         = useState(false)
  const [isHovered, setIsHovered]         = useState(false)
  const [highlightedIdx, setHighlightedIdx] = useState(-1)
  const [searchQuery, setSearchQuery]     = useState('')
  const [clearPhase,  setClearPhase]      = useState<Phase>('hidden')

  const containerRef  = useRef<HTMLDivElement>(null)
  const triggerRef    = useRef<HTMLButtonElement>(null)
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const portalRef     = useRef<HTMLDivElement>(null)
  const panelTimer    = useRef<ReturnType<typeof setTimeout>>()
  const errorTimer    = useRef<ReturnType<typeof setTimeout>>()
  const clearTimer    = useRef<ReturnType<typeof setTimeout>>()

  const [portalPos, setPortalPos] = useState<{ top: number; left: number; width: number } | null>(null)

  const value        = controlledValue !== undefined ? controlledValue : internalValue
  const isOpen       = panelPhase !== 'hidden'
  const selectedVals = Array.isArray(value) ? value : (value ? [value as string] : [])
  const hasValue     = selectedVals.length > 0

  const filteredOptions = options.filter(o =>
    o.label.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const isSelected = (v: string) => selectedVals.includes(v)

  // ── Open / Close ─────────────────────────────────────────────────────────

  const openPanel = () => {
    if (disabled) return
    clearTimeout(panelTimer.current)
    panelTimer.current = undefined
    setPanelPhase('visible')
    setHighlightedIdx(-1)
    setSearchQuery('')
  }

  const closePanel = () => {
    clearTimeout(panelTimer.current)
    setPanelPhase('exiting')
    panelTimer.current = setTimeout(() => { setPanelPhase('hidden'); panelTimer.current = undefined }, 200)
    setHighlightedIdx(-1)
  }

  const togglePanel = () => (isOpen ? closePanel() : openPanel())

  // Click outside to close
  useEffect(() => {
    if (panelPhase === 'hidden') return
    const handler = (e: MouseEvent) => {
      if (
        !containerRef.current?.contains(e.target as Node) &&
        !portalRef.current?.contains(e.target as Node)
      ) {
        clearTimeout(panelTimer.current)
        setPanelPhase('exiting')
        panelTimer.current = setTimeout(() => { setPanelPhase('hidden'); panelTimer.current = undefined }, 200)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [panelPhase])

  // Error message slide in/out (default variant)
  useEffect(() => {
    clearTimeout(errorTimer.current)
    const isErr = error && !disabled
    if (isErr) {
      setErrorPhase('visible')
    } else {
      setErrorPhase(p => p !== 'hidden' ? 'exiting' : 'hidden')
      errorTimer.current = setTimeout(() => setErrorPhase('hidden'), 200)
    }
    return () => clearTimeout(errorTimer.current)
  }, [error, disabled])

  // ── Animate clear button in/out ────────────────────────────────────────────
  useEffect(() => {
    clearTimeout(clearTimer.current)
    const show = multiSelect && hasValue && (isFocused || isOpen)
    if (show) {
      setClearPhase('visible')
    } else {
      setClearPhase(p => p !== 'hidden' ? 'exiting' : 'hidden')
      clearTimer.current = setTimeout(() => setClearPhase('hidden'), 180)
    }
    return () => clearTimeout(clearTimer.current)
  }, [multiSelect, hasValue, isFocused, isOpen])

  // Cleanup on unmount
  useEffect(() => () => {
    clearTimeout(panelTimer.current)
    clearTimeout(errorTimer.current)
    clearTimeout(clearTimer.current)
  }, [])

  // Track trigger position for cell variant portal rendering
  useEffect(() => {
    if (variant !== 'cell' || panelPhase === 'hidden') return
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) setPortalPos({ top: rect.bottom + 8, left: rect.left, width: rect.width })
  }, [variant, panelPhase])

  // ── Selection ────────────────────────────────────────────────────────────

  const selectOption = (optValue: string) => {
    if (multiSelect) {
      const current = Array.isArray(value) ? value : []
      const next    = current.includes(optValue)
        ? current.filter(v => v !== optValue)
        : [...current, optValue]
      if (onChange) onChange(next)
      else          setInternalValue(next)
    } else {
      if (onChange) onChange(optValue)
      else          setInternalValue(optValue)
      closePanel()
    }
  }

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation()
    const empty = multiSelect ? [] : ''
    if (onChange) onChange(empty)
    else          setInternalValue(empty)
  }

  // ── Keyboard navigation ───────────────────────────────────────────────────

  const moveHighlight = (dir: 1 | -1) => {
    setHighlightedIdx(prev => {
      const next = prev + dir
      if (next < 0)                       return filteredOptions.length - 1
      if (next >= filteredOptions.length) return 0
      return next
    })
  }

  const confirmHighlighted = () => {
    const opt = filteredOptions[highlightedIdx]
    if (opt && !opt.disabled) selectOption(opt.value)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        if (!isOpen) { openPanel(); return }
        moveHighlight(1)
        break
      case 'ArrowUp':
        e.preventDefault()
        if (!isOpen) { openPanel(); return }
        moveHighlight(-1)
        break
      case 'Enter':
      case ' ':
        e.preventDefault()
        if (!isOpen) { openPanel(); return }
        confirmHighlighted()
        break
      case 'Escape':
        e.preventDefault()
        closePanel()
        triggerRef.current?.focus()
        break
      case 'Tab':
        if (isOpen) closePanel()
        break
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown': e.preventDefault(); moveHighlight(1);  break
      case 'ArrowUp':   e.preventDefault(); moveHighlight(-1); break
      case 'Enter':     e.preventDefault(); confirmHighlighted(); break
      case 'Escape':    e.preventDefault(); closePanel(); triggerRef.current?.focus();  break
      case 'Tab':       closePanel(); break
    }
  }

  // ── Trigger display content ───────────────────────────────────────────────

  const renderTriggerContent = () => {
    if (!hasValue) return <span className="dropdown__placeholder">{placeholder}</span>

    if (multiSelect) {
      const first = options.find(o => o.value === selectedVals[0])
      const extra = selectedVals.length - 1
      return (
        <>
          <span className="dropdown__value">{first?.label}</span>
          {extra > 0 && (
            <>
              <span className="dropdown__value-sep">,</span>
              <span className="dropdown__badge-inline">+{extra} more</span>
            </>
          )}
        </>
      )
    }

    const opt = options.find(o => o.value === (value as string))
    return <span className="dropdown__value">{opt?.label}</span>
  }

  // ── Shared panel ──────────────────────────────────────────────────────────

  const renderPanel = (cellPortal = false) => {
    if (panelPhase === 'hidden') return null

    const menuItems: MenuItemDef[] = filteredOptions.map(opt => ({
      label:    opt.label,
      // Multi-select: use the checked prop so MenuItem renders its own animated
      // checkbox visual. Single-select: use selected for the blue highlight.
      checked:  multiSelect ? isSelected(opt.value) : undefined,
      selected: multiSelect ? undefined : isSelected(opt.value),
      variant:  opt.disabled ? ('disabled' as const) : ('default' as const),
      onClick:  () => selectOption(opt.value),
    }))

    return (
      <div
        className={[
          'dropdown__panel',
          panelPhase === 'exiting' ? 'dropdown__panel--exiting' : 'dropdown__panel--visible',
          `dropdown__panel--${variant}`,
          cellPortal ? 'dropdown__panel--cell-portal' : '',
        ].filter(Boolean).join(' ')}
      >
        {/* Search */}
        {searchable && (
          <div
            ref={searchWrapRef}
            className="dropdown__search-wrap"
            onKeyDown={handleSearchKeyDown}
          >
            <InputField
              label=""
              required={false}
              placeholder="Search..."
              value={searchQuery}
              onChange={v => { setSearchQuery(v); setHighlightedIdx(-1) }}
              size="Medium"
            />
          </div>
        )}

        {/* Options via Menu component */}
        {filteredOptions.length === 0
          ? <p className="dropdown__empty">No options found</p>
          : <Menu
              sections={[{ items: menuItems }]}
              isOpen={true}
              className="dropdown__menu"
            />
        }
      </div>
    )
  }

  // ─── Render: inline ───────────────────────────────────────────────────────

  if (variant === 'inline') {
    return (
      <div
        ref={containerRef}
        className={['dropdown', 'dropdown--inline', className].filter(Boolean).join(' ')}
      >
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={panelPhase === 'visible'}
          aria-haspopup="listbox"
          disabled={disabled}
          className={[
            'dropdown__trigger--inline',
            hasValue   ? 'dropdown__trigger--inline-filled'   : '',
            disabled   ? 'dropdown__trigger--inline-disabled' : '',
          ].filter(Boolean).join(' ')}
          onClick={togglePanel}
          onKeyDown={handleKeyDown}
        >
          {renderTriggerContent()}
          <span className={['dropdown__chevron', 'dropdown__chevron--inline', isOpen ? 'dropdown__chevron--open' : ''].filter(Boolean).join(' ')}>
            <DropdownChevron />
          </span>
        </button>
        {renderPanel()}
      </div>
    )
  }

  // ─── Render: cell ─────────────────────────────────────────────────────────

  if (variant === 'cell') {
    return (
      <div
        ref={containerRef}
        className={['dropdown', 'dropdown--cell', className].filter(Boolean).join(' ')}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={panelPhase === 'visible'}
          aria-haspopup="listbox"
          disabled={disabled}
          className={[
            'dropdown__trigger--cell',
            isHovered ? 'dropdown__trigger--cell-hovered' : '',
            isOpen    ? 'dropdown__trigger--cell-open'    : '',
            disabled  ? 'dropdown__trigger--cell-disabled' : '',
          ].filter(Boolean).join(' ')}
          onClick={togglePanel}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        >
          {renderTriggerContent()}
          {multiSelect && hasValue && (
            <span
              role="button"
              tabIndex={-1}
              className="dropdown__clear dropdown__clear--cell"
              onMouseDown={e => { e.preventDefault(); clearAll(e) }}
              aria-label="Clear selection"
            >
              <X size={11} strokeWidth={2.5} />
            </span>
          )}
          <span className={['dropdown__chevron', 'dropdown__chevron--cell', isOpen ? 'dropdown__chevron--open' : ''].filter(Boolean).join(' ')}>
            <DropdownChevron />
          </span>
        </button>
        {panelPhase !== 'hidden' && portalPos && createPortal(
          <div
            ref={portalRef}
            style={{ position: 'fixed', top: portalPos.top, left: portalPos.left, width: portalPos.width, zIndex: 1000 }}
          >
            {renderPanel(true)}
          </div>,
          document.body
        )}
      </div>
    )
  }

  // ─── Render: default ──────────────────────────────────────────────────────

  const borderState = getBorderState({ error, disabled, isOpen, focused: isFocused, hovered: isHovered })
  const isErr       = error && !disabled

  return (
    <div
      ref={containerRef}
      className={['dropdown', 'dropdown--default', className].filter(Boolean).join(' ')}
    >
      {/* Label */}
      <label className={['dropdown__label', isErr ? 'dropdown__label--error' : ''].filter(Boolean).join(' ')}>
        <span>{label}</span>
        {required && <span className="dropdown__required">*</span>}
      </label>

      {/* Wrapper */}
      <div
        className={[
          'dropdown__wrapper',
          `dropdown__wrapper--${size.toLowerCase()}`,
          disabled ? 'dropdown__wrapper--disabled' : '',
          isErr     ? 'dropdown__wrapper--error'    : '',
        ].filter(Boolean).join(' ')}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Trigger */}
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-expanded={panelPhase === 'visible'}
          aria-haspopup="listbox"
          disabled={disabled}
          className={[
            'dropdown__trigger',
            `dropdown__trigger--${size.toLowerCase()}`,
            hasValue ? 'dropdown__trigger--has-value' : '',
          ].filter(Boolean).join(' ')}
          onClick={togglePanel}
          onFocus={() => !disabled && setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
        >
          <span className="dropdown__trigger-content">
            {showLeftIcon && icon && (
              <span className="dropdown__left-icon" aria-hidden="true">{icon}</span>
            )}
            {renderTriggerContent()}
          </span>
          <span className="dropdown__trigger-right">
            {multiSelect && clearPhase !== 'hidden' && (
              <span
                role="button"
                tabIndex={-1}
                className={`dropdown__clear dropdown__clear--${clearPhase === 'exiting' ? 'exiting' : 'visible'}`}
                onMouseDown={e => { e.preventDefault(); clearAll(e) }}
                aria-label="Clear selection"
              >
                <X size={14} strokeWidth={2.5} />
              </span>
            )}
            <span className={['dropdown__chevron', isOpen ? 'dropdown__chevron--open' : ''].filter(Boolean).join(' ')}>
              <DropdownChevron />
            </span>
          </span>
        </button>

        {renderPanel()}

        {/* Border overlay */}
        <div
          aria-hidden="true"
          className={`dropdown__border dropdown__border--${borderState}`}
        />
      </div>

      {/* Below-field messages */}
      <div className="dropdown__below">
        {errorPhase !== 'hidden' && (
          <p className={[
            'dropdown__helper',
            'dropdown__helper--error',
            errorPhase === 'exiting' ? 'dropdown__helper--exiting' : 'dropdown__helper--entering',
          ].join(' ')}>
            {errorMessage}
          </p>
        )}
        {!isErr && helperText && (
          <p className="dropdown__helper dropdown__helper--neutral dropdown__helper--entering">
            {helperText}
          </p>
        )}
      </div>
    </div>
  )
}
