import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import { InputField } from '../../components/InputField/InputField'
import type { WizardState, WizardAction } from '../../store/wizard'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

export function Step1Details({ state, dispatch }: Props) {
  const canContinue = state.projectName.trim().length > 0

  return (
    <div>
      <Typography variant="h5" weight="bold">Project details</Typography>
      <Typography variant="b2" color="secondary" as="p" style={{ marginTop: 6, marginBottom: 24 }}>
        Give your compliance project a name and optional description.
      </Typography>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
        <InputField
          label="Project name"
          placeholder="e.g. Q3 Campaign Deck"
          value={state.projectName}
          onChange={v => dispatch({ type: 'SET_FIELD', field: 'projectName', value: v })}
          size="Large"
        />
        <InputField
          label="Description"
          placeholder="Optional — what is this project about?"
          value={state.projectDesc}
          onChange={v => dispatch({ type: 'SET_FIELD', field: 'projectDesc', value: v })}
          size="Large"
        />
      </div>

      <div className="nav-footer">
        <Button
          buttonLabel="Next"
          color="Blue"
          type="Default"
          size="Large"
          state={canContinue ? 'Normal' : 'Deactivated'}
          onClick={() => canContinue && dispatch({ type: 'SET_STEP', step: 2 })}
        />
      </div>
    </div>
  )
}
