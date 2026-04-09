import React, { useRef, useState, useId, useEffect } from 'react'
import { Tag } from '../Tag/Tag'
import './TagInput.css'

const EXIT_MS = 130

export interface TagInputProps {
  label?: string
  required?: boolean
  placeholder?: string
  value?: string[]
  onChange?: (tags: string[]) => void
  /** Tags that should render in the Error state */
  invalidTags?: string[]
  size?: 'Large' | 'Medium'
  error?: boolean
  errorMessage?: string
  helperText?: string
  disabled?: boolean
  className?: string
  onBlur?: () => void
  onFocus?: () => void
}

export function TagInput({
  label,
  required,
  placeholder = 'Add a tag…',
  value = [],
  onChange,
  invalidTags = [],
  size = 'Large',
  error,
  errorMessage,
  helperText,
  disabled,
  className,
  onBlur,
  onFocus,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [exitingTags, setExitingTags] = useState<Set<string>>(new Set())
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const exitTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())
  const valueRef   = useRef(value)
  valueRef.current = value
  const inputRef = useRef<HTMLInputElement>(null)
  const id = useId()

  useEffect(() => {
    const timers = exitTimers.current
    return () => { timers.forEach(clearTimeout) }
  }, [])

  const confirmInput = (raw: string) => {
    const trimmed = raw.trim()
    if (trimmed && !value.includes(trimmed)) {
      onChange?.([...value, trimmed])
    }
    setInputValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Cmd+A / Ctrl+A — select all tags when input is empty
    if ((e.metaKey || e.ctrlKey) && e.key === 'a' && inputValue === '' && value.length > 0) {
      e.preventDefault()
      setSelectedTags(new Set(value))
      return
    }

    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      if (inputValue.trim()) {
        e.preventDefault()
        confirmInput(inputValue)
      }
    } else if (e.key === 'Escape') {
      setSelectedTags(new Set())
    } else if (e.key === 'Backspace' && inputValue === '') {
      if (selectedTags.size > 0) {
        // Remove all selected tags with exit animation
        e.preventDefault()
        selectedTags.forEach(tag => { if (!exitingTags.has(tag)) startExit(tag) })
        setSelectedTags(new Set())
      } else if (value.length > 0) {
        const last = value[value.length - 1]
        if (!exitingTags.has(last)) startExit(last)
      }
    } else if (!e.metaKey && !e.ctrlKey && e.key.length === 1) {
      // Any printable character clears selection
      if (selectedTags.size > 0) setSelectedTags(new Set())
    }
  }

  const startExit = (tag: string) => {
    setExitingTags(prev => new Set(prev).add(tag))
    const timer = setTimeout(() => {
      onChange?.(valueRef.current.filter(t => t !== tag))
      setExitingTags(prev => {
        const next = new Set(prev)
        next.delete(tag)
        return next
      })
      exitTimers.current.delete(tag)
    }, EXIT_MS)
    exitTimers.current.set(tag, timer)
  }

  const handleBlur = () => {
    if (inputValue.trim()) confirmInput(inputValue)
    setFocused(false)
    setSelectedTags(new Set())
    onBlur?.()
  }

  const handleFocus = () => {
    setFocused(true)
    onFocus?.()
  }

  const containerClass = [
    'tag-input',
    `tag-input--${size.toLowerCase()}`,
    focused && 'tag-input--focused',
    (error || errorMessage) && 'tag-input--error',
    disabled && 'tag-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className="tag-input__root">
      {label && (
        <label className="tag-input__label" htmlFor={id}>
          {label}
          {required && <span className="tag-input__required" aria-hidden="true"> *</span>}
        </label>
      )}

      <div
        className={containerClass}
        onClick={() => !disabled && inputRef.current?.focus()}
      >
        {value.map(tag => (
          <Tag
            key={tag}
            label={tag}
            size={size}
            state={invalidTags.includes(tag) ? 'Error' : 'Default'}
            selected={selectedTags.has(tag)}
            exiting={exitingTags.has(tag)}
            onRemove={disabled ? undefined : () => startExit(tag)}
          />
        ))}

        <input
          id={id}
          ref={inputRef}
          className="tag-input__input"
          type="text"
          value={inputValue}
          placeholder={value.length === 0 ? placeholder : ''}
          disabled={disabled}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={label ?? placeholder}
        />
      </div>

      {(errorMessage || helperText) && (
        <p className={`tag-input__helper ${errorMessage ? 'tag-input__helper--error' : ''}`}>
          {errorMessage ?? helperText}
        </p>
      )}
    </div>
  )
}
