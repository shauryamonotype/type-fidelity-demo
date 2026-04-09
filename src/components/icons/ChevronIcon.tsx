import React from 'react'
import type { IconSize } from './CheckmarkIcon'

export type ChevronDirection = 'Up' | 'Down' | 'Right' | 'Left'

export interface ChevronIconProps {
  size?:      IconSize
  direction?: ChevronDirection
  color?:     string
  className?: string
}

// Natural orientation is Down (open end facing down).
// All four directions are achieved by rotating around the icon centre.
// Paths sourced directly from Figma (Down variant, full coordinate space).
const variants = {
  16: { d: 'M11.8021 5.28577L8.00012 9.51019L4.19812 5.28577', strokeWidth: 1.1 },
  20: { d: 'M15.3228 6L10 11.9142L4.6772 6',                   strokeWidth: 1.3 },
  24: { d: 'M18.8437 6.71436L12.0001 14.3183L5.15651 6.71436', strokeWidth: 1.5 },
} as const

const rotationDeg: Record<ChevronDirection, number> = {
  Down:    0,
  Up:    180,
  Right:  -90,
  Left:    90,
}

export function ChevronIcon({
  size      = 16,
  direction = 'Down',
  color,
  className,
}: ChevronIconProps) {
  const { d, strokeWidth } = variants[size]
  const cx     = size / 2
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
      <g transform={`rotate(${rotate}, ${cx}, ${cx})`}>
        <path
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeMiterlimit="10"
        />
      </g>
    </svg>
  )
}
