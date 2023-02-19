import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'
import { Base, type IBaseEntity } from './Base'

interface UploadEntity extends IBaseEntity {
  deletedAt?: Date | null
  keyFile: string
  filename: string
  mimetype: string
  size: number
  signedURL: string
  expiryDateURL: Date
}

export type UploadAttributes = Omit<
  UploadEntity,
  'id' | 'createdAt' | 'updatedAt' | 'deletedAt'
>

@Entity()
export class Upload extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date

  @Index()
  @Column({ type: 'text' })
  keyFile: string

  @Column({ type: 'text' })
  filename: string

  @Column({ type: 'text' })
  mimetype: string

  @Column({ type: 'bigint' })
  size: number

  @Column({ type: 'text' })
  signedURL: string

  @Index()
  @Column()
  expiryDateURL: Date
}
