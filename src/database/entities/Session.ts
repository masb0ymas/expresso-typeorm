import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'
import { Base } from './Base'
import { User } from './User'

interface SessionEntity {
  user_id: string
  token: string
  ip_address?: string | null
  device?: string | null
  platform?: string | null
}

export type SessionAttributes = Omit<
  SessionEntity,
  'id' | 'created_at' | 'updated_at'
>

@Entity()
export class Session extends Base {
  @ManyToOne(() => User, (User) => User.Sessions)
  @JoinColumn({ name: 'user_id' })
  User: User

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
}
