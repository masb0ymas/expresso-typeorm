import * as bcrypt from 'bcrypt'
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  Unique,
} from 'typeorm'
import { Base } from './Base'
import { Role } from './Role'
import { Session } from './Session'

interface UserEntity {
  id?: string
  fullName: string
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
  deletedAt?: Date | null
}

export interface UserLoginAttributes {
  uid: string
}

export type CreatePassword = Pick<
  UserEntity,
  'newPassword' | 'confirmNewPassword'
>

export type LoginAttributes = Pick<UserEntity, 'email' | 'password'>

export type UserAttributes = Omit<
  UserEntity,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

@Entity()
@Unique(['email'])
export class User extends Base {
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date

  @Column()
  fullName: string

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
  Role: Role

  @Column('uuid')
  RoleId: string

  @ManyToMany(() => Session)
  @JoinTable()
  Sessions: Session[]

  async comparePassword(currentPassword: string): Promise<boolean> {
    return await bcrypt.compare(currentPassword, this.password)
  }
}
