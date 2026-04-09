import figma from '@figma/code-connect'
import { Tooltip } from './Tooltip'

/**
 * Code Connect for the "Smart Tooltips" component set in the
 * Antiqua Design System v1.0.
 *
 * File key : L2RM9EGefn3tLZI0rwaKOC
 * Node     : 8645:19002  (Smart Tooltips)
 *
 * Prop mapping
 * ─────────────────────────────────────────────────────────────────────────────
 * Figma property            Type     → Code prop           Notes
 * ────────────────────────  ───────  ──────────────────    ──────────────────────────────
 * Size                      variant  → size                Default | Expanded
 * Side                      variant  → side                Top | Bottom | Left | Right
 * Position                  variant  → position            Start | Center | End
 * Show Description icon     boolean  → showIcon            Default size: leading icon
 * Show Title                boolean  → showTitle           Expanded only
 * Show Title icon           boolean  → showTitleIcon       Expanded only
 * Show image                boolean  → showImage           Expanded only
 * Show Description icon     boolean  → showDescriptionIcon Expanded only
 * Change icon               instance → titleIcon           Expanded title icon slot
 * Change icon in description instance → descriptionIcon   Expanded description icon slot
 * ─────────────────────────────────────────────────────────────────────────────
 */

const NODE_URL =
  'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=8645-19002'

// ── Default size (compact pill) ───────────────────────────────────────────────
figma.connect(
  Tooltip,
  NODE_URL,
  {
    variant: { Size: 'Default' },
    props: {
      side: figma.enum('Side', {
        Top:    'Top',
        Bottom: 'Bottom',
        Left:   'Left',
        Right:  'Right',
      }),
      position: figma.enum('Position', {
        Start:  'Start',
        Center: 'Center',
        End:    'End',
      }),
      showIcon: figma.boolean('Show Description icon'),
    },
    example: ({ side, position, showIcon }) => (
      <Tooltip
        label="Tooltip text"
        side={side}
        position={position}
        showIcon={showIcon}
      >
        <button>Hover me</button>
      </Tooltip>
    ),
  }
)

// ── Expanded size (rich card: title + image + description) ────────────────────
figma.connect(
  Tooltip,
  NODE_URL,
  {
    variant: { Size: 'Expanded' },
    props: {
      side: figma.enum('Side', {
        Top:    'Top',
        Bottom: 'Bottom',
        Left:   'Left',
        Right:  'Right',
      }),
      position: figma.enum('Position', {
        Start:  'Start',
        Center: 'Center',
        End:    'End',
      }),
      showTitle:           figma.boolean('Show Title'),
      showTitleIcon:       figma.boolean('Show Title icon'),
      showImage:           figma.boolean('Show image'),
      showDescriptionIcon: figma.boolean('Show Description icon'),
      titleIcon:           figma.instance('Change icon'),
      descriptionIcon:     figma.instance('Change icon in description'),
    },
    example: ({
      side,
      position,
      showTitle,
      showTitleIcon,
      showImage,
      showDescriptionIcon,
      titleIcon,
      descriptionIcon,
    }) => (
      <Tooltip
        size="Expanded"
        side={side}
        position={position}
        title="Lorem ipsum dolor sit amet"
        showTitle={showTitle}
        showTitleIcon={showTitleIcon}
        titleIcon={titleIcon}
        image="https://example.com/image.jpg"
        showImage={showImage}
        description="Ultricies quis varius quam et scelerisque sodales tellus eleifend vitae."
        showDescriptionIcon={showDescriptionIcon}
        descriptionIcon={descriptionIcon}
      >
        <button>Hover me</button>
      </Tooltip>
    ),
  }
)
