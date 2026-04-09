import { useWizard } from './store/wizard'
import { WizardShell } from './views/wizard/WizardShell'
import { Step1Details } from './views/wizard/Step1Details'
import { Step2Guidelines } from './views/wizard/Step2Guidelines'
import { AuditView } from './views/audit/AuditView'

function App() {
  const [state, dispatch] = useWizard()

  if (state.view === 'audit') {
    return (
      <AuditView
        state={state}
        dispatch={dispatch}
        onBack={() => {
          dispatch({ type: 'SET_VIEW', view: 'wizard' })
          dispatch({ type: 'SET_STEP', step: 2 })
          dispatch({ type: 'SET_FIELD', field: 'auditResult', value: null })
          dispatch({ type: 'RESET_FIXES' })
        }}
      />
    )
  }

  return (
    <WizardShell state={state} onCancel={() => dispatch({ type: 'RESET' })}>
      {state.step === 1 && <Step1Details state={state} dispatch={dispatch} />}
      {state.step === 2 && <Step2Guidelines state={state} dispatch={dispatch} />}
    </WizardShell>
  )
}

export default App
