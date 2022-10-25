import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export interface IBaseEntity {
  id?: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

@Entity()
export abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @CreateDateColumn({ nullable: false })
  createdAt!: Date

  @UpdateDateColumn({ nullable: false })
  updatedAt!: Date
}
