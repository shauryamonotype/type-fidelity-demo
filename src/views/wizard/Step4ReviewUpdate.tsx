import { useRef, useState } from 'react'
import type { WizardState, WizardAction, AuditViolation } from '../../store/wizard'
import { runAudit, applyFixes } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const AUTO_FIX_PARAMS = new Set(['font_name', 'size', 'casing', 'letter_spacing', 'alignment'])

// ── Illustrations ─────────────────────────────────────────────────────────────

function ListsIllustration() {
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
      <rect x="52" y="32" width="108" height="136" rx="6" fill="#E2E5E8"/>
      <rect x="64" y="22" width="108" height="136" rx="6" fill="#E2E5E8"/>
      <rect x="76" y="12" width="108" height="136" rx="6" fill="#fff" stroke="#E2E5E8" strokeWidth="1.5"/>
      <rect x="92" y="38" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="38" width="56" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="92" y="54" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="54" width="48" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="92" y="70" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="70" width="60" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="92" y="86" width="12" height="6" rx="3" fill="#24272B"/>
      <rect x="110" y="86" width="44" height="6" rx="3" fill="#E2E5E8"/>
      <circle cx="120" cy="184" r="44" fill="#24272B"/>
      <path d="M120 164 L120 204 M107 178 L120 164 L133 178" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Violation card ────────────────────────────────────────────────────────────

function SeverityBadge({ severity }: { severity: string }) {
  const isHard = severity === 'hard'
  const isSoft = severity === 'soft'
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      padding: '2px 8px', gap: 3.2,
      background: isHard ? '#F8E4E4' : isSoft ? '#FEF3C7' : '#E0F2FE',
      border: `0.82px solid ${isHard ? '#F8E4E4' : isSoft ? '#FEF3C7' : '#E0F2FE'}`,
      borderRadius: 4,
      flexShrink: 0,
    }}>
      <span style={{
        fontSize: 9, fontWeight: 500, lineHeight: '16px',
        color: isHard ? '#C40020' : isSoft ? '#92400E' : '#0369A1',
      }}>
        {isHard ? 'HARD' : isSoft ? 'SOFT' : 'INFO'}
      </span>
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
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 24,
      padding: 24,
      background: '#FFFFFF',
      border: '1px solid #DBDFE5',
      borderRadius: 16,
      opacity: decision === 'ignore' ? 0.45 : 1,
      transition: 'opacity 0.15s',
      boxSizing: 'border-box',
    }}>
      {/* Title row — 500.5px inner, flex-row, gap 16px */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <span style={{
          flex: 1,
          fontSize: 16, fontWeight: 500, lineHeight: '24px',
          letterSpacing: '-0.02em', color: '#1E242C',
        }}>
          {v.title ?? v.parameter.replace(/_/g, ' ')}
        </span>
        <SeverityBadge severity={v.severity} />
      </div>

      {/* Metadata — flex-col, gap 16px */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {v.text_preview && (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579', minWidth: 90, flexShrink: 0 }}>Issue with:</span>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>
              &ldquo;{v.text_preview.slice(0, 80)}&rdquo;{v.slide_number ? ` at slide ${v.slide_number}` : ''}
            </span>
          </div>
        )}
        {v.parameter && (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579', minWidth: 90, flexShrink: 0 }}>Reason:</span>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>
              Incorrect {v.parameter.replace(/_/g, ' ')}
            </span>
          </div>
        )}
        {v.suggestion && (
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579', minWidth: 90, flexShrink: 0 }}>Brand recommendation:</span>
            <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>{v.suggestion}</span>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderBottom: '1px solid #DBDFE5' }} />

      {/* FOUND → RECOMMENDED FIX — flex-row, justify-content: space-between, gap 30px */}
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 30 }}>
        {/* FOUND — flex-col, gap 4px, 120px, align-items: flex-start */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 4, width: 120 }}>
          <span style={{ fontSize: 9, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>FOUND</span>
          <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#1E242C' }}>
            {v.actual_value || v.found || '—'}
          </span>
        </div>

        {/* Arrow — 24×24px, border: 1.3px solid #667488 */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
          <path d="M5 12H19M14 7L19 12L14 17" stroke="#667488" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

        {/* RECOMMENDED FIX — flex-col, gap 4px, 168px, align-items: flex-end */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, width: 168 }}>
          <span style={{ fontSize: 9, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>RECOMMENDED FIX</span>
          <span style={{ fontSize: 13, fontWeight: 400, lineHeight: '16px', color: '#1E242C', textAlign: 'right' }}>
            {v.expected_value || v.fix || '—'}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderBottom: '1px solid #DBDFE5' }} />

      {/* Buttons — flex-row, gap 8px, 186px total */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
        {/* Fix issue — 78×32px, #1A73E8, border-radius 8px, padding 8px 12px */}
        <button
          onClick={onFix}
          style={{
            width: 78, height: 32, padding: '8px 12px',
            background: decision === 'fix' ? '#155db2' : '#1A73E8',
            border: 'none', borderRadius: 8,
            fontSize: 11, fontWeight: 500, lineHeight: '16px',
            color: '#FFFFFF', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          Fix issue
        </button>
        {/* Ignore issue — 100×32px, outlined */}
        <button
          onClick={onIgnore}
          style={{
            width: 100, height: 32, padding: '8px 12px',
            background: decision === 'ignore' ? '#F3F4F6' : 'transparent',
            border: '1px solid #DBDFE5', borderRadius: 8,
            fontSize: 11, fontWeight: 500, lineHeight: '16px',
            color: '#576579', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          Ignore issue
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const infoCount  = violations.filter(v => v.severity === 'info').length
  const score = result?.compliance_score ?? 0
  const fixableViolations = violations.filter(v => v.auto_fixable || AUTO_FIX_PARAMS.has(v.parameter))
  const fixCount = Object.values(state.fixDecisions).filter(d => d === 'fix').length

  // ── Screen 4: upload ───────────────────────────────────────────────────────
  if (!result) {
    return (
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        minHeight: '100%', padding: '32px 0',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, width: 629 }}>
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
              <span style={{ fontSize: 13, fontWeight: 400, color: '#576579' }}>📄 {auditFile.name}</span>
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
              onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFileSelect(f) }}
            >
              <input
                ref={fileRef} type="file" accept=".pptx,.docx" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
              />
              <button
                onClick={() => auditFile ? handleRunAudit() : fileRef.current?.click()}
                disabled={running}
                style={{
                  background: dragging ? '#1557b0' : '#1A73E8',
                  border: 'none', borderRadius: 8, padding: '12px 24px',
                  fontSize: 16, fontWeight: 500, letterSpacing: '-0.02em',
                  color: '#fff', cursor: running ? 'wait' : 'pointer',
                  minWidth: 200, transition: 'background 0.15s',
                }}
              >
                {running ? 'Running audit…' : auditFile ? 'Run compliance audit' : 'Upload document'}
              </button>
            </div>
            <span style={{ fontSize: 9, fontWeight: 400, lineHeight: '16px', color: '#576579' }}>
              Upload/drag &amp; drop and scan a document. Supported formats: JSON, PDF, DOC, XLS
            </span>
          </div>
        </div>
      </div>
    )
  }

  // ── Screen 5: results ──────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Progress bar section — flex-col, gap 16px, width 1065px */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* Score heading + upload-new link */}
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
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            {/* Circular arrow icon — Vector border: 1.3px solid #1A73E8 */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M13 8A5 5 0 1 1 8 3M8 3L10.5 1M8 3L10.5 5" stroke="#1A73E8" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 13, fontWeight: 500, lineHeight: '16px', color: '#1A73E8' }}>
              Upload new document
            </span>
          </button>
        </div>

        {/* Progress bar — Rectangle 1: #F3F4F6, 8px, r8; Rectangle 2: #DC0024 */}
        <div style={{ position: 'relative', width: '100%', height: 8, background: '#F3F4F6', borderRadius: 8 }}>
          <div style={{
            position: 'absolute', left: 0, top: 0, height: 8,
            width: `${score}%`, background: '#DC0024', borderRadius: 8,
            transition: 'width 0.6s',
          }} />
        </div>

        {/* Stats row — M1/Medium 11px, dots 4×4px #667488 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {hardCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '16px', color: '#576579' }}>
              {hardCount} hard violation{hardCount !== 1 ? 's' : ''}
            </span>
          )}
          {hardCount > 0 && (softCount > 0 || infoCount > 0) && (
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#667488', flexShrink: 0 }} />
          )}
          {softCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '16px', color: '#576579' }}>
              {softCount} soft violation{softCount !== 1 ? 's' : ''}
            </span>
          )}
          {softCount > 0 && infoCount > 0 && (
            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#667488', flexShrink: 0 }} />
          )}
          {infoCount > 0 && (
            <span style={{ fontSize: 11, fontWeight: 500, lineHeight: '16px', color: '#576579' }}>
              {infoCount} suggestion{infoCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Overview header + bulk actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 16, fontWeight: 500, lineHeight: '24px', letterSpacing: '-0.02em', color: '#1E242C' }}>
          Overview
        </span>
        {fixableViolations.length > 0 && (
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => dispatch({ type: 'FIX_ALL', ids: fixableViolations.map(v => v.id) })}
              style={{
                height: 32, padding: '8px 12px', background: '#1A73E8',
                border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500,
                color: '#fff', cursor: 'pointer',
              }}
            >
              Fix all issues
            </button>
            <button
              onClick={() => dispatch({ type: 'IGNORE_ALL', ids: fixableViolations.map(v => v.id) })}
              style={{
                height: 32, padding: '8px 12px', background: 'transparent',
                border: '1px solid #DBDFE5', borderRadius: 8, fontSize: 11, fontWeight: 500,
                color: '#576579', cursor: 'pointer',
              }}
            >
              Ignore all issues
            </button>
            {fixCount > 0 && (
              <button
                onClick={handleApplyFixes}
                disabled={applying}
                style={{
                  height: 32, padding: '8px 12px', background: '#26A568',
                  border: 'none', borderRadius: 8, fontSize: 11, fontWeight: 500,
                  color: '#fff', cursor: applying ? 'wait' : 'pointer',
                }}
              >
                {applying ? 'Applying…' : `Apply ${fixCount} fix${fixCount > 1 ? 'es' : ''} & download`}
              </button>
            )}
          </div>
        )}
      </div>

      {/* 2-column card grid — gap 16px */}
      {violations.length === 0 ? (
        <div style={{ gridColumn: '1/-1', padding: '48px 0', textAlign: 'center' }}>
          <span style={{ fontSize: 16, color: '#26A568', fontWeight: 500 }}>
            ✓ No violations found — document is fully compliant
          </span>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          alignItems: 'flex-start',
        }}>
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
          padding: '16px 0', marginTop: 8,
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
