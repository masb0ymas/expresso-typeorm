import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

interface SessionAttributes {
  id?: string
  UserId: string
  token: string
  ipAddress?: string | null
  device?: string | null
  platform?: string | null
  latitude?: string | null
  longitude?: string | null
  createdAt: Date
  updatedAt: Date
}

export type SessionPost = Omit<
  SessionAttributes,
  'id' | 'createdAt' | 'updatedAt'
>

@Entity()
export class Session {
  @PrimaryGeneratedColumn('uuid')
  id: string

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

  @Column({ nullable: true })
  latitude!: string

  @Column({ nullable: true })
  longitude!: string

  @CreateDateColumn()
  createdAt: Date

  @UpdateDateColumn()
  updatedAt: Date
}
