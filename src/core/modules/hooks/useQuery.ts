import { useTypeOrm } from 'expresso-query'
import { UseQueryTypeOrm } from 'expresso-query/lib/typeorm/types'
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm'
import { env } from '~/config/env'

type ConnectType = 'postgres' | 'mysql' | 'mariadb'

type IUseQuery<T extends ObjectLiteral> = Omit<
  UseQueryTypeOrm<T>,
  'options'
> & {
  limit?: number
}

/**
 * Create New Instance Query TypeORM from `expresso-query` Library
 * @param params
 * @returns
 */
export function useQuery<T extends ObjectLiteral>(
  params: IUseQuery<T>
): SelectQueryBuilder<T> {
  const connectType = env.TYPEORM_CONNECTION as ConnectType

  return useTypeOrm.queryBuilder(
    { ...params, options: { limit: params.limit, orderKey: 'created_at' } },
    { type: connectType }
  )
}
