import React from 'react'
import figma from '@figma/code-connect'
import { ProjectIcon } from './ProjectIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-54920'

figma.connect(ProjectIcon, BASE, { variant: { Size: '16px' }, example: () => <ProjectIcon size={16} /> })
figma.connect(ProjectIcon, BASE, { variant: { Size: '20px' }, example: () => <ProjectIcon size={20} /> })
figma.connect(ProjectIcon, BASE, { variant: { Size: '24px' }, example: () => <ProjectIcon size={24} /> })
