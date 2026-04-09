import figma from '@figma/code-connect'
import { Menu } from './Menu'

/**
 * Code Connect for the "Menu" component in Next-Gen Component Library.
 *
 * File key : gSQPdYKD2xoX1ozN2FX4cg
 * Node     : 2356-5064  (Menu)
 */
figma.connect(
  Menu,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2356-5064',
  {
    example: () => (
      <Menu
        isOpen
        onClose={() => {}}
        sections={[
          {
            title: 'Section header',
            items: [
              { label: 'Menu item' },
              { label: 'Menu item' },
            ],
          },
          {
            title: 'Section header',
            items: [
              { label: 'Menu item' },
              { label: 'Menu item' },
            ],
          },
        ]}
      />
    ),
  }
)
