import _ from 'lodash'
import { ObjectLiteral } from 'typeorm'
import { validate } from '../validate'
import { applyFilter } from './filtered'
import { applyPagination } from './pagination'
import { applySort } from './sorted'
import { QueryBuilderParams } from './types'

/**
 * Query builder for TypeORM
 */
export function QueryBuilder<T extends ObjectLiteral>({ params, options }: QueryBuilderParams<T>) {
  const { query, model, reqQuery, options: opt } = params

  const queryPage = _.get(reqQuery, 'page', 1)
  const queryPageSize = _.get(reqQuery, 'pageSize', 10)
  const queryFilters = _.get(reqQuery, 'filtered', [])
  const querySorts = _.get(reqQuery, 'sorted', [])

  const limit = _.get(opt, 'limit', 100)
  const orderKey = _.get(opt, 'orderKey', 'created_at')

  applyFilter({ query, filters: queryFilters, model, options })

  applySort({
    query,
    sorts: querySorts,
    model,
    orderKey,
  })

  applyPagination({
    query,
    page: validate.number(queryPage),
    pageSize: validate.number(queryPageSize),
    limit,
  })
}
