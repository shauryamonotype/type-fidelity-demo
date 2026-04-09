import React from 'react'
import type { IconSize } from './CheckmarkIcon'

export interface ProductionFontsIconProps {
  size?: IconSize
  color?: string
  className?: string
}

// P-in-hexagon icon. Fill-based; each size has its own optimised path + viewBox.
// Source: Figma Antiqua Design System — Production Fonts, node 22031-54999
const variants = {
  16: {
    viewBox: '0 0 16 16',
    d: 'M10.5992 6.91056C10.5992 8.00584 9.89529 8.75744 8.58433 8.75744H7.16089V10.7485H6.08201V5.05552H8.58433C9.89529 5.05552 10.5992 5.80712 10.5992 6.91056ZM9.51169 6.91056C9.51169 6.3188 9.16793 5.9832 8.53665 5.9832H7.16089V7.83008H8.53665C9.16793 7.83008 9.51169 7.50232 9.51169 6.91056ZM8.00001 15.05L1.87969 11.5168V4.45L8.00001 0.916797L14.1203 4.45V11.5168L8.00001 15.05ZM2.92033 10.916L8.00001 13.8492L13.0797 10.916V5.0508L8.00001 2.1176L2.92033 5.0508V10.916Z',
  },
  20: {
    viewBox: '0 0 20 20',
    d: 'M13.249 8.6382C13.249 10.0073 12.3691 10.9468 10.7304 10.9468H8.9511V13.4356H7.6025V6.3194H10.7304C12.3691 6.3194 13.249 7.2589 13.249 8.6382ZM11.8896 8.6382C11.8896 7.8985 11.4599 7.479 10.6708 7.479H8.9511V9.7876H10.6708C11.4599 9.7876 11.8896 9.3779 11.8896 8.6382ZM10 18.8125L2.3496 14.396V5.5625L10 1.146L17.6504 5.5625V14.396L10 18.8125ZM3.6504 13.645L10 17.3115L16.3496 13.645V6.3135L10 2.647L3.6504 6.3135V13.645Z',
  },
  24: {
    viewBox: '0 0 24 24',
    d: 'M15.8989 10.3657C15.8989 12.0087 14.843 13.1361 12.8766 13.1361H10.7414V16.1226H9.12307V7.58318H12.8766C14.843 7.58318 15.8989 8.71058 15.8989 10.3657ZM14.2676 10.3657C14.2676 9.4781 13.752 8.9747 12.805 8.9747H10.7414V11.745H12.805C13.752 11.745 14.2676 11.2534 14.2676 10.3657ZM12.0001 22.5749L2.81959 17.2751V6.6749L12.0001 1.3751L21.1806 6.6749V17.2751L12.0001 22.5749ZM4.38055 16.3739L12.0001 20.7737L19.6196 16.3739V7.5761L12.0001 3.1763L4.38055 7.5761V16.3739Z',
  },
} as const

export function ProductionFontsIcon({ size = 16, color, className }: ProductionFontsIconProps) {
  const { viewBox, d } = variants[size]
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
      <path d={d} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}
