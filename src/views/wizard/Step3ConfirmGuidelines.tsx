import { useState } from 'react'
import type { WizardState, WizardAction, FontRule, BrandProfile } from '../../store/wizard'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
  onReupload: () => void
}

const WEIGHTS = [
  '', 'Thin', 'ExtraLight', 'Light', 'Regular', 'Medium', 'SemiBold', 'Bold', 'ExtraBold', 'Black',
  'Condensed Regular', 'Condensed Bold', 'Condensed Light', 'Display Regular', 'Display Bold',
]
const CASINGS = ['', 'Sentence case', 'Title case', 'Uppercase', 'Lowercase', 'Small caps']

const COL_HEADERS = ['Title', 'Family', 'Style', 'Size', 'Line height', 'Kerning', 'Additional details']

function SortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M8 3L10.5 6H5.5L8 3Z" fill="#667488"/>
      <path d="M8 13L5.5 10H10.5L8 13Z" fill="#667488"/>
    </svg>
  )
}

function ColHeader({ label }: { label: string }) {
  return (
    <th style={{
      padding: '8px 12px', textAlign: 'left',
      fontFamily: 'inherit', fontWeight: 500, fontSize: 13,
      lineHeight: '16px', color: '#576579',
      whiteSpace: 'nowrap', userSelect: 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {label}
        <SortIcon />
      </div>
    </th>
  )
}

function EditableCell({
  value, onChange, type = 'text', options,
}: {
  value: string
  onChange: (v: string) => void
  type?: 'text' | 'select'
  options?: string[]
}) {
  const baseStyle: React.CSSProperties = {
    border: '1px solid #DBDFE5', borderRadius: 6, padding: '4px 8px',
    fontSize: 13, background: 'white', color: '#1E242C',
    fontFamily: 'inherit', outline: 'none',
  }
  if (type === 'select' && options) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...baseStyle, cursor: 'pointer', minWidth: 100 }}
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
      style={{ ...baseStyle, width: '100%', minWidth: 60 }}
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
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
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
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M2 8C2 4.69 4.69 2 8 2C10.04 2 11.84 3.01 13 4.57V2.5" stroke="#1A73E8" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M14 8C14 11.31 11.31 14 8 14" stroke="#1A73E8" strokeWidth="1.3" strokeLinecap="round"/>
        </svg>
        <button
          onClick={onReupload}
          style={{
            background: 'none', border: 'none', padding: 0,
            fontSize: 13, fontWeight: 400, lineHeight: '16px',
            color: '#1A73E8', cursor: 'pointer',
          }}
        >
          Re-upload guidelines
        </button>
      </div>

      {/* Font rules table */}
      <div style={{ overflowX: 'auto', marginBottom: 32, border: '1px solid #DBDFE5', borderRadius: 8 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #DBDFE5', background: '#FAFAFA' }}>
              <th style={{ padding: '8px 12px', width: 36 }}>
                <input
                  type="checkbox"
                  checked={selected.size === fonts.length && fonts.length > 0}
                  onChange={() => setSelected(
                    selected.size === fonts.length ? new Set() : new Set(fonts.map((_, i) => i))
                  )}
                />
              </th>
              {COL_HEADERS.map(h => <ColHeader key={h} label={h} />)}
            </tr>
          </thead>
          <tbody>
            {fonts.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: '24px', textAlign: 'center', color: '#667488', fontSize: 13 }}>
                  No font rules extracted
                </td>
              </tr>
            )}
            {fonts.map((f, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid #DBDFE5',
                  background: selected.has(i) ? '#EBF3FD' : 'white',
                }}
              >
                <td style={{ padding: '8px 12px' }}>
                  <input type="checkbox" checked={selected.has(i)} onChange={() => toggleRow(i)} />
                </td>
                {/* Title: font_name + usage */}
                <td style={{ padding: '8px 12px', minWidth: 140 }}>
                  <div style={{ fontWeight: 500, color: '#1E242C', fontSize: 13, lineHeight: '16px' }}>{f.font_name}</div>
                  {f.usage && <div style={{ color: '#667488', fontSize: 11, marginTop: 2 }}>{f.usage}</div>}
                </td>
                {/* Family select */}
                <td style={{ padding: '8px 12px', minWidth: 140 }}>
                  <EditableCell
                    value={f.font_name}
                    onChange={v => updateFont(i, 'font_name', v)}
                    type="select"
                    options={['Avenir Next', 'Helvetica Now', 'Speedee', 'Mona Sans', f.font_name]
                      .filter((v, idx, arr) => arr.indexOf(v) === idx)}
                  />
                </td>
                {/* Style / weight */}
                <td style={{ padding: '8px 12px', minWidth: 120 }}>
                  <EditableCell
                    value={f.weight ?? ''}
                    onChange={v => updateFont(i, 'weight', v)}
                    type="select"
                    options={WEIGHTS}
                  />
                </td>
                {/* Size */}
                <td style={{ padding: '8px 12px', minWidth: 80 }}>
                  <EditableCell value={f.size ?? ''} onChange={v => updateFont(i, 'size', v)} />
                </td>
                {/* Line height */}
                <td style={{ padding: '8px 12px', minWidth: 80 }}>
                  <EditableCell value={f.line_height ?? ''} onChange={v => updateFont(i, 'line_height', v)} />
                </td>
                {/* Kerning / letter spacing */}
                <td style={{ padding: '8px 12px', minWidth: 80 }}>
                  <EditableCell value={f.letter_spacing ?? ''} onChange={v => updateFont(i, 'letter_spacing', v)} />
                </td>
                {/* Additional details / casing */}
                <td style={{ padding: '8px 12px', minWidth: 120 }}>
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
          <span style={{ fontSize: 13, fontWeight: 700, lineHeight: '16px', color: '#1E242C', display: 'block', marginBottom: 10 }}>
            Don&apos;t rules
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {dontRules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: '#F8E4E4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: '#C40020', fontWeight: 700 }}>✕</span>
                </div>
                <input
                  value={r}
                  onChange={e => setDontRules(prev => prev.map((x, idx) => idx === i ? e.target.value : x))}
                  style={{
                    flex: 1, border: '1px solid #DBDFE5', borderRadius: 6,
                    padding: '6px 10px', fontSize: 13, fontFamily: 'inherit',
                    color: '#1E242C', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General rules */}
      {generalRules.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 13, fontWeight: 700, lineHeight: '16px', color: '#1E242C', display: 'block', marginBottom: 10 }}>
            General rules
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {generalRules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{
                  width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                  background: '#E7EAEE', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 10, color: '#576579', fontWeight: 700 }}>i</span>
                </div>
                <input
                  value={r}
                  onChange={e => setGeneralRules(prev => prev.map((x, idx) => idx === i ? e.target.value : x))}
                  style={{
                    flex: 1, border: '1px solid #DBDFE5', borderRadius: 6,
                    padding: '6px 10px', fontSize: 13, fontFamily: 'inherit',
                    color: '#1E242C', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          onClick={handleConfirm}
          style={{
            background: '#1A73E8', border: 'none', borderRadius: 8,
            padding: '12px 24px', fontSize: 16, fontWeight: 500,
            letterSpacing: '-0.02em', color: '#fff', cursor: 'pointer',
          }}
        >
          Confirm and save
        </button>
      </div>
    </div>
  )
}
