import figma from '@figma/code-connect'
import { Tag } from './Tag'

/**
 * Code Connect — "Tag" pill primitive
 * Next-Gen Component Library · file gSQPdYKD2xoX1ozN2FX4cg
 * Component set node: 3010-2501
 *
 * Prop mapping
 * ─────────────────────────────────────────────────────
 * Figma property  Type    → Code prop   Notes
 * ──────────────  ──────  ────────────  ────────────────
 * State           variant → state       "Default" | "Error"
 * Size            variant → size        "Large" | "Medium"
 */

// ─── Large ────────────────────────────────────────────────────────────────────
figma.connect(
  Tag,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=3010-2501',
  {
    variant: { Size: 'Large' },
    props: {
      state: figma.enum('State', {
        Default: 'Default',
        Error:   'Error',
      }),
    },
    example: ({ state }) => (
      <Tag label="Label" size="Large" state={state} onRemove={() => {}} />
    ),
  }
)

// ─── Medium ───────────────────────────────────────────────────────────────────
figma.connect(
  Tag,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=3010-2501',
  {
    variant: { Size: 'Medium' },
    props: {
      state: figma.enum('State', {
        Default: 'Default',
        Error:   'Error',
      }),
    },
    example: ({ state }) => (
      <Tag label="Label" size="Medium" state={state} onRemove={() => {}} />
    ),
  }
)
