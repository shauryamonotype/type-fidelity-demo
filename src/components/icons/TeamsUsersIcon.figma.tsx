import React from 'react'
import figma from '@figma/code-connect'
import { TeamsUsersIcon } from './TeamsUsersIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-54846'

figma.connect(TeamsUsersIcon, BASE, { variant: { Size: '16px' }, example: () => <TeamsUsersIcon size={16} /> })
figma.connect(TeamsUsersIcon, BASE, { variant: { Size: '20px' }, example: () => <TeamsUsersIcon size={20} /> })
figma.connect(TeamsUsersIcon, BASE, { variant: { Size: '24px' }, example: () => <TeamsUsersIcon size={24} /> })
