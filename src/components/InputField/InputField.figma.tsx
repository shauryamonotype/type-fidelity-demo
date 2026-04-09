import figma from '@figma/code-connect'
import { InputField } from './InputField'

/**
 * Code Connect — "Input Field (2025)"
 * Antiqua Design System v1.0
 *
 * Figma file : L2RM9EGefn3tLZI0rwaKOC
 * Node       : 16441:927
 *
 * Prop mapping (verified against Figma API)
 * ─────────────────────────────────────────────────────────────────────────────
 * Figma property        Type      → Code prop          Notes
 * ────────────────────  ───────   ────────────────────  ──────────────────────
 * State                 variant   → error / disabled    "Error" → error=true
 *                                                        "Disabled" → disabled=true
 * Size                  variant   → size                "Large" | "Medium"
 * Mandated              boolean   → required            direct boolean map
 * Input field Label     text      → label               editable label text
 * Input Field text      text      → placeholder         hint text in the field
 * Helper text           text      → errorMessage        shown in red on error
 *                                                        (use helperText in code for neutral hints)
 * ─────────────────────────────────────────────────────────────────────────────
 */
figma.connect(
  InputField,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=16441-927',
  {
    props: {
      label: figma.string('Input field Label'),

      required: figma.boolean('Mandated'),

      placeholder: figma.string('Input Field text'),

      // "Error" variant → error=true; everything else → false
      error: figma.enum('State', {
        Error:         true,
        Default:       false,
        'Filled Text': false,
        Disabled:      false,
      }),

      // "Disabled" variant → disabled=true
      disabled: figma.enum('State', {
        Disabled:      true,
        Default:       false,
        Error:         false,
        'Filled Text': false,
      }),

      // Size maps 1:1
      size: figma.enum('Size', {
        Large:  'Large',
        Medium: 'Medium',
      }),

      // The Figma "Helper text" layer maps to errorMessage in code.
      // For neutral hints on non-error fields, pass helperText in code instead.
      errorMessage: figma.string('Helper text'),
    },

    example: ({ label, required, placeholder, error, disabled, size, errorMessage }) => (
      <InputField
        label={label}
        required={required}
        placeholder={placeholder}
        error={error}
        disabled={disabled}
        size={size}
        errorMessage={errorMessage}
      />
    ),
  }
)
