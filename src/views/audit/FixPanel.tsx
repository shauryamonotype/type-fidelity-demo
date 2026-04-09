import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge'
import type { AuditViolation, WizardAction } from '../../store/wizard'
import type { WizardState } from '../../store/wizard'
import { applyFixes } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  auditFile: File
}

const AUTO_FIX_PARAMS = new Set(['font_name', 'size', 'casing', 'letter_spacing', 'alignment'])

export function FixPanel({ state, dispatch, auditFile }: Props) {
  const result = state.auditResult
  if (!result) return null

  const fixable = result.violations.filter(v => v.auto_fixable || AUTO_FIX_PARAMS.has(v.parameter))
  const toFix = fixable.filter(v => state.fixDecisions[v.id] === 'fix')
  const decided = fixable.filter(v => v.id in state.fixDecisions).length

  function sevBadge(sev: string) {
    if (sev === 'hard') return <StatusBadge status="Critical" />
    if (sev === 'soft') return <StatusBadge status="Warning" />
    return <StatusBadge status="Info" />
  }

  async function handleApply() {
    if (toFix.length === 0) return
    try {
      const blob = await applyFixes(auditFile, toFix)
      const ext = auditFile.name.endsWith('.pptx') ? 'pptx' : 'docx'
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = auditFile.name.replace(`.${ext}`, `_fixed.${ext}`)
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      console.error('Fix failed:', e)
    }
  }

  if (fixable.length === 0) {
    return (
      <Typography variant="b2" color="success" as="p" style={{ marginTop: 16 }}>
        ✓ No auto-fixable issues found.
      </Typography>
    )
  }

  return (
    <div style={{ marginTop: 24 }}>
      <hr className="divider" />
      <Typography variant="h6" weight="bold">Review & Fix</Typography>
      <Typography variant="b2" color="muted" as="p" className="mt-2">
        {fixable.length} auto-fixable issues
      </Typography>

      {/* Bulk actions */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 8 }}>
        <Button
          buttonLabel="Fix All"
          color="Blue"
          type="Default"
          size="Small"
          onClick={() => dispatch({ type: 'FIX_ALL', ids: fixable.map(v => v.id) })}
        />
        <Button
          buttonLabel="Ignore All"
          color="Blue"
          type="Ghost"
          size="Small"
          onClick={() => dispatch({ type: 'IGNORE_ALL', ids: fixable.map(v => v.id) })}
        />
        <Button
          buttonLabel="Reset"
          color="Blue"
          type="Text"
          size="Small"
          onClick={() => dispatch({ type: 'RESET_FIXES' })}
        />
      </div>

      {/* Progress */}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${(decided / fixable.length) * 100}%` }}
        />
      </div>
      <Typography variant="m1" color="muted">
        Reviewed {decided} of {fixable.length}
      </Typography>

      {/* Fix rows */}
      <div style={{ marginTop: 12 }}>
        {fixable.map(v => {
          const dec = state.fixDecisions[v.id]
          const icon = dec === 'fix' ? '✅' : dec === 'ignore' ? '⏭' : '⬜'
          return (
            <div key={v.id} className="fix-row">
              <div className="fix-status">{icon}</div>
              <div className="fix-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  {sevBadge(v.severity)}
                  <Typography variant="b2" weight="medium">
                    {v.parameter.replace(/_/g, ' ')}
                  </Typography>
                </div>
                <Typography variant="b2" color="muted">
                  <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>{v.actual_value}</code>
                  {' → '}
                  <code style={{ background: '#f3f4f6', padding: '1px 4px', borderRadius: 3 }}>{v.expected_value}</code>
                </Typography>
                <Typography variant="m1" color="muted">&ldquo;{v.text_preview?.slice(0, 60)}&rdquo;</Typography>
              </div>
              <div className="fix-actions">
                <Button
                  buttonLabel="Fix"
                  color="Blue"
                  type={dec === 'fix' ? 'Default' : 'Ghost'}
                  size="Small"
                  onClick={() => dispatch({ type: 'SET_FIX_DECISION', id: v.id, decision: 'fix' })}
                />
                <Button
                  buttonLabel="Skip"
                  color="Blue"
                  type={dec === 'ignore' ? 'Default' : 'Ghost'}
                  size="Small"
                  onClick={() => dispatch({ type: 'SET_FIX_DECISION', id: v.id, decision: 'ignore' })}
                />
              </div>
            </div>
          )
        })}
      </div>

      {/* Metrics + Apply */}
      {decided > 0 && (
        <div style={{ marginTop: 20 }}>
          <div className="metrics-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            <div className="metric-card">
              <div className="metric-label">Fixes to apply</div>
              <div className="metric-value">{toFix.length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Ignored</div>
              <div className="metric-value">{fixable.filter(v => state.fixDecisions[v.id] === 'ignore').length}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">Pending</div>
              <div className="metric-value">{fixable.filter(v => !(v.id in state.fixDecisions)).length}</div>
            </div>
          </div>

          {toFix.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Button
                buttonLabel="Apply Fixes & Download"
                color="Blue"
                type="Default"
                size="Large"
                onClick={handleApply}
              />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
