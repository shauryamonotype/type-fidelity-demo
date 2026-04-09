import figma from '@figma/code-connect'
import { Modal } from './Modal'

/**
 * Code Connect for the "Modal_v1_2026" component in Next-Gen Component Library.
 *
 * File key : gSQPdYKD2xoX1ozN2FX4cg
 * Node     : 2009-1831  (Modal_v1_2026)
 */
figma.connect(
  Modal,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2009-1831',
  {
    props: {
      cta: figma.children(['CTAs']),
    },
    example: ({ cta }) => (
      <Modal
        isOpen
        onClose={() => {}}
        title="Leave without saving changes?"
        description="If you leave without saving, all changes you've made will be discarded."
        cta={cta}
      />
    ),
  }
)
