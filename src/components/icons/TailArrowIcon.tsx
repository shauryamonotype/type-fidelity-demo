import React from 'react'
import type { IconSize } from './CheckmarkIcon'

export type ArrowDirection = 'Right' | 'Left' | 'Up' | 'Down'

export interface TailArrowIconProps {
  size?: IconSize
  direction?: ArrowDirection
  color?: string
  className?: string
}

// Right-pointing arrow paths for each size.
// All directions are achieved by rotating around the icon's center.
const variants = {
  16: {
    // Natural path bounds: 10.6566 × 7.6566 → centered in 16×16
    tx: 8 - 10.6566 / 2,   // 2.6717
    ty: 8 - 7.6566  / 2,   // 4.1717
    shaft:     { d: 'M10 3.8283L0 3.8283',            strokeWidth: 1.1      },
    arrowhead: { d: 'M6.5 0.3283L10 3.8283L6.5 7.3283', strokeWidth: 0.928571 },
  },
  20: {
    // Natural path bounds: 14.9192 × 9.9192 → centered in 20×20
    tx: 10 - 14.9192 / 2,  // 2.5404
    ty: 10 - 9.9192  / 2,  // 5.0404
    shaft:     { d: 'M14 4.95962H0',                       strokeWidth: 1.3 },
    arrowhead: { d: 'M9.5 0.459619L14 4.95962L9.5 9.45962', strokeWidth: 1.3 },
  },
  24: {
    // Natural path bounds: 19.0607 × 12.0607 → centered in 24×24
    tx: 12 - 19.0607 / 2,  // 2.4697
    ty: 12 - 12.0607 / 2,  // 5.9697
    shaft:     { d: 'M18 6.03031L0 6.03031',              strokeWidth: 1.5 },
    arrowhead: { d: 'M12.5 0.53033L18 6.03033L12.5 11.5303', strokeWidth: 1.5 },
  },
} as const

const rotationDeg: Record<ArrowDirection, number> = {
  Right:   0,
  Down:   90,
  Left:  180,
  Up:   -90,
}

export function TailArrowIcon({
  size = 16,
  direction = 'Right',
  color,
  className,
}: TailArrowIconProps) {
  const { tx, ty, shaft, arrowhead } = variants[size]
  const cx = size / 2
  const rotate = rotationDeg[direction]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={color ? { color } : undefined}
      className={className}
      aria-hidden="true"
    >
      <g transform={`rotate(${rotate}, ${cx}, ${cx}) translate(${tx}, ${ty})`}>
        <path
          d={shaft.d}
          stroke="currentColor"
          strokeWidth={shaft.strokeWidth}
          strokeMiterlimit="10"
        />
        <path
          d={arrowhead.d}
          stroke="currentColor"
          strokeWidth={arrowhead.strokeWidth}
          strokeMiterlimit="10"
        />
      </g>
    </svg>
  )
}
