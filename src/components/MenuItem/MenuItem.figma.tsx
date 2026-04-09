import figma from '@figma/code-connect'
import { MenuItem } from './MenuItem'

/**
 * Code Connect for the "MenuItem" component in Next-Gen Component Library.
 *
 * File key : gSQPdYKD2xoX1ozN2FX4cg
 * Node     : 2212-523  (MenuItem)
 *
 * Type=Menu — standard navigation item with icon + label + chevron
 * ─────────────────────────────────────────────────────────────────────────────
 * Figma state    → code props
 * ──────────────────────────────────────────────────────────────────────────────
 * Default/Hover/Focus → <MenuItem label="…" />
 * Selected            → <MenuItem label="…" selected />
 *
 * Type=Dual info — label + secondary text + right-aligned value
 * ─────────────────────────────────────────────────────────────────────────────
 * label / subhead / value are all user-supplied strings.
 *
 * Type=Multi-select — checkbox items inside a menu
 * ─────────────────────────────────────────────────────────────────────────────
 * Pass `checked` (boolean | 'indeterminate') to render the animated checkbox
 * visual. Used via sections[n].items[].checked in the Menu component.
 */

// Type=Menu — Default (Selected only adds `selected` prop — easily inferred)
figma.connect(
  MenuItem,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2212-523',
  {
    variant: { Type: 'Menu', State: 'Default' },
    example: () => <MenuItem label="Dashboard" />,
  }
)

// Type=Multi-select — Default (unchecked)
figma.connect(
  MenuItem,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2212-523',
  {
    variant: { Type: 'Multi-select', State: 'Default' },
    example: () => <MenuItem label="Design" checked={false} onClick={() => {}} />,
  }
)

// Type=Multi-select — Selected (checked)
figma.connect(
  MenuItem,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2212-523',
  {
    variant: { Type: 'Multi-select', State: 'Selected' },
    example: () => <MenuItem label="Design" checked={true} onClick={() => {}} />,
  }
)

// Type=Dual info — label + subhead + right-aligned value (Selected only adds `selected` — easily inferred)
figma.connect(
  MenuItem,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2212-523',
  {
    variant: { Type: 'Dual info', State: 'Default' },
    example: () => (
      <MenuItem
        label="Sample text"
        subhead="Subhead"
        value="Value"
        showChevron={false}
      />
    ),
  }
)
