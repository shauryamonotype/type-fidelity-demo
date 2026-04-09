import React, { useId } from 'react'

import type { IconSize } from './CheckmarkIcon'

export interface AnalyticsIconProps {
  size?: IconSize
  color?: string
  className?: string
}

const masks = {
  16: 'M-0.22998 15.9263V8.56089H7.70956L15.4589 16.3098L-0.22998 15.9263ZM8.42111 0V7.84933L16.17 15.5987V0.506341L8.42111 0ZM1.1319 0.559701L7.41413 6.84227V0L1.1319 0.559701ZM-0.22998 7.55392H6.70248L0.419912 1.27168L-0.22998 7.55392Z',
  20: 'M0.299988 19.3823V10.6036H9.763L18.9993 19.8394L0.299988 19.3823ZM10.6111 0.400024V9.75552L19.8469 18.9918V1.00352L10.6111 0.400024ZM1.92319 1.06712L9.41089 8.55522V0.400024L1.92319 1.06712ZM0.299988 9.40343H8.56268L1.07458 1.91573L0.299988 9.40343Z',
  24: 'M0.500061 23.0592V12.6725H11.6964L22.6244 23.6L0.500061 23.0592ZM12.6998 0.599976V11.6691L23.6273 22.5971V1.31402L12.6998 0.599976ZM2.42057 1.38926L11.2798 10.2489V0.599976L2.42057 1.38926ZM0.500061 11.2525H10.2762L1.41654 2.3933L0.500061 11.2525Z',
}

const circles = {
  16: { d: 'M7.99667 14.1634C11.4024 14.1634 14.1634 11.4025 14.1634 7.99672C14.1634 4.59094 11.4024 1.83002 7.99667 1.83002C4.59089 1.83002 1.82996 4.59094 1.82996 7.99672C1.82996 11.4025 4.59089 14.1634 7.99667 14.1634Z', strokeWidth: 1.1 },
  20: { d: 'M10.011 17.3535C14.0703 17.3535 17.361 14.0628 17.361 10.0035C17.361 5.94421 14.0703 2.6535 10.011 2.6535C5.95172 2.6535 2.66101 5.94421 2.66101 10.0035C2.66101 14.0628 5.95172 17.3535 10.011 17.3535Z', strokeWidth: 1.3 },
  24: { d: 'M11.9897 20.6588C16.7925 20.6588 20.686 16.7654 20.686 11.9626C20.686 7.15974 16.7925 3.2663 11.9897 3.2663C7.18691 3.2663 3.29346 7.15974 3.29346 11.9626C3.29346 16.7654 7.18691 20.6588 11.9897 20.6588Z', strokeWidth: 1.5 },
}

const bars = {
  16: { paths: ['M7.91748 10.5744V4.70135', 'M5.40063 10.5736V8.05743', 'M10.4344 10.5744V6.37939'], strokeWidth: 1.1 },
  20: { paths: ['M10.0109 13.0035V6.00354', 'M7.01093 13.0035V10.0035', 'M13.0109 13.0035V8.00354'], strokeWidth: 1.3 },
  24: { paths: ['M11.9896 15.5121V7.22992', 'M8.44012 15.512V11.9625', 'M15.5392 15.512V9.59619'], strokeWidth: 1.5 },
}

export function AnalyticsIcon({ size = 16, color, className }: AnalyticsIconProps) {
  const id = useId()
  const maskId = `analytics-mask-${id}`
  const circle = circles[size]
  const bar = bars[size]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={color ? { color } : undefined}
      className={className}
      aria-hidden="true"
    >
      <mask
        id={maskId}
        style={{ maskType: 'luminance' }}
        maskUnits="userSpaceOnUse"
        x="-1"
        y="0"
        width={size + 2}
        height={size + 1}
      >
        <path d={masks[size]} fill="white" />
      </mask>
      <g mask={`url(#${maskId})`}>
        <path d={circle.d} stroke="currentColor" strokeWidth={circle.strokeWidth} strokeMiterlimit="10" />
      </g>
      {bar.paths.map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth={bar.strokeWidth} strokeMiterlimit="10" />
      ))}
    </svg>
  )
}
