import { ObjectLiteral } from 'typeorm'
import { ApplySortParams, QuerySorts } from './types'

/**
 * Apply sort to query
 */
export function applySort<T extends ObjectLiteral>({
  query,
  sorts,
  model,
  orderKey,
}: ApplySortParams<T>) {
  let sorted: QuerySorts[] = []

  if (Array.isArray(sorts)) {
    sorted = sorts
  } else {
    sorted = JSON.parse(sorts) as QuerySorts[]
  }

  if (sorted.length > 0) {
    for (let i = 0; i < sorted.length; i += 1) {
      const item = sorted[i]
      query.addOrderBy(`${model}.${item.sort}`, item.order)
    }
  } else {
    query.orderBy(`${model}.${orderKey || 'created_at'}`, 'DESC')
  }
}
