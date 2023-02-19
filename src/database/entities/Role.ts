import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'
import { Base, type IBaseEntity } from './Base'

interface RoleEntity extends IBaseEntity {
  deletedAt?: Date | null
  name: string
}

export type RoleAttributes = Omit<
  RoleEntity,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

@Entity()
export class Role extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date

  @Index()
  @Column()
  name: string
}
