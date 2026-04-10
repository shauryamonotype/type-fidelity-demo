import type { WizardState } from '../../store/wizard'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'

interface Props {
  state: WizardState
  onCancel: () => void
  children: React.ReactNode
}

const STEPS = [
  { label: 'Project details',     desc: 'Name and description' },
  { label: 'Add guidelines',      desc: 'Upload your brand guideline' },
  { label: 'Confirm guidelines',  desc: 'Review and edit extracted rules' },
  { label: 'Review and update',   desc: 'Audit a document' },
]

export function WizardShell({ state, onCancel, children }: Props) {
  return (
    <>
      {/* Top bar */}
      <div className="top-bar">
        <Typography variant="b2" color="muted" style={{ fontWeight: 600, fontSize: 13 }}>
          Monotype Type Guideline Demo.
        </Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Typography variant="h5" weight="bold">Create project</Typography>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button buttonLabel="Cancel" color="Blue" type="Ghost" size="Medium" onClick={onCancel} />
          <Button
            buttonLabel={state.step === 4 ? 'Done' : 'Continue'}
            color="Blue" type="Default" size="Medium"
            state={state.projectName.trim() ? 'Normal' : 'Deactivated'}
            onClick={() => {}}
          />
        </div>
      </div>

      <div className="wizard-layout">
        {/* Left sidebar */}
        <nav className="wizard-sidebar">
          {STEPS.map((s, i) => {
            const n = (i + 1) as 1 | 2 | 3 | 4
            const isComplete = state.step > n
            const isActive = state.step === n
            const status = isComplete ? 'complete' : isActive ? 'active' : 'inactive'
            return (
              <div key={n} className="step-item">
                <div className={`step-badge step-badge--${status}`}>
                  {isComplete ? '✓' : n}
                </div>
                <div className="step-meta">
                  <div className={`step-label step-label--${status}`}>{s.label}</div>
                  {(isActive || isComplete) && (
                    <div className="step-desc">{s.desc}</div>
                  )}
                </div>
              </div>
            )
          })}
        </nav>

        {/* Right content */}
        <div className="wizard-content">{children}</div>
      </div>
    </>
  )
}
