import figma from '@figma/code-connect'
import { TagInput } from './TagInput'

/**
 * Code Connect — "Input Field (2025)" · Type=Multi select → TagInput
 * Next-Gen Component Library · file gSQPdYKD2xoX1ozN2FX4cg
 * Component set node: 3010-2542
 *
 * The Multi select type in the Input Field (2025) component maps to TagInput.
 * Single select → InputField (see InputField.figma.tsx).
 *
 * Prop mapping
 * ─────────────────────────────────────────────────────────────────
 * Figma property      Type    → Code prop      Notes
 * ──────────────────  ──────  ───────────────  ────────────────────
 * State               variant → error          "Error" → error=true
 * State               variant → disabled       "Disabled" → disabled=true
 * Size                variant → size           "Large" | "Medium"
 * Input field Label   text    → label          field label above input
 * Input Field text    text    → placeholder    hint text inside field
 * Helper text         text    → errorMessage   shown red on error state
 */

// ─── Large · Default / Filled ─────────────────────────────────────────────────
figma.connect(
  TagInput,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=3010-2542',
  {
    variant: { Type: 'Multi select', Size: 'Large', State: 'Filled Text' },
    props: {
      label:       figma.string('Input field Label'),
      placeholder: figma.string('Input Field text'),
    },
    example: ({ label, placeholder }) => (
      <TagInput
        label={label}
        placeholder={placeholder}
        size="Large"
        value={['Tag one', 'Tag two']}
        onChange={() => {}}
      />
    ),
  }
)

// ─── Medium · Default / Filled ────────────────────────────────────────────────
figma.connect(
  TagInput,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=3010-2542',
  {
    variant: { Type: 'Multi select', Size: 'Medium', State: 'Filled Text' },
    props: {
      label:       figma.string('Input field Label'),
      placeholder: figma.string('Input Field text'),
    },
    example: ({ label, placeholder }) => (
      <TagInput
        label={label}
        placeholder={placeholder}
        size="Medium"
        value={['Tag one', 'Tag two']}
        onChange={() => {}}
      />
    ),
  }
)

// ─── Large · Error ────────────────────────────────────────────────────────────
figma.connect(
  TagInput,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=3010-2542',
  {
    variant: { Type: 'Multi select', Size: 'Large', State: 'Error' },
    props: {
      label:        figma.string('Input field Label'),
      errorMessage: figma.string('Helper text'),
    },
    example: ({ label, errorMessage }) => (
      <TagInput
        label={label}
        size="Large"
        error
        errorMessage={errorMessage}
        value={['valid@example.com', 'notanemail']}
        invalidTags={['notanemail']}
        onChange={() => {}}
      />
    ),
  }
)

// ─── Medium · Error ───────────────────────────────────────────────────────────
figma.connect(
  TagInput,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=3010-2542',
  {
    variant: { Type: 'Multi select', Size: 'Medium', State: 'Error' },
    props: {
      label:        figma.string('Input field Label'),
      errorMessage: figma.string('Helper text'),
    },
    example: ({ label, errorMessage }) => (
      <TagInput
        label={label}
        size="Medium"
        error
        errorMessage={errorMessage}
        value={['valid@example.com', 'notanemail']}
        invalidTags={['notanemail']}
        onChange={() => {}}
      />
    ),
  }
)
