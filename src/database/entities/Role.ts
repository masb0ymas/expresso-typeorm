import { Column, DeleteDateColumn, Entity } from 'typeorm'
import { Base } from './Base'

interface RoleEntity {
  id?: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export type RoleAttributes = Pick<RoleEntity, 'name'>

@Entity()
export class Role extends Base {
  @Column()
  name: string

  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date
}
