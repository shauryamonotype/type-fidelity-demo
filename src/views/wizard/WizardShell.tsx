import type { WizardState } from '../../store/wizard'

interface Props {
  state: WizardState
  onCancel: () => void
  onContinue?: () => void
  children: React.ReactNode
}

const STEPS = [
  { label: 'Project details',    desc: 'Collaborate with your team and manage project details anytime in settings.' },
  { label: 'Add guidelines',     desc: 'Upload your brand guideline document' },
  { label: 'Confirm guidelines', desc: 'Review and edit extracted rules' },
  { label: 'Review and update',  desc: 'Audit a document against your guidelines' },
]

export function WizardShell({ state, onCancel, onContinue, children }: Props) {
  const canContinue = state.projectName.trim().length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#fff', overflow: 'hidden' }}>

      {/* Bar 1 — app name (48px) */}
      <div style={{
        height: 48, flexShrink: 0,
        display: 'flex', alignItems: 'center',
        padding: '0 24px',
        background: '#fff',
        borderBottom: '1px solid #DBDFE5',
      }}>
        <span style={{
          fontWeight: 700, fontSize: 16, lineHeight: '24px',
          letterSpacing: '-0.02em', color: '#1E242C',
        }}>
          Monotype Type Guideline Demo.
        </span>
      </div>

      {/* Bar 2 — title + buttons (80px) */}
      <div style={{
        height: 80, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 0 0 24px',
        background: '#fff',
        borderBottom: '1px solid #DBDFE5',
      }}>
        <span style={{
          fontWeight: 700, fontSize: 28, lineHeight: '32px',
          letterSpacing: '-0.01em', color: '#1E242C',
        }}>
          Create project
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 24px', height: '100%' }}>
          <button
            onClick={onCancel}
            style={{
              background: '#E7EAEE', border: 'none', borderRadius: 8,
              width: 85, height: 48, padding: '12px 16px',
              fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em',
              color: '#1E242C', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => canContinue && onContinue?.()}
            style={{
              background: '#1A73E8', border: 'none', borderRadius: 8,
              width: 100, height: 48, padding: '12px 16px',
              fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em',
              color: '#fff',
              cursor: canContinue ? 'pointer' : 'default',
              opacity: canContinue ? 1 : 0.4,
            }}
          >
            {state.step === 4 ? 'Done' : 'Continue'}
          </button>
        </div>
      </div>

      {/* Body — sidebar + content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

        {/* Sidebar (279px) */}
        <nav style={{
          width: 279, flexShrink: 0,
          borderRight: '1px solid #DBDFE5',
          background: '#fff',
          overflowY: 'auto',
        }}>
          {STEPS.map((s, i) => {
            const n = (i + 1) as 1 | 2 | 3 | 4
            const isActive = state.step === n
            const isComplete = state.step > n

            return (
              <div
                key={n}
                style={{
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'flex-start',
                  padding: 24,
                  gap: isActive ? 12 : 8,
                  borderBottom: '1px solid #DBDFE5',
                }}
              >
                {/* Badge + label row */}
                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16, width: '100%' }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                    background: isActive || isComplete ? '#1E242C' : '#E7EAEE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      fontSize: 9, fontWeight: 500, lineHeight: '16px',
                      color: isActive || isComplete ? '#fff' : '#667488',
                    }}>
                      {isComplete ? '✓' : n}
                    </span>
                  </div>
                  <span style={{
                    fontSize: 16, lineHeight: '24px',
                    fontWeight: isActive ? 700 : 400,
                    letterSpacing: isActive ? '-0.02em' : undefined,
                    color: isActive || isComplete ? '#1E242C' : '#576579',
                  }}>
                    {s.label}
                  </span>
                </div>

                {/* Description — active step only */}
                {isActive && (
                  <div style={{ paddingLeft: 40 }}>
                    <span style={{ fontSize: 11, lineHeight: '16px', color: '#576579' }}>
                      {s.desc}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Content area */}
        <div style={{ flex: 1, padding: 24, overflowY: 'auto' }}>
          {children}
        </div>
      </div>
    </div>
  )
}
