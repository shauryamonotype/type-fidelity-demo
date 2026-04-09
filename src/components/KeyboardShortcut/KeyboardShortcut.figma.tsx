import figma from '@figma/code-connect'
import { KeyboardShortcut } from './KeyboardShortcut'

figma.connect(
  KeyboardShortcut,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2222-959',
  {
    example: () => <KeyboardShortcut keys={['⌘', 'C']} />,
  }
)
