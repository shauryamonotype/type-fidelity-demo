import { useEffect, useId, useRef, useState } from 'react'
import { CloseIcon } from '../icons/CloseIcon'
import { Button } from '../index'
import './Modal.css'

// ─── Types ────────────────────────────────────────────────────────────────────

type Phase = 'hidden' | 'visible' | 'exiting'

const CARD_EXIT_MS    = 160
const OVERLAY_EXIT_MS = 200

// ─── ModalConfig ──────────────────────────────────────────────────────────────

export interface ModalConfig {
  id:                       string
  title?:                   string
  description?:             string
  /** CTA slot — pass your own buttons. When provided, overrides the built-in button props. */
  cta?:                     React.ReactNode
  confirmLabel?:            string
  onConfirm?:               () => void
  secondaryLabel?:          string
  onSecondary?:             () => void
  destructiveLabel?:        string
  onDestructive?:           () => void
  showDestructive?:         boolean
  imageSlot?:               React.ReactNode
  /** Optional content slot rendered between description and footer */
  additionalCapabilities?:  React.ReactNode
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ModalProps {
  onClose: () => void

  // ── Single-modal mode ──────────────────────────────────────────────────────
  isOpen?: boolean
  title?: string
  description?: string
  /** CTA slot — pass your own buttons. When provided, overrides the built-in button props. */
  cta?: React.ReactNode
  confirmLabel?: string
  onConfirm?: () => void
  secondaryLabel?: string
  onSecondary?: () => void
  destructiveLabel?: string
  onDestructive?: () => void
  showDestructive?: boolean
  imageSlot?: React.ReactNode
  /** Optional content slot rendered between description and footer */
  additionalCapabilities?: React.ReactNode
  className?: string

  // ── Stack mode ─────────────────────────────────────────────────────────────
  activeId?: string | null
  modals?: ModalConfig[]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function Modal({
  onClose,
  isOpen,
  title            = 'Leave without saving changes?',
  description      = "If you leave without saving, all changes you've made will be discarded.",
  cta,
  confirmLabel     = 'Save and exit',
  onConfirm,
  secondaryLabel   = 'Go back',
  onSecondary,
  destructiveLabel = 'Discard changes',
  onDestructive,
  showDestructive  = false,
  imageSlot,
  additionalCapabilities,
  className,
  activeId,
  modals,
}: ModalProps) {
  const uid     = useId()
  const titleId = `modal-title-${uid}`
  const descId  = `modal-desc-${uid}`

  const isStack = Array.isArray(modals)

  const initOpen = isStack ? !!activeId : !!isOpen
  const [overlayPhase, setOverlayPhase] = useState<Phase>(initOpen ? 'visible' : 'hidden')
  const [cardPhase,    setCardPhase]    = useState<Phase>(initOpen ? 'visible' : 'hidden')
  const [displayedId,  setDisplayedId]  = useState<string | null>(activeId ?? null)

  const overlayPhaseRef = useRef(overlayPhase)
  const cardPhaseRef    = useRef(cardPhase)
  const activeIdRef     = useRef(activeId)
  overlayPhaseRef.current = overlayPhase
  cardPhaseRef.current    = cardPhase
  activeIdRef.current     = activeId

  const cardTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const overlayTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Focus management ────────────────────────────────────────────────────────
  const cardRef     = useRef<HTMLDivElement>(null)
  const prevFocusRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (cardPhase === 'visible') {
      prevFocusRef.current = document.activeElement as HTMLElement
      cardRef.current?.focus()
    }
    if (cardPhase === 'hidden' && prevFocusRef.current) {
      prevFocusRef.current.focus()
      prevFocusRef.current = null
    }
  }, [cardPhase])

  // Focus trap — keeps Tab/Shift+Tab inside the modal card
  const handleCardKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab' || !cardRef.current) return
    const focusable = cardRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
    const items = Array.from(focusable)
    if (items.length === 0) return
    const first = items[0]
    const last  = items[items.length - 1]
    if (e.shiftKey) {
      if (document.activeElement === first) { e.preventDefault(); last.focus() }
    } else {
      if (document.activeElement === last)  { e.preventDefault(); first.focus() }
    }
  }

  // ── Open/close effects ──────────────────────────────────────────────────────

  const clearTimers = () => {
    if (cardTimer.current)    { clearTimeout(cardTimer.current);    cardTimer.current    = null }
    if (overlayTimer.current) { clearTimeout(overlayTimer.current); overlayTimer.current = null }
  }

  useEffect(() => {
    if (isStack) return
    if (isOpen) {
      clearTimers()
      setOverlayPhase('visible')
      setCardPhase('visible')
    } else {
      if (overlayPhaseRef.current === 'hidden') return
      clearTimers()
      setCardPhase('exiting')
      setOverlayPhase('exiting')
      overlayTimer.current = setTimeout(() => {
        setOverlayPhase('hidden')
        setCardPhase('hidden')
      }, OVERLAY_EXIT_MS)
    }
    return clearTimers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  useEffect(() => {
    if (!isStack) return
    if (activeId) {
      if (overlayPhaseRef.current === 'hidden') {
        clearTimers()
        setDisplayedId(activeId)
        setOverlayPhase('visible')
        setCardPhase('visible')
      } else if (activeId !== displayedId) {
        clearTimers()
        setCardPhase('exiting')
        cardTimer.current = setTimeout(() => {
          setDisplayedId(activeIdRef.current ?? null)
          setCardPhase('visible')
        }, CARD_EXIT_MS)
      }
    } else {
      if (overlayPhaseRef.current === 'hidden') return
      clearTimers()
      setCardPhase('exiting')
      setOverlayPhase('exiting')
      overlayTimer.current = setTimeout(() => {
        setOverlayPhase('hidden')
        setCardPhase('hidden')
        setDisplayedId(null)
      }, OVERLAY_EXIT_MS)
    }
    return clearTimers
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cardPhaseRef.current === 'visible') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  if (overlayPhase === 'hidden') return null

  const cfg = isStack
    ? (modals!.find(m => m.id === displayedId) ?? {} as ModalConfig)
    : null

  const resolvedTitle                  = cfg ? (cfg.title            ?? 'Leave without saving changes?')                                           : title
  const resolvedDescription            = cfg ? (cfg.description      ?? "If you leave without saving, all changes you've made will be discarded.") : description
  const resolvedCta                    = cfg ? cfg.cta                                                                                             : cta
  const resolvedConfirmLabel           = cfg ? (cfg.confirmLabel     ?? 'Save and exit')                                                           : confirmLabel
  const resolvedSecondaryLabel         = cfg ? (cfg.secondaryLabel   ?? 'Go back')                                                                 : secondaryLabel
  const resolvedDestructiveLabel       = cfg ? (cfg.destructiveLabel ?? 'Discard changes')                                                         : destructiveLabel
  const resolvedShowDestructive        = cfg ? (cfg.showDestructive  ?? false)                                                                     : showDestructive
  const resolvedImageSlot              = cfg ? cfg.imageSlot                                                                                       : imageSlot
  const resolvedAdditionalCapabilities = cfg ? cfg.additionalCapabilities                                                                          : additionalCapabilities
  const resolvedOnConfirm              = cfg ? cfg.onConfirm                                                                                       : onConfirm
  const resolvedOnSecondary            = cfg ? cfg.onSecondary                                                                                     : onSecondary
  const resolvedOnDestructive          = cfg ? cfg.onDestructive                                                                                   : onDestructive

  const handleOverlayMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className={`modal-overlay modal-overlay--${overlayPhase}`}
      onMouseDown={handleOverlayMouseDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      {cardPhase !== 'hidden' && (
        <div
          ref={cardRef}
          tabIndex={-1}
          className={['modal', `modal--${cardPhase}`, !isStack ? className : ''].filter(Boolean).join(' ')}
          onKeyDown={handleCardKeyDown}
        >

          <div className="modal__header">
            <div className="modal__text">
              <h2 id={titleId} className="modal__title modal__title--h6">{resolvedTitle}</h2>
              <p id={descId} className="modal__description">
                {resolvedDescription}
              </p>
            </div>
            {resolvedImageSlot && (
              <div className="modal__image" aria-hidden="true">
                {resolvedImageSlot}
              </div>
            )}
          </div>

          <button className="modal__close" onClick={onClose} aria-label="Close modal">
            <CloseIcon size={20} />
          </button>

          {resolvedAdditionalCapabilities && (
            <div className="modal__capabilities">
              {resolvedAdditionalCapabilities}
            </div>
          )}

          <div className="modal__footer">
            {resolvedCta ? (
              <div className="modal__actions">{resolvedCta}</div>
            ) : (
              <>
                {resolvedShowDestructive && (
                  <Button
                    color="Red"
                    size="Small"
                    type="Text"
                    buttonLabel={resolvedDestructiveLabel}
                    onClick={resolvedOnDestructive}
                  />
                )}
                <div className="modal__actions">
                  <Button
                    color="Light grey"
                    size="Medium"
                    type="Default"
                    buttonLabel={resolvedSecondaryLabel}
                    onClick={resolvedOnSecondary ?? onClose}
                  />
                  <Button
                    color="Blue"
                    size="Medium"
                    type="Default"
                    buttonLabel={resolvedConfirmLabel}
                    onClick={resolvedOnConfirm}
                  />
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
