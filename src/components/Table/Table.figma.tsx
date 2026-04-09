import figma from '@figma/code-connect'
import { createColumnHelper } from '@tanstack/react-table'
import { Table } from './Table'
import { TableCell } from '../TableCell/TableCell'
import type { StatusValue } from './Table'

// ── UserRows / Table component
// Figma: Next-Gen Component Library › node 2102-3391
// ─────────────────────────────────────────────────────────────────────────────

figma.connect(
  Table,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2102-3391',
  {
    example: () => {
      type User = {
        id:         string
        name:       string
        email:      string
        avatarUrl?: string
        initials?:  string
        team:       string
        role:       string
        status:     StatusValue
        isNew?:     boolean
      }

      const columnHelper = createColumnHelper<User>()

      const columns = [
        columnHelper.accessor('name', {
          header: 'User',
          enableSorting: true,
          cell: (info: any) => (
            <TableCell
              type="user"
              name={info.getValue()}
              email={info.row.original.email}
              initials={info.row.original.initials}
              isNew={info.row.original.isNew}
            />
          ),
        }),
        columnHelper.accessor('team', {
          header: 'Team',
          size: 165,
          enableSorting: false,
          cell: (info: any) => <TableCell type="text" text={info.getValue()} />,
        }),
        columnHelper.accessor('role', {
          header: 'Role',
          size: 134,
          enableSorting: false,
          cell: (info: any) => <TableCell type="text" text={info.getValue()} />,
        }),
        columnHelper.accessor('status', {
          header: 'Status',
          size: 150,
          enableSorting: true,
          cell: (info: any) => <TableCell type="status" status={info.getValue()} />,
        }),
        columnHelper.display({
          id: 'action',
          header: 'Action',
          size: 120,
          enableSorting:  false,
          enableResizing: false,
          cell: (info: any) => (
            <TableCell
              type="action"
              primaryLabel="View"
              onPrimaryAction={() => {}}
            />
          ),
        }),
      ]

      const data: User[] = [
        {
          id: '1', name: 'Tanya Hill', email: 'tanya.hill@example.com',
          team: 'Team A', role: 'Collaborator', status: 'Active',
        },
        {
          id: '2', name: 'Rachel Green', email: 'rachel.green@example.com',
          team: 'Team A', role: 'User', status: 'Deactivated',
        },
        {
          id: '3', name: 'Invited user', email: 'seema.sharma@example.com',
          initials: 'S', team: 'Team A', role: 'Collaborator', status: 'Invited',
        },
      ]

      return <Table data={data} columns={columns} selectable />
    },
  },
)
