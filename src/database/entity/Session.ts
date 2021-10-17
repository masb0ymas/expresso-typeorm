import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
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
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne(() => User, (user) => user)
  @JoinColumn({ name: 'UserId' })
  user: User

  @Column('uuid')
  UserId: string

  @Column('text')
  token: string

  @Column({ nullable: true })
  ipAddress!: string

  @Column({ nullable: true })
  device!: string

  @Column({ nullable: true })
  platform!: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
