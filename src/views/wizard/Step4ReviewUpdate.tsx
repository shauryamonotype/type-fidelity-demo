import { useRef, useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge'
import { Toggle } from '../../components/Toggle/Toggle'
import type { WizardState, WizardAction, AuditViolation } from '../../store/wizard'
import { runAudit, applyFixes } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const AUTO_FIX_PARAMS = new Set(['font_name', 'size', 'casing', 'letter_spacing', 'alignment'])

function ViolationCard({
  v,
  decision,
  onFix,
  onIgnore,
}: {
  v: AuditViolation
  decision: 'fix' | 'ignore' | undefined
  onFix: () => void
  onIgnore: () => void
}) {
  const isHard = v.severity === 'hard'
  const borderColor = isHard ? '#ef4444' : '#f59e0b'
  const badgeStatus = isHard ? 'Critical' : v.severity === 'soft' ? 'Warning' : 'Info'

  return (
    <div
      style={{
        border: `1.5px solid ${decision === 'fix' ? '#22c55e' : decision === 'ignore' ? '#d1d5db' : borderColor}`,
        borderRadius: 10,
        padding: '16px 20px',
        background: decision === 'fix' ? '#f0fdf4' : decision === 'ignore' ? '#f9fafb' : 'white',
        opacity: decision === 'ignore' ? 0.6 : 1,
        transition: 'all 0.15s',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
        <StatusBadge status={badgeStatus as 'Critical' | 'Warning' | 'Info'} />
        <div style={{ flex: 1 }}>
          <Typography variant="b2" weight="bold" style={{ color: '#111827' }}>
            {v.title ?? v.parameter.replace(/_/g, ' ')}
          </Typography>
          {v.inferred_role && (
            <Typography variant="m1" color="muted" style={{ marginTop: 2 }}>
              {v.inferred_role}
              {v.slide_number ? ` · Slide ${v.slide_number}` : ''}
              {v.shape_name ? ` · ${v.shape_name}` : ''}
            </Typography>
          )}
        </div>
      </div>

      {/* Text preview */}
      {v.text_preview && (
        <div
          style={{
            background: '#f3f4f6',
            borderRadius: 6,
            padding: '6px 10px',
            marginBottom: 12,
            fontSize: 12,
            color: '#374151',
            fontStyle: 'italic',
          }}
        >
          &ldquo;{v.text_preview.slice(0, 120)}&rdquo;
        </div>
      )}

      {/* Found → Fix */}
      <div style={{ display: 'flex', gap: 0, alignItems: 'center', marginBottom: 14 }}>
        <div
          style={{
            flex: 1,
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '6px 0 0 6px',
            padding: '8px 12px',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            FOUND
          </div>
          <code style={{ fontSize: 13, color: '#dc2626', fontFamily: 'monospace' }}>
            {v.actual_value || v.found || '—'}
          </code>
        </div>

        <div
          style={{
            background: '#f3f4f6',
            padding: '0 12px',
            fontSize: 18,
            color: '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            alignSelf: 'stretch',
          }}
        >
          →
        </div>

        <div
          style={{
            flex: 1,
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '0 6px 6px 0',
            padding: '8px 12px',
          }}
        >
          <div style={{ fontSize: 10, fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>
            RECOMMENDED FIX
          </div>
          <code style={{ fontSize: 13, color: '#16a34a', fontFamily: 'monospace' }}>
            {v.expected_value || v.fix || '—'}
          </code>
        </div>
      </div>

      {/* Suggestion */}
      {v.suggestion && (
        <Typography variant="m1" color="muted" style={{ marginBottom: 12 }}>
          {v.suggestion}
        </Typography>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Button
          buttonLabel="Fix issue"
          color="Blue"
          type={decision === 'fix' ? 'Default' : 'Ghost'}
          size="Small"
          onClick={onFix}
        />
        <Button
          buttonLabel="Ignore issue"
          color="Blue"
          type={decision === 'ignore' ? 'Default' : 'Ghost'}
          size="Small"
          onClick={onIgnore}
        />
      </div>
    </div>
  )
}

export function Step4ReviewUpdate({ state, dispatch }: Props) {
  const profile = state.selectedProfile
  const fileRef = useRef<HTMLInputElement>(null)
  const [auditFile, setAuditFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const [applying, setApplying] = useState(false)

  const result = state.auditResult

  function handleFileSelect(f: File) {
    setAuditFile(f)
    setRunError('')
    dispatch({ type: 'SET_FIELD', field: 'auditResult', value: null })
    dispatch({ type: 'RESET_FIXES' })
  }

  async function handleRunAudit() {
    if (!auditFile || !profile) return
    setRunning(true)
    setRunError('')
    try {
      const modes = state.auditMode === 'intelligent' ? 'rule_based,openai' : 'rule_based'
      const res = await runAudit(auditFile, profile, modes)
      dispatch({ type: 'SET_FIELD', field: 'auditResult', value: res })
      dispatch({ type: 'RESET_FIXES' })
    } catch (e: unknown) {
      setRunError(e instanceof Error ? e.message : String(e))
    } finally {
      setRunning(false)
    }
  }

  async function handleApplyFixes() {
    if (!auditFile || !result) return
    const toFix = result.violations.filter(
      v => state.fixDecisions[v.id] === 'fix' && (v.auto_fixable || AUTO_FIX_PARAMS.has(v.parameter))
    )
    if (toFix.length === 0) return
    setApplying(true)
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
    } finally {
      setApplying(false)
    }
  }

  const violations = result?.violations ?? []
  const hardCount = violations.filter(v => v.severity === 'hard').length
  const softCount = violations.filter(v => v.severity === 'soft').length
  const fixableViolations = violations.filter(
    v => v.auto_fixable || AUTO_FIX_PARAMS.has(v.parameter)
  )
  const fixCount = Object.values(state.fixDecisions).filter(d => d === 'fix').length
  const score = result?.compliance_score ?? 0

  const scoreColor =
    score >= 80 ? '#16a34a' : score >= 60 ? '#d97706' : '#ef4444'

  // ── Upload screen (no result yet) ──────────────────────────────────────────
  if (!result) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 520 }}>
        {/* Aa illustration */}
        <div style={{ marginBottom: 24 }}>
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="28" y="8" width="52" height="64" rx="4" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5"/>
            <rect x="36" y="8" width="52" height="64" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5"/>
            <rect x="44" y="8" width="52" height="64" rx="4" fill="white" stroke="#d1d5db" strokeWidth="1.5"/>
            <text x="70" y="52" textAnchor="middle" fontSize="24" fontWeight="700" fill="#1d4ed8" fontFamily="serif">Aa</text>
            <circle cx="60" cy="88" r="22" fill="#1d4ed8"/>
            <path d="M60 78 L60 98 M52 86 L60 78 L68 86" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="60" cy="88" r="22" fill="none" stroke="#1e40af" strokeWidth="1"/>
          </svg>
        </div>

        <Typography variant="h5" weight="bold" style={{ marginBottom: 8, textAlign: 'center' }}>
          Upload document to check
        </Typography>
        <Typography variant="b2" color="muted" style={{ marginBottom: 20, textAlign: 'center' }}>
          Upload a PPTX or DOCX file to audit against your brand guidelines.
        </Typography>

        {auditFile && !running && (
          <Typography variant="b2" color="muted" style={{ marginBottom: 12 }}>
            📄 {auditFile.name}
          </Typography>
        )}

        {runError && (
          <pre style={{
            color: '#dc2626', fontSize: 12, background: '#fef2f2',
            border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            maxHeight: 120, overflowY: 'auto', marginBottom: 12, maxWidth: 520, width: '100%',
          }}>
            {runError}
          </pre>
        )}

        <Typography variant="m1" color="muted" style={{ marginBottom: 10 }}>
          Supported formats: PPTX, DOCX
        </Typography>

        {/* Audit mode toggle */}
        {auditFile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Typography variant="b2" weight="medium">Rule-based</Typography>
            <Toggle
              state={state.auditMode === 'intelligent' ? 'on' : 'off'}
              onChange={v =>
                dispatch({ type: 'SET_FIELD', field: 'auditMode', value: v === 'on' ? 'intelligent' : 'rule_based' })
              }
              size="Large"
            />
            <Typography variant="b2" weight="medium">Intelligent + AI</Typography>
          </div>
        )}

        <div
          onDragOver={e => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => {
            e.preventDefault()
            setDragging(false)
            const f = e.dataTransfer.files[0]
            if (f) handleFileSelect(f)
          }}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pptx,.docx"
            style={{ display: 'none' }}
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
          />
          <button
            onClick={() => auditFile ? handleRunAudit() : fileRef.current?.click()}
            disabled={running}
            style={{
              background: dragging ? '#1e40af' : '#1d4ed8',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              padding: '14px 48px',
              fontSize: 15,
              fontWeight: 600,
              cursor: running ? 'wait' : 'pointer',
              minWidth: 260,
              transition: 'background 0.15s',
            }}
          >
            {running ? 'Running audit…' : auditFile ? 'Run compliance audit' : 'Upload document'}
          </button>
        </div>
      </div>
    )
  }

  // ── Results screen ─────────────────────────────────────────────────────────
  return (
    <div>
      {/* Score banner */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
          <div>
            <Typography variant="b2" color="muted" style={{ marginBottom: 2 }}>
              {auditFile?.name} · {profile?.brand_name}
            </Typography>
            <Typography variant="h4" weight="bold" style={{ color: scoreColor }}>
              {score}% compliant
            </Typography>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => {
                dispatch({ type: 'SET_FIELD', field: 'auditResult', value: null })
                dispatch({ type: 'RESET_FIXES' })
                setAuditFile(null)
              }}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer', padding: '4px 8px' }}
            >
              ↺ Re-upload
            </button>
          </div>
        </div>

        {/* Score bar */}
        <div style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${score}%`, background: scoreColor, transition: 'width 0.5s', borderRadius: 4 }} />
        </div>

        {/* Counts */}
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          {[
            { label: 'Hard violations', value: hardCount, color: '#ef4444' },
            { label: 'Soft violations', value: softCount, color: '#f59e0b' },
            { label: 'Elements checked', value: result.total_elements, color: '#6b7280' },
            { label: 'Passing', value: result.passing_count, color: '#16a34a' },
          ].map(m => (
            <div key={m.label}>
              <div style={{ fontSize: 20, fontWeight: 700, color: m.color }}>{m.value}</div>
              <div style={{ fontSize: 12, color: '#9ca3af' }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bulk actions */}
      {fixableViolations.length > 0 && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
          <Button
            buttonLabel="Fix all issues"
            color="Blue"
            type="Default"
            size="Small"
            onClick={() => dispatch({ type: 'FIX_ALL', ids: fixableViolations.map(v => v.id) })}
          />
          <Button
            buttonLabel="Ignore all issues"
            color="Blue"
            type="Ghost"
            size="Small"
            onClick={() => dispatch({ type: 'IGNORE_ALL', ids: fixableViolations.map(v => v.id) })}
          />
          {Object.keys(state.fixDecisions).length > 0 && (
            <Button
              buttonLabel="Reset"
              color="Blue"
              type="Text"
              size="Small"
              onClick={() => dispatch({ type: 'RESET_FIXES' })}
            />
          )}
          {fixCount > 0 && (
            <div style={{ marginLeft: 'auto' }}>
              <Button
                buttonLabel={applying ? 'Applying…' : `Apply ${fixCount} fix${fixCount > 1 ? 'es' : ''} & download`}
                color="Blue"
                type="Default"
                size="Medium"
                state={applying ? 'Deactivated' : 'Normal'}
                onClick={handleApplyFixes}
              />
            </div>
          )}
        </div>
      )}

      {/* Violation cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {violations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Typography variant="b2" color="muted">No violations found — document is fully compliant!</Typography>
          </div>
        ) : (
          violations.map(v => (
            <ViolationCard
              key={v.id}
              v={v}
              decision={state.fixDecisions[v.id]}
              onFix={() => dispatch({ type: 'SET_FIX_DECISION', id: v.id, decision: 'fix' })}
              onIgnore={() => dispatch({ type: 'SET_FIX_DECISION', id: v.id, decision: 'ignore' })}
            />
          ))
        )}
      </div>

      {/* Bottom apply strip */}
      {fixCount > 0 && (
        <div style={{ position: 'sticky', bottom: 0, background: 'white', borderTop: '1px solid #e5e7eb', padding: '16px 0', marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            buttonLabel={applying ? 'Applying…' : `Apply ${fixCount} fix${fixCount > 1 ? 'es' : ''} & download`}
            color="Blue"
            type="Default"
            size="Large"
            state={applying ? 'Deactivated' : 'Normal'}
            onClick={handleApplyFixes}
          />
        </div>
      )}
    </div>
  )
}
