import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm'
import { z } from 'zod'
import { Base, BaseSchema } from './base'
import { User } from './user'

// Schema
export const sessionSchema = z.object({
  user_id: z
    .string({ required_error: 'user_id is required' })
    .uuid({ message: 'user_id must be a valid UUID' }),
  token: z
    .string({ required_error: 'token is required' })
    .min(3, { message: 'token must be at least 3 characters long' }),
  ip_address: z.string({ required_error: 'ip_address is required' }).nullable().optional(),
  device: z.string({ required_error: 'device is required' }).nullable().optional(),
  platform: z.string({ required_error: 'platform is required' }).nullable().optional(),
  latitude: z.string({ required_error: 'latitude is required' }).nullable().optional(),
  longitude: z.string({ required_error: 'longitude is required' }).nullable().optional(),
})

// Type
export type SessionSchema = z.infer<typeof sessionSchema> & BaseSchema

// Entity
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
