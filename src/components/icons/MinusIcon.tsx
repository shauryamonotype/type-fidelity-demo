export type MinusIconStyle = 'Default' | 'Round' | 'Square'

export interface MinusIconProps {
  size?: 16 | 20 | 24
  style?: MinusIconStyle
  color?: string
  className?: string
}

export function MinusIcon({ size = 16, style = 'Default', color, className }: MinusIconProps) {
  const svgStyle = color ? { color } : undefined
  const inner = style !== 'Default'

  if (size === 16) {
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" style={svgStyle} className={className}>
        {style === 'Round'  && <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.1" />}
        {style === 'Square' && <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.1" />}
        <path d={inner ? 'M5 8H11' : 'M3 8H13'} stroke="currentColor" strokeWidth="1.1" />
      </svg>
    )
  }

  if (size === 20) {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" style={svgStyle} className={className}>
        {style === 'Round'  && <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.3" />}
        {style === 'Square' && <rect x="2.5" y="2.5" width="15" height="15" rx="2.5" stroke="currentColor" strokeWidth="1.3" />}
        <path d={inner ? 'M6.25 10H13.75' : 'M3.75 10H16.25'} stroke="currentColor" strokeWidth="1.3" />
      </svg>
    )
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" style={svgStyle} className={className}>
      {style === 'Round'  && <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />}
      {style === 'Square' && <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />}
      <path d={inner ? 'M7.5 12H16.5' : 'M4.5 12H19.5'} stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
