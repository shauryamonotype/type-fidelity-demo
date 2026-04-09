import { useEffect, useRef, useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import { InputField } from '../../components/InputField/InputField'
import { StatusBadge } from '../../components/StatusBadge/StatusBadge'
import { Toggle } from '../../components/Toggle/Toggle'
import type { WizardState, WizardAction, BrandProfile, ProfileSummary, FontRule } from '../../store/wizard'
import { listProfiles, getProfile, extractGuideline } from '../../api/client'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

// ─── Inline extracted rules panel ────────────────────────────────────────────

function ExtractedRulesPanel({
  profile,
  selectedKeys,
  onToggle,
  onAddAll,
}: {
  profile: BrandProfile
  selectedKeys: Set<string>
  onToggle: (key: string) => void
  onAddAll: () => void
}) {
  const allAdded = profile.fonts.length > 0 &&
    profile.fonts.every((f, i) => selectedKeys.has(`${f.font_name}::${i}`))

  return (
    <div style={{ marginTop: 24 }}>
      <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', marginBottom: 20 }} />

      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <StatusBadge status="All good" />
          <Typography variant="h6" weight="bold">{profile.brand_name}</Typography>
          <Typography variant="b2" color="muted">
            — {profile.fonts.length} fonts · {profile.dont_rules.length} don&apos;ts · {profile.general_rules.length} general rules
          </Typography>
        </div>
        <Button
          buttonLabel={allAdded ? '✓ All added' : 'Add all to project'}
          color="Blue"
          type={allAdded ? 'Default' : 'Ghost'}
          size="Medium"
          onClick={onAddAll}
        />
      </div>

      {/* Font rules table */}
      {profile.fonts.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Typography variant="b2" weight="bold" style={{ marginBottom: 10 }}>Font rules</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {profile.fonts.map((f: FontRule, i: number) => {
              const key = `${f.font_name}::${i}`
              const added = selectedKeys.has(key)
              return (
                <div
                  key={key}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr auto auto auto auto',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    border: `1px solid ${added ? '#2563eb' : '#e5e7eb'}`,
                    background: added ? '#eff6ff' : '#fafafa',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  <div>
                    <Typography variant="b2" weight="medium">{f.font_name}</Typography>
                    {f.usage && <Typography variant="m1" color="muted">{f.usage}</Typography>}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    {f.font_guidelines && (
                      <span title={f.font_guidelines} style={{
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {f.font_guidelines}
                      </span>
                    )}
                  </div>
                  <Pill label={f.weight} />
                  <Pill label={f.size} />
                  <Pill label={f.casing} />
                  <Button
                    buttonLabel={added ? '✓ Added' : 'Add to project'}
                    color="Blue"
                    type={added ? 'Default' : 'Ghost'}
                    size="Small"
                    onClick={() => onToggle(key)}
                  />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Don't rules */}
      {profile.dont_rules.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <Typography variant="b2" weight="bold" style={{ marginBottom: 8 }}>Don&apos;t rules</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {profile.dont_rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', padding: '4px 0' }}>
                <span style={{ flexShrink: 0 }}>🚫</span>
                <span>{typeof r === 'string' ? r : (r as { rule: string }).rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General rules */}
      {profile.general_rules.length > 0 && (
        <div>
          <Typography variant="b2" weight="bold" style={{ marginBottom: 8 }}>General rules</Typography>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {profile.general_rules.map((r, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 13, color: '#374151', padding: '4px 0' }}>
                <span style={{ flexShrink: 0 }}>📐</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function Pill({ label }: { label?: string }) {
  if (!label) return <span />
  return (
    <span style={{
      fontSize: 11, color: '#6b7280', background: '#f3f4f6',
      padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────

export function Step2Guidelines({ state, dispatch }: Props) {
  const [mode, setMode] = useState<'existing' | 'new'>('existing')
  const [profiles, setProfiles] = useState<ProfileSummary[]>([])
  const [loadingProfiles, setLoadingProfiles] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const [guidelineFile, setGuidelineFile] = useState<File | null>(null)
  const [brandHint, setBrandHint] = useState('')
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState('')
  const [extractedProfile, setExtractedProfile] = useState<BrandProfile | null>(null)
  const [extractCost, setExtractCost] = useState<number | null>(null)
  const [selectedFontKeys, setSelectedFontKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (mode !== 'existing') return
    setLoadingProfiles(true)
    listProfiles()
      .then(setProfiles)
      .catch(() => {})
      .finally(() => setLoadingProfiles(false))
  }, [mode])

  function toggleFont(key: string) {
    setSelectedFontKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  function addAllFonts() {
    if (!extractedProfile) return
    const allKeys = new Set(extractedProfile.fonts.map((f, i) => `${f.font_name}::${i}`))
    setSelectedFontKeys(allKeys)
  }

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
    setExtractedProfile(null)
    setSelectedFontKeys(new Set())
    try {
      const result = await extractGuideline(guidelineFile, brandHint)
      const prof: BrandProfile = {
        brand_name: result.brand_name,
        fonts: result.fonts,
        dont_rules: result.dont_rules,
        general_rules: result.general_rules,
      }
      setExtractedProfile(prof)
      if (result.llm_cost?.estimated_usd) setExtractCost(result.llm_cost.estimated_usd)
    } catch (e: unknown) {
      setExtractError(e instanceof Error ? e.message : String(e))
    } finally {
      setExtracting(false)
    }
  }

  function createProjectFromExtracted() {
    if (!extractedProfile) return
    const selectedFonts = extractedProfile.fonts.filter((f, i) =>
      selectedFontKeys.has(`${f.font_name}::${i}`)
    )
    const profileToUse: BrandProfile = { ...extractedProfile, fonts: selectedFonts }
    dispatch({ type: 'SET_FIELD', field: 'selectedProfile', value: profileToUse })
    dispatch({ type: 'SET_VIEW', view: 'audit' })
  }

  return (
    <div>
      <Typography variant="h5" weight="bold">Brand Guidelines</Typography>
      <Typography variant="b2" color="secondary" as="p" style={{ marginTop: 6, marginBottom: 20 }}>
        Link a brand guideline to enable compliance auditing.
      </Typography>

      {/* Mode toggle */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Typography variant="b2" color={mode === 'existing' ? 'primary' : 'muted'}>Use existing</Typography>
        <Toggle
          state={mode === 'new' ? 'on' : 'off'}
          onChange={v => setMode(v === 'on' ? 'new' : 'existing')}
          size="Small"
        />
        <Typography variant="b2" color={mode === 'new' ? 'primary' : 'muted'}>Upload & extract new</Typography>
      </div>

      {/* ── Existing ── */}
      {mode === 'existing' && (
        <>
          {loadingProfiles && <Typography variant="b2" color="muted">Loading guidelines…</Typography>}
          {!loadingProfiles && profiles.length === 0 && (
            <Typography variant="b2" color="muted">No saved guidelines found.</Typography>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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
                      buttonLabel={isSelected ? '✓ Selected' : 'Select'}
                      color="Blue"
                      type={isSelected ? 'Default' : 'Ghost'}
                      size="Medium"
                      onClick={() => selectProfile(p.slug)}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {state.selectedProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
              <StatusBadge status="All good" />
              <Typography variant="b2" weight="medium">{state.selectedProfile.brand_name} selected</Typography>
            </div>
          )}

          <div className="nav-footer">
            <Button buttonLabel="Back" color="Blue" type="Ghost" size="Large"
              onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} />
            <Button
              buttonLabel="Create project"
              color="Blue" type="Default" size="Large"
              state={state.selectedProfile ? 'Normal' : 'Deactivated'}
              onClick={() => state.selectedProfile && dispatch({ type: 'SET_VIEW', view: 'audit' })}
            />
          </div>
        </>
      )}

      {/* ── Upload & extract ── */}
      {mode === 'new' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <Typography variant="b2" weight="medium" as="p" style={{ marginBottom: 6 }}>
                Brand guideline document (PDF, DOCX, or image)
              </Typography>
              <div
                className="file-drop"
                style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                onClick={() => fileRef.current?.click()}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.png,.jpg,.jpeg"
                  onChange={e => {
                    setGuidelineFile(e.target.files?.[0] ?? null)
                    setExtractedProfile(null)
                    setExtractError('')
                  }}
                  style={{ display: 'none' }}
                />
                <span style={{ fontSize: 22 }}>☁</span>
                <Typography variant="b2" color={guidelineFile ? 'primary' : 'muted'}>
                  {guidelineFile ? guidelineFile.name : 'Click to browse · PDF, DOCX, PNG, JPG'}
                </Typography>
              </div>
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
              maxHeight: 160, overflowY: 'auto', marginBottom: 12,
            }}>
              {extractError}
            </pre>
          )}

          {extractCost !== null && (
            <Typography variant="m1" color="muted" as="p" style={{ marginBottom: 8 }}>
              Extraction cost: ~${extractCost.toFixed(4)} USD
            </Typography>
          )}

          <Button
            buttonLabel={extracting ? 'Extracting…' : 'Extract Typography Rules'}
            color="Blue" type="Default" size="Large"
            state={guidelineFile && !extracting ? 'Normal' : 'Deactivated'}
            onClick={handleExtract}
          />

          {/* Inline extracted rules + font selection */}
          {extractedProfile && (
            <>
              <ExtractedRulesPanel
                profile={extractedProfile}
                selectedKeys={selectedFontKeys}
                onToggle={toggleFont}
                onAddAll={addAllFonts}
              />
              <div className="nav-footer">
                <Button buttonLabel="Back" color="Blue" type="Ghost" size="Large"
                  onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} />
                <Button
                  buttonLabel="Create project & start audit"
                  color="Blue" type="Default" size="Large"
                  onClick={createProjectFromExtracted}
                />
              </div>
            </>
          )}

          {!extractedProfile && (
            <div className="nav-footer">
              <Button buttonLabel="Back" color="Blue" type="Ghost" size="Large"
                onClick={() => dispatch({ type: 'SET_STEP', step: 1 })} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
