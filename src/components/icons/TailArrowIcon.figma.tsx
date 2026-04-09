import figma from '@figma/code-connect'
import { TailArrowIcon } from './TailArrowIcon'

/**
 * Code Connect — TailArrowIcon
 *
 * File : L2RM9EGefn3tLZI0rwaKOC  (Antiqua Design System v1.0)
 * Node : 22031-55252  (Tail Arrow component set)
 *
 * Size variant + Direction variant → size + direction prop mapping
 * ──────────────────────────────────────────────────────────────────
 * Size=16px, Direction=Right/Left/Down/Up → <TailArrowIcon size={16} direction={…} />
 * Size=20px, Direction=Right/Left/Down/Up → <TailArrowIcon size={20} direction={…} />
 * Size=24px, Direction=Right/Left/Down/Up → <TailArrowIcon size={24} direction={…} />
 */

figma.connect(
  TailArrowIcon,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-55252',
  {
    variant: { Size: '16px' },
    props: {
      direction: figma.enum('Direction', {
        Right: 'Right',
        Left:  'Left',
        Down:  'Down',
        Up:    'Up',
      }),
    },
    example: ({ direction }) => <TailArrowIcon size={16} direction={direction} />,
  }
)

figma.connect(
  TailArrowIcon,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-55252',
  {
    variant: { Size: '20px' },
    props: {
      direction: figma.enum('Direction', {
        Right: 'Right',
        Left:  'Left',
        Down:  'Down',
        Up:    'Up',
      }),
    },
    example: ({ direction }) => <TailArrowIcon size={20} direction={direction} />,
  }
)

figma.connect(
  TailArrowIcon,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-55252',
  {
    variant: { Size: '24px' },
    props: {
      direction: figma.enum('Direction', {
        Right: 'Right',
        Left:  'Left',
        Down:  'Down',
        Up:    'Up',
      }),
    },
    example: ({ direction }) => <TailArrowIcon size={24} direction={direction} />,
  }
)
