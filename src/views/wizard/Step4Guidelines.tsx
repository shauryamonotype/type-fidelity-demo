// @ts-nocheck
import { useEffect, useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import { InputField } from '../../components/InputField/InputField'
import { Modal } from '../../components/Modal/Modal'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge'
import { Toggle } from '../../components/Toggle/Toggle'
import type { WizardState, WizardAction, BrandProfile, ProfileSummary } from '../../store/wizard'
import { listProfiles, getProfile, extractGuideline } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

function GuidelineDetailModal({
  profile,
  onClose,
}: {
  profile: BrandProfile
  onClose: () => void
}) {
  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`${profile.brand_name} — Typography Rules`}
      cta={
        <Button buttonLabel="Close" color="Blue" type="Ghost" size="Medium" onClick={onClose} />
      }
      additionalCapabilities={
        <div style={{ maxHeight: 460, overflowY: 'auto', paddingTop: 12 }}>
          {profile.fonts.length > 0 && (
            <>
              <Typography variant="b2" weight="bold">Font rules</Typography>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 8, marginBottom: 16, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                    {['Font', 'Usage', 'Size', 'Weight', 'Casing'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 600, color: '#6b7280' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {profile.fonts.map((f, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '4px 8px' }}>{f.font_name}</td>
                      <td style={{ padding: '4px 8px', color: '#6b7280' }}>{f.usage}</td>
                      <td style={{ padding: '4px 8px', color: '#6b7280' }}>{f.size}</td>
                      <td style={{ padding: '4px 8px', color: '#6b7280' }}>{f.weight}</td>
                      <td style={{ padding: '4px 8px', color: '#6b7280' }}>{f.casing}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
          {profile.dont_rules.length > 0 && (
            <>
              <Typography variant="b2" weight="bold">Don&apos;t rules</Typography>
              <ul style={{ marginTop: 8, paddingLeft: 20, color: '#374151', fontSize: 13 }}>
                {profile.dont_rules.map((r, i) => <li key={i}>🚫 {r}</li>)}
              </ul>
            </>
          )}
          {profile.general_rules.length > 0 && (
            <>
              <Typography variant="b2" weight="bold" className="mt-4">General rules</Typography>
              <ul style={{ marginTop: 8, paddingLeft: 20, color: '#374151', fontSize: 13 }}>
                {profile.general_rules.map((r, i) => <li key={i}>📐 {r}</li>)}
              </ul>
            </>
          )}
        </div>
      }
    />
  )
}

export function Step4Guidelines({ state, dispatch }: Props) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)
  const [detailProfile, setDetailProfile] = useState<BrandProfile | null>(null)
  const [guidelineFile, setGuidelineFile] = useState<File | null>(null)
  const [brandHint, setBrandHint] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [extractedProfile, setExtractedProfile] = useState<BrandProfile | null>(null)
  const [extractCost, setExtractCost] = useState<number | null>(null)

  useEffect(() => {
    if (mode !== 'existing') return
    setLoadingProfiles(true)
    listProfiles()
      .then(setProfiles)
      .catch(() => {})
      .finally(() => setLoadingProfiles(false))
  }, [mode])

  function selectProfile(slug: string) {
    getProfile(slug).then(prof => {
      dispatch({ type: 'SET_FIELD', field: 'selectedProfile', value: prof })
      dispatch({ type: 'SET_FIELD', field: 'selectedProfileSlug', value: slug })
    })
  }

  async function handleExtract() {
    if (!guidelineFile) return
    setExtracting(true)
    setExtractError('')
    try {
      const result = await extractGuideline(guidelineFile, brandHint)
      console.log('[handleExtract] result:', result)
      const prof: BrandProfile = {
        brand_name: result.brand_name,
        fonts: result.fonts,
        dont_rules: result.dont_rules,
        general_rules: result.general_rules,
      }
      setExtractedProfile(prof)
      if (result.llm_cost?.estimated_usd) setExtractCost(result.llm_cost.estimated_usd)
    } catch (e: unknown) {
      console.error('[handleExtract] error:', e)
      setExtractError(e instanceof Error ? e.message : String(e))
    } finally {
      setExtracting(false)
    }
  }

  function createProject(profile: BrandProfile) {
    dispatch({ type: 'SET_FIELD', field: 'selectedProfile', value: profile })
    dispatch({ type: 'SET_VIEW', view: 'audit' })
  }

  return (
    <div>
      <Typography variant="h5" weight="bold">Add Guidelines</Typography>
      <Typography variant="b2" color="secondary" as="p" className="mt-2">
        Link a brand guideline to this project to enable compliance auditing
      </Typography>

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 24, margin: '20px 0 24px', alignItems: 'center' }}>
        <Typography variant="b2" weight="medium">Brand guideline</Typography>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Typography variant="b2" color={mode === 'existing' ? 'primary' : 'secondary'}>
            Use an existing guideline
          </Typography>
          <Toggle
            state={mode === 'new' ? 'on' : 'off'}
            onChange={v => setMode(v === 'on' ? 'new' : 'existing')}
            size="Small"
          />
          <Typography variant="b2" color={mode === 'new' ? 'primary' : 'secondary'}>
            Upload & extract a new guideline
          </Typography>
        </div>
      </div>

      {/* ── Existing guideline branch ── */}
      {mode === 'existing' && (
        <>
          {loadingProfiles && (
            <Typography variant="b2" color="muted">Loading guidelines…</Typography>
          )}
          {!loadingProfiles && profiles.length === 0 && (
            <Typography variant="b2" color="muted">No saved guidelines found.</Typography>
          )}
          {profiles.map(p => {
            const isSelected = state.selectedProfileSlug === p.slug
            return (
              <div key={p.slug} className={`guideline-card ${isSelected ? 'guideline-card--selected' : ''}`}>
                <Typography variant="b1" weight="bold">{p.brand_name}</Typography>
                <Typography variant="b2" color="muted">
                  {p.n_fonts} font rules · {p.n_donts} don&apos;t rules · {p.n_general} general rules
                </Typography>
                <div className="guideline-card-actions">
                  <Button
                    buttonLabel={`Select — ${p.brand_name}`}
                    color="Blue"
                    type={isSelected ? 'Default' : 'Ghost'}
                    size="Medium"
                    onClick={() => selectProfile(p.slug)}
                  />
                  <Button
                    buttonLabel="View details"
                    color="Blue"
                    type="Ghost"
                    size="Medium"
                    onClick={() => getProfile(p.slug).then(setDetailProfile)}
                  />
                </div>
              </div>
            )
          })}

          {state.selectedProfile && (
            <div style={{ marginTop: 16 }}>
              <StatusBadge status="All good" />
              <Typography variant="b2" weight="medium" className="mt-2">
                ✓ Guideline selected: {state.selectedProfile.brand_name}
              </Typography>
            </div>
          )}

          <div className="nav-footer">
            <Button
              buttonLabel="Back"
              color="Blue"
              type="Ghost"
              size="Large"
              onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
            />
            <Button
              buttonLabel="Create project"
              color="Blue"
              type="Default"
              size="Large"
              state={state.selectedProfile ? 'Normal' : 'Deactivated'}
              onClick={() => state.selectedProfile && createProject(state.selectedProfile)}
            />
          </div>
        </>
      )}

      {/* ── Upload & extract branch ── */}
      {mode === 'new' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 16 }}>
            <div>
              <Typography variant="b2" weight="medium" as="p" style={{ marginBottom: 6 }}>
                Brand guideline document (PDF, DOCX, or image)
              </Typography>
              <label className="file-drop" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <input
                  type="file"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={e => setGuidelineFile(e.target.files?.[0] ?? null)}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 24 }}>☁</span>
                <span>
                  {guidelineFile
                    ? guidelineFile.name
                    : 'Drag and drop file here · PDF, DOCX, PNG, JPG'}
                </span>
                <Button buttonLabel="Browse files" color="Blue" type="Ghost" size="Small" onClick={() => {}} />
              </label>
            </div>
            <InputField
              label="Brand name hint"
              placeholder="e.g. McDonald's"
              value={brandHint}
              onChange={setBrandHint}
              size="Large"
            />
          </div>

          {extractError && (
            <pre style={{
              color: '#dc2626', fontSize: 12, background: '#fef2f2',
              border: '1px solid #fecaca', borderRadius: 6, padding: '8px 12px',
              whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              maxHeight: 200, overflowY: 'auto', marginTop: 8,
            }}>
              {extractError}
            </pre>
          )}

          {extractCost !== null && (
            <Typography variant="b2" color="muted" as="p">
              Estimated cost: ~${extractCost.toFixed(4)} USD
            </Typography>
          )}

          <Button
            buttonLabel={extracting ? 'Extracting…' : 'Extract Typography Rules'}
            color="Blue"
            type="Default"
            size="Large"
            state={guidelineFile && !extracting ? 'Normal' : 'Deactivated'}
            onClick={handleExtract}
          />

          {extractedProfile && (
            <div style={{ marginTop: 24 }}>
              <Typography variant="h6" weight="bold">
                Extracted: {extractedProfile.brand_name}
              </Typography>
              <Typography variant="b2" color="muted" as="p">
                {extractedProfile.fonts.length} font rules · {extractedProfile.dont_rules.length} don&apos;ts · {extractedProfile.general_rules.length} general rules
              </Typography>
              <div style={{ marginTop: 12 }}>
                <Button
                  buttonLabel="View details"
                  color="Blue"
                  type="Ghost"
                  size="Small"
                  onClick={() => setDetailProfile(extractedProfile)}
                />
              </div>
              <div className="nav-footer">
                <Button
                  buttonLabel="Save Guideline & Create Project"
                  color="Blue"
                  type="Default"
                  size="Large"
                  onClick={() => createProject(extractedProfile)}
                />
              </div>
            </div>
          )}

          {!extractedProfile && (
            <div className="nav-footer">
              <Button
                buttonLabel="Back"
                color="Blue"
                type="Ghost"
                size="Large"
                onClick={() => dispatch({ type: 'SET_STEP', step: 3 })}
              />
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {detailProfile && (
        <GuidelineDetailModal
          profile={detailProfile}
          onClose={() => setDetailProfile(null)}
        />
      )}
    </div>
  )
}
