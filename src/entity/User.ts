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
  newPassword?: string | null
  confirmNewPassword?: string | null
  password: string
  phone: string | null
  isActive?: boolean
  isBlocked?: boolean
  RoleId: string
  createdAt: Date
  updatedAt: Date
}

export interface UserLoginAttributes {
  uid: string
}

export type CreatePassword = Pick<
  UserAttributes,
  'newPassword' | 'confirmNewPassword'
>

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

  @Column('char', { length: 20, nullable: true })
  phone!: string

  @Column('boolean', { default: false })
  isActive: boolean

  @Column('boolean', { default: false })
  isBlocked: boolean

  @Column('uuid')
  RoleId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
