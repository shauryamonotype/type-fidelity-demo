import { useRef, useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import './SearchBox.css'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AnimatedChar {
  char:      string
  id:        number
  isNew:     boolean
  isExiting: boolean
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface SearchBoxProps {
  /** Called when the user presses Enter with a non-empty value */
  onSearch?: (value: string) => void
  /** Input placeholder — defaults to "Search" */
  placeholder?: string
  /** Controlled value. If omitted the component manages its own state */
  value?: string
  /** Called on every keystroke when used in controlled mode */
  onChange?: (value: string) => void
  /** Disables all interaction */
  disabled?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SearchBox({ onSearch, placeholder = 'Search', value: controlledValue, onChange, disabled = false }: SearchBoxProps) {
  const isControlled = controlledValue !== undefined
  const [internalValue, setInternalValue] = useState('')
  const value = isControlled ? controlledValue : internalValue

  const [expanded, setExpanded] = useState(false)
  const [animatedChars, setAnimatedChars] = useState<AnimatedChar[]>([])

  const inputRef       = useRef<HTMLInputElement>(null)
  const overlayRef     = useRef<HTMLDivElement>(null)
  const charIdCounter  = useRef(0)
  const prevValueRef   = useRef('')

  const hasValue = value.length > 0

  const setValue = (v: string) => {
    if (!isControlled) setInternalValue(v)
    onChange?.(v)
  }

  const handleOpen = () => {
    setExpanded(true)
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const handleClose = () => {
    setValue('')
    setExpanded(false)
    inputRef.current?.blur()
  }

  const handleBlur = () => {
    if (!value) setExpanded(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') { handleClose(); return }
    if (e.key === 'Enter' && value.trim()) onSearch?.(value.trim())
  }

  // ── Sync animated chars with current value ──────────────────────────────────
  useEffect(() => {
    const prevVal    = prevValueRef.current
    const isDeleting = value.length < prevVal.length
    prevValueRef.current = value

    setAnimatedChars((prev) => {
      if (isDeleting) {
        const next: AnimatedChar[] = []
        for (let i = 0; i < value.length; i++) {
          if (i < prev.length && prev[i].char === value[i] && !prev[i].isExiting) {
            next.push({ ...prev[i], isNew: false, isExiting: false })
          } else {
            charIdCounter.current += 1
            next.push({ char: value[i], id: charIdCounter.current, isNew: false, isExiting: false })
          }
        }
        for (let i = value.length; i < prev.length; i++) {
          if (!prev[i].isExiting) next.push({ ...prev[i], isExiting: true })
        }
        return next
      }

      const next:        AnimatedChar[] = []
      const activeChars = prev.filter((c) => !c.isExiting)
      for (let i = 0; i < value.length; i++) {
        if (i < activeChars.length && activeChars[i].char === value[i]) {
          next.push({ ...activeChars[i], isNew: false, isExiting: false })
        } else {
          charIdCounter.current += 1
          next.push({ char: value[i], id: charIdCounter.current, isNew: true, isExiting: false })
        }
      }
      return next
    })
  }, [value])

  // ── Clean up enter/exit flags after animation frame ─────────────────────────
  useEffect(() => {
    const hasNew     = animatedChars.some((c) => c.isNew)
    const hasExiting = animatedChars.some((c) => c.isExiting)
    if (!hasNew && !hasExiting) return
    const t = setTimeout(() => {
      setAnimatedChars((prev) =>
        prev.filter((c) => !c.isExiting).map((c) => ({ ...c, isNew: false }))
      )
    }, 60)
    return () => clearTimeout(t)
  }, [animatedChars])

  // ── Keep overlay scroll synced with the native input ────────────────────────
  useEffect(() => {
    const input   = inputRef.current
    const overlay = overlayRef.current
    if (!input || !overlay) return
    const sync = () => { overlay.scrollLeft = input.scrollLeft }
    input.addEventListener('scroll', sync)
    sync()
    return () => input.removeEventListener('scroll', sync)
  }, [value])

  return (
    <div className={`sb${expanded ? ' sb--expanded' : ''}${disabled ? ' sb--disabled' : ''}`}>

      {/* ── Collapsed trigger ──────────────────────────────────────────── */}
      <button
        className="sb__trigger"
        onClick={handleOpen}
        tabIndex={expanded ? -1 : 0}
        aria-label="Open search"
        aria-expanded={expanded}
      >
        <Search size={24} strokeWidth={1.5} />
      </button>

      {/* ── Expanded field ─────────────────────────────────────────────── */}
      <div className="sb__field" aria-hidden={!expanded}>

        {/* Text area — native input + animated char overlay */}
        <div className="sb__text-area">
          <input
            ref={inputRef}
            className={`sb__input${expanded && hasValue ? ' sb__input--has-value' : ''}`}
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            tabIndex={expanded ? 0 : -1}
            aria-label="Search"
          />

          {/* Animated character overlay — shown while field has a value */}
          {expanded && hasValue && (
            <div ref={overlayRef} aria-hidden="true" className="sb__overlay">
              {animatedChars.map((c) => (
                <span
                  key={c.id}
                  className="sb__char"
                  data-exiting={c.isExiting || undefined}
                  data-new={c.isNew || undefined}
                >
                  {c.char === ' ' ? '\u00A0' : c.char}
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          className="sb__clear"
          onClick={handleClose}
          tabIndex={expanded ? 0 : -1}
          aria-label="Clear search"
        >
          <X size={24} strokeWidth={1.5} />
        </button>
      </div>

    </div>
  )
}
