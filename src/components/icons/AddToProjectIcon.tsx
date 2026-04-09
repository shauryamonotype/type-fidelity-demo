import React from 'react'

import type { IconSize } from './CheckmarkIcon'

export interface AddToProjectIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    paths: [
      'M11.5333 1V7.93333',
      'M15 4.46667H8.06665',
      'M11.5333 9.66668V12.7C11.5333 13.418 10.9513 14 10.2333 14H3.3C2.58205 14 2 13.418 2 12.7V5.76667C2 5.04873 2.58205 4.46667 3.3 4.46667H6.33333',
    ],
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    paths: [
      'M14 2V10',
      'M18 6H10',
      'M14 12V15.5C14 16.3284 13.3284 17 12.5 17H4.5C3.6716 17 3 16.3284 3 15.5V7.5C3 6.6716 3.6716 6 4.5 6H8',
    ],
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      'M16.4666 3V12.0667',
      'M21 7.53339H11.9333',
      'M16.4667 14.3334V18.3001C16.4667 19.2389 15.7055 20.0001 14.7667 20.0001H5.7C4.76115 20.0001 4 19.2389 4 18.3001V9.23339C4 8.29453 4.76115 7.53339 5.7 7.53339H9.66667',
    ],
  },
}

export function AddToProjectIcon({ size = 16, color, className }: AddToProjectIconProps) {
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
