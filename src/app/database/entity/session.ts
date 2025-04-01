import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm'
import { Base } from './base'
import { User } from './user'

@Entity({ name: 'session' })
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
