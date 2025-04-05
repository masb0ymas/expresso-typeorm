import _ from 'lodash'
import { ObjectLiteral, SelectQueryBuilder } from 'typeorm'
import { env } from '~/config/env'
import { validate } from '../validate'
import { applyFilter } from './filtered'
import { applyPagination } from './pagination'
import { applySort } from './sorted'
import { QueryBuilderParams, QueryParams } from './types'

/**
 * Query builder for TypeORM
 */
function QueryBuilder<T extends ObjectLiteral>({
  params,
  options,
}: QueryBuilderParams<T>): SelectQueryBuilder<T> {
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

  return query
}

type ConnectType = 'postgres' | 'mysql' | 'mariadb'

/**
 * Use query builder
 */
export function useQuery<T extends ObjectLiteral>(params: QueryParams<T>) {
  const connectType = env.TYPEORM_CONNECTION as ConnectType
  return QueryBuilder({ params, options: { type: connectType } })
}
