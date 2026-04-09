import React from 'react'
import figma from '@figma/code-connect'
import { DiscoverFontsIcon } from './DiscoverFontsIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22072-14'

figma.connect(DiscoverFontsIcon, BASE, { variant: { Size: '16px' }, example: () => <DiscoverFontsIcon size={16} /> })
figma.connect(DiscoverFontsIcon, BASE, { variant: { Size: '20px' }, example: () => <DiscoverFontsIcon size={20} /> })
figma.connect(DiscoverFontsIcon, BASE, { variant: { Size: '24px' }, example: () => <DiscoverFontsIcon size={24} /> })
