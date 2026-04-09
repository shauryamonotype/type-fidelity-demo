import figma from '@figma/code-connect'
import { Checkbox } from './Checkbox'

// ─── NEW Checkbox with text (node 10598-11295) ────────────────────────────────
// Composite: wraps a Checkbox_2026 instance + label. Props sourced from the
// nested Checkbox_2026 layer via figma.nestedProps.
figma.connect(
  Checkbox,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=10598-11295',
  {
    props: {
      innerCheckbox: figma.nestedProps('Checkbox_2026', {
        checked: figma.enum('State', {
          'Selected': true,
          'Partial':  'indeterminate',
          'Default':  false,
        }),
        disabled: figma.enum('Disabled', {
          'ON':  true,
          'OFF': false,
        }),
      }),
    },
    example: ({ innerCheckbox }) => (
      <Checkbox
        checked={innerCheckbox.checked}
        disabled={innerCheckbox.disabled}
        label="Option label"
        onChange={(next) => console.log('checkbox changed:', next)}
      />
    ),
  }
)

// ─── Checkbox_2026 (node 21845-423) ──────────────────────────────────────────
// Icon-only checkbox — no label. Figma props: State + Disabled.
figma.connect(
  Checkbox,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=21845-423',
  {
    props: {
      checked: figma.enum('State', {
        'Selected': true,
        'Partial':  'indeterminate',
        'Default':  false,
      }),
      disabled: figma.enum('Disabled', {
        'ON':  true,
        'OFF': false,
      }),
    },
    example: ({ checked, disabled }) => (
      <Checkbox
        checked={checked}
        disabled={disabled}
        showLabel={false}
        onChange={(next) => console.log('checkbox changed:', next)}
      />
    ),
  }
)
