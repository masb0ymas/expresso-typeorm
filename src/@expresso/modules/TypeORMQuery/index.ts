import { Request } from 'express'
import _ from 'lodash'
import { SelectQueryBuilder } from 'typeorm'
import { validate as uuidValidate } from 'uuid'

export function queryFiltered<T>(
  entity: string,
  query: SelectQueryBuilder<T>,
  req: Request
): SelectQueryBuilder<T> {
  const reqQuery = req.getQuery()

  // pagination
  const page = Number(reqQuery.page) || 1
  const pageSize = Number(reqQuery.pageSize) || 10

  query.skip((page - 1) * pageSize)
  query.take(pageSize)

  // query
  const filtered = _.get(reqQuery, 'filtered', '[]')
  const parseFiltered = JSON.parse(filtered)

  // check parser filtered
  if (!_.isEmpty(parseFiltered)) {
    for (let i = 0; i < parseFiltered.length; i += 1) {
      const item = parseFiltered[i]

      if (uuidValidate(item.value)) {
        // case UUID
        // example : query.andWhere('User.RoleId' = :RoleId, { RoleId: 'anyValue' })
        query.andWhere(`${entity}.${item.id} = :${item.id}`, {
          [`${item.id}`]: `${item.value}`,
        })
      } else {
        // default query LIKE
        // example : query.andWhere('User.RoleId' ILIKE :RoleId, { RoleId: '%anyValue%' })
        query.andWhere(`${entity}.${item.id} ILIKE :${item.id}`, {
          [`${item.id}`]: `%${item.value}%`,
        })
      }
    }
  }

  return query
}
