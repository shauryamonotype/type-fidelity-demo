import type { BrandProfile, ProfileSummary, AuditResponse } from '../store/wizard'

// Small GET requests go through the Vite proxy (/api → localhost:8080).
// File uploads bypass the proxy and hit the backend directly — Vite's proxy
// buffers the entire request body before forwarding and chokes on large files.
const PROXY_BASE = '/api'
const DIRECT_BASE = `${import.meta.env.VITE_API_BASE ?? 'http://localhost:8080'}/api`

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function listProfiles(): Promise<ProfileSummary[]> {
  const res = await fetch(`${PROXY_BASE}/profiles`)
  if (!res.ok) throw new Error(`Failed to list profiles: ${res.statusText}`)
  return res.json()
}

export async function getProfile(slug: string): Promise<BrandProfile> {
  const res = await fetch(`${PROXY_BASE}/profiles/${slug}`)
  if (!res.ok) throw new Error(`Profile '${slug}' not found`)
  return res.json()
}

// ─── Extract guideline ────────────────────────────────────────────────────────

export interface ExtractResult {
  brand_name: string
  fonts: BrandProfile['fonts']
  dont_rules: string[]
  general_rules: string[]
  llm_cost?: { estimated_usd: number; input_tokens: number; output_tokens: number; models: string[] } | null
}

async function readError(res: Response): Promise<string> {
  const text = await res.text()
  if (!text) return `HTTP ${res.status} ${res.statusText}`
  try {
    const json = JSON.parse(text)
    return json.detail ?? json.message ?? text
  } catch {
    return text
  }
}

export async function extractGuideline(
  file: File,
  brandName: string,
): Promise<ExtractResult> {
  const form = new FormData()
  form.append('file', file)
  form.append('brand_name', brandName)
  // Use direct backend URL to bypass Vite proxy body-size limit
  const res = await fetch(`${DIRECT_BASE}/extract`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(await readError(res))

  const data = await res.json()
  const raw = data._raw ?? data
  return {
    brand_name: data.brand_name ?? raw.brand_name ?? brandName,
    fonts: raw.fonts ?? [],
    dont_rules: raw.dont_rules ?? [],
    general_rules: raw.general_rules ?? [],
    llm_cost: data.llm_cost ?? null,
  }
}

// ─── Audit ───────────────────────────────────────────────────────────────────

export async function runAudit(
  file: File,
  profile: BrandProfile,
  modes: string,
): Promise<AuditResponse> {
  const form = new FormData()
  form.append('file', file)
  form.append('profile', JSON.stringify(profile))
  form.append('modes', modes)
  const res = await fetch(`${DIRECT_BASE}/audit`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(await readError(res))
  return res.json()
}

// ─── Fix ─────────────────────────────────────────────────────────────────────

export async function applyFixes(
  file: File,
  violations: AuditResponse['violations'],
): Promise<Blob> {
  const form = new FormData()
  form.append('file', file)
  form.append('violations', JSON.stringify(violations))
  const res = await fetch(`${DIRECT_BASE}/fix`, { method: 'POST', body: form })
  if (!res.ok) throw new Error(await readError(res))
  return res.blob()
}
