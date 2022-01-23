import { Column, DeleteDateColumn, Entity } from 'typeorm'
import { Base } from './Base'

interface RoleEntity {
  id?: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export type RoleAttributes = Omit<
  RoleEntity,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

@Entity()
export class Role extends Base {
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date

  @Column()
  name: string
}
