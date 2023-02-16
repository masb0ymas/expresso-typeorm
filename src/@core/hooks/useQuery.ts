import { isNumeric } from '@core/helpers/formatter'
import {
  type FilteredQueryEntity,
  type SortedQueryEntity,
  type UseQueryEntity,
} from '@core/interface/QueryFiltered'
import { AppDataSource } from '@database/data-source'
import _ from 'lodash'
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm'
import { validate as uuidValidate } from 'uuid'

/**
 * Hooks useQuery
 * @param values
 * @returns
 */
export function useQuery<T extends ObjectLiteral>(
  values: UseQueryEntity<T>
): SelectQueryBuilder<T> {
  const { entity, query, req } = values

  const reqQuery = req.getQuery()

  // pagination
  const page = Number(reqQuery.page) || 1
  const pageSize = Number(reqQuery.pageSize) || 10

  query.skip((page - 1) * pageSize)
  query.take(pageSize)

  // query
  const filtered = _.get(reqQuery, 'filtered', '[]')
  const parseFiltered = JSON.parse(filtered) as FilteredQueryEntity[]

  const sorted = _.get(reqQuery, 'sorted', '[]')
  const parseSorted = JSON.parse(sorted) as SortedQueryEntity[]

  // check parser filtered
  if (!_.isEmpty(parseFiltered)) {
    for (let i = 0; i < parseFiltered.length; i += 1) {
      const item = parseFiltered[i]

      const check_uuid = uuidValidate(item.value)
      const check_numeric = isNumeric(item.value)
      const expect_numberic_or_uuid = !check_numeric && !check_uuid

      // query connection postgres
      const check_query_like_postgres =
        AppDataSource.options.type === 'postgres' && expect_numberic_or_uuid

      // query connection mysql
      const check_query_like_mysql =
        ['mysql', 'mariadb'].includes(AppDataSource.options.type) &&
        expect_numberic_or_uuid

      // case UUID
      if (check_uuid) {
        // example : query.andWhere('User.RoleId' = :RoleId, { RoleId: 'anyValue' })
        query.andWhere(`${entity}.${item.id} = :${item.id}`, {
          [`${item.id}`]: `${item.value}`,
        })
      }

      // case Numberic
      if (check_numeric) {
        // example : query.andWhere('User.Age' = :Age, { Age: 'anyValue' })
        query.andWhere(`${entity}.${item.id} = :${item.id}`, {
          [`${item.id}`]: `${item.value}`,
        })
      }

      // query ILIKE with PostgreSQL
      if (check_query_like_postgres) {
        // example : query.andWhere('User.email' ILIKE :email, { email: '%anyValue%' })
        query.andWhere(`${entity}.${item.id} ILIKE :${item.id}`, {
          [`${item.id}`]: `%${item.value}%`,
        })
      }

      // query LIKE with MySQL or MariaDB
      if (check_query_like_mysql) {
        // example : query.andWhere('User.email' LIKE :email, { email: '%anyValue%' })
        query.andWhere(`${entity}.${item.id} LIKE :${item.id}`, {
          [`${item.id}`]: `%${item.value}%`,
        })
      }
    }
  }

  // check parser sorted
  if (!_.isEmpty(parseSorted)) {
    for (let i = 0; i < parseSorted.length; i += 1) {
      const item = parseSorted[i]

      // example : query.addOrderBy('User.email', 'DESC')
      query.addOrderBy(`${entity}.${item.sort}`, item.order)
    }
  } else {
    query.orderBy(`${entity}.createdAt`, 'DESC')
  }

  return query
}
