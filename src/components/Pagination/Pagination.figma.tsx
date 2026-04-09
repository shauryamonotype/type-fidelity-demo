import figma from '@figma/code-connect'
import { Pagination } from './Pagination'

figma.connect(
  Pagination,
  'https://www.figma.com/design/gSQPdYKD2xoX1ozN2FX4cg/Next-Gen-Component-Library?node-id=2104-3285',
  {
    example: () => (
      <Pagination
        totalItems={120}
        currentPage={1}
        pageSize={20}
        onPageChange={() => {}}
      />
    ),
  }
)
