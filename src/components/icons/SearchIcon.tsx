import React from 'react'

import type { IconSize } from './CheckmarkIcon'

export interface SearchIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    paths: [
      'M6.73161 11.4632C9.34481 11.4632 11.4632 9.34481 11.4632 6.73161C11.4632 4.11842 9.34481 2 6.73161 2C4.11842 2 2 4.11842 2 6.73161C2 9.34481 4.11842 11.4632 6.73161 11.4632Z',
      'M13.7 13.7L10.0782 10.0782',
    ],
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    paths: [
      'M8.5 14C11.5376 14 14 11.5376 14 8.5C14 5.46243 11.5376 3 8.5 3C5.46243 3 3 5.46243 3 8.5C3 11.5376 5.46243 14 8.5 14Z',
      'M16.6 16.6L12.39 12.39',
    ],
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      'M10.3088 16.6176C13.793 16.6176 16.6176 13.7931 16.6176 10.3088C16.6176 6.82456 13.793 4 10.3088 4C6.82451 4 3.99995 6.82456 3.99995 10.3088C3.99995 13.7931 6.82451 16.6176 10.3088 16.6176Z',
      'M19.5999 19.6001L14.7708 14.7709',
    ],
  },
}

export function SearchIcon({ size = 16, color, className }: SearchIconProps) {
  const { viewBox, strokeWidth, paths } = variants[size]
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
      {paths.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth={strokeWidth} strokeMiterlimit="10" />
      ))}
    </svg>
  )
}
