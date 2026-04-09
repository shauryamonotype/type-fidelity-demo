import React, { useState, useRef, useCallback, useLayoutEffect, useEffect } from 'react'
import './Tooltip.css'

export interface TooltipProps {
  // ── Always present ───────────────────────────────────────────
  children:   React.ReactNode
  delay?:     number                                // default 600 ms
  className?: string

  // ── Placement ────────────────────────────────────────────────
  side?:      'Top' | 'Bottom' | 'Left' | 'Right'  // default 'Top'
  /** When omitted the tooltip auto-detects position from the trigger's
   *  viewport location so the arrow always points back at the trigger. */
  position?:  'Start' | 'Center' | 'End'
  size?:      'Default' | 'Expanded'                // default 'Default'

  // ── Default size (compact pill) ──────────────────────────────
  label?:     string
  icon?:      React.ReactNode
  showIcon?:  boolean                               // default false

  // ── Expanded size (rich card) ────────────────────────────────
  title?:                string
  showTitle?:            boolean                    // default true
  titleIcon?:            React.ReactNode
  showTitleIcon?:        boolean                    // default true
  description?:          string
  descriptionIcon?:      React.ReactNode
  showDescriptionIcon?:  boolean                    // default true
  image?:                string                     // image URL
  showImage?:            boolean                    // default true
}

type Phase    = 'hidden' | 'visible' | 'exiting'
type Position = 'Start' | 'Center' | 'End'

const EDGE_MARGIN = 8 // px clearance from viewport edge

export function Tooltip({
  children,
  delay               = 600,
  className,
  side                = 'Top',
  position,                       // intentionally no default — auto-detected when omitted
  size                = 'Default',
  label               = '',
  icon,
  showIcon            = false,
  title,
  showTitle           = true,
  titleIcon,
  showTitleIcon       = true,
  description,
  descriptionIcon,
  showDescriptionIcon = true,
  image,
  showImage           = true,
}: TooltipProps) {
  const [phase, setPhase]                     = useState<Phase>('hidden')
  const [autoPosition, setAutoPosition]       = useState<Position>('Center')
  const hostRef    = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const enterTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const exitTimer  = useRef<ReturnType<typeof setTimeout> | null>(null)

  // After the tooltip renders, measure whether it overflows the viewport and
  // correct the position — same approach as context menus. Runs before paint
  // via useLayoutEffect so there is no visible flicker.
  useLayoutEffect(() => {
    if (phase !== 'visible' || position !== undefined) return
    const el = tooltipRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight
    if (side === 'Top' || side === 'Bottom') {
      if (rect.left < EDGE_MARGIN) setAutoPosition('Start')
      else if (rect.right > vw - EDGE_MARGIN) setAutoPosition('End')
      else setAutoPosition('Center')
    } else {
      if (rect.top < EDGE_MARGIN) setAutoPosition('Start')
      else if (rect.bottom > vh - EDGE_MARGIN) setAutoPosition('End')
      else setAutoPosition('Center')
    }
  }, [phase, position, side])

  // Cleanup timers on unmount
  useEffect(() => () => {
    if (enterTimer.current) clearTimeout(enterTimer.current)
    if (exitTimer.current)  clearTimeout(exitTimer.current)
  }, [])

  const show = useCallback(() => {
    if (exitTimer.current) { clearTimeout(exitTimer.current); exitTimer.current = null }
    // Reset to Center before showing — the useLayoutEffect above will correct
    // it after the tooltip renders if it genuinely overflows the viewport.
    if (position === undefined) setAutoPosition('Center')
    enterTimer.current = setTimeout(() => { setPhase('visible'); enterTimer.current = null }, delay)
  }, [delay, position])

  const hide = useCallback(() => {
    if (enterTimer.current) { clearTimeout(enterTimer.current); enterTimer.current = null }
    setPhase(prev => {
      if (prev === 'visible') {
        exitTimer.current = setTimeout(() => { setPhase('hidden'); exitTimer.current = null }, 150)
        return 'exiting'
      }
      return 'hidden'
    })
  }, [])

  // Resolved position: explicit prop takes precedence, otherwise auto-detected
  const resolvedPosition: Position = position ?? autoPosition

  // Arrow appears before the body for Bottom/Right (renders above or left of body)
  const arrowFirst = side === 'Bottom' || side === 'Right'

  const arrow = <div className="tooltip__arrow" aria-hidden="true" />

  return (
    <div
      ref={hostRef}
      className={`tooltip-host${className ? ` ${className}` : ''}`}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      {phase !== 'hidden' && (
        <div
          ref={tooltipRef}
          className={`tooltip tooltip--${phase}`}
          data-side={side}
          data-position={resolvedPosition}
          data-size={size}
          role="tooltip"
        >
          {arrowFirst && arrow}

          <div className="tooltip__inner">
            {size === 'Default' && (
              <>
                {showIcon && icon && (
                  <span className="tooltip__icon">{icon}</span>
                )}
                <span>{label}</span>
              </>
            )}

            {size === 'Expanded' && (
              <>
                {showTitle && title && (
                  <div className="tooltip__title">
                    {showTitleIcon && titleIcon && (
                      <span className="tooltip__title-icon">{titleIcon}</span>
                    )}
                    <span>{title}</span>
                  </div>
                )}
                {showImage && image && (
                  <img className="tooltip__image" src={image} alt="" />
                )}
                {description && (
                  <div className="tooltip__description">
                    {showDescriptionIcon && descriptionIcon && (
                      <span className="tooltip__desc-icon">{descriptionIcon}</span>
                    )}
                    <p>{description}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {!arrowFirst && arrow}
        </div>
      )}
      {children}
    </div>
  )
}
