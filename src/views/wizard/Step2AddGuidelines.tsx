import { useRef, useState } from 'react'
import type { WizardState, WizardAction, BrandProfile } from '../../store/wizard'
import { extractGuideline } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

// Upload illustration SVG (240×240)
function UploadIllustration() {
  return (
    <svg width="240" height="240" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Back document */}
      <rect x="44" y="28" width="112" height="144" rx="6" fill="#E2E5E8"/>
      {/* Mid document */}
      <rect x="60" y="20" width="112" height="144" rx="6" fill="#E2E5E8"/>
      {/* Front document */}
      <rect x="76" y="12" width="112" height="144" rx="6" fill="#fff" stroke="#E2E5E8" strokeWidth="1.5"/>
      {/* Document lines */}
      <rect x="96" y="40" width="72" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="96" y="56" width="72" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="96" y="72" width="56" height="6" rx="3" fill="#E2E5E8"/>
      <rect x="96" y="88" width="64" height="6" rx="3" fill="#E2E5E8"/>
      {/* Upload circle */}
      <circle cx="120" cy="182" r="46" fill="#24272B"/>
      {/* Upload arrow */}
      <path d="M120 162 L120 202 M106 175 L120 162 L134 175" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function Step2AddGuidelines({ state, dispatch }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')

  function handleFile(f: File) {
    setFile(f)
    setError('')
  }

  async function handleUpload() {
    if (!file) return
    setExtracting(true)
    setError('')
    try {
      const result = await extractGuideline(file, state.projectName)
      const prof: BrandProfile = {
        brand_name: result.brand_name,
        fonts: result.fonts,
        dont_rules: result.dont_rules,
        general_rules: result.general_rules,
      }
      dispatch({ type: 'SET_FIELD', field: 'selectedProfile', value: prof })
      dispatch({ type: 'SET_STEP', step: 3 })
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setExtracting(false)
    }
  }

  const valueProps = [
    'Enforce brand-approved fonts and styles',
    'Maintain consistent typography across designs',
    'Ensure visual consistency across teams and projects',
  ]

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      minHeight: '100%', padding: '32px 0',
    }}>
      <div style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 32,
        width: 629,
      }}>
        {/* Illustration */}
        <UploadIllustration />

        {/* Text group */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
          <span style={{
            fontSize: 23, fontWeight: 700, lineHeight: '32px',
            letterSpacing: '-0.01em', color: '#1E242C', textAlign: 'center',
          }}>
            Set typography guidelines for this project
          </span>

          {/* Value props */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {valueProps.map(text => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Tick — #26A568 */}
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8.5L6.5 12L13 5" stroke="#26A568" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: 16, fontWeight: 400, lineHeight: '24px', color: '#576579' }}>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Upload zone */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          {file && !extracting && (
            <span style={{ fontSize: 13, color: '#576579' }}>📄 {file.name}</span>
          )}

          {error && (
            <pre style={{
              color: '#DC0024', fontSize: 12, background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              maxHeight: 100, overflowY: 'auto', width: '100%', boxSizing: 'border-box',
            }}>
              {error}
            </pre>
          )}

          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false)
              const f = e.dataTransfer.files[0]; if (f) handleFile(f)
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.docx,.doc,.json,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => file ? handleUpload() : fileRef.current?.click()}
              disabled={extracting}
              style={{
                background: dragging ? '#1557b0' : '#1A73E8',
                border: 'none', borderRadius: 8,
                padding: '12px 24px',
                fontSize: 16, fontWeight: 500,
                letterSpacing: '-0.02em', color: '#fff',
                cursor: extracting ? 'wait' : 'pointer',
                minWidth: 200,
                transition: 'background 0.15s',
              }}
            >
              {extracting ? 'Scanning document…' : file ? 'Scan document' : 'Upload document'}
            </button>
          </div>

          <span style={{
            fontSize: 9, fontWeight: 400, lineHeight: '16px', color: '#576579', textAlign: 'center',
          }}>
            Upload/drag &amp; drop and scan a document. Supported formats: JSON, PDF, DOC, XLS
          </span>
        </div>
      </div>
    </div>
  )
}
