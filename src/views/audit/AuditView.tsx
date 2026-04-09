import { useRef, useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge'
import { Toggle } from '../../components/Toggle/Toggle'
import { Table } from '../../components/Table/Table'
import { createColumnHelper } from '@tanstack/react-table'
import type { WizardState, WizardAction, AuditViolation } from '../../store/wizard'
import { runAudit } from '../../api/client'
import { FixPanel } from './FixPanel'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  onBack: () => void
}

const col = createColumnHelper<AuditViolation>()

const COLUMNS = [
  col.accessor('severity', {
    header: 'Severity',
    size: 90,
    enableSorting: true,
    cell: info => {
      const v = info.getValue()
      const status = v === 'hard' ? 'Critical' : v === 'soft' ? 'Warning' : 'Info'
      return <StatusBadge status={status as 'Critical' | 'Warning' | 'Info'} />
    },
  }),
  col.accessor('parameter', {
    header: 'Parameter',
    size: 120,
    enableSorting: true,
    cell: info => info.getValue().replace(/_/g, ' '),
  }),
  col.accessor('actual_value', {
    header: 'Found',
    size: 140,
    enableSorting: false,
    cell: info => (
      <code style={{ fontSize: 12, background: '#fee2e2', padding: '1px 4px', borderRadius: 3 }}>
        {info.getValue()}
      </code>
    ),
  }),
  col.accessor('expected_value', {
    header: 'Expected',
    size: 140,
    enableSorting: false,
    cell: info => (
      <code style={{ fontSize: 12, background: '#dcfce7', padding: '1px 4px', borderRadius: 3 }}>
        {info.getValue()}
      </code>
    ),
  }),
  col.accessor('text_preview', {
    header: 'Text',
    enableSorting: false,
    cell: info => (
      <span style={{ color: '#6b7280', fontSize: 12 }}>
        {(info.getValue() ?? '').slice(0, 50)}
      </span>
    ),
  }),
  col.accessor('slide_number', {
    header: 'Slide',
    size: 60,
    enableSorting: true,
  }),
]

export function AuditView({ state, dispatch, onBack }: Props) {
  const profile = state.selectedProfile
  const fileRef = useRef<HTMLInputElement>(null)
  const [auditFile, setAuditFile] = useState<File | null>(null)
  const [running, setRunning] = useState(false)
  const [runError, setRunError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [sevFilter, setSevFilter] = useState<string[]>(['hard', 'soft'])

  const result = state.auditResult

  function handleFileSelect(file: File) {
    setAuditFile(file)
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

  const filteredViolations = result?.violations.filter(v => sevFilter.includes(v.severity)) ?? []

  const scoreColor = !result
    ? '#9ca3af'
    : result.compliance_score >= 80
    ? '#16a34a'
    : result.compliance_score >= 60
    ? '#d97706'
    : '#dc2626'

  return (
    <>
      {/* Top bar */}
      <div className="top-bar">
        <div>
          <Typography variant="m1" color="muted">Project</Typography>
          <Typography variant="h6" weight="bold">
            {state.projectName || 'Untitled Project'}
            {profile && (
              <span style={{ fontWeight: 400, color: '#6b7280', marginLeft: 8 }}>
                · {profile.brand_name}
              </span>
            )}
          </Typography>
        </div>
        <Button buttonLabel="← Back to Project" color="Blue" type="Ghost" size="Medium" onClick={onBack} />
      </div>

      <div className="audit-layout">
        {/* Upload */}
        <Typography variant="h6" weight="bold">Upload document to audit</Typography>
        <div
          className={`file-drop mt-4 ${dragOver ? 'file-drop--active' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => {
            e.preventDefault()
            setDragOver(false)
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
          <Typography variant="b2" color="muted">
            {auditFile
              ? `📄 ${auditFile.name}`
              : 'Drag & drop a PPTX or DOCX file here, or click to browse'}
          </Typography>
        </div>

        {/* Audit mode */}
        {auditFile && (
          <div className="audit-mode-row mt-6">
            <Typography variant="b2" weight="medium">Rule-based</Typography>
            <Toggle
              state={state.auditMode === 'intelligent' ? 'on' : 'off'}
              onChange={v =>
                dispatch({
                  type: 'SET_FIELD',
                  field: 'auditMode',
                  value: v === 'on' ? 'intelligent' : 'rule_based',
                })
              }
              size="Large"
            />
            <Typography variant="b2" weight="medium">Intelligent + AI</Typography>

            <div style={{ marginLeft: 'auto' }}>
              <Button
                buttonLabel={running ? 'Running audit…' : 'Run Compliance Audit'}
                color="Blue"
                type="Default"
                size="Large"
                state={running ? 'Deactivated' : 'Normal'}
                onClick={handleRunAudit}
              />
            </div>
          </div>
        )}

        {runError && (
          <Typography variant="b2" color="danger" as="p" className="mt-4">{runError}</Typography>
        )}

        {/* Score banner */}
        {result && (
          <>
            <div className="score-banner mt-6" style={{ background: scoreColor }}>
              Compliance Score: {result.compliance_score}%
            </div>

            {/* Metrics */}
            <div className="metrics-row">
              {[
                { label: 'Issues Found', value: result.violations.length },
                { label: 'Elements Checked', value: result.total_elements },
                { label: 'Passing', value: result.passing_count },
                {
                  label: result.llm_cost ? `API Cost` : 'API Cost',
                  value: result.llm_cost ? `$${result.llm_cost.estimated_usd.toFixed(4)}` : 'Free',
                },
              ].map(m => (
                <div key={m.label} className="metric-card">
                  <div className="metric-label">{m.label}</div>
                  <div className="metric-value">{m.value}</div>
                </div>
              ))}
            </div>

            <hr className="divider" />

            {/* Severity filter */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center' }}>
              <Typography variant="b2" weight="medium">Filter:</Typography>
              {(['hard', 'soft', 'info'] as const).map(s => (
                <Button
                  key={s}
                  buttonLabel={s === 'hard' ? 'Errors' : s === 'soft' ? 'Warnings' : 'Info'}
                  color="Blue"
                  type={sevFilter.includes(s) ? 'Default' : 'Ghost'}
                  size="Small"
                  onClick={() =>
                    setSevFilter(f =>
                      f.includes(s) ? f.filter(x => x !== s) : [...f, s]
                    )
                  }
                />
              ))}
            </div>

            {/* Issues table */}
            {filteredViolations.length > 0 ? (
              <div className="issue-table-wrap">
                <Table
                  data={filteredViolations}
                  columns={COLUMNS}
                  selectable={false}
                  resizable
                />
              </div>
            ) : (
              <Typography variant="b2" color="muted">No issues match the current filter.</Typography>
            )}

            {/* Fix panel */}
            {auditFile && (
              <FixPanel state={state} dispatch={dispatch} auditFile={auditFile} />
            )}
          </>
        )}
      </div>
    </>
  )
}
