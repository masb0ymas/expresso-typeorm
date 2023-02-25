import { TYPEORM_CONNECTION } from '@config/env'
import { useQueryTypeORM } from 'expresso-query'
import { type UseQueryEntity } from 'expresso-query/lib/interface'
import { type SelectQueryBuilder, type ObjectLiteral } from 'typeorm'

type ConnectType = 'postgres' | 'mysql' | 'mariadb'

/**
 * Create New Instance Query TypeORM from `expresso-query` Library
 * @param params
 * @returns
 */
export function useQuery<T extends ObjectLiteral>(
  params: UseQueryEntity<T>
): SelectQueryBuilder<T> {
  const connectType = TYPEORM_CONNECTION as ConnectType

  return useQueryTypeORM(params, { type: connectType })
}
