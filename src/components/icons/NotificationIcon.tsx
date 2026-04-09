import React from 'react'

import type { IconSize } from './CheckmarkIcon'

export interface NotificationIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    bell: 'M7.99186 2C10.6441 2 11.9745 3.51644 12.348 5.88634C12.8107 8.82367 12.8593 9.11115 12.8593 9.11115C12.8593 9.11115 13.2541 11.5044 15 11.5044H8H1C2.7458 11.5044 3.14068 9.11115 3.14068 9.11115C3.14068 9.11115 3.18916 8.82367 3.65204 5.88634C4.02549 3.51644 5.35592 2 8.00813 2',
    clapper: 'M8.96 14H7.04C6.4656 14 6 13.5523 6 13H10C10 13.5523 9.5344 14 8.96 14Z',
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    bell: 'M9.99069 3C13.0218 3 14.5423 4.8109 14.9691 7.641C15.498 11.1487 15.5535 11.492 15.5535 11.492C15.5535 11.492 16.0047 14.35 18 14.35H10H2C3.9952 14.35 4.44649 11.492 4.44649 11.492C4.44649 11.492 4.5019 11.1487 5.0309 7.641C5.4577 4.8109 6.97819 3 10.0093 3',
    clapper: 'M10.96 17H9.04C8.4656 17 8 16.5523 8 16H12C12 16.5523 11.5344 17 10.96 17Z',
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    bell: 'M11.9895 4C15.3995 4 17.1101 6.08978 17.5902 9.35572C18.1853 13.4036 18.2477 13.7998 18.2477 13.7998C18.2477 13.7998 18.7553 17.0979 21 17.0979H12H3C5.2446 17.0979 5.7523 13.7998 5.7523 13.7998C5.7523 13.7998 5.81464 13.4036 6.40977 9.35572C6.88992 6.08978 8.60047 4 12.0105 4',
    clapper: 'M12.96 20H11.04C10.4656 20 10 19.5523 10 19H14C14 19.5523 13.5344 20 12.96 20Z',
  },
}

export function NotificationIcon({ size = 16, color, className }: NotificationIconProps) {
  const { viewBox, strokeWidth, bell, clapper } = variants[size]
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
      <path d={bell} stroke="currentColor" strokeWidth={strokeWidth} strokeMiterlimit="10" />
      <path d={clapper} fill="currentColor" />
    </svg>
  )
}
