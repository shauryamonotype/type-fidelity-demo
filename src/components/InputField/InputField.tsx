// @ts-nocheck
import { useState, useRef, useEffect } from 'react'
import { X } from 'lucide-react'
import './InputField.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'hidden' | 'visible' | 'exiting'

interface AnimatedChar {
  char:      string
  id:        number
  isNew:     boolean
  isExiting: boolean
}

export interface InputFieldProps {
  /** Label text displayed above the input */
  label?:        string
  /** Shows the mandatory red asterisk */
  required?:     boolean
  /** Placeholder / hint text inside the field */
  placeholder?:  string
  /** Controlled value */
  value?:        string
  onChange?:     (value: string) => void
  onSubmit?:     () => void
  onBlur?:       () => void
  onFocus?:      () => void
  /** Switches the field to its error styling */
  error?:        boolean
  /** Message shown below the field when error is true */
  errorMessage?: string
  /** Neutral helper text shown below the field when there is no error */
  helperText?:   string
  /** Field height — Large (48 px) or Medium (40 px) */
  size?:         'Large' | 'Medium'
  /** Disables interaction and shows a muted style */
  disabled?:     boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type BorderState =
  | 'default'
  | 'hovered'
  | 'focused'
  | 'focused-hovered'
  | 'error'               // idle (no hover, no focus): soft pink, no ring
  | 'error-hover-large'   // Large hover, not focused: full red, no ring
  | 'error-hover-medium'  // Medium hover, not focused: full red, no ring
  | 'error-focused'       // focused, not hovered: full red + 2 px ring
  | 'error-hovered'       // focused + hovered: full red + 4 px ring
  | 'disabled'

function getBorderState(opts: {
  error:    boolean
  disabled: boolean
  focused:  boolean
  hovered:  boolean
  size:     'Large' | 'Medium'
}): BorderState {
  const { error, disabled, focused, hovered, size } = opts
  if (disabled)                    return 'disabled'
  if (error && focused && hovered) return 'error-hovered'                                   // 4 px red ring
  if (error && focused)            return 'error-focused'                                   // 2 px red ring
  if (error && hovered)            return size === 'Large' ? 'error-hover-large'            // full red, no ring
                                                           : 'error-hover-medium'           // full red, no ring
  if (error)                       return 'error'                                           // soft pink, no ring
  if (focused && hovered)          return 'focused-hovered'
  if (focused)                     return 'focused'
  if (hovered)                     return 'hovered'
  return 'default'
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InputField({
  label        = 'Label',
  required     = true,
  placeholder  = 'Input text',
  value:         controlledValue,
  onChange,
  onSubmit,
  onBlur,
  onFocus,
  error        = false,
  errorMessage = 'This field is required',
  helperText,
  size         = 'Large',
  disabled     = false,
}: InputFieldProps) {
  const [internalValue, setInternalValue] = useState('')
  const [isFocused,     setIsFocused]     = useState(false)
  const [isHovered,     setIsHovered]     = useState(false)
  const [animatedChars, setAnimatedChars] = useState<AnimatedChar[]>([])
  const [helperPhase,   setHelperPhase]   = useState<Phase>(() => (error && !disabled) ? 'visible' : 'hidden')
  const [clearPhase,    setClearPhase]    = useState<Phase>('hidden')

  const charIdCounter  = useRef(0)
  const inputRef       = useRef<HTMLInputElement>(null)
  const overlayRef     = useRef<HTMLDivElement>(null)
  const prevValueRef   = useRef('')
  const helperTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const clearTimerRef  = useRef<ReturnType<typeof setTimeout>>()

  const value    = controlledValue !== undefined ? controlledValue : internalValue
  const hasValue = value.length > 0

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

  // ── Animate helper text in/out when error state changes ─────────────────────
  useEffect(() => {
    clearTimeout(helperTimerRef.current)
    const isErr = error && !disabled
    if (isErr) {
      setHelperPhase('visible')
    } else {
      setHelperPhase(p => p !== 'hidden' ? 'exiting' : 'hidden')
      helperTimerRef.current = setTimeout(() => setHelperPhase('hidden'), 200)
    }
    return () => clearTimeout(helperTimerRef.current)
  }, [error, disabled])

  // ── Animate clear button in/out when field gains/loses value or focus ────────
  useEffect(() => {
    clearTimeout(clearTimerRef.current)
    if (hasValue && isFocused) {
      setClearPhase('visible')
    } else {
      setClearPhase(p => p !== 'hidden' ? 'exiting' : 'hidden')
      clearTimerRef.current = setTimeout(() => setClearPhase('hidden'), 180)
    }
    return () => clearTimeout(clearTimerRef.current)
  }, [hasValue, isFocused])

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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    if (onChange) onChange(v)
    else          setInternalValue(v)
  }

  const handleClear = () => {
    if (onChange) onChange('')
    else          setInternalValue('')
    inputRef.current?.focus()
  }

  // ── Derived state ─────────────────────────────────────────────────────────────
  const borderState = getBorderState({ error, disabled, focused: isFocused, hovered: isHovered, size })
  const isError     = error && !disabled

  const wrapperMods  = [
    'input-field__wrapper',
    `input-field__wrapper--${size.toLowerCase()}`,
    disabled ? 'input-field__wrapper--disabled' : '',
  ].filter(Boolean).join(' ')

  const charMod = isError ? 'input-field__char--error' : ''

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="input-field">

      {/* Label */}
      <label className={`input-field__label${isError ? ' input-field__label--error' : ''}`}>
        <span>{label}</span>
        {required && <span className="input-field__required">*</span>}
      </label>

      {/* Input wrapper */}
      <div
        className={wrapperMods}
        onMouseEnter={() => !disabled && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="input-field__inner">
          <div className="input-field__content">

            {/* Text area — native input + animated char overlay */}
            <div className="input-field__text-area">
              <input
                ref={inputRef}
                type="text"
                value={value}
                disabled={disabled}
                onChange={handleChange}
                onFocus={() => { if (!disabled) { setIsFocused(true);  onFocus?.() } }}
                onBlur={()  => { setIsFocused(false); onBlur?.()  }}
                placeholder={placeholder}
                className={[
                  'input-field__input',
                  `input-field__input--${size.toLowerCase()}`,
                  isError    ? 'input-field__input--error'    : '',
                  disabled   ? 'input-field__input--disabled' : '',
                ].filter(Boolean).join(' ')}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'a') e.currentTarget.select()
                  if (e.key === 'Enter' && onSubmit) { e.preventDefault(); onSubmit() }
                }}
              />

              {/* Animated character overlay — shown while field has a value */}
              {hasValue && (
                <div
                  ref={overlayRef}
                  aria-hidden="true"
                  className={`input-field__overlay input-field__overlay--${size.toLowerCase()}`}
                >
                  {animatedChars.map((c) => (
                    <span
                      key={c.id}
                      className={['input-field__char', charMod].filter(Boolean).join(' ')}
                      data-exiting={c.isExiting || undefined}
                      data-new={c.isNew || undefined}
                    >
                      {c.char === ' ' ? '\u00A0' : c.char}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Clear button */}
            {!disabled && clearPhase !== 'hidden' && (
              <div className="input-field__actions">
                <button
                  type="button"
                  tabIndex={-1}
                  onMouseDown={(e) => { e.preventDefault(); handleClear() }}
                  className={`input-field__clear input-field__clear--${clearPhase === 'exiting' ? 'exiting' : 'visible'}`}
                  aria-label="Clear input"
                >
                  <X size={14} strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* State-driven border overlay */}
        <div
          aria-hidden="true"
          className={`input-field__border input-field__border--${borderState}`}
        />
      </div>

      {/* Below-field messages */}
      <div className="input-field__below">
        {/* Error message — mounts/unmounts with slide-down/up animation */}
        {helperPhase !== 'hidden' && (
          <p className={[
            'input-field__helper',
            'input-field__helper--error',
            helperPhase === 'exiting' ? 'input-field__helper--exiting' : 'input-field__helper--entering',
          ].join(' ')}>
            {errorMessage}
          </p>
        )}

        {/* Neutral helper text — only rendered when no error */}
        {!isError && helperText && (
          <p className="input-field__helper input-field__helper--neutral input-field__helper--entering">
            {helperText}
          </p>
        )}
      </div>

    </div>
  )
}
