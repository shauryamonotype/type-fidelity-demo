import { useRef, useState } from 'react'
import type { WizardState, WizardAction, AuditViolation } from '../../store/wizard'
import { runAudit, applyFixes } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const AUTO_FIX_PARAMS = new Set(['font_name', 'size', 'casing', 'letter_spacing', 'alignment'])

// Document + lists illustration for screen 4
function ListsIllustration() {
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document stack */}
      <rect x="52" y="32" width="108" height="136" rx="6" fill="#E2E5E8"/>
      <rect x="64" y="22" width="108" height="136" rx="6" fill="#E2E5E8"/>
      <rect x="76" y="12" width="108" height="136" rx="6" fill="#fff" stroke="#E2E5E8" strokeWidth="1.5"/>
      {/* List lines */}
      <rect x="92" y="38" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="38" width="56" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="92" y="54" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="54" width="48" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="92" y="70" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="70" width="60" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="92" y="86" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="86" width="44" height="6" rx="3" fill="#E2E5E8"/>
      {/* Upload circle */}
      <circle cx="120" cy="184" r="44" fill="#24272B"/>
      {/* Arrow up */}
      <path d="M120 164 L120 204 M107 178 L120 164 L133 178" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const isHard = severity === 'hard'
  const isSoft = severity === 'soft'
  const bg = isHard ? '#F8E4E4' : isSoft ? '#FEF3C7' : '#E0F2FE'
  const color = isHard ? '#C40020' : isSoft ? '#92400E' : '#0369A1'
  const label = isHard ? 'HARD' : isSoft ? 'SOFT' : 'INFO'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 8px', gap: 3,
      background: bg, border: `1px solid ${bg}`, borderRadius: 4,
    }}>
      <span style={{ fontSize: 9, fontWeight: 500, lineHeight: '16px', color }}>{label}</span>
    </div>
  )
}

function ViolationCard({
  v, decision, onFix, onIgnore,
}: {
  v: AuditViolation
  decision: 'fix' | 'ignore' | undefined
  onFix: () => void
  onIgnore: () => void
}) {
  const ignored = decision === 'ignore'
  return (
    <div style={{
      borderBottom: '1px solid #DBDFE5',
      padding: '20px 0',
      opacity: ignored ? 0.45 : 1,
      transition: 'opacity 0.15s',
    }}>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', letterSpacing: '-0.02em', color: '#1E242C', flex: 1 }}>
          {v.title ?? v.parameter.replace(/_/g, ' ')}
        </span>
        <SeverityBadge severity={v.severity} />
      </div>

      {/* Metadata rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
        {v.text_preview && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579', minWidth: 100 }}>Issue with:</span>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>
              &ldquo;{v.text_preview.slice(0, 80)}&rdquo;
              {v.slide_number ? ` at slide ${v.slide_number}` : ''}
            </span>
          </div>
        )}
        {v.parameter && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579', minWidth: 100 }}>Reason:</span>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>
              Incorrect {v.parameter.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        {v.suggestion && (
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579', minWidth: 100 }}>Brand recommendation:</span>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>{v.suggestion}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderBottom: '1px solid #DBDFE5', marginBottom: 12 }} />

      {/* FOUND → RECOMMENDED FIX */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 30, marginBottom: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 400, lineHeight: '16px', color: '#576579', letterSpacing: '0.04em' }}>FOUND</span>
          <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#1E242C' }}>
            {v.actual_value || v.found || '—'}
          </span>
        </div>

        {/* Arrow */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M5 12H19M14 7L19 12L14 17" stroke="#667488" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span style={{ fontSize: 9, fontWeight: 400, lineHeight: '16px', color: '#576579', letterSpacing: '0.04em' }}>RECOMMENDED FIX</span>
          <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#1E242C' }}>
            {v.expected_value || v.fix || '—'}
          </span>
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={onFix}
          style={{
            width: 78, height: 32, padding: '8px 12px',
            background: decision === 'fix' ? '#1A73E8' : '#E7EAEE',
            border: 'none', borderRadius: 8,
            fontSize: 11, fontWeight: 500, lineHeight: '16px',
            color: decision === 'fix' ? '#fff' : '#1E242C',
            cursor: 'pointer',
          }}
        >
          Fix issue
        </button>
        <button
          onClick={onIgnore}
          style={{
            width: 90, height: 32, padding: '8px 12px',
            background: decision === 'ignore' ? '#1E242C' : 'transparent',
            border: `1px solid ${decision === 'ignore' ? '#1E242C' : '#DBDFE5'}`,
            borderRadius: 8,
            fontSize: 11, fontWeight: 500, lineHeight: '16px',
            color: decision === 'ignore' ? '#fff' : '#576579',
            cursor: 'pointer',
          }}
        >
          Ignore issue
        </button>
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
  const infoCount = violations.filter(v => v.severity === 'info').length
  const score = result?.compliance_score ?? 0
  const fixableViolations = violations.filter(v => v.auto_fixable || AUTO_FIX_PARAMS.has(v.parameter))
  const fixCount = Object.values(state.fixDecisions).filter(d => d === 'fix').length

  // ── Upload screen ────────────────────────────────────────────────────────
  if (!result) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100%', padding: '32px 0',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: 32, width: 629,
        }}>
          <ListsIllustration />

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 23, fontWeight: 700, lineHeight: '32px',
              letterSpacing: '-0.01em', color: '#1E242C', textAlign: 'center',
            }}>
              Upload document to check
            </span>
            <span style={{
              fontSize: 16, fontWeight: 400, lineHeight: '24px',
              color: '#576579', textAlign: 'center',
            }}>
              Check any document and fix against any guidelines
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
            {auditFile && !running && (
              <span style={{ fontSize: 13, color: '#576579' }}>📄 {auditFile.name}</span>
            )}
            {runError && (
              <pre style={{
                color: '#DC0024', fontSize: 12, background: '#fef2f2',
                border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px',
                whiteSpace: 'pre-wrap', wordBreak: 'break-word',
                maxHeight: 100, overflowY: 'auto', width: '100%', boxSizing: 'border-box',
              }}>
                {runError}
              </pre>
            )}

            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={e => {
                e.preventDefault(); setDragging(false)
                const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f)
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
                  background: dragging ? '#1557b0' : '#1A73E8',
                  border: 'none', borderRadius: 8,
                  padding: '12px 24px',
                  fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em',
                  color: '#fff', cursor: running ? 'wait' : 'pointer',
                  minWidth: 200, transition: 'background 0.15s',
                }}
              >
                {running ? 'Running audit…' : auditFile ? 'Run compliance audit' : 'Upload document'}
              </button>
            </div>

            <span style={{ fontSize: 9, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>
              Supported formats: PPTX, DOCX
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── Results screen ───────────────────────────────────────────────────────
  return (
    <div>
      {/* Progress bar section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>

        {/* Label + re-upload */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: 23, fontWeight: 700, lineHeight: '32px',
            letterSpacing: '-0.01em', color: '#1E242C',
          }}>
            {score}% compliance
          </span>
          <button
            onClick={() => {
              dispatch({ type: 'SET_FIELD', field: 'auditResult', value: null })
              dispatch({ type: 'RESET_FIXES' })
              setAuditFile(null)
            }}
            style={{
              background: 'none', border: 'none',
              fontSize: 13, color: '#1A73E8', cursor: 'pointer', padding: 0,
              display: 'flex', alignItems: 'center', gap: 4,
            }}
          >
            ↺ Upload new document
          </button>
        </div>

        {/* Bar */}
        <div style={{ position: 'relative', width: '100%', height: 8, background: '#F3F4F6', borderRadius: 8 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0,
            height: 8, width: `${score}%`,
            background: '#DC0024', borderRadius: 8,
            transition: 'width 0.5s',
          }} />
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hardCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '16px', color: '#576579' }}>
              {hardCount} hard violation{hardCount !== 1 ? 's' : ''}
            </span>
          )}
          {hardCount > 0 && (softCount > 0 || infoCount > 0) && (
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#667488' }} />
          )}
          {softCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '16px', color: '#576579' }}>
              {softCount} soft violation{softCount !== 1 ? 's' : ''}
            </span>
          )}
          {softCount > 0 && infoCount > 0 && (
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#667488' }} />
          )}
          {infoCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '16px', color: '#576579' }}>
              {infoCount} suggestion{infoCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Overview heading + bulk actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 16, fontWeight: 700, lineHeight: '24px', letterSpacing: '-0.02em', color: '#1E242C' }}>
          Overview
        </span>
        {fixableViolations.length > 0 && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {fixCount > 0 && (
              <button
                onClick={handleApplyFixes}
                disabled={applying}
                style={{
                  height: 32, padding: '8px 12px',
                  background: '#1A73E8', border: 'none', borderRadius: 8,
                  fontSize: 11, fontWeight: 500, color: '#fff',
                  cursor: applying ? 'wait' : 'pointer',
                }}
              >
                {applying ? 'Applying…' : `Apply ${fixCount} fix${fixCount > 1 ? 'es' : ''} & download`}
              </button>
            )}
            <button
              onClick={() => dispatch({ type: 'FIX_ALL', ids: fixableViolations.map(v => v.id) })}
              style={{
                height: 32, padding: '8px 12px',
                background: '#E7EAEE', border: 'none', borderRadius: 8,
                fontSize: 11, fontWeight: 500, color: '#1E242C', cursor: 'pointer',
              }}
            >
              Fix all issues
            </button>
            <button
              onClick={() => dispatch({ type: 'IGNORE_ALL', ids: fixableViolations.map(v => v.id) })}
              style={{
                height: 32, padding: '8px 12px',
                background: 'transparent', border: '1px solid #DBDFE5', borderRadius: 8,
                fontSize: 11, fontWeight: 500, color: '#576579', cursor: 'pointer',
              }}
            >
              Ignore all issues
            </button>
          </div>
        )}
      </div>

      {/* Violation list */}
      {violations.length === 0 ? (
        <div style={{ padding: '48px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 16, color: '#26A568', fontWeight: 500 }}>
            ✓ No violations found — document is fully compliant
          </span>
        </div>
      ) : (
        <div>
          {violations.map(v => (
            <ViolationCard
              key={v.id}
              v={v}
              decision={state.fixDecisions[v.id]}
              onFix={() => dispatch({ type: 'SET_FIX_DECISION', id: v.id, decision: 'fix' })}
              onIgnore={() => dispatch({ type: 'SET_FIX_DECISION', id: v.id, decision: 'ignore' })}
            />
          ))}
        </div>
      )}

      {/* Sticky apply footer */}
      {fixCount > 0 && (
        <div style={{
          position: 'sticky', bottom: 0,
          background: '#fff', borderTop: '1px solid #DBDFE5',
          padding: '16px 0', marginTop: 24,
          display: 'flex', justifyContent: 'flex-end',
        }}>
          <button
            onClick={handleApplyFixes}
            disabled={applying}
            style={{
              height: 48, padding: '12px 24px',
              background: '#1A73E8', border: 'none', borderRadius: 8,
              fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em',
              color: '#fff', cursor: applying ? 'wait' : 'pointer',
            }}
          >
            {applying ? 'Applying…' : `Apply ${fixCount} fix${fixCount > 1 ? 'es' : ''} & download`}
          </button>
        </div>
      )}
    </div>
  )
}
