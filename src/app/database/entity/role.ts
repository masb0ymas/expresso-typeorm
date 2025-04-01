import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'
import { Base } from './base'

@Entity()
export class Role extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Index()
  @Column()
  name: string
}
