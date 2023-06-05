import { useTypeOrm } from 'expresso-query'
import { type IUseTypeOrmQuery } from 'expresso-query/lib/interface'
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm'
import { env } from '~/config/env'

type ConnectType = 'postgres' | 'mysql' | 'mariadb'

type IUseQuery<T extends ObjectLiteral> = Omit<
  IUseTypeOrmQuery<T>,
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
    { ...params, options: { orderKey: 'created_at' } },
    { type: connectType }
  )
}
