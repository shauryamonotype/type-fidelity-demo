import React from 'react'

export type IconSize = 16 | 20 | 24

export interface CheckmarkIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    d: 'M3 7.5L6 11L12.5 4.5',
    strokeWidth: 1.1,
  },
  20: {
    viewBox: '0 0 20 20',
    d: 'M3 10.5L7.5 15L16.5 5.5',
    strokeWidth: 1.3,
  },
  24: {
    viewBox: '0 0 24 24',
    d: 'M3.00006 13L8.50006 18L20.0001 6',
    strokeWidth: 1.5,
  },
} as const

export function CheckmarkIcon({ size = 16, color, className }: CheckmarkIconProps) {
  const { viewBox, d, strokeWidth } = variants[size]
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid meet"
      style={color ? { color } : undefined}
      className={className}
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeMiterlimit="10"
      />
    </svg>
  )
}
