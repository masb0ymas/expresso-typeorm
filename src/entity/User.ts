import * as bcrypt from 'bcrypt'
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { Role } from './Role'

interface UserAttributes {
  id?: string
  firstName: string
  lastName: string
  email: string
  newPassword?: string | null
  confirmNewPassword?: string | null
  password: string
  phone: string | null
  tokenVerify: string | null
  picturePath: string | null
  isActive?: boolean | null
  isBlocked?: boolean | null
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

export type LoginAttributes = Pick<UserAttributes, 'email' | 'password'>

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

  @Column({ select: false })
  password: string

  @Column('char', { length: 20, nullable: true })
  phone!: string

  @Column('text', { nullable: true })
  tokenVerify!: string

  @Column('text', { nullable: true })
  picturePath!: string

  @Column('boolean', { default: false })
  isActive: boolean

  @Column('boolean', { default: false })
  isBlocked: boolean

  @ManyToOne(() => Role, (role) => role)
  @JoinColumn({ name: 'RoleId' })
  role: Role

  @Column('uuid')
  RoleId: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date

  async comparePassword(currentPassword: string): Promise<boolean> {
    return await bcrypt.compare(currentPassword, this.password)
  }
}
