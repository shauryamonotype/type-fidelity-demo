import type { WizardState } from '../../store/wizard'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'

interface Props {
  state: WizardState
  onCancel: () => void
  children: React.ReactNode
}

const STEPS = [
  { label: 'Project details',   desc: 'Name and description' },
  { label: 'Brand guidelines',  desc: 'Link or extract a guideline' },
]

export function WizardShell({ state, onCancel, children }: Props) {
  return (
    <>
      {/* Top bar */}
      <div className="top-bar">
        <Typography variant="h6" weight="bold">Create Project</Typography>
        <Button buttonLabel="Cancel" color="Blue" type="Ghost" size="Medium" onClick={onCancel} />
      </div>

      <div className="wizard-layout">
        {/* Left sidebar */}
        <nav className="wizard-sidebar">
          {STEPS.map((s, i) => {
            const n = i + 1
            const status = state.step > n ? 'complete' : state.step === n ? 'active' : 'inactive'
            return (
              <div key={n} className="step-item">
                <div className={`step-badge step-badge--${status}`}>
                  {status === 'complete' ? '✓' : n}
                </div>
                <div className="step-meta">
                  <div className={`step-label step-label--${status}`}>{s.label}</div>
                  <div className="step-desc">{s.desc}</div>
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
