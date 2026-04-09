import type { IconSize } from './CheckmarkIcon'

export interface SettingsIconProps {
  size?:      IconSize
  color?:     string
  className?: string
}

// Paths sourced directly from Figma — file tCOxDFXbrdNDN93nnQ2izE, node 773:292.
// Each size uses a nested <svg> to preserve the Figma viewBox exactly while
// fitting inside the DLS icon grid (16/20/24 px with 2px safe-area inset).
// strokeWidths match the DLS icon scale: 1.1 (16px) / 1.3 (20px) / 1.5 (24px).

const GEAR_16   = 'M8.42794 1.42617C8.63473 2.2461 9.47803 2.73314 10.2916 2.50247L11.1796 2.25068L12.6933 4.84932L12.0489 5.46633C11.4323 6.05675 11.4321 7.04201 12.0485 7.63269L12.6933 8.25068L11.1796 10.8493L10.292 10.5974C9.47831 10.3664 8.63469 10.8535 8.42791 11.6737L8.20697 12.55H5.17962L4.95829 11.6732C4.75131 10.8533 3.90775 10.3664 3.09422 10.5974L2.20697 10.8493L0.693295 8.25068L1.33808 7.63248C1.95412 7.04183 1.95391 6.05692 1.33762 5.46654L0.693295 4.84932L2.20697 2.25068L3.09505 2.50229C3.90831 2.73269 4.75124 2.24596 4.95824 1.42643L5.17962 0.55H8.20697L8.42794 1.42617Z'
const GEAR_20   = 'M11.1322 1.81823C11.4079 2.91147 12.5323 3.56085 13.617 3.2533L14.8011 2.91758L16.8193 6.38242L15.9602 7.2051C15.1381 7.99233 15.1378 9.30601 15.9596 10.0936L16.8193 10.9176L14.8011 14.3824L13.6176 14.0465C12.5327 13.7386 11.4079 14.388 11.1322 15.4815L10.8376 16.65H6.80112L6.50601 15.481C6.23003 14.3877 5.10529 13.7386 4.02058 14.0465L2.83758 14.3824L0.819348 10.9176L1.67907 10.0933C2.50045 9.30578 2.50017 7.99256 1.67844 7.20539L0.819348 6.38242L2.83758 2.91758L4.02168 3.25305C5.10603 3.56025 6.22994 2.91128 6.50595 1.81858L6.80112 0.65H10.8376L11.1322 1.81823Z'
const GEAR_24   = 'M13.9415 2.29362C14.2862 3.66017 15.6917 4.47189 17.0476 4.08746L18.5277 3.66781L21.0504 7.99886L19.9765 9.02721C18.9488 10.0112 18.9485 11.6533 19.9757 12.6378L21.0504 13.6678L18.5277 17.9989L17.0482 17.5789C15.6921 17.194 14.2861 18.0058 13.9415 19.3728L13.5732 20.8333H8.52766L8.15878 19.3721C7.8138 18.0054 6.40788 17.194 5.05199 17.579L3.57324 17.9989L1.05045 13.6678L2.12509 12.6375C3.15183 11.6531 3.15147 10.0115 2.12432 9.02757L1.05045 7.99886L3.57324 3.66781L5.05337 4.08714C6.4088 4.47115 7.81368 3.65994 8.15869 2.29406L8.52766 0.833333H13.5732L13.9415 2.29362Z'

export function SettingsIcon({ size = 16, color, className }: SettingsIconProps) {
  const style = color ? { color } : undefined

  if (size === 16) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
           xmlns="http://www.w3.org/2000/svg" style={style} className={className} aria-hidden="true">
        {/* 12×12 icon content at 2px inset; viewBox matches the Figma artboard */}
        <svg x="2" y="2" width="12" height="12" viewBox="0 0 13.3866 13.1" overflow="visible">
          <path d={GEAR_16} stroke="currentColor" strokeWidth="1.1" />
          <circle cx="6.69329" cy="6.55" r="2" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      </svg>
    )
  }

  if (size === 20) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
           xmlns="http://www.w3.org/2000/svg" style={style} className={className} aria-hidden="true">
        {/* Gear body: 16×16 at (2,2) */}
        <svg x="2" y="2" width="16" height="16" viewBox="0 0 17.6388 17.3" overflow="visible">
          <path d={GEAR_20} stroke="currentColor" strokeWidth="1.3" />
        </svg>
        {/* Centre hole: 6×6 at (7,7) */}
        <svg x="7" y="7" width="6" height="6" viewBox="0 0 7.3 7.3" overflow="visible">
          <circle cx="3.65" cy="3.65" r="3" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      </svg>
    )
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
         xmlns="http://www.w3.org/2000/svg" style={style} className={className} aria-hidden="true">
      {/* 20×20 icon content at 2px inset */}
      <svg x="2" y="2" width="20" height="20" viewBox="0 0 22.101 21.6667" overflow="visible">
        <path d={GEAR_24} stroke="currentColor" strokeWidth="1.5" />
        <circle cx="11.0504" cy="10.8333" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </svg>
  )
}
