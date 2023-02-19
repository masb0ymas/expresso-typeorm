import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm'
import { Base, type IBaseEntity } from './Base'
import { User } from './User'

interface SessionEntity extends IBaseEntity {
  UserId: string
  token: string
  ipAddress?: string | null
  device?: string | null
  platform?: string | null
}

export type SessionAttributes = Omit<
  SessionEntity,
  'id' | 'createdAt' | 'updatedAt'
>

@Entity()
export class Session extends Base {
  @ManyToOne(() => User, (User) => User.Sessions)
  @JoinColumn({ name: 'UserId' })
  User: Relation<User>

  @Index()
  @Column({ type: 'uuid' })
  UserId: string

  @Index()
  @Column({ type: 'text' })
  token: string

  @Column({ nullable: true })
  ipAddress!: string

  @Column({ nullable: true })
  device!: string

  @Column({ nullable: true })
  platform!: string
}
