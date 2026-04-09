import React from 'react'
import figma from '@figma/code-connect'
import { AddToProjectIcon } from './AddToProjectIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-54944'

figma.connect(AddToProjectIcon, BASE, { variant: { Size: '16px' }, example: () => <AddToProjectIcon size={16} /> })
figma.connect(AddToProjectIcon, BASE, { variant: { Size: '20px' }, example: () => <AddToProjectIcon size={20} /> })
figma.connect(AddToProjectIcon, BASE, { variant: { Size: '24px' }, example: () => <AddToProjectIcon size={24} /> })
