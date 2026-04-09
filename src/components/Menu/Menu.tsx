import { createPortal } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { Typography } from '../Typography/Typography'
import { MenuItem } from '../MenuItem/MenuItem'
import './Menu.css'

// ─── Internal types ────────────────────────────────────────────────────────────

interface SlideHighlight {
  top:     number
  height:  number
  opacity: number
}

interface SubMenuState {
  sections: MenuSectionDef[]
  x:        number   // fixed-position x of sub-menu wrapper
  y:        number   // fixed-position y of sub-menu wrapper (first-item aligned)
}

// ─── Public types ──────────────────────────────────────────────────────────────

type Phase = 'hidden' | 'visible' | 'exiting'

export type MenuItemVariant = 'default' | 'danger' | 'disabled'

export interface MenuItemDef {
  /** Display label */
  label: string
  /** Left icon — any React node (e.g. lucide icon at size 16, strokeWidth 1.5) */
  icon?: React.ReactNode
  /** Whether to show the left icon slot at all */
  showIcon?: boolean
  /** Visual variant. Default: 'default' */
  variant?: MenuItemVariant
  /** Show right-pointing chevron. Set automatically if subMenu is provided. */
  showChevron?: boolean
  /** Keyboard shortcut hint shown on the right (e.g. '⌘K') */
  shortcut?: string
  /** Whether the item is in a selected/active state (blue fill + medium label) */
  selected?: boolean
  /**
   * Multi-select checkbox state. When set, renders an animated checkbox visual
   * and suppresses the chevron. Use for multi-select menus and Dropdowns.
   */
  checked?: boolean | 'indeterminate'
  /** Click handler — does not fire when variant is 'disabled' */
  onClick?: () => void
  /** Nested sections shown as a sub-menu when the item is hovered */
  subMenu?: MenuSectionDef[]
}

export interface MenuSectionDef {
  /** Optional section header label */
  title?: string
  items: MenuItemDef[]
}

export interface MenuProps {
  sections: MenuSectionDef[]
  /**
   * Controls open/close with entrance and exit animations.
   * Keep the Menu mounted and toggle this prop for exit animations.
   * Default: true (useful for conditional rendering without exit animation).
   */
  isOpen?: boolean
  /** Called when a menu item is clicked (after that item's onClick fires) */
  onClose?: () => void
  /** Extra class forwarded to the menu container */
  className?: string
  /** Inline styles forwarded to the menu container — use for fixed positioning */
  style?: React.CSSProperties
  /**
   * Maximum height (px) of the scrollable menu body.
   * When content overflows, a gradient fade appears at the bottom.
   */
  maxHeight?: number
}

// ─── MenuSection ──────────────────────────────────────────────────────────────

export function MenuSection({
  title,
  items,
  onClose,
  onItemMouseEnter,
}: MenuSectionDef & {
  onClose?:          () => void
  onItemMouseEnter?: (item: MenuItemDef, e: React.MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className="menu__section" role="group" aria-label={title}>
      {title && (
        <Typography variant="b2" weight="medium" as="div" className="menu__section-title">
          {title}
        </Typography>
      )}
      <div className="menu__section-items">
        {items.map((item, i) => (
          <MenuItem
            key={i}
            label={item.label}
            icon={item.icon}
            showIcon={item.showIcon}
            variant={item.variant}
            shortcut={item.shortcut}
            selected={item.selected}
            checked={item.checked}
            showChevron={item.showChevron ?? !!(item.subMenu?.length)}
            role="menuitem"
            // Only close the menu for leaf items — sub-menu openers keep it open
            onClose={item.subMenu?.length ? undefined : onClose}
            onMouseEnter={onItemMouseEnter ? (e) => onItemMouseEnter(item, e) : undefined}
            onClick={item.onClick}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Menu ─────────────────────────────────────────────────────────────────────

export function Menu({
  sections,
  isOpen = true,
  onClose,
  className,
  style,
  maxHeight,
}: MenuProps) {
  const [phase, setPhase]     = useState<Phase>(isOpen ? 'visible' : 'hidden')
  const [slideHL, setSlideHL] = useState<SlideHighlight>({ top: 0, height: 0, opacity: 0 })
  const [subMenu, setSubMenu] = useState<SubMenuState | null>(null)
  const [showFade, setShowFade] = useState(false)

  const exitTimer    = useRef<ReturnType<typeof setTimeout> | null>(null)
  const subMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const menuRef      = useRef<HTMLDivElement>(null)
  const scrollRef    = useRef<HTMLDivElement>(null)
  const phaseRef     = useRef(phase)
  phaseRef.current   = phase

  useEffect(() => {
    if (isOpen) {
      if (exitTimer.current) clearTimeout(exitTimer.current)
      setPhase('visible')
    } else {
      if (phaseRef.current === 'hidden') return
      setSlideHL(h => ({ ...h, opacity: 0 }))
      setSubMenu(null)
      setPhase('exiting')
      exitTimer.current = setTimeout(() => setPhase('hidden'), 120)
    }
    return () => { if (exitTimer.current) clearTimeout(exitTimer.current) }
  }, [isOpen])

  // Cleanup sub-menu timer on unmount
  useEffect(() => () => {
    if (subMenuTimer.current) clearTimeout(subMenuTimer.current)
  }, [])

  // Show fade when content overflows maxHeight
  useEffect(() => {
    if (!maxHeight || !scrollRef.current) {
      setShowFade(false)
      return
    }
    const el = scrollRef.current
    setShowFade(el.scrollHeight > el.clientHeight)
  }, [maxHeight, sections, phase])

  if (phase === 'hidden') return null

  // ── Slide highlight ─────────────────────────────────────────────────────────

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const item = (e.target as HTMLElement).closest<HTMLElement>('.menu-item:not(:disabled)')
    if (!item || !menuRef.current) return
    const wrapperTop = menuRef.current.getBoundingClientRect().top
    const itemRect   = item.getBoundingClientRect()
    setSlideHL({ top: itemRect.top - wrapperTop, height: itemRect.height, opacity: 1 })
  }

  const handleMouseLeave = () => {
    setSlideHL(h => ({ ...h, opacity: 0 }))
    // Start sub-menu close countdown when leaving the parent menu
    if (subMenu) {
      if (subMenuTimer.current) clearTimeout(subMenuTimer.current)
      subMenuTimer.current = setTimeout(() => setSubMenu(null), 150)
    }
  }

  const handleMouseEnterContainer = () => {
    // Cancel close timer when mouse re-enters parent after briefly visiting sub-menu
    if (subMenuTimer.current) clearTimeout(subMenuTimer.current)
  }

  // ── Scroll fade ─────────────────────────────────────────────────────────────

  const handleBodyScroll = () => {
    if (!scrollRef.current) return
    const el = scrollRef.current
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 2
    setShowFade(!atBottom)
  }

  // ── Sub-menu hover ──────────────────────────────────────────────────────────

  const handleItemMouseEnter = (item: MenuItemDef, e: React.MouseEvent<HTMLButtonElement>) => {
    if (subMenuTimer.current) clearTimeout(subMenuTimer.current)

    if (item.subMenu?.length) {
      const itemEl   = e.currentTarget
      const itemRect = itemEl.getBoundingClientRect()
      const menuRect = menuRef.current!.getBoundingClientRect()

      // Vertical: align the first menu-item of the sub-menu with the hovered item.
      // Offset = menu-padding-top (8px) + section-title height+gap (24+4px) if title exists.
      const firstSection    = item.subMenu[0]
      const hasTitle        = !!firstSection?.title
      const firstItemOffset = hasTitle ? 36 : 8
      let y = itemRect.top - firstItemOffset

      // Clamp to viewport bottom (rough height estimate)
      const estHeight = item.subMenu.reduce((acc, s) => {
        if (s.title) acc += 28    // title row
        acc += s.items.length * 42  // item rows
        acc += 16                 // section padding-bottom
        return acc
      }, 8)
      y = Math.min(y, window.innerHeight - estHeight - 8)
      y = Math.max(8, y)

      // Horizontal: prefer right side, flip left if it would overflow
      const menuWidth = 240
      const x = (menuRect.right + 4 + menuWidth > window.innerWidth - 8)
        ? menuRect.left - menuWidth - 4
        : menuRect.right + 4

      setSubMenu({ sections: item.subMenu, x, y })
    } else {
      // Non-chevron item — close any open sub-menu after a short delay
      subMenuTimer.current = setTimeout(() => setSubMenu(null), 100)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <div
        ref={menuRef}
        className={['menu', `menu--${phase}`, className].filter(Boolean).join(' ')}
        role="menu"
        style={style}
        onMouseOver={handleMouseOver}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnterContainer}
      >
        <div
          className="menu__slide-highlight"
          style={{ top: slideHL.top, height: slideHL.height, opacity: slideHL.opacity }}
          aria-hidden="true"
        />

        <div
          ref={scrollRef}
          className="menu__body"
          style={maxHeight ? { maxHeight, overflowY: 'auto' } : undefined}
          onScroll={maxHeight ? handleBodyScroll : undefined}
        >
          {sections.map((section, i) => (
            <MenuSection
              key={i}
              {...section}
              onClose={onClose}
              onItemMouseEnter={handleItemMouseEnter}
            />
          ))}
        </div>

        {maxHeight && showFade && (
          <div className="menu__scroll-fade" aria-hidden="true" />
        )}
      </div>

      {/* Sub-menu — portalled to document.body to escape overflow:hidden */}
      {subMenu && createPortal(
        <div
          style={{ position: 'fixed', left: subMenu.x, top: subMenu.y, zIndex: 200 }}
          onMouseEnter={() => {
            if (subMenuTimer.current) clearTimeout(subMenuTimer.current)
          }}
          onMouseLeave={() => {
            if (subMenuTimer.current) clearTimeout(subMenuTimer.current)
            subMenuTimer.current = setTimeout(() => setSubMenu(null), 150)
          }}
        >
          <Menu
            sections={subMenu.sections}
            isOpen={true}
            onClose={onClose}
          />
        </div>,
        document.body
      )}
    </>
  )
}
