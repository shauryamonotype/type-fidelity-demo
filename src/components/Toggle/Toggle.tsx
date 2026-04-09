import React, { useState, useRef, useCallback, useEffect, useLayoutEffect } from 'react'
import './Toggle.css'
import '../Tooltip/Tooltip.css'

export interface ToggleProps {
  /** The toggle's value state — partial is system-controlled only */
  state:     'off' | 'on' | 'partial'
  /** Semantic colour channel. Permanent = blue, Temporary = yellow.
   *  Controlled by the parent — user clicks only emit 'off' | 'on'. */
  type?:     'permanent' | 'temporary'
  size?:     'Large' | 'Small'
  disabled?: boolean
  onChange?: (value: 'off' | 'on') => void
  className?: string
}

type TooltipPhase = 'hidden' | 'visible' | 'exiting'

export function Toggle({
  state,
  type      = 'permanent',
  size      = 'Large',
  disabled  = false,
  onChange,
  className,
}: ToggleProps) {
  // Knob nudge tracking
  const [hoveredHalf, setHoveredHalf] = useState<'left' | 'right' | null>(null)

  // Directional tooltip — shown only when hovering a half, not at rest
  const [tooltipPhase, setTooltipPhase] = useState<TooltipPhase>('hidden')
  const [tooltipHalf, setTooltipHalf]   = useState<'left' | 'right'>('left')

  const hoveredHalfRef = useRef<'left' | 'right' | null>(null)
  const tooltipEnter   = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipExit    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tooltipElRef   = useRef<HTMLDivElement>(null)
  const [tooltipAutoPos, setTooltipAutoPos] = useState<'Start' | 'Center' | 'End'>('Center')

  // Clear tooltip when leaving partial state
  useEffect(() => {
    if (state !== 'partial') {
      if (tooltipEnter.current) { clearTimeout(tooltipEnter.current); tooltipEnter.current = null }
      if (tooltipExit.current)  { clearTimeout(tooltipExit.current);  tooltipExit.current  = null }
      setTooltipPhase('hidden')
      hoveredHalfRef.current = null
      setHoveredHalf(null)
    }
  }, [state])

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (tooltipEnter.current) clearTimeout(tooltipEnter.current)
    if (tooltipExit.current)  clearTimeout(tooltipExit.current)
  }, [])

  // Auto-correct tooltip position if it overflows the viewport
  useLayoutEffect(() => {
    if (tooltipPhase !== 'visible' || !tooltipElRef.current) return
    const rect = tooltipElRef.current.getBoundingClientRect()
    const vw   = window.innerWidth
    if (rect.left < 8)          setTooltipAutoPos('Start')
    else if (rect.right > vw - 8) setTooltipAutoPos('End')
    else                          setTooltipAutoPos('Center')
  }, [tooltipPhase])

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || state !== 'partial') return
    const rect = e.currentTarget.getBoundingClientRect()
    const newHalf: 'left' | 'right' = e.clientX - rect.left < rect.width / 2 ? 'left' : 'right'

    if (newHalf === hoveredHalfRef.current) return

    const wasNull = hoveredHalfRef.current === null
    hoveredHalfRef.current = newHalf
    setHoveredHalf(newHalf)
    setTooltipHalf(newHalf) // update label instantly when switching halves

    if (wasNull) {
      // Entering from outside — start 600 ms enter delay
      if (tooltipExit.current) { clearTimeout(tooltipExit.current); tooltipExit.current = null }
      tooltipEnter.current = setTimeout(() => { setTooltipPhase('visible'); tooltipEnter.current = null }, 600)
    }
    // Switching halves: label already updated via setTooltipHalf, no re-animation
  }, [disabled, state])

  const handleMouseLeave = useCallback(() => {
    hoveredHalfRef.current = null
    setHoveredHalf(null)
    if (tooltipEnter.current) { clearTimeout(tooltipEnter.current); tooltipEnter.current = null }
    setTooltipPhase(prev => {
      if (prev === 'visible') {
        tooltipExit.current = setTimeout(() => { setTooltipPhase('hidden'); tooltipExit.current = null }, 150)
        return 'exiting'
      }
      return 'hidden'
    })
  }, [])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !onChange) return
    if (state === 'off') {
      onChange('on')
    } else if (state === 'on') {
      onChange('off')
    } else {
      // partial: click position determines direction
      const rect = e.currentTarget.getBoundingClientRect()
      onChange(e.clientX - rect.left < rect.width / 2 ? 'off' : 'on')
    }
  }, [state, disabled, onChange])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled || !onChange) return
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      if (state === 'on') {
        onChange('off')
      } else if (state === 'off') {
        onChange('on')
      } else {
        // partial: respect current hover half if known; default to 'on'
        onChange(hoveredHalfRef.current === 'left' ? 'off' : 'on')
      }
    }
  }, [state, disabled, onChange])

  // Compute the effective data-state (drives all CSS)
  const dataState =
    state === 'partial' && hoveredHalf
      ? `partial-${hoveredHalf}`
      : state

  const ariaChecked: boolean | 'mixed' =
    state === 'on'  ? true  :
    state === 'off' ? false :
    'mixed'

  const tooltipLabel = tooltipHalf === 'left' ? 'Turn off' : 'Turn on'

  return (
    <div className={`tooltip-host${className ? ` ${className}` : ''}`}>
      {state === 'partial' && tooltipPhase !== 'hidden' && (
        <div
          ref={tooltipElRef}
          className={`tooltip tooltip--${tooltipPhase}`}
          data-side="Top"
          data-position={tooltipAutoPos}
          data-size="Default"
          role="tooltip"
        >
          <div className="tooltip__inner">
            <span>{tooltipLabel}</span>
          </div>
          <div className="tooltip__arrow" aria-hidden="true" />
        </div>
      )}
      <button
        type="button"
        role="switch"
        aria-checked={ariaChecked}
        disabled={disabled}
        className="toggle"
        data-state={dataState}
        data-type={type}
        data-size={size}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <span className="toggle__line" aria-hidden="true" />
        <span className="toggle__pip"  aria-hidden="true" />
        <span className="toggle__knob" aria-hidden="true" />
      </button>
    </div>
  )
}
