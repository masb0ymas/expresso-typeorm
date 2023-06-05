import { type FindOptionsRelations } from 'typeorm'

export interface IReqOptions {
  lang?: string
  withDeleted?: boolean
  relations?: FindOptionsRelations<any> | string[]
}
