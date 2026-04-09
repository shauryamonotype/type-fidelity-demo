import figma from '@figma/code-connect'
import { TableRow, TableRowCell } from './TableRow'
import { TableCell } from '../TableCell/TableCell'

const FIGMA_URL = 'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2626-1969'

figma.connect(TableRow, FIGMA_URL, {
  example: () => (
    <TableRow selectable selected={false} onSelect={() => {}}>
      <TableRowCell>
        <TableCell type="text" text="Text" description="Description" />
      </TableRowCell>
      <TableRowCell>
        <TableCell
          type="dropdown"
          options={[
            { value: 'option-1', label: 'Option 1' },
            { value: 'option-2', label: 'Option 2' },
          ]}
          value=""
          onChange={() => {}}
        />
      </TableRowCell>
      <TableRowCell>
        <TableCell
          type="action"
          primaryLabel="Button"
          onPrimaryAction={() => {}}
          secondaryActions={[
            { label: 'Edit', onClick: () => {} },
            { label: 'Delete', variant: 'danger', onClick: () => {} },
          ]}
        />
      </TableRowCell>
    </TableRow>
  ),
})
