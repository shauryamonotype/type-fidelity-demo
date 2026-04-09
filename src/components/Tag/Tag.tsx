import React from 'react'
import { CloseIcon } from '../icons/CloseIcon'
import './Tag.css'

export interface TagProps {
  label: string
  size?: 'Large' | 'Medium'
  state?: 'Default' | 'Error'
  selected?: boolean
  onRemove?: () => void
  exiting?: boolean
  className?: string
}

export function Tag({
  label,
  size = 'Large',
  state = 'Default',
  selected = false,
  onRemove,
  exiting = false,
  className,
}: TagProps) {
  return (
    <span
      className={[
        'tag',
        `tag--${size.toLowerCase()}`,
        `tag--${state.toLowerCase()}`,
        selected && 'tag--selected',
        exiting && 'tag--exiting',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <span className="tag__label">{label}</span>
      {onRemove && (
        <button
          type="button"
          className="tag__remove"
          onClick={onRemove}
          aria-label={`Remove ${label}`}
          tabIndex={0}
        >
          <CloseIcon size={16} />
        </button>
      )}
    </span>
  )
}
