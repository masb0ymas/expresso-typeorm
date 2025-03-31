import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'
import { z } from 'zod'
import { Base, BaseSchema } from './base'

// Schema
export const roleSchema = z.object({
  name: z
    .string({ required_error: 'name is required' })
    .min(3, { message: 'name must be at least 3 characters long' })
    .max(255, { message: 'name must be at most 255 characters long' }),
})

// Type
export type RoleSchema = z.infer<typeof roleSchema> &
  BaseSchema & {
    deleted_at: Date | null
  }

// Entity
@Entity()
export class Role extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Index()
  @Column()
  name: string
}
