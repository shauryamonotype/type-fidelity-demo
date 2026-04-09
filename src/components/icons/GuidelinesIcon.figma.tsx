import React from 'react'
import figma from '@figma/code-connect'
import { GuidelinesIcon } from './GuidelinesIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-54778'

figma.connect(GuidelinesIcon, BASE, { variant: { Size: '16px' }, example: () => <GuidelinesIcon size={16} /> })
figma.connect(GuidelinesIcon, BASE, { variant: { Size: '20px' }, example: () => <GuidelinesIcon size={20} /> })
figma.connect(GuidelinesIcon, BASE, { variant: { Size: '24px' }, example: () => <GuidelinesIcon size={24} /> })
