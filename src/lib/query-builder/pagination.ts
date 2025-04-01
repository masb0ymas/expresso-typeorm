import { ObjectLiteral } from 'typeorm'
import { validate } from '../validate'
import { ApplyPaginationParams, CalculatePageSizeParams } from './types'

function _calculatePageSize({ pageSize, limit }: CalculatePageSizeParams) {
  const min = 10
  const parsePageSize = validate.number(pageSize)

  if (parsePageSize > 0) {
    return Math.min(parsePageSize, limit)
  }

  return min
}

export function applyPagination<T extends ObjectLiteral>({
  query,
  page,
  pageSize,
  limit = 100,
}: ApplyPaginationParams<T>) {
  const parsePage = validate.number(page) || 1
  let parsePageSize = _calculatePageSize({ pageSize, limit })

  if (parsePageSize <= 0) {
    parsePageSize = 10
  }

  query.skip((parsePage - 1) * parsePageSize)
  query.take(parsePageSize)
}
