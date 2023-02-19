import * as bcrypt from 'bcrypt'
import {
  Column,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToOne,
  OneToMany,
  Relation,
  Unique,
} from 'typeorm'
import { Base, type IBaseEntity } from './Base'
import { Role } from './Role'
import { Session } from './Session'
import { Upload } from './Upload'

interface UserEntity extends IBaseEntity {
  deletedAt?: Date | null
  fullname: string
  email: string
  password?: string | null
  phone?: string | null
  tokenVerify?: string | null
  isActive?: boolean | null
  isBlocked?: boolean | null
  UploadId?: string | null
  RoleId: string

  // virtual
  newPassword?: string | null
  confirmNewPassword?: string | null
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
  @Index()
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date

  @Index()
  @Column()
  fullname: string

  @Index()
  @Column()
  email: string

  @Column({ select: false, nullable: true })
  password!: string

  @Index()
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string

  @Column({ type: 'text', nullable: true })
  tokenVerify!: string

  @Index()
  @Column({ type: 'boolean', default: false })
  isActive: boolean

  @Index()
  @Column({ type: 'boolean', default: false })
  isBlocked: boolean

  @ManyToOne(() => Role, (role) => role)
  @JoinColumn({ name: 'RoleId' })
  Role: Relation<Role>

  @Column({ type: 'uuid' })
  RoleId: string

  @ManyToOne(() => Upload, (upload) => upload)
  @JoinColumn({ name: 'UploadId' })
  Upload: Upload

  @Column({ type: 'uuid', nullable: true })
  UploadId!: string

  @OneToMany(() => Session, (Session) => Session.User)
  @JoinTable()
  Sessions: Array<Relation<Session>>

  async comparePassword(currentPassword: string): Promise<boolean> {
    return await bcrypt.compare(currentPassword, this.password)
  }
}
