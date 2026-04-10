import { useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import type { WizardState, WizardAction, FontRule, BrandProfile } from '../../store/wizard'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  onReupload: () => void
}

const WEIGHTS = ['Thin', 'ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black',
  'Condensed Regular', 'Condensed Bold', 'Condensed Light', 'Display Regular', 'Display Bold']

const CASINGS = ['', 'Sentence case', 'Title case', 'Uppercase', 'Lowercase', 'Small caps']

function EditableCell({
  value, onChange, type = 'text', options,
}: {
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'select'
  options?: string[]
}) {
  if (type === 'select' && options) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px',
          fontSize: 13, background: 'white', color: '#111827', cursor: 'pointer',
          minWidth: 100,
        }}
      >
        {options.map(o => <option key={o} value={o}>{o || '—'}</option>)}
      </select>
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px',
        fontSize: 13, background: 'white', width: '100%', minWidth: 60,
        color: '#111827',
      }}
    />
  )
}

export function Step3ConfirmGuidelines({ state, dispatch, onReupload }: Props) {
  const profile = state.selectedProfile
  const [fonts, setFonts] = useState<FontRule[]>(profile?.fonts ?? [])
  const [dontRules, setDontRules] = useState<string[]>(
    (profile?.dont_rules ?? []).map(r => typeof r === 'string' ? r : (r as { rule: string }).rule)
  )
  const [generalRules, setGeneralRules] = useState<string[]>(profile?.general_rules ?? [])
  const [selected, setSelected] = useState<Set<number>>(new Set())

  function updateFont(i: number, field: keyof FontRule, value: string) {
    setFonts(prev => prev.map((f, idx) => idx === i ? { ...f, [field]: value } : f))
  }

  function toggleRow(i: number) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === fonts.length) setSelected(new Set())
    else setSelected(new Set(fonts.map((_, i) => i)))
  }

  function handleConfirm() {
    const updatedProfile: BrandProfile = {
      brand_name: profile?.brand_name ?? '',
      fonts,
      dont_rules: dontRules,
      general_rules: generalRules,
    }
    dispatch({ type: 'SET_FIELD', field: 'selectedProfile', value: updatedProfile })
    dispatch({ type: 'SET_STEP', step: 4 })
  }

  if (!profile) return null

  return (
    <div>
      {/* Re-upload link */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20 }}>
        <span style={{ color: '#2563eb', fontSize: 16 }}>↺</span>
        <button
          onClick={onReupload}
          style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 13, cursor: 'pointer', padding: 0 }}
        >
          Re-upload guidelines
        </button>
      </div>

      {/* Font rules table */}
      <div style={{ overflowX: 'auto', marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '8px 10px', textAlign: 'left', width: 36 }}>
                <input
                  type="checkbox"
                  checked={selected.size === fonts.length && fonts.length > 0}
                  onChange={toggleAll}
                />
              </th>
              {['Title', 'Family', 'Style', 'Size', 'Line height', 'Kerning', 'Additional details'].map(h => (
                <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {h} <span style={{ color: '#9ca3af', fontSize: 11 }}>↕</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fonts.map((f, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: selected.has(i) ? '#eff6ff' : 'white' }}>
                <td style={{ padding: '8px 10px' }}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggleRow(i)} />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <div style={{ fontWeight: 500, color: '#111827' }}>{f.font_name}</div>
                  {f.usage && <div style={{ color: '#6b7280', fontSize: 12 }}>{f.usage}</div>}
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <EditableCell
                    value={f.font_name}
                    onChange={v => updateFont(i, 'font_name', v)}
                    type="select"
                    options={['Avenir Next', 'Helvetica Now', 'Speedee', 'Mona Sans', f.font_name].filter((v, idx, arr) => arr.indexOf(v) === idx)}
                  />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <EditableCell
                    value={f.weight ?? ''}
                    onChange={v => updateFont(i, 'weight', v)}
                    type="select"
                    options={WEIGHTS}
                  />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <EditableCell value={f.size ?? ''} onChange={v => updateFont(i, 'size', v)} />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <EditableCell value={f.line_height ?? ''} onChange={v => updateFont(i, 'line_height', v)} />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <EditableCell value={f.letter_spacing ?? ''} onChange={v => updateFont(i, 'letter_spacing', v)} />
                </td>
                <td style={{ padding: '8px 10px' }}>
                  <EditableCell
                    value={f.casing ?? ''}
                    onChange={v => updateFont(i, 'casing', v)}
                    type="select"
                    options={CASINGS}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Don't rules */}
      {dontRules.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <Typography variant="b2" weight="bold" style={{ marginBottom: 10 }}>Don&apos;t rules</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dontRules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, color: '#dc2626', marginTop: 3 }}>🚫</span>
                <input
                  value={r}
                  onChange={e => setDontRules(prev => prev.map((x, idx) => idx === i ? e.target.value : x))}
                  style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General rules */}
      {generalRules.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <Typography variant="b2" weight="bold" style={{ marginBottom: 10 }}>General rules</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {generalRules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ flexShrink: 0, marginTop: 3 }}>📐</span>
                <input
                  value={r}
                  onChange={e => setGeneralRules(prev => prev.map((x, idx) => idx === i ? e.target.value : x))}
                  style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '4px 8px', fontSize: 13 }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          buttonLabel="Confirm and save"
          color="Blue" type="Default" size="Large"
          onClick={handleConfirm}
        />
      </div>
    </div>
  )
}
