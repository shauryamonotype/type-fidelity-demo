import './Checkbox.css'

export type CheckboxChecked = boolean | 'indeterminate'

export interface CheckboxProps {
  /** Whether the checkbox is checked, unchecked, or indeterminate */
  checked?: CheckboxChecked
  /** Called when the user toggles — receives the next value */
  onChange?: (checked: CheckboxChecked) => void
  /** Disables all interaction */
  disabled?: boolean
  /** Label text displayed beside the checkbox */
  label?: string
  /** Whether to show the label */
  showLabel?: boolean
  /** Extra class names forwarded to the root element */
  className?: string
}

export function Checkbox({
  checked = false,
  onChange,
  disabled = false,
  label = 'Sample text',
  showLabel = true,
  className,
}: CheckboxProps) {
  const isChecked = checked === true
  const isPartial = checked === 'indeterminate'
  const isFilled  = isChecked || isPartial

  const handleClick = () => {
    if (disabled) return
    // indeterminate → checked → unchecked → checked…
    onChange?.(checked === 'indeterminate' ? true : !checked)
  }

  const boxClass = [
    'cb__box',
    isFilled  && 'cb__box--filled',
    isChecked && 'cb__box--checked',
    isPartial && 'cb__box--partial',
  ].filter(Boolean).join(' ')

  return (
    <button
      className={['cb', disabled && 'cb--disabled', className].filter(Boolean).join(' ')}
      onClick={handleClick}
      disabled={disabled}
      role="checkbox"
      aria-checked={isPartial ? 'mixed' : isChecked}
      type="button"
    >
      <div className={boxClass} aria-hidden="true">

        {/* Checkmark — always in DOM, revealed by stroke-dashoffset transition */}
        <svg className="cb__icon cb__check" viewBox="0 0 16 16" fill="none">
          <path
            d="M3.5 8.5L6 11.25L12.5 4.75"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>

        {/* Dash — always in DOM, revealed by scaleX transition */}
        <svg className="cb__icon cb__dash" viewBox="0 0 16 16" fill="none">
          <path
            d="M3 8H13"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

      </div>

      {showLabel && (
        <span className={['cb__label', isFilled && 'cb__label--medium'].filter(Boolean).join(' ')}>
          {label}
        </span>
      )}
    </button>
  )
}
