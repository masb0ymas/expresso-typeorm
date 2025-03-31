import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'
import { Base, BaseSchema } from './base'
import { z } from 'zod'

// Schema
export const uploadSchema = z.object({
  key_file: z
    .string({ required_error: 'key_file is required' })
    .min(3, { message: 'key_file must be at least 3 characters long' }),
  filename: z
    .string({ required_error: 'filename is required' })
    .min(3, { message: 'filename must be at least 3 characters long' }),
  mimetype: z
    .string({ required_error: 'mimetype is required' })
    .min(3, { message: 'mimetype must be at least 3 characters long' }),
  size: z
    .number({ required_error: 'size is required' })
    .min(1, { message: 'size must be at least 1' }),
  signed_url: z
    .string({ required_error: 'signed_url is required' })
    .min(3, { message: 'signed_url must be at least 3 characters long' }),
  expiry_date_url: z.date({ required_error: 'expiry_date_url is required' }),
})

// Type
export type UploadSchema = z.infer<typeof uploadSchema> &
  BaseSchema & {
    deleted_at: Date | null
  }

// Entity
@Entity()
export class Upload extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Index()
  @Column({ type: 'text' })
  key_file: string

  @Column({ type: 'text' })
  filename: string

  @Column({ type: 'text' })
  mimetype: string

  @Column({ type: 'bigint' })
  size: number

  @Column({ type: 'text' })
  signed_url: string

  @Index()
  @Column()
  expiry_date_url: Date
}
