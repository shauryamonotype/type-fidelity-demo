// @ts-nocheck
import { useState, useRef, useEffect, useCallback, useMemo, type CSSProperties } from 'react'
import { InputField, Button } from '../index'
import './DatePicker.css'

// ─── Inline SVG icons ─────────────────────────────────────────────────────────

function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">
      <rect x="1.5" y="2.5" width="13" height="11" rx="1.5"/>
      <path d="M1.5 6.5h13M5 1v3M11 1v3"/>
    </svg>
  )
}

// ─── Types ────────────────────────────────────────────────────────────────────

type CalPhase = 'hidden' | 'visible' | 'exiting'
type CalView  = 'days' | 'months' | 'years'
type PickStep = 'start' | 'end'

export interface DateRange {
  start: Date
  end:   Date
}

interface DatePickerBase {
  label?:        string
  required?:     boolean
  placeholder?:  string
  onBlur?:       () => void
  onFocus?:      () => void
  error?:        boolean
  errorMessage?: string
  helperText?:   string
  size?:         'Large' | 'Medium'
  disabled?:     boolean
  className?:    string
}

export interface SingleDatePickerProps extends DatePickerBase {
  mode?:     'single'
  trigger?:  'input' | 'icon'
  value?:    Date | null
  onChange?: (date: Date | null) => void
}

export interface RangeDatePickerProps extends DatePickerBase {
  mode:      'range'
  value?:    DateRange | null
  onChange?: (range: DateRange | null) => void
  minDate?:  Date
  maxDate?:  Date
}

export type DatePickerProps = SingleDatePickerProps | RangeDatePickerProps

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

const MONTH_ABBR: Record<string, number> = {
  jan:0, feb:1, mar:2, apr:3, may:4, jun:5,
  jul:6, aug:7, sep:8, oct:9, nov:10, dec:11,
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  )
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatRange(start: Date, end: Date): string {
  if (start.getFullYear() === end.getFullYear()) {
    const s = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const e = end.toLocaleDateString('en-US',   { month: 'short', day: 'numeric', year: 'numeric' })
    return `${s} – ${e}`
  }
  return `${formatDate(start)} – ${formatDate(end)}`
}

function getCalendarDays(year: number, month: number): (Date | null)[] {
  const firstDayOfWeek = new Date(year, month, 1).getDay()
  const daysInMonth    = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDayOfWeek; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

// ─── Natural language constants & helpers ─────────────────────────────────────

const FULL_MONTHS  = ['january','february','march','april','may','june','july','august','september','october','november','december']
const SHORT_MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec']
const WEEKDAYS     = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday']

// Worded quantities → numeric values
const WORD_NUMS: Record<string, number> = {
  'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'eleven': 11, 'twelve': 12,
  'a couple': 2, 'a couple of': 2, 'a few': 3,
}

// Ordinal words → day numbers
const ORDINAL_WORDS: Record<string, number> = {
  'first': 1, 'second': 2, 'third': 3, 'fourth': 4, 'fifth': 5,
  'sixth': 6, 'seventh': 7, 'eighth': 8, 'ninth': 9, 'tenth': 10,
  'eleventh': 11, 'twelfth': 12, 'thirteenth': 13, 'fourteenth': 14,
  'fifteenth': 15, 'sixteenth': 16, 'seventeenth': 17, 'eighteenth': 18,
  'nineteenth': 19, 'twentieth': 20, 'twenty-first': 21, 'twenty-second': 22,
  'twenty-third': 23, 'twenty-fourth': 24, 'twenty-fifth': 25,
  'twenty-sixth': 26, 'twenty-seventh': 27, 'twenty-eighth': 28,
  'twenty-ninth': 29, 'thirtieth': 30, 'thirty-first': 31,
}

function stripOrdinal(s: string): string {
  return s.replace(/(\d+)(?:st|nd|rd|th)\b/gi, '$1')
}

/** Resolve a word or digit string to a number. Returns null if not parseable. */
function parseQty(s: string): number | null {
  const lo = s.toLowerCase().trim()
  if (lo in WORD_NUMS) return WORD_NUMS[lo]
  const n = parseInt(lo)
  return isNaN(n) ? null : n
}

/** Return 0-based month index from any full or abbreviated month name. */
function monthIdx(name: string): number {
  const lo = name.toLowerCase()
  const fi = FULL_MONTHS.indexOf(lo)
  if (fi !== -1) return fi
  return SHORT_MONTHS.indexOf(lo.slice(0, 3))
}

// ─── Single-date natural language parser ──────────────────────────────────────

function parseNaturalDate(input: string): Date | null {
  const raw = input.trim()
  if (!raw) return null

  // Normalise: strip leading "the", ordinal suffixes, "a fortnight" → "2 weeks"
  const n = stripOrdinal(raw.toLowerCase())
    .replace(/^the\s+/, '')
    .replace(/\ba fortnight\b/g, '2 weeks')
    .trim()

  const today = startOfDay(new Date())
  const y = today.getFullYear()
  const mo = today.getMonth()
  const d = today.getDate()

  // ── Anchors ──────────────────────────────────────────────────────────────
  if (n === 'today' || n === 'now') return new Date(today)
  if (n === 'tomorrow')             { const t = new Date(today); t.setDate(d + 1); return t }
  if (n === 'yesterday')            { const t = new Date(today); t.setDate(d - 1); return t }
  if (n === 'day after tomorrow')   { const t = new Date(today); t.setDate(d + 2); return t }
  if (n === 'day before yesterday') { const t = new Date(today); t.setDate(d - 2); return t }

  // ── End / start of periods ────────────────────────────────────────────────
  if (/^end of (?:the )?month$/.test(n))                   return new Date(y, mo + 1, 0)
  if (/^end of next month$/.test(n))                       return new Date(y, mo + 2, 0)
  if (/^end of last month$/.test(n))                       return new Date(y, mo, 0)
  if (/^end of (?:the )?year$/.test(n))                    return new Date(y, 11, 31)
  if (/^end of next year$/.test(n))                        return new Date(y + 1, 11, 31)
  if (/^(?:beginning|start) of (?:the )?month$/.test(n))   return new Date(y, mo, 1)
  if (/^(?:beginning|start) of next month$/.test(n))       return new Date(y, mo + 1, 1)
  if (/^(?:beginning|start) of last month$/.test(n))       return new Date(y, mo - 1, 1)
  if (/^(?:beginning|start) of (?:the )?year$/.test(n))    return new Date(y, 0, 1)
  if (/^(?:beginning|start) of next year$/.test(n))        return new Date(y + 1, 0, 1)

  // first/last day of [period]
  const flDay = n.match(/^(first|last) day of (.+)$/)
  if (flDay) {
    const [, which, period] = flDay
    const isFirst = which === 'first'
    if (/^(?:this )?month$/.test(period))   return isFirst ? new Date(y, mo, 1)     : new Date(y, mo + 1, 0)
    if (/^next month$/.test(period))        return isFirst ? new Date(y, mo + 1, 1) : new Date(y, mo + 2, 0)
    if (/^last month$/.test(period))        return isFirst ? new Date(y, mo - 1, 1) : new Date(y, mo, 0)
    if (/^(?:this )?year$/.test(period))    return isFirst ? new Date(y, 0, 1)      : new Date(y, 11, 31)
    if (/^next year$/.test(period))         return isFirst ? new Date(y + 1, 0, 1)  : new Date(y + 1, 11, 31)
    const mi = monthIdx(period)
    if (mi !== -1) return isFirst ? new Date(y, mi, 1) : new Date(y, mi + 1, 0)
  }

  // ── mid [month] ───────────────────────────────────────────────────────────
  const midM = n.match(/^mid(?:-|\s+(?:of\s+)?)?(.+)$/)
  if (midM) {
    const period = midM[1].trim()
    if (/^(?:this )?month$/.test(period))  return new Date(y, mo, 15)
    if (/^next month$/.test(period))       return new Date(y, mo + 1, 15)
    if (/^last month$/.test(period))       return new Date(y, mo - 1, 15)
    const mi = monthIdx(period)
    if (mi !== -1) return new Date(y, mi, 15)
  }

  // ── Weekday references ────────────────────────────────────────────────────
  if (n === 'next week') { const t = new Date(today); t.setDate(d + 7);  return t }
  if (n === 'last week') { const t = new Date(today); t.setDate(d - 7); return t }

  const relDay = n.match(/^(next|this|last)\s+(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/)
  if (relDay) {
    const [, rel, day] = relDay
    const target = WEEKDAYS.indexOf(day)
    const t = new Date(today)
    let diff = target - t.getDay()
    if (rel === 'next') { if (diff <= 0) diff += 7 }
    if (rel === 'this') { if (diff < 0)  diff += 7 }
    if (rel === 'last') { diff = diff <= 0 ? diff : diff - 7; if (diff === 0) diff = -7 }
    t.setDate(d + diff)
    return t
  }

  // bare weekday → next occurrence
  const bareDay = n.match(/^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)$/)
  if (bareDay) {
    const target = WEEKDAYS.indexOf(bareDay[1])
    const t = new Date(today)
    let diff = target - t.getDay()
    if (diff <= 0) diff += 7
    t.setDate(d + diff)
    return t
  }

  // ── Relative offsets — "in N units", "N units from now/today", "N units ago" ──

  const inUnit = n.match(/^in\s+(.+?)\s+(days?|weeks?|months?|years?)$/)
  if (inUnit) {
    const qty = parseQty(inUnit[1])
    if (qty !== null) {
      const t = new Date(today); const u = inUnit[2]
      if (u.startsWith('day'))   t.setDate(d + qty)
      if (u.startsWith('week'))  t.setDate(d + qty * 7)
      if (u.startsWith('month')) t.setMonth(mo + qty)
      if (u.startsWith('year'))  t.setFullYear(y + qty)
      return t
    }
  }

  const fromNow = n.match(/^(.+?)\s+(days?|weeks?|months?|years?)\s+from\s+(?:now|today)$/)
  if (fromNow) {
    const qty = parseQty(fromNow[1])
    if (qty !== null) {
      const t = new Date(today); const u = fromNow[2]
      if (u.startsWith('day'))   t.setDate(d + qty)
      if (u.startsWith('week'))  t.setDate(d + qty * 7)
      if (u.startsWith('month')) t.setMonth(mo + qty)
      if (u.startsWith('year'))  t.setFullYear(y + qty)
      return t
    }
  }

  const agoUnit = n.match(/^(.+?)\s+(days?|weeks?|months?|years?)\s+ago$/)
  if (agoUnit) {
    const qty = parseQty(agoUnit[1])
    if (qty !== null) {
      const t = new Date(today); const u = agoUnit[2]
      if (u.startsWith('day'))   t.setDate(d - qty)
      if (u.startsWith('week'))  t.setDate(d - qty * 7)
      if (u.startsWith('month')) t.setMonth(mo - qty)
      if (u.startsWith('year'))  t.setFullYear(y - qty)
      return t
    }
  }

  // N units before/after [date]
  const beforeAfter = n.match(/^(.+?)\s+(days?|weeks?|months?)\s+(before|after)\s+(.+)$/)
  if (beforeAfter) {
    const qty = parseQty(beforeAfter[1])
    const ref = parseNaturalDate(beforeAfter[4])
    if (qty !== null && ref) {
      const t = new Date(ref); const u = beforeAfter[2]
      const sign = beforeAfter[3] === 'before' ? -1 : 1
      if (u.startsWith('day'))   t.setDate(t.getDate() + sign * qty)
      if (u.startsWith('week'))  t.setDate(t.getDate() + sign * qty * 7)
      if (u.startsWith('month')) t.setMonth(t.getMonth() + sign * qty)
      return t
    }
  }

  // ── Ordinal word expressions — "fifteenth of March", "the 21st of June" ──
  const ordinalOf = n.match(/^(\S+)\s+of\s+(.+)$/)
  if (ordinalOf) {
    const dayNum = ORDINAL_WORDS[ordinalOf[1]]
    if (dayNum !== undefined) {
      // "fifteenth of March" / "fifteenth of next month" etc.
      if (/^(?:this )?month$/.test(ordinalOf[2]))  return new Date(y, mo, dayNum)
      if (/^next month$/.test(ordinalOf[2]))        return new Date(y, mo + 1, dayNum)
      const mi = monthIdx(ordinalOf[2])
      if (mi !== -1) return new Date(y, mi, dayNum)
    }
  }

  // ── [Month] [Day] variants ────────────────────────────────────────────────
  // "[Month] [Nth]" or "[Month] [Nth], [Year]"
  const mD = n.match(/^([a-z]+)\s+(\d{1,2})(?:,?\s*(\d{4}))?$/)
  if (mD) {
    const mi   = monthIdx(mD[1])
    const day  = parseInt(mD[2])
    const year = mD[3] ? parseInt(mD[3]) : y
    if (mi !== -1 && day >= 1 && day <= 31) return new Date(year, mi, day)
  }

  // "[Nth] [Month]" or "[Nth] [Month] [Year]"
  const dM = n.match(/^(\d{1,2})\s+([a-z]+)(?:,?\s*(\d{4}))?$/)
  if (dM) {
    const mi   = monthIdx(dM[2])
    const day  = parseInt(dM[1])
    const year = dM[3] ? parseInt(dM[3]) : y
    if (mi !== -1 && day >= 1 && day <= 31) return new Date(year, mi, day)
  }

  // "[Month] [Year]" — bare month + year → 1st of that month
  const mY = n.match(/^([a-z]+)\s+(\d{4})$/)
  if (mY) {
    const mi = monthIdx(mY[1])
    if (mi !== -1) return new Date(parseInt(mY[2]), mi, 1)
  }

  // "in [Month]" or bare month name → 1st of that month (next occurrence)
  const inOrBareMonth = n.match(/^(?:in\s+)?([a-z]+)$/)
  if (inOrBareMonth) {
    const mi = monthIdx(inOrBareMonth[1])
    if (mi !== -1) {
      const targetYear = mi < mo ? y + 1 : y
      return new Date(targetYear, mi, 1)
    }
  }

  // ── Bare day number → day of current month ────────────────────────────────
  const bareNum = n.match(/^(\d{1,2})$/)
  if (bareNum) {
    const day = parseInt(bareNum[1])
    if (day >= 1 && day <= 31) return new Date(y, mo, day)
  }

  // ── Numeric date formats ──────────────────────────────────────────────────
  const iso = n.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (iso) return new Date(parseInt(iso[1]), parseInt(iso[2]) - 1, parseInt(iso[3]))

  const dot = n.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/)
  if (dot) return new Date(parseInt(dot[3]), parseInt(dot[2]) - 1, parseInt(dot[1]))

  const slash = n.match(/^(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?$/)
  if (slash) {
    const smo  = parseInt(slash[1]) - 1
    const day  = parseInt(slash[2])
    let   year = slash[3] ? parseInt(slash[3]) : y
    if (year < 100) year += year < 50 ? 2000 : 1900
    if (smo >= 0 && smo <= 11 && day >= 1 && day <= 31) return new Date(year, smo, day)
  }

  return null
}

// ─── Range natural language parser ────────────────────────────────────────────

/** Used by the range parser — tries NL first, falls back to native Date(). */
function parseSingleDate(raw: string): Date | null {
  const nl = parseNaturalDate(raw)
  if (nl) return nl
  const native = new Date(raw.trim())
  return isNaN(native.getTime()) ? null : startOfDay(native)
}

function parseNaturalRange(input: string): DateRange | null {
  const normalized = input.trim()
    .replace(/^(?:for\s+the\s+|for\s+|the\s+|over\s+the\s+|in\s+the\s+)/i, '')
    .replace(/\ba fortnight\b/g, '2 weeks')
    .trim()
  const lc  = normalized.toLowerCase()
  const now = startOfDay(new Date())
  const y   = now.getFullYear()
  const m   = now.getMonth()

  // ── this/next/last [week / month / year / quarter] ────────────────────────
  const weekMatch = /^(this|next|last)\s+week$/.exec(lc)
  if (weekMatch) {
    const dow = now.getDay()
    const ws  = (offset: number) => { const t = new Date(now); t.setDate(now.getDate() + offset - dow); return startOfDay(t) }
    if (weekMatch[1] === 'this') return { start: ws(0),  end: ws(6)  }
    if (weekMatch[1] === 'next') return { start: ws(7),  end: ws(13) }
    /* last */                   return { start: ws(-7), end: ws(-1) }
  }

  const monthMatch = /^(this|next|last)\s+month$/.exec(lc)
  if (monthMatch) {
    if (monthMatch[1] === 'this') return { start: new Date(y, m,     1), end: new Date(y, m + 1, 0) }
    if (monthMatch[1] === 'next') return { start: new Date(y, m + 1, 1), end: new Date(y, m + 2, 0) }
    /* last */                    return { start: new Date(y, m - 1, 1), end: new Date(y, m,     0) }
  }

  const yearMatch = /^(this|next|last)\s+year$/.exec(lc)
  if (yearMatch) {
    const ry = yearMatch[1] === 'last' ? y - 1 : yearMatch[1] === 'next' ? y + 1 : y
    return { start: new Date(ry, 0, 1), end: new Date(ry, 11, 31) }
  }

  const quarterRel = /^(this|next|last)\s+quarter$/.exec(lc)
  if (quarterRel) {
    const cq = Math.floor(m / 3)
    let q: number, qy: number
    if (quarterRel[1] === 'this') { q = cq; qy = y }
    else if (quarterRel[1] === 'next') { q = (cq + 1) % 4; qy = cq === 3 ? y + 1 : y }
    else                               { q = (cq + 3) % 4; qy = cq === 0 ? y - 1 : y }
    return { start: new Date(qy, q * 3, 1), end: new Date(qy, q * 3 + 3, 0) }
  }

  // ── Q1–Q4 [year] ──────────────────────────────────────────────────────────
  const quarter = /^q([1-4])(?:\s+(\d{4}))?$/.exec(lc)
  if (quarter) {
    const q  = parseInt(quarter[1]) - 1
    const qy = quarter[2] ? parseInt(quarter[2]) : y
    return { start: new Date(qy, q * 3, 1), end: new Date(qy, q * 3 + 3, 0) }
  }

  // ── H1 / H2 [year] ────────────────────────────────────────────────────────
  const half = /^h([12])(?:\s+(\d{4}))?$/.exec(lc)
  if (half) {
    const hy = half[2] ? parseInt(half[2]) : y
    return half[1] === '1'
      ? { start: new Date(hy, 0, 1), end: new Date(hy, 5, 30) }
      : { start: new Date(hy, 6, 1), end: new Date(hy, 11, 31) }
  }

  // ── Bare 4-digit year → whole year ────────────────────────────────────────
  const bareYear = /^(\d{4})$/.exec(lc)
  if (bareYear) {
    const ry = parseInt(bareYear[1])
    return { start: new Date(ry, 0, 1), end: new Date(ry, 11, 31) }
  }

  // ── next / last N [units] — supports word quantities ──────────────────────
  const nextN = /^next\s+(.+?)\s+(days?|weeks?|months?|years?)$/.exec(lc)
  if (nextN) {
    const qty = parseQty(nextN[1])
    if (qty !== null) {
      const u = nextN[2]
      let end: Date
      if      (u.startsWith('day'))   end = new Date(y, m, now.getDate() + qty)
      else if (u.startsWith('week'))  end = new Date(y, m, now.getDate() + qty * 7)
      else if (u.startsWith('month')) end = new Date(y, m + qty, now.getDate())
      else                            end = new Date(y + qty, m, now.getDate())
      return { start: now, end: startOfDay(end) }
    }
  }

  const lastN = /^(?:last|past)\s+(.+?)\s+(days?|weeks?|months?|years?)$/.exec(lc)
  if (lastN) {
    const qty = parseQty(lastN[1])
    if (qty !== null) {
      const u = lastN[2]
      let start: Date
      if      (u.startsWith('day'))   start = new Date(y, m, now.getDate() - qty)
      else if (u.startsWith('week'))  start = new Date(y, m, now.getDate() - qty * 7)
      else if (u.startsWith('month')) start = new Date(y, m - qty, now.getDate())
      else                            start = new Date(y - qty, m, now.getDate())
      return { start: startOfDay(start), end: now }
    }
  }

  // ── within N [units] → today → today + N ─────────────────────────────────
  const withinN = /^within\s+(?:the\s+)?(?:next\s+)?(.+?)\s+(days?|weeks?|months?)$/.exec(lc)
  if (withinN) {
    const qty = parseQty(withinN[1])
    if (qty !== null) {
      const u = withinN[2]
      let end: Date
      if      (u.startsWith('day'))   end = new Date(y, m, now.getDate() + qty)
      else if (u.startsWith('week'))  end = new Date(y, m, now.getDate() + qty * 7)
      else                            end = new Date(y, m + qty, now.getDate())
      return { start: now, end: startOfDay(end) }
    }
  }

  // ── Month-to-month: "Jan to Feb" / "January to February [year]" ──────────
  const monToMon = /^([a-z]+)\s+to\s+([a-z]+)(?:\s+(\d{4}))?$/.exec(lc)
  if (monToMon) {
    const m1 = MONTH_ABBR[monToMon[1].slice(0, 3)]
    const m2 = MONTH_ABBR[monToMon[2].slice(0, 3)]
    if (m1 !== undefined && m2 !== undefined) {
      const ry = monToMon[3] ? parseInt(monToMon[3]) : y
      return { start: new Date(ry, m1, 1), end: new Date(ry, m2 + 1, 0) }
    }
  }

  // "in [Month]" or bare month name → whole month
  const inOrBareMonthRange = /^(?:in\s+|month of\s+)?([a-z]+)(?:\s+(\d{4}))?$/.exec(lc)
  if (inOrBareMonthRange) {
    const mi = MONTH_ABBR[inOrBareMonthRange[1].slice(0, 3)]
    if (mi !== undefined) {
      const ry = inOrBareMonthRange[2] ? parseInt(inOrBareMonthRange[2]) : y
      return { start: new Date(ry, mi, 1), end: new Date(ry, mi + 1, 0) }
    }
  }

  // ── Explicit ranges: [date] to / through / until / – [date] ──────────────
  const toSep = /^(.+?)\s+(?:to|through|thru|until|till)\s+(.+)$/i.exec(normalized)
  if (toSep) {
    const d1 = parseSingleDate(toSep[1])
    const d2 = parseSingleDate(toSep[2])
    if (d1 && d2) return d1 <= d2 ? { start: d1, end: d2 } : { start: d2, end: d1 }
  }

  const dashSep = /^(.+?)\s*[–—-]+\s*(.+)$/i.exec(normalized)
  if (dashSep) {
    const d1 = parseSingleDate(dashSep[1])
    const d2 = parseSingleDate(dashSep[2])
    if (d1 && d2) return d1 <= d2 ? { start: d1, end: d2 } : { start: d2, end: d1 }
  }

  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DatePicker(props: DatePickerProps) {
  const isRange = props.mode === 'range'

  const {
    label        = isRange ? 'Date range' : 'Date',
    required     = false,
    placeholder  = isRange ? "e.g. 'last 30 days', 'Q2', 'Mar to Jun'" : "e.g. 'next Monday', 'in two weeks', 'Mar 15'",
    onBlur,
    onFocus,
    error        = false,
    errorMessage = isRange ? 'Please select a date range' : 'Please select a date',
    helperText,
    size         = 'Large',
    disabled     = false,
    className    = '',
  } = props

  const trigger  = !isRange ? ((props as SingleDatePickerProps).trigger ?? 'input') : 'input'
  const minDate  =  isRange ? (props as RangeDatePickerProps).minDate : undefined
  const maxDate  =  isRange ? (props as RangeDatePickerProps).maxDate : undefined

  const controlledSingle = !isRange ? (props.value as Date       | null | undefined) : undefined
  const controlledRange  =  isRange ? (props.value as DateRange  | null | undefined) : undefined
  const onChangeSingle   = !isRange ? (props.onChange as ((d: Date      | null) => void) | undefined) : undefined
  const onChangeRange    =  isRange ? (props.onChange as ((r: DateRange | null) => void) | undefined) : undefined

  // ── Single-mode state ───────────────────────────────────────────────────────
  const [inputValue,   setInputValue]   = useState(controlledSingle ? formatDate(controlledSingle) : '')
  const [selectedDate, setSelectedDate] = useState<Date | null>(controlledSingle ?? null)
  const [parsedDate,   setParsedDate]   = useState<Date | null>(null)
  const [focusedDay,   setFocusedDay]   = useState<Date | null>(null)

  // ── Range-mode state ────────────────────────────────────────────────────────
  const [confirmedRange, setConfirmedRange] = useState<DateRange | null>(controlledRange ?? null)
  const [rangeStart,     setRangeStart]     = useState<Date | null>(controlledRange?.start ?? null)
  const [rangeEnd,       setRangeEnd]       = useState<Date | null>(controlledRange?.end   ?? null)
  const [inputText,      setInputText]      = useState(() =>
    controlledRange ? formatRange(controlledRange.start, controlledRange.end) : ''
  )
  const [hoverDay,  setHoverDay]  = useState<Date | null>(null)
  const [pickStep,  setPickStep]  = useState<PickStep>('start')

  // ── Shared calendar state ───────────────────────────────────────────────────
  const [calPhase,  setCalPhase]  = useState<CalPhase>('hidden')
  const [calView,   setCalView]   = useState<CalView>('days')
  const [yearPage,  setYearPage]  = useState(() => Math.floor(new Date().getFullYear() / 12) * 12)
  const [viewMonth, setViewMonth] = useState(() =>
    isRange ? (controlledRange?.start ?? new Date()) : (controlledSingle ?? new Date())
  )
  const [navDir,    setNavDir]    = useState<'prev' | 'next' | 'view-up' | 'view-down'>('view-down')
  const [gridPhase, setGridPhase] = useState<'idle' | 'exiting'>('idle')
  const [gridKey,   setGridKey]   = useState(0)

  // ── Refs ────────────────────────────────────────────────────────────────────
  const containerRef      = useRef<HTMLDivElement>(null)
  const calTimerRef       = useRef<ReturnType<typeof setTimeout>>()
  const gridTimerRef      = useRef<ReturnType<typeof setTimeout>>()
  const focusedDayRef     = useRef<Date | null>(null)
  const parsedDateRef     = useRef<Date | null>(null)
  const selectedRef       = useRef<Date | null>(null)
  const inputValueRef     = useRef('')
  const calPhaseRef       = useRef<CalPhase>(calPhase)
  const rangeStartRef     = useRef<Date | null>(null)
  const confirmedRangeRef = useRef<DateRange | null>(null)

  focusedDayRef.current     = focusedDay
  parsedDateRef.current     = parsedDate
  selectedRef.current       = selectedDate
  inputValueRef.current     = inputValue
  calPhaseRef.current       = calPhase
  rangeStartRef.current     = rangeStart
  confirmedRangeRef.current = confirmedRange

  // ── Min/max (must be defined before callbacks that reference them) ───────────
  const today   = useMemo(() => startOfDay(new Date()), [])
  const minDay  = useMemo(() => (minDate ? startOfDay(minDate) : null), [minDate])
  const maxDay  = useMemo(() => (maxDate ? startOfDay(maxDate) : null), [maxDate])
  const calDays = useMemo(
    () => getCalendarDays(viewMonth.getFullYear(), viewMonth.getMonth()),
    [viewMonth]
  )

  // ── Sync controlled values ──────────────────────────────────────────────────
  useEffect(() => {
    if (!isRange && controlledSingle !== undefined) {
      setSelectedDate(controlledSingle)
      setInputValue(controlledSingle ? formatDate(controlledSingle) : '')
    }
  }, [isRange, controlledSingle])

  useEffect(() => {
    if (isRange && controlledRange !== undefined) {
      setConfirmedRange(controlledRange)
      setRangeStart(controlledRange?.start ?? null)
      setRangeEnd(controlledRange?.end     ?? null)
      setInputText(controlledRange ? formatRange(controlledRange.start, controlledRange.end) : '')
    }
  }, [isRange, controlledRange])

  // ── Calendar open/close ─────────────────────────────────────────────────────
  const closeCalendar = useCallback(() => {
    if (calPhaseRef.current !== 'visible') return
    clearTimeout(calTimerRef.current)
    setCalPhase('exiting')
    calTimerRef.current = setTimeout(() => {
      setCalPhase('hidden')
      setFocusedDay(null)
      setHoverDay(null)
    }, 200)
  }, [])

  const openCalendar = useCallback(() => {
    clearTimeout(calTimerRef.current)
    setFocusedDay(null)
    setCalView('days')
    setCalPhase('visible')
  }, [])

  // ── Single mode: confirm a date ─────────────────────────────────────────────
  const confirmDate = useCallback((date: Date) => {
    const clean = startOfDay(date)
    setSelectedDate(clean)
    setInputValue(formatDate(clean))
    setParsedDate(null)
    onChangeSingle?.(clean)
    closeCalendar()
  }, [onChangeSingle, closeCalendar])

  // ── Range mode: day click ───────────────────────────────────────────────────
  const handleDayClickRange = useCallback((day: Date) => {
    const clean = startOfDay(day)
    if (minDay && clean < minDay) return
    if (maxDay && clean > maxDay) return

    if (pickStep === 'start') {
      setRangeStart(clean)
      setRangeEnd(null)
      setPickStep('end')
    } else {
      const start = rangeStartRef.current!
      const [s, e] = clean < start ? [clean, start] : [start, clean]
      const range: DateRange = { start: s, end: e }
      setRangeStart(s)
      setRangeEnd(e)
      setConfirmedRange(range)
      setInputText(formatRange(s, e))
      setPickStep('start')
      setHoverDay(null)
      onChangeRange?.(range)
      closeCalendar()
    }
  }, [pickStep, minDay, maxDay, onChangeRange, closeCalendar])

  // ── Input handlers ──────────────────────────────────────────────────────────
  const handleInputChange = (val: string) => {
    setInputValue(val)
    if (!val) {
      setSelectedDate(null); setParsedDate(null); onChangeSingle?.(null); return
    }
    const parsed = parseNaturalDate(val)
    setParsedDate(parsed)
    if (parsed) { setViewMonth(new Date(parsed.getFullYear(), parsed.getMonth(), 1)); setFocusedDay(null) }
  }

  const handleSubmit = () => {
    const dateToConfirm = focusedDayRef.current ?? parsedDateRef.current
    if (dateToConfirm) confirmDate(dateToConfirm)
    else closeCalendar()
  }

  const handleRangeInputChange = (val: string) => {
    setInputText(val)
    if (!val.trim()) {
      setRangeStart(null); setRangeEnd(null); setConfirmedRange(null); onChangeRange?.(null); return
    }
    const parsed = parseNaturalRange(val)
    if (parsed) { setRangeStart(parsed.start); setRangeEnd(parsed.end); setViewMonth(parsed.start) }
  }

  const handleRangeSubmit = () => {
    const parsed = parseNaturalRange(inputText)
    if (!parsed) return
    setConfirmedRange(parsed)
    setRangeStart(parsed.start); setRangeEnd(parsed.end)
    setPickStep('start')
    setInputText(formatRange(parsed.start, parsed.end))
    onChangeRange?.(parsed)
    closeCalendar()
  }

  // ── Focus / blur ────────────────────────────────────────────────────────────
  const handleFocus = () => {
    if (disabled) return
    if (isRange) {
      setViewMonth(confirmedRangeRef.current?.start ?? new Date())
      setRangeStart(confirmedRangeRef.current?.start ?? null)
      setRangeEnd(confirmedRangeRef.current?.end     ?? null)
      setPickStep('start')
    } else {
      const base = parsedDateRef.current ?? selectedRef.current ?? new Date()
      setViewMonth(startOfDay(new Date(base.getFullYear(), base.getMonth(), 1)))
    }
    openCalendar()
    onFocus?.()
  }

  const handleBlur = () => {
    setTimeout(() => {
      if (containerRef.current?.contains(document.activeElement)) return
      if (isRange) {
        const cr = confirmedRangeRef.current
        setRangeStart(cr?.start ?? null); setRangeEnd(cr?.end ?? null)
        setInputText(cr ? formatRange(cr.start, cr.end) : '')
        setPickStep('start')
      } else {
        if (!parsedDateRef.current && inputValueRef.current !== '') {
          setInputValue(selectedRef.current ? formatDate(selectedRef.current) : '')
        }
      }
      closeCalendar()
      onBlur?.()
    }, 150)
  }

  // ── Icon trigger (single mode only) ────────────────────────────────────────
  const handleIconClick = () => {
    if (disabled) return
    if (calPhase !== 'hidden') { closeCalendar() } else { setParsedDate(null); openCalendar(); onFocus?.() }
  }

  const handleIconClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedDate(null)
    setInputValue('')
    onChangeSingle?.(null)
    closeCalendar()
  }

  // ── Keyboard ────────────────────────────────────────────────────────────────
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (calPhase !== 'visible') return
    if (e.key === 'Escape') {
      e.preventDefault()
      if (isRange) {
        const cr = confirmedRangeRef.current
        setRangeStart(cr?.start ?? null); setRangeEnd(cr?.end ?? null)
        setInputText(cr ? formatRange(cr.start, cr.end) : '')
        setPickStep('start')
      } else {
        setInputValue(selectedRef.current ? formatDate(selectedRef.current) : '')
        setParsedDate(null)
      }
      closeCalendar(); return
    }
    if (!isRange && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
      e.preventDefault()
      const base = new Date(focusedDayRef.current ?? parsedDateRef.current ?? viewMonth)
      const next = new Date(base)
      if (e.key === 'ArrowRight') next.setDate(next.getDate() + 1)
      if (e.key === 'ArrowLeft')  next.setDate(next.getDate() - 1)
      if (e.key === 'ArrowDown')  next.setDate(next.getDate() + 7)
      if (e.key === 'ArrowUp')    next.setDate(next.getDate() - 7)
      setFocusedDay(next)
      setViewMonth(new Date(next.getFullYear(), next.getMonth(), 1))
    }
  }

  // ── Click outside ───────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return
      if (calPhase === 'visible') {
        if (isRange) {
          const cr = confirmedRangeRef.current
          setRangeStart(cr?.start ?? null); setRangeEnd(cr?.end ?? null)
          setInputText(cr ? formatRange(cr.start, cr.end) : '')
          setPickStep('start')
        } else {
          if (!parsedDateRef.current) setInputValue(selectedRef.current ? formatDate(selectedRef.current) : '')
        }
        closeCalendar()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [calPhase, isRange, closeCalendar])

  // ── Nav animations ──────────────────────────────────────────────────────────
  const animateNav = (dir: 'prev' | 'next' | 'view-up' | 'view-down', update: () => void) => {
    clearTimeout(gridTimerRef.current)
    setNavDir(dir)
    setGridPhase('exiting')
    gridTimerRef.current = setTimeout(() => { update(); setGridKey(k => k + 1); setGridPhase('idle') }, 150)
  }

  const prevAction = () => {
    const view = calView
    animateNav('prev', () => {
      if (view === 'days')   setViewMonth(v => new Date(v.getFullYear(), v.getMonth() - 1, 1))
      if (view === 'months') setViewMonth(v => new Date(v.getFullYear() - 1, v.getMonth(), 1))
      if (view === 'years')  setYearPage(p => p - 12)
    })
  }
  const nextAction = () => {
    const view = calView
    animateNav('next', () => {
      if (view === 'days')   setViewMonth(v => new Date(v.getFullYear(), v.getMonth() + 1, 1))
      if (view === 'months') setViewMonth(v => new Date(v.getFullYear() + 1, v.getMonth(), 1))
      if (view === 'years')  setYearPage(p => p + 12)
    })
  }

  // ── Derived display state ───────────────────────────────────────────────────
  const activeDay = !isRange ? (focusedDay ?? parsedDate ?? (calPhase !== 'hidden' ? selectedDate : null)) : null

  const effectiveEnd = isRange
    ? (pickStep === 'end' ? (hoverDay ?? rangeEnd) : rangeEnd)
    : null

  const [dispStart, dispEnd] = (() => {
    if (!rangeStart || !effectiveEnd) return [rangeStart, effectiveEnd]
    return rangeStart <= effectiveEnd ? [rangeStart, effectiveEnd] : [effectiveEnd, rangeStart]
  })()

  // ── Calendar popover ────────────────────────────────────────────────────────
  const calendarEl = calPhase !== 'hidden' ? (
    <div
      className={[
        'date-picker__calendar',
        calPhase === 'exiting' ? 'date-picker__calendar--out' : 'date-picker__calendar--in',
      ].join(' ')}
      onMouseDown={e => e.preventDefault()}
      role="dialog"
      aria-label={isRange ? 'Date range picker calendar' : 'Date picker calendar'}
    >
      {/* Header */}
      <div className="date-picker__header">
        <Button showButtonLabel={false} showLeftIco leftIcon={<ChevronLeft />} color="Dark grey" type="Text" size="Small" onClick={prevAction} />
        <div className="date-picker__header-labels">
          {calView === 'years' ? (
            <span className="date-picker__year-range-label">{yearPage} – {yearPage + 11}</span>
          ) : (
            <>
              <Button color="Dark grey" type="Text" size="Small" buttonLabel={MONTH_NAMES[viewMonth.getMonth()]} onClick={() => animateNav('view-up', () => setCalView('months'))} />
              <Button color="Dark grey" type="Text" size="Small" buttonLabel={String(viewMonth.getFullYear())} onClick={() => { const yr = viewMonth.getFullYear(); animateNav('view-up', () => { setYearPage(Math.floor(yr / 12) * 12); setCalView('years') }) }} />
            </>
          )}
        </div>
        <Button showButtonLabel={false} showRightIco rightIcon={<ChevronRight />} color="Dark grey" type="Text" size="Small" onClick={nextAction} />
      </div>

      {/* Animated grid */}
      <div
        key={gridKey}
        className={['date-picker__grid-area', gridPhase === 'exiting' ? `date-picker__grid-area--exit-${navDir}` : ''].filter(Boolean).join(' ')}
        data-enter={gridPhase !== 'exiting' ? (navDir === 'prev' ? 'left' : navDir === 'next' ? 'right' : 'fade') : undefined}
      >
        {calView === 'months' && (
          <div className="date-picker__month-grid">
            {MONTH_NAMES.map((name, i) => (
              <Button key={name} color={i === viewMonth.getMonth() ? 'Blue' : 'Dark grey'} type={i === viewMonth.getMonth() ? 'Default' : 'Text'} size="Small" buttonLabel={name.slice(0, 3)} onClick={() => { const yr = viewMonth.getFullYear(); animateNav('view-down', () => { setViewMonth(new Date(yr, i, 1)); setCalView('days') }) }} />
            ))}
          </div>
        )}

        {calView === 'years' && (
          <div className="date-picker__year-grid">
            {Array.from({ length: 12 }, (_, i) => yearPage + i).map(year => (
              <Button key={year} color={year === viewMonth.getFullYear() ? 'Blue' : 'Dark grey'} type={year === viewMonth.getFullYear() ? 'Default' : 'Text'} size="Small" buttonLabel={String(year)} onClick={() => { const mo = viewMonth.getMonth(); animateNav('view-down', () => { setViewMonth(new Date(year, mo, 1)); setYearPage(Math.floor(year / 12) * 12); setCalView('months') }) }} />
            ))}
          </div>
        )}

        {calView === 'days' && (
          <div className="date-picker__weekdays" aria-hidden="true">
            {DAY_LABELS.map(d => <span key={d} className="date-picker__weekday">{d}</span>)}
          </div>
        )}

        {calView === 'days' && (() => {
          const rows: (Date | null)[][] = []
          for (let i = 0; i < calDays.length; i += 7) rows.push(calDays.slice(i, i + 7))
          return (
            <div className="date-picker__day-rows" role="grid" onMouseLeave={isRange ? () => setHoverDay(null) : undefined}>
              {rows.map((row, ri) => (
                <div key={ri} className="date-picker__day-row" role="row" style={{ '--dp-row-delay': `${ri * 22}ms` } as CSSProperties}>
                  {row.map((day, ci) => {
                    if (!day) return <span key={`pad-${ri}-${ci}`} className="date-picker__day-pad" aria-hidden="true" />

                    if (isRange) {
                      const dayNorm    = startOfDay(day)
                      const isDisabled = (minDay !== null && dayNorm < minDay) || (maxDay !== null && dayNorm > maxDay)
                      const isStart    = dispStart ? isSameDay(day, dispStart) : false
                      const isEnd      = dispEnd   ? isSameDay(day, dispEnd)   : false
                      const isInRange  = Boolean(dispStart && dispEnd && day > dispStart && day < dispEnd)
                      const isSingle   = isStart && isEnd
                      const isMarker   = !isDisabled && (isSingle || isStart || isEnd)
                      const cellCls = [
                        'date-picker__day-cell',
                        !isSingle && isStart                                             ? 'date-picker__day-cell--start'     : '',
                        !isSingle && isEnd                                               ? 'date-picker__day-cell--end'       : '',
                        isInRange                                                        ? 'date-picker__day-cell--in-range'  : '',
                        (isInRange || (!isSingle && isEnd))   && ci === 0               ? 'date-picker__day-cell--row-start' : '',
                        (isInRange || (!isSingle && isStart)) && ci === row.length - 1  ? 'date-picker__day-cell--row-end'   : '',
                      ].filter(Boolean).join(' ')
                      return (
                        <span key={day.toISOString()} className={cellCls} onMouseEnter={() => { if (!isDisabled) setHoverDay(day) }}>
                          <Button
                            color={isDisabled ? 'Dark grey' : isMarker ? 'Blue' : isInRange ? 'Blue' : isSameDay(day, today) ? 'Light grey' : 'Dark grey'}
                            type={isDisabled  ? 'Text'      : isMarker ? 'Default' : isInRange ? 'Text' : isSameDay(day, today) ? 'Ghost' : 'Text'}
                            size="Small"
                            buttonLabel={String(day.getDate())}
                            onClick={() => handleDayClickRange(day)}
                            className="date-picker__day-btn"
                            disabled={isDisabled}
                          />
                        </span>
                      )
                    }

                    // Single mode
                    const isToday       = isSameDay(day, today)
                    const isActive      = activeDay ? isSameDay(day, activeDay) : false
                    const isSelected    = selectedDate ? isSameDay(day, selectedDate) : false
                    const isHighlighted = isActive || isSelected
                    return (
                      <Button
                        key={day.toISOString()}
                        color={isHighlighted ? 'Blue' : (isToday ? 'Light grey' : 'Dark grey')}
                        type={isHighlighted ? 'Default' : (isToday ? 'Ghost' : 'Text')}
                        size="Small"
                        buttonLabel={String(day.getDate())}
                        onClick={() => confirmDate(day)}
                        className="date-picker__day-btn"
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          )
        })()}
      </div>
    </div>
  ) : null

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className={['date-picker', trigger === 'icon' ? 'date-picker--icon' : '', className].filter(Boolean).join(' ')}
      onKeyDown={handleKeyDown}
    >
      {trigger === 'icon' ? (
        <button
          className={[
            'date-picker__icon-btn',
            selectedDate ? 'date-picker__icon-btn--has-date' : '',
            disabled    ? 'date-picker__icon-btn--disabled'  : '',
          ].filter(Boolean).join(' ')}
          onClick={handleIconClick}
          disabled={disabled}
          type="button"
          aria-label={selectedDate ? `Selected: ${formatDate(selectedDate)}` : 'Pick a date'}
          aria-expanded={calPhase !== 'hidden'}
          aria-haspopup="dialog"
        >
          <CalendarIcon />
          {selectedDate && !disabled && (
            <span className="date-picker__icon-clear" onClick={handleIconClear} aria-label="Clear date">×</span>
          )}
          {selectedDate && (
            <span className="date-picker__icon-tooltip" role="tooltip">
              {formatDate(selectedDate)}
            </span>
          )}
        </button>
      ) : (
        <InputField
          label={label}
          required={required}
          placeholder={placeholder}
          value={isRange ? inputText : inputValue}
          onChange={isRange ? handleRangeInputChange : handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onSubmit={isRange ? handleRangeSubmit : handleSubmit}
          error={isRange ? (error && !confirmedRange) : error}
          errorMessage={errorMessage}
          helperText={helperText}
          size={size}
          disabled={disabled}
        />
      )}
      {calendarEl}
    </div>
  )
}
