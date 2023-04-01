import { type FindOptionsRelations } from 'typeorm'

export interface ReqOptions {
  lang?: string
  withDeleted?: boolean
  relations?: FindOptionsRelations<any> | string[]
}
