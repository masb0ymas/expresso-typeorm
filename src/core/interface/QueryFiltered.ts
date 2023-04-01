import { type Request } from 'express'
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm'

export interface FilteredQueryEntity {
  id: string
  value: string
}

export interface SortedQueryEntity {
  sort: string
  order: 'ASC' | 'DESC'
}

export interface UseQueryEntity<T extends ObjectLiteral> {
  entity: string
  query: SelectQueryBuilder<T>
  req: Request
}
