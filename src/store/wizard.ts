import { useReducer } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FontRule {
  font_name: string
  usage: string
  size?: string
  weight?: string
  casing?: string
  font_guidelines?: string
}

export interface BrandProfile {
  brand_name: string
  fonts: FontRule[]
  dont_rules: string[]
  general_rules: string[]
}

export interface ProfileSummary {
  slug: string
  brand_name: string
  n_fonts: number
  n_donts: number
  n_general: number
}

export interface AuditViolation {
  id: number
  severity: 'hard' | 'soft' | 'info'
  parameter: string
  actual_value: string
  expected_value: string
  text_preview: string
  slide_number: number
  shape_name: string
  suggestion: string
  auto_fixable: boolean
  rule_source: string
  inferred_role: string
}

export interface AuditResponse {
  total_elements: number
  passing_count: number
  compliance_score: number
  violations: AuditViolation[]
  design_file: string
  date: string
  llm_cost?: {
    input_tokens: number
    output_tokens: number
    models: string[]
    estimated_usd: number
  } | null
}

export interface WizardState {
  step: 1 | 2
  view: 'wizard' | 'audit'
  // Step 1
  projectName: string
  projectDesc: string
  // Step 2
  guidelineMode: 'existing' | 'new'
  selectedProfile: BrandProfile | null
  selectedProfileSlug: string | null
  // Audit
  auditResult: AuditResponse | null
  fixDecisions: Record<number, 'fix' | 'ignore'>
  auditMode: 'rule_based' | 'intelligent'
}

export type WizardAction =
  | { type: 'SET_STEP'; step: 1 | 2 }
  | { type: 'SET_VIEW'; view: 'wizard' | 'audit' }
  | { type: 'SET_FIELD'; field: keyof WizardState; value: unknown }
  | { type: 'SET_FIX_DECISION'; id: number; decision: 'fix' | 'ignore' }
  | { type: 'FIX_ALL'; ids: number[] }
  | { type: 'IGNORE_ALL'; ids: number[] }
  | { type: 'RESET_FIXES' }
  | { type: 'RESET' }

export const INITIAL_STATE: WizardState = {
  step: 1,
  view: 'wizard',
  projectName: '',
  projectDesc: '',
  guidelineMode: 'existing',
  selectedProfile: null,
  selectedProfileSlug: null,
  auditResult: null,
  fixDecisions: {},
  auditMode: 'rule_based',
}

function reducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step }
    case 'SET_VIEW':
      return { ...state, view: action.view }
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_FIX_DECISION':
      return { ...state, fixDecisions: { ...state.fixDecisions, [action.id]: action.decision } }
    case 'FIX_ALL': {
      const d = { ...state.fixDecisions }
      action.ids.forEach(id => { d[id] = 'fix' })
      return { ...state, fixDecisions: d }
    }
    case 'IGNORE_ALL': {
      const d = { ...state.fixDecisions }
      action.ids.forEach(id => { d[id] = 'ignore' })
      return { ...state, fixDecisions: d }
    }
    case 'RESET_FIXES':
      return { ...state, fixDecisions: {} }
    case 'RESET':
      return INITIAL_STATE
    default:
      return state
  }
}

export function useWizard() {
  return useReducer(reducer, INITIAL_STATE)
}
