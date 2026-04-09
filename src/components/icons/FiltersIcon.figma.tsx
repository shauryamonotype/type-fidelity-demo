import React from 'react'
import figma from '@figma/code-connect'
import { FiltersIcon } from './FiltersIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-54752'

figma.connect(FiltersIcon, BASE, { variant: { Size: '16px' }, example: () => <FiltersIcon size={16} /> })
figma.connect(FiltersIcon, BASE, { variant: { Size: '20px' }, example: () => <FiltersIcon size={20} /> })
figma.connect(FiltersIcon, BASE, { variant: { Size: '24px' }, example: () => <FiltersIcon size={24} /> })
