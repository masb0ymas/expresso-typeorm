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
  created_at: Date
  updated_at: Date
}

@Entity()
export abstract class Base extends BaseEntity {
  @Index({ unique: true })
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @CreateDateColumn({ nullable: false })
  created_at!: Date

  @UpdateDateColumn({ nullable: false })
  updated_at!: Date
}
