import { TYPEORM_CONNECTION } from '@config/env'
import { useTypeOrm } from 'expresso-query'
import { type UseTypeOrmQuery } from 'expresso-query/lib/interface'
import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm'

type ConnectType = 'postgres' | 'mysql' | 'mariadb'

/**
 * Create New Instance Query TypeORM from `expresso-query` Library
 * @param params
 * @returns
 */
export function useQuery<T extends ObjectLiteral>(
  params: UseTypeOrmQuery<T>
): SelectQueryBuilder<T> {
  const connectType = TYPEORM_CONNECTION as ConnectType

  return useTypeOrm.queryBuilder(params, { type: connectType })
}
