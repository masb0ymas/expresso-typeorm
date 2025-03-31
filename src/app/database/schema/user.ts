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
import { z } from 'zod'
import Hashing from '~/config/hashing'
import { Base, BaseSchema } from './base'
import { Role } from './role'
import { Session } from './session'
import { Upload } from './upload'

// Schema
const passwordSchema = z.object({
  new_password: z.string().min(8, 'new password at least 8 characters'),
  confirm_new_password: z.string().min(8, 'confirm new password at least 8 characters'),
})

export const createPassword = passwordSchema.refine(
  (data) => data.new_password === data.confirm_new_password,
  {
    message: "passwords don't match",
    path: ['confirm_new_password'], // path of error
  }
)

export const changePassword = passwordSchema
  .extend({
    current_password: z.string().min(8, 'current password at least 8 characters'),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "passwords don't match",
    path: ['confirm_new_password'], // path of error
  })

export const userSchema = passwordSchema
  .extend({
    fullname: z
      .string({
        required_error: 'fullname is required',
        invalid_type_error: 'fullname must be a string',
      })
      .min(2, "fullname can't be empty"),
    email: z
      .string({
        required_error: 'email is required',
        invalid_type_error: 'email must be a string',
      })
      .email({ message: 'invalid email address' })
      .min(2, "email can't be empty"),
    phone: z.string().nullable(),
    token_verify: z.string().nullable(),
    upload_id: z.string().uuid({ message: 'upload_id invalid uuid format' }).nullable(),
    is_active: z.boolean({
      required_error: 'is_active is required',
      invalid_type_error: 'is_active must be a boolean',
    }),
    is_blocked: z.boolean({
      required_error: 'is_blocked is required',
      invalid_type_error: 'is_blocked must be a boolean',
    }),
    role_id: z
      .string({
        required_error: 'role id is required',
        invalid_type_error: 'role id must be a string',
      })
      .uuid({ message: 'role id invalid uuid format' })
      .min(2, `role id can't be empty`),
  })
  .refine((data) => data.new_password === data.confirm_new_password, {
    message: "passwords don't match",
    path: ['confirm_new_password'], // path of error
  })

export const loginSchema = z.object({
  email: z.string().email({ message: 'invalid email address' }).min(2, "email can't be empty"),
  password: z.string().min(2, "password can't be empty"),
  latitude: z.string().nullable(),
  longitude: z.string().nullable(),
})

// Type
export type UserSchema = Omit<z.infer<typeof userSchema>, 'new_password' | 'confirm_new_password'> &
  Partial<BaseSchema> & {
    deleted_at: Date | null
  }

export type CreatePasswordSchema = z.infer<typeof passwordSchema>
export type LoginSchema = z.infer<typeof loginSchema>
export type LoginState = {
  uid: string
}

const hashing = new Hashing()

// Entity
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

  @Index()
  @Column({ type: 'uuid' })
  role_id: string

  @ManyToOne(() => Upload, (upload) => upload)
  @JoinColumn({ name: 'upload_id' })
  upload: Relation<Upload>

  @Index()
  @Column({ type: 'uuid', nullable: true })
  upload_id!: string

  @OneToMany(() => Session, (Session) => Session.user)
  @JoinTable()
  sessions: Relation<Session>[]

  async comparePassword(current_password: string): Promise<boolean> {
    return await hashing.verify(this.password, current_password)
  }
}
