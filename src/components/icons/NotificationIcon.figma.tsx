import React from 'react'
import figma from '@figma/code-connect'
import { NotificationIcon } from './NotificationIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22262-450'

figma.connect(NotificationIcon, BASE, { variant: { Size: '16px' }, example: () => <NotificationIcon size={16} /> })
figma.connect(NotificationIcon, BASE, { variant: { Size: '20px' }, example: () => <NotificationIcon size={20} /> })
figma.connect(NotificationIcon, BASE, { variant: { Size: '24px' }, example: () => <NotificationIcon size={24} /> })
