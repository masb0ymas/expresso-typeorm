import { Column, DeleteDateColumn, Entity } from 'typeorm'
import { Base, IBaseEntity } from './Base'

interface RoleEntity extends IBaseEntity {
  name: string
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
