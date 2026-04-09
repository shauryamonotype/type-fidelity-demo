// ─── Antiqua Design System — Component Exports ────────────────────────────────
//
// Import from here in any layout:
//   import { InputField, Button } from '../components'
//
// All animations, states and interactions are bundled with each component.
// ──────────────────────────────────────────────────────────────────────────────

export { InputField }   from './InputField/InputField'
export type { InputFieldProps } from './InputField/InputField'

export { Button }       from './Button/Button'
export type { ButtonProps, ButtonColor, ButtonSize, ButtonType, ButtonState } from './Button/Button'


export { Modal } from './Modal/Modal'
export type { ModalProps, ModalConfig } from './Modal/Modal'

export { Table, UserCell, KebabMenu } from './Table/Table'
export type { TableProps, UserCellProps, UserRowStatus } from './Table/Table'

// Standalone StatusBadge — superset of the legacy version; supports 10 statuses
export { StatusBadge } from './StatusBadge/StatusBadge'
export type { StatusBadgeProps, StatusValue } from './StatusBadge/StatusBadge'

// Table primitives (bottom-up: Cell → Row → Header → Table)
export { TableCell } from './TableCell/TableCell'
export type {
  TableCellProps,
  TextCellProps,
  UserCellProps as TableUserCellProps,
  StatusCellProps,
  EditableCellProps,
  DropdownCellProps,
  ActionCellProps,
  CellState,
} from './TableCell/TableCell'

export { TableRow, TableRowCell } from './TableRow/TableRow'
export type { TableRowProps, TableRowCellProps } from './TableRow/TableRow'

export { TableHeaderCell } from './TableHeaderCell/TableHeaderCell'
export type { TableHeaderCellProps, SortState } from './TableHeaderCell/TableHeaderCell'

export { Pagination } from './Pagination/Pagination'
export type { PaginationProps } from './Pagination/Pagination'

export { Menu, MenuSection } from './Menu/Menu'
export type { MenuProps, MenuItemDef, MenuSectionDef, MenuItemVariant } from './Menu/Menu'

export { MenuItem } from './MenuItem/MenuItem'
export type { MenuItemProps } from './MenuItem/MenuItem'

export { Typography } from './Typography/Typography'
export type { TypographyProps, TypographyVariant, TypographyWeight, TypographyAlign } from './Typography/Typography'

export { Dropdown } from './Dropdown/Dropdown'
export type { DropdownProps, DropdownOption, DropdownSize, DropdownVariant } from './Dropdown/Dropdown'

export { Checkbox } from './Checkbox/Checkbox'
export type { CheckboxProps, CheckboxChecked } from './Checkbox/Checkbox'

export { DatePicker } from './DatePicker/DatePicker'
export type { DatePickerProps, SingleDatePickerProps, RangeDatePickerProps, DateRange } from './DatePicker/DatePicker'

export { CheckmarkIcon, CloseIcon, TailArrowIcon, ChevronIcon, MyInventoryIcon, ProductionFontsIcon, FontLicensingIcon, DashboardIcon, FontsForReviewIcon, ImportedFontsIcon, FiltersIcon, GuidelinesIcon, SearchIcon, AnalyticsIcon, TeamsUsersIcon, NotificationIcon, ProjectIcon, DiscoverFontsIcon, AddToProjectIcon, SettingsIcon, WarningIcon, AddIcon, MinusIcon, TeamsAndUsersIcon } from './icons'
export type { CheckmarkIconProps, CloseIconProps, TailArrowIconProps, ArrowDirection, IconSize, ChevronIconProps, ChevronDirection, MyInventoryIconProps, ProductionFontsIconProps, FontLicensingIconProps, DashboardIconProps, FontsForReviewIconProps, ImportedFontsIconProps, FiltersIconProps, GuidelinesIconProps, SearchIconProps, AnalyticsIconProps, TeamsUsersIconProps, NotificationIconProps, ProjectIconProps, DiscoverFontsIconProps, AddToProjectIconProps, SettingsIconProps, WarningIconProps, AddIconProps, AddIconStyle, MinusIconProps, MinusIconStyle, TeamsAndUsersIconProps, TeamsAndUsersIconType } from './icons'

export { SearchBox } from './SearchBox/SearchBox'
export type { SearchBoxProps } from './SearchBox/SearchBox'

export { KeyboardShortcut } from './KeyboardShortcut/KeyboardShortcut'
export type { KeyboardShortcutProps } from './KeyboardShortcut/KeyboardShortcut'

export { Tag } from './Tag/Tag'
export type { TagProps } from './Tag/Tag'

export { TagInput } from './TagInput/TagInput'
export type { TagInputProps } from './TagInput/TagInput'

export { Tooltip } from './Tooltip/Tooltip'
export type { TooltipProps } from './Tooltip/Tooltip'

export { Toggle } from './Toggle/Toggle'
export type { ToggleProps } from './Toggle/Toggle'
