import './StatusBadge.css'

// ─── Status values ────────────────────────────────────────────────────────────

export type StatusValue =
  // Figma "Status" type — square corners (4px), no border
  | 'Critical' | 'Warning' | 'All good' | 'Ready' | 'In Progress' | 'Neutral'
  // Figma "Informational" type — pill corners, has border
  | 'New' | 'Variable' | 'Custom' | 'Info'
  // Legacy user-status values (Table)
  | 'Active' | 'Inactive' | 'Deactivated' | 'Invited'
  | 'Pending' | 'Draft' | 'Published' | 'Failed' | 'Expired' | 'Archived'

// CSS modifier for each value
const STATUS_MOD: Record<StatusValue, string> = {
  'Critical':    'critical',
  'Warning':     'warning',
  'All good':    'all-good',
  'Ready':       'ready',
  'In Progress': 'in-progress',
  'Neutral':     'neutral',
  'New':         'new',
  'Variable':    'variable',
  'Custom':      'custom',
  'Info':        'info',
  Active:        'active',
  Inactive:      'inactive',
  Deactivated:   'deactivated',
  Invited:       'invited',
  Pending:       'pending',
  Draft:         'draft',
  Published:     'published',
  Failed:        'failed',
  Expired:       'expired',
  Archived:      'archived',
}

// Informational = pill shape + border
const INFORMATIONAL = new Set<StatusValue>([
  'New', 'Variable', 'Custom', 'Info', 'Invited', 'Draft',
])

export interface StatusBadgeProps {
  status:     StatusValue
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const mod    = STATUS_MOD[status]
  const shape  = INFORMATIONAL.has(status) ? 'informational' : 'status'
  return (
    <span
      className={[
        'status-badge',
        `status-badge--${shape}`,
        `status-badge--${mod}`,
        className,
      ].filter(Boolean).join(' ')}
    >
      {status}
    </span>
  )
}
