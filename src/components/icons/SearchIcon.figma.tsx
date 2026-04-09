import React from 'react'
import figma from '@figma/code-connect'
import { SearchIcon } from './SearchIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22262-432'

figma.connect(SearchIcon, BASE, { variant: { Size: '16px' }, example: () => <SearchIcon size={16} /> })
figma.connect(SearchIcon, BASE, { variant: { Size: '20px' }, example: () => <SearchIcon size={20} /> })
figma.connect(SearchIcon, BASE, { variant: { Size: '24px' }, example: () => <SearchIcon size={24} /> })
