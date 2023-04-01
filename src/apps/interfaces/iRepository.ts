import { useQuery } from '@core/hooks/useQuery'
import {
  type FindManyOptions,
  type DeepPartial,
  type FindOneOptions,
  type ObjectLiteral,
  type Repository,
  type SelectQueryBuilder,
} from 'typeorm'
import { type iRead, type iWrite } from './iBase'

type BaseRepository<T extends ObjectLiteral> = iRead<T> & iWrite<T>

interface TypeOrmRepositoryEntity<T extends ObjectLiteral> {
  repository: Repository<T>
  entity: string
}

interface Options {
  customEntity: string
}

export abstract class TypeOrmRepository<T extends ObjectLiteral>
  implements BaseRepository<T>
{
  private readonly _repository: Repository<T>
  private readonly _entity: string

  constructor(params: TypeOrmRepositoryEntity<T>) {
    this._repository = params.repository
    this._entity = params.entity
  }

  /**
   * Repository
   * @returns
   */
  public repository(): Repository<T> {
    return this._repository
  }

  /**
   * Find Query
   * @returns
   */
  public findQuery(reqQuery: Record<any, any>): SelectQueryBuilder<T> {
    const query = this._repository.createQueryBuilder()

    const newQuery = useQuery({ entity: this._entity, query, reqQuery })

    return newQuery
  }

  /**
   * Find
   * @param options
   * @returns
   */
  public async find(options?: FindManyOptions<T>): Promise<T[]> {
    const data = await this._repository.find(options)

    return data
  }

  /**
   * Find One
   * @param id
   * @returns
   */
  public async findOne(options: FindOneOptions<T>): Promise<T | null> {
    const data = await this._repository.findOne(options)

    return data
  }

  /**
   * Create
   * @param item
   * @returns
   */
  public async save(item: DeepPartial<T>): Promise<T> {
    const data = await this._repository.save(item)

    return data
  }

  /**
   * Restore
   * @param id
   */
  public async restore(id: string): Promise<void> {
    await this._repository.restore(id)
  }

  /**
   * Soft Delete
   * @param id
   */
  public async softDelete(id: string): Promise<void> {
    await this._repository.softDelete(id)
  }

  /**
   * Force Delete
   * @param id
   */
  public async forceDelete(id: string): Promise<void> {
    await this._repository.delete(id)
  }

  /**
   *
   * @param ids
   * @returns
   */
  private _multipleGetByIds(
    ids: string[],
    options?: Options
  ): SelectQueryBuilder<T> {
    const entity = options?.customEntity ?? this._entity

    const query = this._repository
      .createQueryBuilder()
      .where(`${entity}.id IN (:...ids)`, { ids: [...ids] })

    return query
  }

  /**
   * Multiple Restore
   * @param ids
   */
  public async multipleRestore(
    ids: string[],
    options?: Options
  ): Promise<void> {
    const query = this._multipleGetByIds(ids, options).withDeleted()

    // restore record
    await query.restore().execute()
  }

  /**
   * Multiple Soft Delete
   * @param ids
   */
  public async multipleSoftDelete(
    ids: string[],
    options?: Options
  ): Promise<void> {
    const query = this._multipleGetByIds(ids, options)

    // soft delete record
    await query.softDelete().execute()
  }

  /**
   * Multiple Force Delete
   * @param ids
   */
  public async multipleForceDelete(
    ids: string[],
    options?: Options
  ): Promise<void> {
    const query = this._multipleGetByIds(ids, options)

    // soft delete record
    await query.delete().execute()
  }
}
