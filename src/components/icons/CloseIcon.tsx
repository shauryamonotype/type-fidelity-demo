import React from 'react'

import type { IconSize } from './CheckmarkIcon'

export interface CloseIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    d: 'M12 4L4 12M4 4L12 12',
    strokeWidth: 1.1,
  },
  20: {
    viewBox: '0 0 20 20',
    d: 'M15.5 4.5L4.5 15.5M4.5 4.5L15.5 15.5',
    strokeWidth: 1.3,
  },
  24: {
    viewBox: '0 0 24 24',
    d: 'M19 5L5 19M5 5L19 19',
    strokeWidth: 1.5,
  },
} as const

export function CloseIcon({ size = 16, color, className }: CloseIconProps) {
  const { viewBox, d, strokeWidth } = variants[size]
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={color ? { color } : undefined}
      className={className}
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
      />
    </svg>
  )
}
