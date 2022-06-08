import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { Base } from './Base'
import { User } from './User'

interface SessionEntity {
  id?: string
  UserId: string
  token: string
  ipAddress?: string | null
  device?: string | null
  platform?: string | null
  createdAt: Date
  updatedAt: Date
}

export type SessionAttributes = Omit<
  SessionEntity,
  'id' | 'createdAt' | 'updatedAt'
>

@Entity()
export class Session extends Base {
  @ManyToOne(() => User, (User) => User.Sessions)
  @JoinColumn({ name: 'UserId' })
  User: User

  @Column({ type: 'uuid' })
  UserId: string

  @Column({ type: 'text' })
  token: string

  @Column({ nullable: true })
  ipAddress!: string

  @Column({ nullable: true })
  device!: string

  @Column({ nullable: true })
  platform!: string
}
