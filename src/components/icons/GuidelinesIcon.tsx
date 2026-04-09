import React from 'react'

import type { IconSize } from './CheckmarkIcon'

export interface GuidelinesIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    paths: [
      'M5.49902 9.71426L13.2127 2C13.2127 2 15.3554 4.14285 13.2127 7.18116L11.7842 7.16196L12.346 8.0095C12.346 8.0095 10.6086 10.133 8.98758 8.51187',
      'M9.27013 2.85721H1.98499V11.4286C1.98499 12.8488 3.13612 14 4.55621 14H13.127V10.1429',
    ],
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    paths: [
      'M7.09998 12L16.1 3C16.1 3 18.6 5.5 16.1 9.0447L14.4333 9.0223L15.0888 10.0111C15.0888 10.0111 13.0616 12.4885 11.1703 10.5972',
      'M11.5 4H3V14C3 15.6569 4.3431 17 6 17H16V12.5',
    ],
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      'M8.69788 14.28L19.0102 3.98364C19.0102 3.98364 21.8748 6.84374 19.0102 10.899L17.1005 10.8734L17.8516 12.0046C17.8516 12.0046 15.5288 14.8388 13.3617 12.6751',
      'M13.7395 5.12756H4V16.5679C4 18.4635 5.53895 20.0001 7.43746 20.0001H18.8957V14.8519',
    ],
  },
}

export function GuidelinesIcon({ size = 16, color, className }: GuidelinesIconProps) {
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
