import React from 'react'
import type { IconSize } from './CheckmarkIcon'

export interface DashboardIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    paths: [
      'M6.55157 6.54494V2.42004L1.54997 2.42004V6.54494H6.55157Z',
      'M14.45 6.54494V2.42004L9.44834 2.42004V6.54494H14.45Z',
      'M6.55157 13.5657V9.4408H1.54997V13.5657H6.55157Z',
      'M14.45 13.5657V9.4408H9.44834V13.5657H14.45Z',
    ],
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    paths: [
      'M8.33936 8.35022V3.65002L2.64015 3.65002V8.35022H8.33936Z',
      'M17.3394 8.35022V3.65002L11.6402 3.65002V8.35022H17.3394Z',
      'M8.33936 16.3502V11.65H2.64015V16.3502H8.33936Z',
      'M17.3394 16.3502V11.65H11.6402V16.3502H17.3394Z',
    ],
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      'M10.1474 10.1761V4.90002H3.74998V10.1761H10.1474Z',
      'M20.25 10.1761V4.90002H13.8526V10.1761H20.25Z',
      'M10.1474 19.1562V13.8801H3.74998V19.1562H10.1474Z',
      'M20.25 19.1562V13.8801H13.8526V19.1562H20.25Z',
    ],
  },
} as const

export function DashboardIcon({ size = 16, color, className }: DashboardIconProps) {
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
        <path
          key={i}
          d={d}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeMiterlimit="10"
        />
      ))}
    </svg>
  )
}
