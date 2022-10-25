import { Column, DeleteDateColumn, Entity } from 'typeorm'
import { Base, IBaseEntity } from './Base'

interface UploadEntity extends IBaseEntity {
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
  @DeleteDateColumn({ nullable: true })
  deletedAt!: Date

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

  @Column()
  expiryDateURL: Date
}
