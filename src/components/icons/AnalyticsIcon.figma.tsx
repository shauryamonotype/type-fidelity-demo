import React from 'react'
import figma from '@figma/code-connect'
import { AnalyticsIcon } from './AnalyticsIcon'

const BASE = 'https://www.figma.com/design/L2RM9EGefn3tLZI0rwaKOC/Antiqua-Design-System-v1.0?node-id=22031-54880'

figma.connect(AnalyticsIcon, BASE, { variant: { Size: '16px' }, example: () => <AnalyticsIcon size={16} /> })
figma.connect(AnalyticsIcon, BASE, { variant: { Size: '20px' }, example: () => <AnalyticsIcon size={20} /> })
figma.connect(AnalyticsIcon, BASE, { variant: { Size: '24px' }, example: () => <AnalyticsIcon size={24} /> })
