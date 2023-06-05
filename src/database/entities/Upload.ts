import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'
import { Base, type IBaseEntity } from './Base'

interface UploadEntity extends IBaseEntity {
  deleted_at?: Date | null
  key_file: string
  filename: string
  mimetype: string
  size: number
  signed_url: string
  expiry_date_url: Date
}

export type UploadAttributes = Omit<
  UploadEntity,
  'id' | 'created_at' | 'updated_at' | 'deleted_at'
>

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
