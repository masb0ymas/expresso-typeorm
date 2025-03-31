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
  private _repository: Repository<T>
  private _schema: z.ZodType<any>
  private _model: string

  constructor({ repository, schema, model }: IProps<T>) {
    this._repository = repository
    this._schema = schema
    this._model = model
  }

  async find(): Promise<T[]> {
    return this._repository.find()
  }

  private async _findOne(options: FindOneOptions<T>): Promise<T> {
    const record = await this._repository.findOne(options)

    if (!record) {
      throw new ErrorResponse.NotFound(`${this._model} not found`)
    }

    return record
  }

  async findById(id: string, options?: FindOneOptions<T>): Promise<T> {
    const newId = validate.uuid(id)

    // @ts-expect-error
    return this._findOne({ where: { id: newId }, ...options })
  }

  async create(data: T): Promise<T> {
    const values = this._schema.parse(data)
    return this._repository.save(values)
  }

  async update(id: string, data: T): Promise<T> {
    const record = await this.findById(id)

    const values = this._schema.parse({ ...record, ...data })
    return this._repository.save({ ...record, ...values })
  }

  async restore(id: string) {
    const record = await this.findById(id, { withDeleted: true })
    await this._repository.restore(record.id)
  }

  async softDelete(id: string) {
    const record = await this.findById(id)
    await this._repository.softDelete(record.id)
  }

  async forceDelete(id: string) {
    const record = await this.findById(id)
    await this._repository.delete(record.id)
  }

  private _validateIds(ids: string[]): string[] {
    if (_.isEmpty(ids)) {
      throw new ErrorResponse.BadRequest('ids is required')
    }

    return ids.map(validate.uuid)
  }

  async multipleRestore(ids: string[]) {
    const newIds = this._validateIds(ids)

    // @ts-expect-error
    await this._repository.restore({ where: { id: In(newIds) }, withDeleted: true })
  }

  async multipleSoftDelete(ids: string[]) {
    const newIds = this._validateIds(ids)

    // @ts-expect-error
    await this._repository.softDelete({ where: { id: In(newIds) } })
  }

  async multipleForceDelete(ids: string[]) {
    const newIds = this._validateIds(ids)

    // @ts-expect-error
    await this._repository.delete({ where: { id: In(newIds) } })
  }
}
