// @ts-nocheck
import React from 'react'
import { Button } from '../Button/Button'
import { Dropdown } from '../Dropdown/Dropdown'
import { InputField } from '../InputField/InputField'
import { UserCell, KebabMenu } from '../Table/Table'
import { StatusBadge } from '../StatusBadge/StatusBadge'
import type { StatusValue } from '../StatusBadge/StatusBadge'
import type { DropdownOption } from '../Dropdown/Dropdown'
import './TableCell.css'

// ─── Types ────────────────────────────────────────────────────────────────────

export type CellState = 'default' | 'loading' | 'error' | 'disabled'

export type TableCellType = 'text' | 'user' | 'status' | 'action' | 'dropdown' | 'editable'

export interface SecondaryAction {
  label:    string
  variant?: 'default' | 'danger'
  onClick:  () => void
}

export interface TextCellProps {
  type:         'text'
  text?:        string
  description?: string
  state?:       CellState
}

export interface UserCellProps {
  type:        'user'
  name:        string
  email?:      string
  avatarUrl?:  string
  initials?:   string
  isNew?:      boolean
  badge?:      string
  state?:      CellState
}

export interface StatusCellProps {
  type:   'status'
  status: StatusValue
  state?: CellState
}

export interface ActionCellProps {
  type:              'action'
  primaryLabel:      string
  onPrimaryAction:   () => void
  secondaryActions?: SecondaryAction[]
  state?:            CellState
}

export interface DropdownCellProps {
  type:      'dropdown'
  options:   DropdownOption[]
  value?:    string | string[]
  onChange?: (value: string) => void
  disabled?: boolean
  error?:    boolean
  state?:    CellState
}

export interface EditableCellProps {
  type:         'editable'
  value?:       string
  onChange?:    (value: string) => void
  onCommit?:    () => void
  onDiscard?:   () => void
  placeholder?: string
  error?:       boolean
  state?:       CellState
}

export type TableCellProps =
  | TextCellProps
  | UserCellProps
  | StatusCellProps
  | ActionCellProps
  | DropdownCellProps
  | EditableCellProps

// ─── Skeleton helpers ─────────────────────────────────────────────────────────

function SkeletonBar({ width, height = 16 }: { width?: number | string; height?: number }) {
  return (
    <div
      className="tc-skeleton-bar"
      style={{
        width:  width !== undefined ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: `${height}px`,
      }}
    />
  )
}

function SkeletonCircle({ size = 36 }: { size?: number }) {
  return <div className="tc-skeleton-circle" style={{ width: size, height: size }} />
}

// ─── TableCell ────────────────────────────────────────────────────────────────

export function TableCell(props: TableCellProps) {
  const isLoading = props.state === 'loading'

  switch (props.type) {

    case 'text':
      if (isLoading) {
        return (
          <div className="tc tc--text">
            <div className="table-cell__text">
              <SkeletonBar width={64} />
              <SkeletonBar width={118} />
            </div>
          </div>
        )
      }
      return (
        <div className="tc tc--text">
          <div className="table-cell__text">
            {props.text        && <span className="table-cell__text-primary">{props.text}</span>}
            {props.description && <span className="table-cell__text-secondary">{props.description}</span>}
          </div>
        </div>
      )

    case 'user':
      if (isLoading) {
        return (
          <div className="tc tc--user">
            <SkeletonCircle size={36} />
            <div className="tc-skeleton-text-block">
              <div className="tc-skeleton-row">
                <SkeletonBar width={64} />
                <SkeletonBar width={40} />
              </div>
              <SkeletonBar width="100%" />
            </div>
          </div>
        )
      }
      return (
        <div className="tc tc--user">
          <div className="tc__user-fill">
            <UserCell
              name={props.name}
              email={props.email ?? ''}
              avatarUrl={props.avatarUrl}
              initials={props.initials}
              isNew={props.isNew}
            />
          </div>
          {props.badge && (
            <span className="tc__badge">{props.badge}</span>
          )}
        </div>
      )

    case 'status':
      if (isLoading) {
        return (
          <div className="tc tc--status">
            <SkeletonBar width={56} />
          </div>
        )
      }
      return (
        <div className="tc tc--status">
          <StatusBadge status={props.status} />
        </div>
      )

    case 'action':
      if (isLoading) {
        return (
          <div className="tc tc--action">
            <SkeletonBar width={48} />
            <SkeletonBar width={24} />
          </div>
        )
      }
      return (
        <div className="tc tc--action">
          <Button
            buttonLabel={props.primaryLabel}
            showButtonLabel
            color="Blue"
            size="Small"
            type="Text"
            state="Normal"
            onClick={props.onPrimaryAction}
          />
          {props.secondaryActions && props.secondaryActions.length > 0 && (
            <KebabMenu />
          )}
        </div>
      )

    case 'dropdown': {
      const isDisabled = props.disabled || props.state === 'disabled'
      const isError    = props.error    || props.state === 'error'
      if (isLoading) {
        return (
          <div className="tc tc--dropdown tc--loading">
            <SkeletonBar width="100%" />
          </div>
        )
      }
      return (
        <div className="tc tc--dropdown">
          <Dropdown
            variant="cell"
            options={props.options}
            value={props.value}
            onChange={props.onChange}
            disabled={isDisabled}
            error={isError}
          />
        </div>
      )
    }

    case 'editable': {
      const isError    = props.error || props.state === 'error'
      const isDisabled = props.state === 'disabled'
      if (isLoading) {
        return (
          <div className="tc tc--editable tc--loading">
            <SkeletonBar width="100%" />
          </div>
        )
      }
      return (
        <div
          className="tc tc--editable"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault();
              (e.target as HTMLElement).blur()
            } else if (e.key === 'Escape') {
              e.preventDefault();
              props.onDiscard?.();
              (e.target as HTMLElement).blur()
            }
          }}
        >
          <InputField
            label=""
            required={false}
            placeholder={props.placeholder}
            value={props.value ?? ''}
            onChange={props.onChange}
            onSubmit={props.onCommit}
            error={isError}
            disabled={isDisabled}
            size="Medium"
          />
        </div>
      )
    }
  }
}
