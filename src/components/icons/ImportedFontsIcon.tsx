import React from 'react'

import type { IconSize } from './CheckmarkIcon'

export interface ImportedFontsIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    paths: [
      'M11.9 2.03329H12.7666C13.724 2.03329 14.5 2.80931 14.5 3.76662V10.6999C14.5 11.6573 13.724 12.4333 12.7666 12.4333H5.83333C4.87602 12.4333 4.10001 11.6573 4.10001 10.6999V3.76662C4.10001 2.80931 4.87602 2.03329 5.83333 2.03329H6.7',
      'M11.9 12.4333V13.3C11.9 14.2533 11.12 15.0333 10.1666 15.0333H3.23333C2.28 15.0333 1.5 14.2533 1.5 13.3V6.36666C1.5 5.41333 2.28 4.63333 3.23333 4.63333H4.09999',
      'M9.29994 8.15864V0.299988',
      'M12.0897 5.58493L9.29995 8.3748L6.51016 5.58493',
    ],
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    paths: [
      'M14 3H15C16.1046 3 17 3.8954 17 5V13.0357C17 14.1436 16.1007 15.0404 14.9928 15.0358C12.7917 15.0267 9.27099 15.0126 6.99728 15.0051C5.89271 15.0014 5 14.1046 5 13V5C5 3.8954 5.8954 3 7 3H8',
      'M14 15V16C14 17.1 13.1 18 12 18H4C2.9 18 2 17.1 2 16V8C2 6.9 2.9 6 4 6H5',
      'M11 10.0677V1',
      'M14.219 7.09802L11 10.3171L7.78101 7.09802',
    ],
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    paths: [
      'M17.1176 4.05298H18.2941C19.5936 4.05298 20.6471 5.10639 20.6471 6.40592V15.8177C20.6471 17.1172 19.5936 18.1706 18.2941 18.1706H8.88233C7.5828 18.1706 6.52939 17.1172 6.52939 15.8177V6.40592C6.52939 5.10639 7.5828 4.05298 8.88233 4.05298H10.0588',
      'M17.1177 18.1706V19.3471C17.1177 20.6412 16.0588 21.7 14.7647 21.7H5.35294C4.05883 21.7 3 20.6412 3 19.3471V9.93531C3 8.64119 4.05883 7.58237 5.35294 7.58237H6.52942',
      'M13.5883 12.3679V1.70001',
      'M17.3753 8.87415L13.5883 12.6613L9.80119 8.87415',
    ],
  },
}

export function ImportedFontsIcon({ size = 16, color, className }: ImportedFontsIconProps) {
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
