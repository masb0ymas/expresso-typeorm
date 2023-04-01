import {
  type FindManyOptions,
  type DeepPartial,
  type FindOneOptions,
  type ObjectLiteral,
  type SelectQueryBuilder,
} from 'typeorm'

export interface iRead<T extends ObjectLiteral> {
  find: (options?: FindManyOptions<T>) => Promise<T[]>
  findQuery: (reqQuery: Record<any, any>) => SelectQueryBuilder<T>
  findOne: (options: FindOneOptions<T>) => Promise<T | null>
}

export interface iWrite<T> {
  save: (item: DeepPartial<T>) => Promise<T>

  // single
  restore: (id: string) => Promise<void>
  softDelete: (id: string) => Promise<void>
  forceDelete: (id: string) => Promise<void>

  // multiple
  multipleRestore: (ids: string[]) => Promise<void>
  multipleSoftDelete: (ids: string[]) => Promise<void>
  multipleForceDelete: (ids: string[]) => Promise<void>
}
