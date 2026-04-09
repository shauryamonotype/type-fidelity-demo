import React from 'react'
import type { IconSize } from './CheckmarkIcon'

export interface FontsForReviewIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const variants = {
  16: {
    viewBox: '0 0 16 16',
    strokeWidth: 1.1,
    doc:  'M14 4.57143V3.71428C14 2.76749 13.2325 2 12.2857 2H3.71429C2.76749 2 2 2.76749 2 3.71428V12.2857C2 13.2325 2.76749 14 3.71429 14H12.2857C13.2325 14 14 13.2325 14 12.2857V11.4286',
    eye:  'M13.2856 6.42857L14.8571 7.99999L13.2856 9.5714C11.5511 11.306 8.73454 11.306 6.99996 9.57139L5.42857 8L6.99999 6.42859C8.73456 4.69402 11.5511 4.694 13.2856 6.42857Z',
    iris: 'M11.0001 7.14282H9.28577V8.85711H11.0001V7.14282Z',
  },
  20: {
    viewBox: '0 0 20 20',
    strokeWidth: 1.3,
    doc:  'M17 6V5C17 3.8954 16.1046 3 15 3H5C3.8954 3 3 3.8954 3 5V15C3 16.1046 3.8954 17 5 17H15C16.1046 17 17 16.1046 17 15V14',
    eye:  'M16.1666 8.16661L17.9999 9.99993L16.1666 11.8332C14.1429 13.8569 10.857 13.8569 8.83333 11.8332L7.00005 9.99995L8.83337 8.16663C10.857 6.14296 14.1429 6.14294 16.1666 8.16661Z',
    iris: 'M13.5 9H11.5V11H13.5V9Z',
  },
  24: {
    viewBox: '0 0 24 24',
    strokeWidth: 1.5,
    doc:  'M20.7334 6.93332V5.66665C20.7334 4.26748 19.5992 3.1333 18.2001 3.1333H5.53334C4.13418 3.1333 3 4.26748 3 5.66665V18.3334C3 19.7325 4.13418 20.8667 5.53334 20.8667H18.2001C19.5992 20.8667 20.7334 19.7325 20.7334 18.3334V17.0667',
    eye:  'M19.6778 9.67759L22 11.9998L19.6778 14.322C17.1145 16.8853 12.9522 16.8853 10.3889 14.322L8.06676 11.9998L10.389 9.67762C12.9523 7.1143 17.1144 7.11427 19.6778 9.67759Z',
    iris: 'M16.3001 10.7334H13.7667V13.2667H16.3001V10.7334Z',
  },
} as const

export function FontsForReviewIcon({ size = 16, color, className }: FontsForReviewIconProps) {
  const { viewBox, strokeWidth, doc, eye, iris } = variants[size]
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
      <path d={doc} stroke="currentColor" strokeWidth={strokeWidth} strokeMiterlimit="10" />
      <path d={eye} stroke="currentColor" strokeWidth={strokeWidth} strokeMiterlimit="10" />
      <path d={iris} fill="currentColor" />
    </svg>
  )
}
