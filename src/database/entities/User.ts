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
  deleted_at?: Date | null
  fullname: string
  email: string
  password?: string | null
  phone?: string | null
  token_verify?: string | null
  address?: string | null
  is_active?: boolean | null
  is_blocked?: boolean | null
  upload_id?: string | null
  role_id: string

  // virtual
  new_password?: string | null
  confirm_new_password?: string | null
}

export interface UserLoginAttributes {
  uid: string
}

export type CreatePassword = Pick<
  UserEntity,
  'new_password' | 'confirm_new_password'
>

export type LoginAttributes = Pick<UserEntity, 'email' | 'password'>

export type UserAttributes = Omit<
  UserEntity,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>

@Entity()
@Unique(['email'])
export class User extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

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
  token_verify!: string

  @Column({ type: 'text', nullable: true })
  address!: string

  @Index()
  @Column({ type: 'boolean', default: false })
  is_active: boolean

  @Index()
  @Column({ type: 'boolean', default: false })
  is_blocked: boolean

  @ManyToOne(() => Role, (role) => role)
  @JoinColumn({ name: 'role_id' })
  role: Relation<Role>

  @Column({ type: 'uuid' })
  role_id: string

  @ManyToOne(() => Upload, (upload) => upload)
  @JoinColumn({ name: 'upload_id' })
  upload: Upload

  @Column({ type: 'uuid', nullable: true })
  upload_id!: string

  @OneToMany(() => Session, (Session) => Session.user)
  @JoinTable()
  sessions: Array<Relation<Session>>

  async comparePassword(current_password: string): Promise<boolean> {
    return await bcrypt.compare(current_password, this.password)
  }
}
