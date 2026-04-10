import { useRef, useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import type { WizardState, WizardAction, BrandProfile } from '../../store/wizard'
import { extractGuideline } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 520 }}>
      {/* Upload illustration */}
      <div style={{ marginBottom: 24 }}>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect x="28" y="8" width="52" height="64" rx="4" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1.5"/>
          <rect x="36" y="8" width="52" height="64" rx="4" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1.5"/>
          <rect x="44" y="8" width="52" height="64" rx="4" fill="white" stroke="#d1d5db" strokeWidth="1.5"/>
          <line x1="54" y1="28" x2="86" y2="28" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          <line x1="54" y1="38" x2="86" y2="38" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          <line x1="54" y1="48" x2="76" y2="48" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="60" cy="88" r="22" fill="#1d4ed8"/>
          <path d="M60 78 L60 98 M52 86 L60 78 L68 86" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="60" cy="88" r="22" fill="none" stroke="#1e40af" strokeWidth="1"/>
        </svg>
      </div>

      <Typography variant="h5" weight="bold" style={{ marginBottom: 10, textAlign: 'center' }}>
        Set typography guidelines for this project
      </Typography>
      <Typography variant="b2" color="muted" style={{ marginBottom: 20, textAlign: 'center' }}>
        Upload, create, or import guidelines to ensure consistent and compliant font usage.
      </Typography>

      {/* Value props */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {[
          'Enforce brand-approved fonts and styles',
          'Maintain consistent typography across designs',
          'Ensure visual consistency across teams and projects',
        ].map(text => (
          <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#16a34a', fontSize: 16 }}>✓</span>
            <Typography variant="b2">{text}</Typography>
          </div>
        ))}
      </div>

      {/* File shown if selected */}
      {file && !extracting && (
        <Typography variant="b2" color="muted" style={{ marginBottom: 12 }}>
          📄 {file.name}
        </Typography>
      )}

      {error && (
        <pre style={{
          color: '#dc2626', fontSize: 12, background: '#fef2f2',
          border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px',
          whiteSpace: 'pre-wrap', wordBreak: 'break-word',
          maxHeight: 120, overflowY: 'auto', marginBottom: 12, maxWidth: 520, width: '100%',
        }}>
          {error}
        </pre>
      )}

      {/* Upload zone / CTA */}
      <Typography variant="m1" color="muted" style={{ marginBottom: 10 }}>
        Upload/drag &amp; drop and scan a document. Supported formats: JSON, PDF, DOC, XLS
      </Typography>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          const f = e.dataTransfer.files[0]
          if (f) handleFile(f)
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
            background: dragging ? '#1e40af' : '#1d4ed8',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            padding: '14px 48px',
            fontSize: 15,
            fontWeight: 600,
            cursor: extracting ? 'wait' : 'pointer',
            minWidth: 260,
            transition: 'background 0.15s',
          }}
        >
          {extracting ? 'Scanning document…' : file ? 'Scan document' : 'Upload document'}
        </button>
      </div>
    </div>
  )
}
