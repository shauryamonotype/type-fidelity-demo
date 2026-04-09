import React from 'react'
import type { IconSize } from './CheckmarkIcon'

export interface FontLicensingIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    paths: [
      'M8.07315 13.6463H3.73519C2.77684 13.6463 2 12.8694 2 11.9111V3.23518C2 2.27684 2.77684 1.5 3.73519 1.5H12.4111C13.3695 1.5 14.1463 2.27684 14.1463 3.23518V4.10277',
      'M13.2787 10.358V14.3403C13.2787 14.3403 12.4285 13.8371 11.5435 13.8371C10.6586 13.8371 9.80835 14.3403 9.80835 14.3403V10.358',
      'M14.45 9.68515V6.32914L11.5435 4.65112L8.63708 6.32914V9.68515L11.5435 11.3632L14.45 9.68515Z',
    ],
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    paths: [
      'M10 17H5C3.8954 17 3 16.1046 3 15V5C3 3.8954 3.8954 3 5 3H15C16.1046 3 17 3.8954 17 5V6',
      'M16 13.21V17.8C16 17.8 15.02 17.22 14 17.22C12.98 17.22 12 17.8 12 17.8V13.21',
      'M17.35 12.4341V8.56594L14 6.63184L10.65 8.56594V12.4341L14 14.3682L17.35 12.4341Z',
    ],
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      'M12.0406 20.0812H6.2973C5.0285 20.0812 4 19.0527 4 17.7839V6.29732C4 5.02851 5.0285 4 6.2973 4H17.7838C19.0526 4 20.0811 5.02851 20.0811 6.29732V7.44598',
      'M18.9325 15.7277V21C18.9325 21 17.8068 20.3338 16.6352 20.3338C15.4635 20.3338 14.3379 21 14.3379 21V15.7277',
      'M20.4832 14.8367V10.3935L16.6352 8.17188L12.7872 10.3935V14.8367L16.6352 17.0584L20.4832 14.8367Z',
    ],
  },
} as const

export function FontLicensingIcon({ size = 16, color, className }: FontLicensingIconProps) {
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
