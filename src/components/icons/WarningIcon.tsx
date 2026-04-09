export interface WarningIconProps {
  size?: 16 | 20 | 24
  color?: string
  className?: string
}

export function WarningIcon({ size = 16, color, className }: WarningIconProps) {
  const style = color ? { color } : undefined

  if (size === 16) {
    return (
      <svg
        width="16" height="16" viewBox="0 0 16 16"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" style={style} className={className}
      >
        <path d="M2.26337 11.5761L6.72546 2.83941C7.29965 1.71514 8.7985 1.72107 9.36119 2.85209C10.8986 5.94236 13.2955 10.7634 13.6873 11.5703C14.297 12.6313 14.0626 14 12.5613 14H3.48495C2.05189 14 1.68201 12.6383 2.26337 11.5761Z" stroke="currentColor" strokeWidth="1.1" />
        <path d="M8 6V9.5M8 11V12.1" stroke="currentColor" strokeWidth="1.1" />
      </svg>
    )
  }

  if (size === 20) {
    return (
      <svg
        width="20" height="20" viewBox="0 0 20 20"
        fill="none" xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true" style={style} className={className}
      >
        <path d="M2.35116 14.7681L8.30061 3.11921C9.06621 1.62019 11.0647 1.62809 11.8149 3.13612C13.8648 7.25648 17.0607 13.6845 17.5831 14.7605C18.396 16.1751 18.0835 18 16.0817 18H3.97994C2.06918 18 1.57601 16.1844 2.35116 14.7681Z" stroke="currentColor" strokeWidth="1.3" />
        <path d="M10 7.5V11.875M10 13.75V15.1" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    )
  }

  return (
    <svg
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true" style={style} className={className}
    >
      <path d="M2.43895 17.9602L9.87576 3.39901C10.8328 1.52523 13.3308 1.53511 14.2686 3.42014C16.831 8.5706 20.8258 16.6056 21.4789 17.9506C22.495 19.7189 22.1044 22 19.6022 22H4.47492C2.08648 22 1.47001 19.7305 2.43895 17.9602Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 9V14.25M12 16.5V18.15" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
