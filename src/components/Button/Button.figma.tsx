import figma from '@figma/code-connect'
import { Button } from './Button'

/**
 * Code Connect for the "Smarter Buttons" component set in the
 * Antiqua Design System v1.0.
 *
 * File key : L2RM9EGefn3tLZI0rwaKOC
 * Node     : 2521:9750  (Smarter Buttons)
 *
 * Prop mapping
 * ─────────────────────────────────────────────────────────────────────────────
 * Figma property      Type     → Code prop       Notes
 * ──────────────────  ───────  ────────────────  ──────────────────────────────
 * Color               variant  → color           9 colour options
 * Size                variant  → size            Large | Medium | Small
 * Type                variant  → type            Default | Ghost | Text
 * State               variant  → state           Normal | Hover | Clicked |
 *                                                  Deactivated (→ disabled)
 * Button_label        text     → buttonLabel     editable label text
 * Show button label   boolean  → showButtonLabel toggle label visibility
 * Show Left ico       boolean  → showLeftIco     toggle left icon slot
 * Show Right ico      boolean  → showRightIco    toggle right icon slot
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Note: leftIcon / rightIcon accept a React node and must be supplied in code.
 */
figma.connect(
  Button,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=2521-9750',
  {
    props: {
      color: figma.enum('Color', {
        'Blue':       'Blue',
        'Dark grey':  'Dark grey',
        'White':      'White',
        'Light grey': 'Light grey',
        'Magenta':    'Magenta',
        'Red':        'Red',
        'Green':      'Green',
        'Yellow':     'Yellow',
        'Purple':     'Purple',
      }),
      size: figma.enum('Size', {
        'Large':  'Large',
        'Medium': 'Medium',
        'Small':  'Small',
      }),
      type: figma.enum('Type', {
        'Default': 'Default',
        'Ghost':   'Ghost',
        'Text':    'Text',
      }),
      state: figma.enum('State', {
        'Normal':      'Normal',
        'Hover':       'Hover',
        'Clicked':     'Clicked',
        'Deactivated': 'Deactivated',
      }),
      buttonLabel:     figma.string('Button_label'),
      showButtonLabel: figma.boolean('Show button label'),
      showLeftIco:     figma.boolean('Show Left ico'),
      showRightIco:    figma.boolean('Show Right ico'),
    },
    example: ({
      color,
      size,
      type,
      state,
      buttonLabel,
      showButtonLabel,
      showLeftIco,
      showRightIco,
    }) => (
      <Button
        color={color}
        size={size}
        type={type}
        state={state}
        buttonLabel={buttonLabel}
        showButtonLabel={showButtonLabel}
        showLeftIco={showLeftIco}
        showRightIco={showRightIco}
      />
    ),
  }
)
