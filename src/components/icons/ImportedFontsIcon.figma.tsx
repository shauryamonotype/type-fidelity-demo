import React from 'react'
import figma from '@figma/code-connect'
import { ImportedFontsIcon } from './ImportedFontsIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-54732'

figma.connect(ImportedFontsIcon, BASE, { variant: { Size: '16px' }, example: () => <ImportedFontsIcon size={16} /> })
figma.connect(ImportedFontsIcon, BASE, { variant: { Size: '20px' }, example: () => <ImportedFontsIcon size={20} /> })
figma.connect(ImportedFontsIcon, BASE, { variant: { Size: '24px' }, example: () => <ImportedFontsIcon size={24} /> })
