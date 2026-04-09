import figma from '@figma/code-connect'
import { ChevronIcon } from './ChevronIcon'

/**
 * Code Connect — ChevronIcon
 *
 * File : L2RM9EGefn3tLZI0rwaKOC  (Antiqua Design System v1.0)
 * Node : 22031-55083  (Chevron component set)
 *
 * Size variant + Direction variant → size + direction prop mapping
 * ──────────────────────────────────────────────────────────────────
 * Size=16px, Direction=Down/Up/Right/Left → <ChevronIcon size={16} direction={…} />
 * Size=20px, Direction=Down/Up/Right/Left → <ChevronIcon size={20} direction={…} />
 * Size=24px, Direction=Down/Up/Right/Left → <ChevronIcon size={24} direction={…} />
 */

figma.connect(
  ChevronIcon,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-55083',
  {
    variant: { Size: '16px' },
    props: {
      direction: figma.enum('Direction', {
        Down:  'Down',
        Up:    'Up',
        Right: 'Right',
        Left:  'Left',
      }),
    },
    example: ({ direction }) => <ChevronIcon size={16} direction={direction} />,
  }
)

figma.connect(
  ChevronIcon,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-55083',
  {
    variant: { Size: '20px' },
    props: {
      direction: figma.enum('Direction', {
        Down:  'Down',
        Up:    'Up',
        Right: 'Right',
        Left:  'Left',
      }),
    },
    example: ({ direction }) => <ChevronIcon size={20} direction={direction} />,
  }
)

figma.connect(
  ChevronIcon,
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-55083',
  {
    variant: { Size: '24px' },
    props: {
      direction: figma.enum('Direction', {
        Down:  'Down',
        Up:    'Up',
        Right: 'Right',
        Left:  'Left',
      }),
    },
    example: ({ direction }) => <ChevronIcon size={24} direction={direction} />,
  }
)
