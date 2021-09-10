import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm'

interface UserAttributes {
  id?: string
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string | null
  RoleId: string
  createdAt: Date
  updatedAt: Date
}

export type UserPost = Omit<UserAttributes, 'id' | 'createdAt' | 'updatedAt'>

@Entity()
@Unique(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  firstName: string

  @Column()
  lastName: string

  @Column()
  email: string

  @Column()
  password: string

  @Column('char', { length: 20 })
  phone: string

  @Column('uuid')
  RoleId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
