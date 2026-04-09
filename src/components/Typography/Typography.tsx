import React from 'react'
import './Typography.css'

// ─── Variant ──────────────────────────────────────────────────────────────────

export type TypographyVariant =
  | 'hero1' | 'hero2' | 'hero3'
  | 'h1' | 'h2' | 'h3' | 'h4'
  | 'h5' | 'h6' | 'h7'
  | 'b1' | 'b2'
  | 'm1' | 'm2'

export type TypographyWeight = 'bold' | 'medium' | 'regular'

export type TypographyAlign = 'left' | 'center' | 'right'

export type TypographyColor = 'primary' | 'secondary' | 'muted' | 'danger' | 'success'

// ─── Default element per variant ─────────────────────────────────────────────

const DEFAULT_ELEMENT: Record<TypographyVariant, keyof React.JSX.IntrinsicElements> = {
  hero1: 'h1',
  hero2: 'h1',
  hero3: 'h1',
  h1:    'h1',
  h2:    'h2',
  h3:    'h3',
  h4:    'h4',
  h5:    'h5',
  h6:    'h6',
  h7:    'h6',
  b1:    'p',
  b2:    'p',
  m1:    'span',
  m2:    'span',
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface TypographyProps {
  /** Visual style from the type scale */
  variant?: TypographyVariant
  /** Override the font weight — defaults to the variant's primary weight */
  weight?: TypographyWeight
  /** Override the rendered HTML element (e.g. render an h1 as a span) */
  as?: keyof React.JSX.IntrinsicElements
  /** Text alignment */
  align?: TypographyAlign
  /** Clip overflow to a single line with an ellipsis */
  truncate?: boolean
  /** Semantic color variant */
  color?: TypographyColor
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

// ─── Component ───────────────────────────────────────────────────────────────

const COLOR_VARS: Record<string, string> = {
  primary:   'var(--color-text-primary, #111827)',
  secondary: 'var(--color-text-secondary, #374151)',
  muted:     'var(--color-text-muted, #6b7280)',
  danger:    'var(--color-text-danger, #dc2626)',
  success:   'var(--color-text-success, #16a34a)',
}

export function Typography({
  variant  = 'b1',
  weight,
  as,
  align,
  truncate = false,
  color,
  className,
  style,
  children,
  ...rest
}: TypographyProps) {
  const Tag = (as ?? DEFAULT_ELEMENT[variant]) as React.ElementType

  const classes = [
    'typography',
    `typography--${variant}`,
    weight  ? `typography--${weight}`  : '',
    align   ? `typography--${align}`   : '',
    truncate ? 'typography--truncate'  : '',
    className ?? '',
  ].filter(Boolean).join(' ')

  const colorStyle = color ? { color: COLOR_VARS[color] } : {}

  return (
    <Tag className={classes} style={{ ...colorStyle, ...style }} {...rest}>
      {children}
    </Tag>
  )
}
