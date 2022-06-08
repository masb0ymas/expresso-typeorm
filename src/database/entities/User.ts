import * as bcrypt from 'bcrypt'
import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  Unique,
} from 'typeorm'
import { Base } from './Base'
import { Role } from './Role'
import { Session } from './Session'
import { Upload } from './Upload'

interface UserEntity {
  id?: string
  fullName: string
  email: string
  newPassword?: string | null
  confirmNewPassword?: string | null
  password: string
  phone: string | null
  tokenVerify: string | null
  isActive?: boolean | null
  isBlocked?: boolean | null
  UploadId?: string | null
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

  @Column({ nullable: true })
  phone!: string

  @Column({ type: 'text', nullable: true })
  tokenVerify!: string

  @Column({ type: 'boolean', default: false })
  isActive: boolean

  @Column({ type: 'boolean', default: false })
  isBlocked: boolean

  @ManyToOne(() => Role, (role) => role)
  @JoinColumn({ name: 'RoleId' })
  Role: Role

  @Column({ type: 'uuid' })
  RoleId: string

  @ManyToOne(() => Upload, (upload) => upload)
  @JoinColumn({ name: 'UploadId' })
  Upload: Upload

  @Column({ type: 'uuid', nullable: true })
  UploadId!: string

  @OneToMany(() => Session, (Session) => Session.User)
  @JoinTable()
  Sessions: Session[]

  async comparePassword(currentPassword: string): Promise<boolean> {
    return await bcrypt.compare(currentPassword, this.password)
  }
}
