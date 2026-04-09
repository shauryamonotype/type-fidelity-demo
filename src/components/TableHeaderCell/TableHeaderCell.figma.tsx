import figma from '@figma/code-connect'
import { TableHeaderCell } from './TableHeaderCell'

// ─── _Cell/Header cell/Default (node 2619-2670) ───────────────────────────────
// Figma: Next-Gen Component Library
// Props: showSort (boolean) → sortable
// ─────────────────────────────────────────────────────────────────────────────

figma.connect(
  TableHeaderCell,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2619-2670',
  {
    example: () => (
      <TableHeaderCell
        label="Column title"
        sortable
        onSort={() => {}}
      />
    ),
  },
)
