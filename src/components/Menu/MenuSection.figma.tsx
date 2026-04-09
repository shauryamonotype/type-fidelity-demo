import figma from '@figma/code-connect'
import { Menu } from './Menu'

/**
 * Code Connect for the "MenuSection" component in Next-Gen Component Library.
 *
 * File key : gSQPdYKD2xoX1ozN2FX4cg
 * Node     : 2214-157  (MenuSection)
 *
 * A MenuSection is used as a building block inside a Menu via the `sections` prop.
 * Each section can have an optional title; dividers are rendered automatically
 * between sections; items map to `sections[n].items[]`.
 *
 * Prop mapping
 * ─────────────────────────────────────────────────────────────────────────────
 * Figma property      → Code prop / notes
 * ──────────────────────────────────────────────────────────────────────────────
 * sectionHeader       → sections[n].title  (omit to hide the title row)
 * showSectionAction   → not implemented (design-only add icon in title row)
 * showDivider         → automatic — divider rendered between sections
 * children (MenuItem) → sections[n].items[]
 */
figma.connect(
  Menu,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2214-157',
  {
    example: () => (
      <Menu
        sections={[
          {
            title: 'Section header',
            items: [
              { label: 'Menu item' },
              { label: 'Menu item' },
            ],
          },
        ]}
        isOpen
        onClose={() => {}}
      />
    ),
  }
)
