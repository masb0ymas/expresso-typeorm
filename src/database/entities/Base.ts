import {
  BaseEntity,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity()
export abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @CreateDateColumn({ nullable: false })
  createdAt!: Date

  @UpdateDateColumn({ nullable: false })
  updatedAt!: Date
}
