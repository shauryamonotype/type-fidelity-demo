// @ts-nocheck
import { useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import { Button } from '../../components/Button/Button'
import { Tag } from '../../components/Tag/Tag'
import { InputField } from '../../components/InputField/InputField'
import type { WizardState, WizardAction } from '../../store/wizard'
import { FONT_INVENTORY } from '../../store/fontInventory'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

function FontCard({
  fontKey,
  onRemove,
}: {
  fontKey: string
  onRemove: () => void
}) {
  const entry = FONT_INVENTORY[fontKey]
  if (!entry) return null
  const [varIdx, setVarIdx] = useState(0)
  const variants = entry.variants
  const curVar = variants[varIdx % variants.length]
  const weight = entry.weightMap[curVar] ?? '400'

  return (
    <div className="font-card">
      <div
        className="font-preview"
        style={{ fontFamily: entry.cssFamily, fontWeight: weight }}
      >
        Art is the highest form of hope.
      </div>

      <div className="font-variant-row">
        <button
          className="variant-nav-btn"
          onClick={() => setVarIdx(i => (i - 1 + variants.length) % variants.length)}
        >
          ‹
        </button>
        <Tag label={curVar} size="Medium" />
        <button
          className="variant-nav-btn"
          onClick={() => setVarIdx(i => (i + 1) % variants.length)}
        >
          ›
        </button>
      </div>

      <div className="font-card-footer">
        <div>
          <Typography variant="b2" weight="bold">{entry.displayName}</Typography>{' '}
          <Typography variant="b2" color="muted">
            {entry.stylesCount} styles · {entry.source}
          </Typography>
        </div>
        <Button
          buttonLabel="— Remove"
          color="Blue"
          type="Text"
          size="Small"
          onClick={onRemove}
        />
      </div>
    </div>
  )
}

export function Step3Fonts({ state, dispatch }: Props) {
  const [search, setSearch] = useState('')

  const projectKeys = Object.keys(state.projectFonts)
  const filtered = search
    ? projectKeys.filter(k =>
        FONT_INVENTORY[k]?.displayName.toLowerCase().includes(search.toLowerCase())
      )
    : projectKeys

  const available = Object.keys(FONT_INVENTORY).filter(k => !(k in state.projectFonts))

  function addFont(key: string) {
    dispatch({ type: 'SET_PROJECT_FONT', fontKey: key, variants: FONT_INVENTORY[key].variants })
  }

  function goNext() {
    dispatch({ type: 'SET_FIELD', field: 'step3Complete', value: true })
    dispatch({ type: 'SET_STEP', step: 4 })
  }

  return (
    <div>
      <Typography variant="h5" weight="bold">Font access settings</Typography>
      <Typography variant="b2" color="secondary" as="p" className="mt-2">
        (Optional) You can ensure that your team only works with a limited set of fonts as per the project.
      </Typography>

      <div style={{ marginTop: 20 }}>
        <InputField
          label=""
          placeholder="Search fonts…"
          value={search}
          onChange={setSearch}
          size="Large"
        />
      </div>

      <div className="font-actions-bar">
        <button className="font-action-link">🔗 Import fonts</button>
        <button className="font-action-link">☰ Import from a list…</button>
        <button className="font-action-link" onClick={() => {
          Object.keys(FONT_INVENTORY).forEach(k => {
            dispatch({ type: 'SET_PROJECT_FONT', fontKey: k, variants: FONT_INVENTORY[k].variants })
          })
        }}>＋ Add all fonts</button>
        <button className="font-action-link">☐ View only the added</button>
        <button className="font-action-link" onClick={() => {
          projectKeys.forEach(k => dispatch({ type: 'REMOVE_PROJECT_FONT', fontKey: k }))
        }}>✕ Clear selection</button>
      </div>

      {filtered.length > 0 ? (
        <div className="font-grid">
          {filtered.map(k => (
            <FontCard
              key={k}
              fontKey={k}
              onRemove={() => dispatch({ type: 'REMOVE_PROJECT_FONT', fontKey: k })}
            />
          ))}
        </div>
      ) : (
        <Typography variant="b2" color="muted" as="p">
          No fonts added to this project yet.
        </Typography>
      )}

      <hr className="divider" />
      <Typography variant="b2" weight="bold">Add a font from inventory</Typography>
      <div className="add-font-grid" style={{ marginTop: 12 }}>
        {available.map(k => (
          <Button
            key={k}
            buttonLabel={FONT_INVENTORY[k].displayName}
            color="Blue"
            type="Ghost"
            size="Small"
            onClick={() => addFont(k)}
          />
        ))}
      </div>

      <div className="nav-footer">
        <Button
          buttonLabel="Back"
          color="Blue"
          type="Ghost"
          size="Large"
          onClick={() => dispatch({ type: 'SET_STEP', step: 2 })}
        />
        <Button
          buttonLabel="Next: Add Guidelines"
          color="Blue"
          type="Default"
          size="Large"
          onClick={goNext}
        />
      </div>
    </div>
  )
}
