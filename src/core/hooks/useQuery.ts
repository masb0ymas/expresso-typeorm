import { useTypeOrm } from 'expresso-query'
import { type UseTypeOrmQuery } from 'expresso-query/lib/interface'
import { type ObjectLiteral, type SelectQueryBuilder } from 'typeorm'
import { TYPEORM_CONNECTION } from '~/config/env'

type ConnectType = 'postgres' | 'mysql' | 'mariadb'

type IUseQuery<T extends ObjectLiteral> = Omit<
  UseTypeOrmQuery<T>,
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
  const connectType = TYPEORM_CONNECTION as ConnectType

  return useTypeOrm.queryBuilder(
    { ...params, options: { orderKey: 'createdAt' } },
    { type: connectType }
  )
}
