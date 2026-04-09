import figma from '@figma/code-connect'
import { Toggle } from './Toggle'

const FIGMA_URL =
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2280-10'

// ── Off ────────────────────────────────────────────────────────────────────
figma.connect(Toggle, FIGMA_URL, {
  variant: { state: 'Off' },
  props: {
    size: figma.enum('size', { Large: 'Large', Small: 'Small' }),
  },
  example: ({ size }) => (
    <Toggle state="off" size={size} onChange={() => {}} />
  ),
})

// ── On — permanent (blue) ──────────────────────────────────────────────────
figma.connect(Toggle, FIGMA_URL, {
  variant: { state: 'Permanent', type: 'Enabled' },
  props: {
    size: figma.enum('size', { Large: 'Large', Small: 'Small' }),
  },
  example: ({ size }) => (
    <Toggle state="on" type="permanent" size={size} onChange={() => {}} />
  ),
})

// ── On — temporary (yellow) ────────────────────────────────────────────────
figma.connect(Toggle, FIGMA_URL, {
  variant: { state: 'Temporary', type: 'Enabled' },
  props: {
    size: figma.enum('size', { Large: 'Large', Small: 'Small' }),
  },
  example: ({ size }) => (
    <Toggle state="on" type="temporary" size={size} onChange={() => {}} />
  ),
})

// ── Partial — permanent (system-driven, blue) ──────────────────────────────
figma.connect(Toggle, FIGMA_URL, {
  variant: { state: 'Partial Permanent', type: 'Enabled' },
  props: {
    size: figma.enum('size', { Large: 'Large', Small: 'Small' }),
  },
  example: ({ size }) => (
    <Toggle state="partial" type="permanent" size={size} onChange={() => {}} />
  ),
})

// ── Partial — temporary (system-driven, yellow) ────────────────────────────
figma.connect(Toggle, FIGMA_URL, {
  variant: { state: 'Partial Temporary', type: 'Enabled' },
  props: {
    size: figma.enum('size', { Large: 'Large', Small: 'Small' }),
  },
  example: ({ size }) => (
    <Toggle state="partial" type="temporary" size={size} onChange={() => {}} />
  ),
})

// ── Disabled ───────────────────────────────────────────────────────────────
figma.connect(Toggle, FIGMA_URL, {
  variant: { type: 'Disabled' },
  props: {
    size: figma.enum('size', { Large: 'Large', Small: 'Small' }),
  },
  example: ({ size }) => (
    <Toggle state="off" size={size} disabled onChange={() => {}} />
  ),
})
