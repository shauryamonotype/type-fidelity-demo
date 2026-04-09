import './Button.css'

export type ButtonColor =
  | 'Blue'
  | 'Dark grey'
  | 'White'
  | 'Light grey'
  | 'Magenta'
  | 'Red'
  | 'Green'
  | 'Yellow'
  | 'Purple'

export type ButtonSize  = 'Large' | 'Medium' | 'Small'
export type ButtonType  = 'Default' | 'Ghost' | 'Text'
export type ButtonState = 'Normal' | 'Hover' | 'Clicked' | 'Deactivated'

const COLOR_CLASS: Record<ButtonColor, string> = {
  'Blue':       'btn--blue',
  'Dark grey':  'btn--darkgrey',
  'White':      'btn--white',
  'Light grey': 'btn--lightgrey',
  'Magenta':    'btn--magenta',
  'Red':        'btn--red',
  'Green':      'btn--green',
  'Yellow':     'btn--yellow',
  'Purple':     'btn--purple',
}

const SIZE_CLASS: Record<ButtonSize, string> = {
  Large:  'btn--large',
  Medium: 'btn--medium',
  Small:  'btn--small',
}

const TYPE_CLASS: Record<ButtonType, string> = {
  Default: 'btn--default',
  Ghost:   'btn--ghost',
  Text:    'btn--text',
}

export interface ButtonProps {
  /** Label text displayed inside the button */
  buttonLabel?: string
  /** Whether to show the label */
  showButtonLabel?: boolean
  /** Fill colour family */
  color?: ButtonColor
  /** Height / padding tier */
  size?: ButtonSize
  /** Visual style: filled, outlined, or text-only */
  type?: ButtonType
  /** Interaction state (maps to disabled when Deactivated) */
  state?: ButtonState
  /** Icon rendered to the left of the label */
  leftIcon?: React.ReactNode
  /** Whether to render the left icon slot */
  showLeftIco?: boolean
  /** Icon rendered to the right of the label */
  rightIcon?: React.ReactNode
  /** Whether to render the right icon slot */
  showRightIco?: boolean
  /** Extra class names forwarded to the root element */
  className?: string
  onClick?: React.MouseEventHandler<HTMLButtonElement>
}

export function Button({
  buttonLabel    = 'Button',
  showButtonLabel = true,
  color          = 'Blue',
  size           = 'Large',
  type           = 'Default',
  state          = 'Normal',
  leftIcon,
  showLeftIco    = false,
  rightIcon,
  showRightIco   = false,
  className,
  onClick,
}: ButtonProps) {
  const isDisabled = state === 'Deactivated'

  const classes = [
    'btn',
    SIZE_CLASS[size],
    TYPE_CLASS[type],
    COLOR_CLASS[color],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      className={classes}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      onClick={onClick}
    >
      {showLeftIco && leftIcon && (
        <span className="btn__icon" aria-hidden="true">
          {leftIcon}
        </span>
      )}

      {showButtonLabel && (
        <span className="btn__label">{buttonLabel}</span>
      )}

      {showRightIco && rightIcon && (
        <span className="btn__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </button>
  )
}
