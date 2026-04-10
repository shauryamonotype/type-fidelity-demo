import { useWizard } from './store/wizard'
import { WizardShell } from './views/wizard/WizardShell'
import { Step1Details } from './views/wizard/Step1Details'
import { Step2AddGuidelines } from './views/wizard/Step2AddGuidelines'
import { Step3ConfirmGuidelines } from './views/wizard/Step3ConfirmGuidelines'
import { Step4ReviewUpdate } from './views/wizard/Step4ReviewUpdate'

function App() {
  const [state, dispatch] = useWizard()

  function handleContinue() {
    if (state.step === 1 && state.projectName.trim()) {
      dispatch({ type: 'SET_STEP', step: 2 })
    }
  }

  return (
    <WizardShell state={state} onCancel={() => dispatch({ type: 'RESET' })} onContinue={handleContinue}>
      {state.step === 1 && <Step1Details state={state} dispatch={dispatch} />}
      {state.step === 2 && (
        <Step2AddGuidelines state={state} dispatch={dispatch} />
      )}
      {state.step === 3 && (
        <Step3ConfirmGuidelines
          state={state}
          dispatch={dispatch}
          onReupload={() => dispatch({ type: 'SET_STEP', step: 2 })}
        />
      )}
      {state.step === 4 && <Step4ReviewUpdate state={state} dispatch={dispatch} />}
    </WizardShell>
  )
}

export default App
