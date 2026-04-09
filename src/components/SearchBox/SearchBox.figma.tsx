import figma from '@figma/code-connect'
import { SearchBox } from './SearchBox'

figma.connect(
  SearchBox,
  'https://figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2148-2214',
  {
    example: () => <SearchBox />,
  },
)
