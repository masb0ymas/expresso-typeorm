import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm'
import { Base, type IBaseEntity } from './Base'
import { User } from './User'

interface SessionEntity extends IBaseEntity {
  user_id: string
  token: string
  ip_address?: string | null
  device?: string | null
  platform?: string | null
  latitude?: string | null
  longitude?: string | null
}

export type SessionAttributes = Omit<
  SessionEntity,
  'id' | 'created_at' | 'updated_at'
>

@Entity()
export class Session extends Base {
  @ManyToOne(() => User, (User) => User.sessions)
  @JoinColumn({ name: 'user_id' })
  user: Relation<User>

  @Index()
  @Column({ type: 'uuid' })
  user_id: string

  @Index()
  @Column({ type: 'text' })
  token: string

  @Column({ nullable: true })
  ip_address!: string

  @Column({ nullable: true })
  device!: string

  @Column({ nullable: true })
  platform!: string

  @Column({ nullable: true })
  latitude!: string

  @Column({ nullable: true })
  longitude!: string
}
