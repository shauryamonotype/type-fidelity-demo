import figma from '@figma/code-connect'
import { TableCell } from './TableCell'

const FIGMA_URL = 'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2619-2417'

// ─── Text cell ────────────────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Text cell', 'State': 'Default' },
  example: () => (
    <TableCell
      type="text"
      text="Text"
      description="Description"
    />
  ),
})

// ─── User cell ────────────────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'User cell', 'State': 'Default' },
  example: () => (
    <TableCell
      type="user"
      name="Tanya Hill"
      email="tanya.hill@example.com"
    />
  ),
})

// ─── Status cell ──────────────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Status cell', 'State': 'Default' },
  example: () => (
    <TableCell
      type="status"
      status="Active"
    />
  ),
})

// ─── Action cell ──────────────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Action cell', 'State': 'Default' },
  example: () => (
    <TableCell
      type="action"
      primaryLabel="Button"
      onPrimaryAction={() => {}}
      secondaryActions={[
        { label: 'Edit',   onClick: () => {} },
        { label: 'Delete', variant: 'danger', onClick: () => {} },
      ]}
    />
  ),
})

// ─── Dropdown cell ────────────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Dropdown cell', 'State': 'Default' },
  example: () => (
    <TableCell
      type="dropdown"
      options={[
        { value: 'option-1', label: 'Option 1' },
        { value: 'option-2', label: 'Option 2' },
      ]}
      value=""
      onChange={() => {}}
    />
  ),
})

// ─── Editable cell ────────────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Editable cell', 'State': 'Default' },
  example: () => (
    <TableCell
      type="editable"
      value="Tanya Hill"
      onChange={() => {}}
    />
  ),
})

// ─── Editable cell — error ────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Editable cell', 'State': 'Error' },
  example: () => (
    <TableCell
      type="editable"
      value="Tanya Hill"
      onChange={() => {}}
      error
    />
  ),
})

// ─── Dropdown cell — disabled ─────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Dropdown cell', 'State': 'Disabled' },
  example: () => (
    <TableCell
      type="dropdown"
      options={[
        { value: 'option-1', label: 'Option 1' },
        { value: 'option-2', label: 'Option 2' },
      ]}
      value="Option 2"
      onChange={() => {}}
      disabled
    />
  ),
})

// ─── Dropdown cell — error ────────────────────────────────────────────────────

figma.connect(TableCell, FIGMA_URL, {
  variant: { 'Cell type': 'Dropdown cell', 'State': 'Error' },
  example: () => (
    <TableCell
      type="dropdown"
      options={[
        { value: 'option-1', label: 'Option 1' },
        { value: 'option-2', label: 'Option 2' },
      ]}
      value="Option 2"
      onChange={() => {}}
      error
    />
  ),
})
