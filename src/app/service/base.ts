import _ from 'lodash'
import { FindOneOptions, In, ObjectLiteral, Repository } from 'typeorm'
import { z } from 'zod'
import ErrorResponse from '~/lib/http/errors'
import { validate } from '~/lib/validate'

type IProps<T extends ObjectLiteral> = {
  repository: Repository<T>
  schema: z.ZodType<any>
  model: string
}

export default class BaseService<T extends ObjectLiteral> {
  public repository: Repository<T>
  private _schema: z.ZodType<any>
  private _model: string

  constructor({ repository, schema, model }: IProps<T>) {
    this.repository = repository
    this._schema = schema
    this._model = model
  }

  /**
   * Find all
   */
  async find(): Promise<T[]> {
    return this.repository.find()
  }

  /**
   * Find one
   */
  private async _findOne(options: FindOneOptions<T>): Promise<T> {
    const record = await this.repository.findOne(options)

    if (!record) {
      throw new ErrorResponse.NotFound(`${this._model} not found`)
    }

    return record
  }

  /**
   * Find by id
   */
  async findById(id: string, options?: FindOneOptions<T>): Promise<T> {
    const newId = validate.uuid(id)

    // @ts-expect-error
    return this._findOne({ where: { id: newId }, ...options })
  }

  /**
   * Create
   */
  async create(data: T): Promise<T> {
    const values = this._schema.parse(data)
    return this.repository.save(values)
  }

  /**
   * Update
   */
  async update(id: string, data: T): Promise<T> {
    const record = await this.findById(id)

    const values = this._schema.parse({ ...record, ...data })
    return this.repository.save({ ...record, ...values })
  }

  /**
   * Restore
   */
  async restore(id: string) {
    const record = await this.findById(id, { withDeleted: true })
    await this.repository.restore(record.id)
  }

  /**
   * Soft delete
   */
  async softDelete(id: string) {
    const record = await this.findById(id)
    await this.repository.softDelete(record.id)
  }

  /**
   * Force delete
   */
  async forceDelete(id: string) {
    const record = await this.findById(id)
    await this.repository.delete(record.id)
  }

  /**
   * Validate ids
   */
  private _validateIds(ids: string[]): string[] {
    if (_.isEmpty(ids)) {
      throw new ErrorResponse.BadRequest('ids is required')
    }

    return ids.map(validate.uuid)
  }

  /**
   * Multiple restore
   */
  async multipleRestore(ids: string[]) {
    const newIds = this._validateIds(ids)

    // @ts-expect-error
    await this.repository.restore({ where: { id: In(newIds) }, withDeleted: true })
  }

  /**
   * Multiple soft delete
   */
  async multipleSoftDelete(ids: string[]) {
    const newIds = this._validateIds(ids)

    // @ts-expect-error
    await this.repository.softDelete({ where: { id: In(newIds) } })
  }

  /**
   * Multiple force delete
   */
  async multipleForceDelete(ids: string[]) {
    const newIds = this._validateIds(ids)

    // @ts-expect-error
    await this.repository.delete({ where: { id: In(newIds) } })
  }
}
