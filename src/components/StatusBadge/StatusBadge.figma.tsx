import figma from '@figma/code-connect'
import { StatusBadge } from './StatusBadge'

const URL = 'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=3094-1069'

// ── Status type (square corners, no border) ───────────────────────────────────

figma.connect(StatusBadge, URL, {
  variant: { Type: 'Status' },
  props: {
    status: figma.enum('Status', {
      'Critical':    'Critical',
      'Warning':     'Warning',
      'All good':    'All good',
      'Ready':       'Ready',
      'In Progress': 'In Progress',
      'Neutral':     'Neutral',
    }),
  },
  example: ({ status }) => <StatusBadge status={status} />,
})

// ── Informational type (pill, border) ─────────────────────────────────────────

figma.connect(StatusBadge, URL, {
  variant: { Type: 'Informational' },
  props: {
    status: figma.enum('Status', {
      'New':      'New',
      'Variable': 'Variable',
      'Custom':   'Custom',
      'Info':     'Info',
    }),
  },
  example: ({ status }) => <StatusBadge status={status} />,
})
