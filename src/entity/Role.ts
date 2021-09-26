import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

interface RoleAttributes {
  id?: string
  name: string
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}

export type RolePost = Omit<
  RoleAttributes,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  @DeleteDateColumn()
  deletedAt: Date
}
