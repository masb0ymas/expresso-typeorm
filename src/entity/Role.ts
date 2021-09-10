import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

interface RoleAttributes {
  id?: string
  name: string
  createdAt: Date
  updatedAt: Date
}

export type RolePost = Pick<RoleAttributes, 'name'>

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
}
