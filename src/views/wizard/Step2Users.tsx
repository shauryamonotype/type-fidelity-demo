// @ts-nocheck
import { useState } from 'react'
import { Typography } from '../../components/Typography/Typography'
import { InputField } from '../../components/InputField/InputField'
import { Button } from '../../components/Button/Button'
import { Dropdown } from '../../components/Dropdown/Dropdown'
import { UserCell } from '../../components/Table/Table'
import type { WizardState, WizardAction } from '../../store/wizard'

interface Props {
  state: WizardState
  dispatch: React.Dispatch<WizardAction>
}

const ROLE_OPTIONS = [
  { label: 'Admin', value: 'Admin' },
  { label: 'Editor', value: 'Editor' },
  { label: 'Viewer', value: 'Viewer' },
]

const INITIAL_USERS = [
  { name: 'Sarah Chen', email: 'sarah.chen@company.com', role: 'Admin' },
  { name: 'Marcus Lee',  email: 'marcus.lee@company.com',  role: 'Editor' },
  { name: 'Priya Nair',  email: 'priya.nair@company.com',  role: 'Viewer' },
]

export function Step2Users({ state, dispatch }: Props) {
  const [users, setUsers] = useState(INITIAL_USERS)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invited, setInvited] = useState(false)

  function updateRole(name: string, role: string) {
    setUsers(u => u.map(x => x.name === name ? { ...x, role } : x))
  }

  function removeUser(name: string) {
    setUsers(u => u.filter(x => x.name !== name))
  }

  function invite() {
    if (!inviteEmail.trim()) return
    setUsers(u => [...u, { name: inviteEmail, email: inviteEmail, role: 'Viewer' }])
    setInviteEmail('')
    setInvited(true)
    setTimeout(() => setInvited(false), 2000)
  }

  function goNext() {
    dispatch({ type: 'SET_FIELD', field: 'step2Complete', value: true })
    dispatch({ type: 'SET_STEP', step: 3 })
  }

  return (
    <div>
      <Typography variant="h5" weight="bold">Users & teams</Typography>
      <Typography variant="b2" color="secondary" as="p" className="mt-2">
        Invite team members who will have access to this project
      </Typography>

      <div style={{ marginTop: 24 }}>
        {users.map(u => (
          <div key={u.name} className="user-row">
            <UserCell
              name={u.name}
              email={u.email}
              initials={u.name[0]}
            />
            <Dropdown
              options={ROLE_OPTIONS}
              value={u.role}
              onChange={v => updateRole(u.name, v as string)}
              variant="default"
              size="Medium"
            />
            <Button
              buttonLabel="Remove"
              color="Blue"
              type="Ghost"
              size="Small"
              onClick={() => removeUser(u.name)}
            />
          </div>
        ))}
      </div>

      <hr className="divider" />

      <div className="invite-row">
        <div style={{ flex: 1 }}>
          <InputField
            label="Invite by email"
            placeholder="colleague@company.com"
            value={inviteEmail}
            onChange={setInviteEmail}
            size="Large"
            onSubmit={invite}
          />
        </div>
        <Button
          buttonLabel={invited ? 'Sent!' : 'Invite'}
          color="Blue"
          type="Default"
          size="Large"
          onClick={invite}
        />
      </div>

      <div className="nav-footer">
        <Button
          buttonLabel="Back"
          color="Blue"
          type="Ghost"
          size="Large"
          onClick={() => dispatch({ type: 'SET_STEP', step: 1 })}
        />
        <Button
          buttonLabel="Next: Font access"
          color="Blue"
          type="Default"
          size="Large"
          onClick={goNext}
        />
      </div>
    </div>
  )
}
