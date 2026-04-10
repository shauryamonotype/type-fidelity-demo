import type { WizardState, WizardAction } from '../../store/wizard'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 500, lineHeight: '16px', color: '#1E242C' }}>{text}</span>
      {required && <span style={{ fontSize: 13, fontWeight: 500, lineHeight: '16px', color: '#DC0024' }}>*</span>}
    </div>
  )
}

const inputBase: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: '#fff',
  border: '1px solid #DBDFE5',
  borderRadius: 8,
  padding: '12px 16px',
  fontSize: 13,
  fontWeight: 400,
  lineHeight: '16px',
  color: '#1E242C',
  fontFamily: 'inherit',
  outline: 'none',
}

export function Step1Details({ state, dispatch }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Heading */}
      <span style={{
        fontSize: 19, fontWeight: 700, lineHeight: '32px',
        letterSpacing: '-0.01em', color: '#1E242C',
      }}>
        Basic details
      </span>

      {/* Fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Project name */}
        <div>
          <FieldLabel text="Project name" required />
          <input
            type="text"
            placeholder="e.g. Brand redesign"
            value={state.projectName}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'projectName', value: e.target.value })}
            style={{ ...inputBase, height: 40 }}
            onFocus={e => { e.currentTarget.style.borderColor = '#1A73E8' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#DBDFE5' }}
          />
        </div>

        {/* Project details */}
        <div>
          <FieldLabel text="Project details" required />
          <textarea
            placeholder="e.g. Brand redesign"
            value={state.projectDesc}
            onChange={e => dispatch({ type: 'SET_FIELD', field: 'projectDesc', value: e.target.value })}
            style={{ ...inputBase, height: 355, resize: 'vertical', alignItems: 'flex-start' }}
            onFocus={e => { e.currentTarget.style.borderColor = '#1A73E8' }}
            onBlur={e => { e.currentTarget.style.borderColor = '#DBDFE5' }}
          />
        </div>
      </div>
    </div>
  )
}
