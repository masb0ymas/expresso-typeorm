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
import Hashing from '~/config/hashing'
import { Base } from './base'
import { Role } from './role'
import { Session } from './session'
import { Upload } from './upload'

const hashing = new Hashing()

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
