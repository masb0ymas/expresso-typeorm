import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export interface IBaseEntity {
  id?: string
  createdAt: Date
  updatedAt: Date
}

@Entity()
export abstract class Base extends BaseEntity {
  @Index({ unique: true })
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @CreateDateColumn({ nullable: false })
  createdAt!: Date

  @UpdateDateColumn({ nullable: false })
  updatedAt!: Date
}
