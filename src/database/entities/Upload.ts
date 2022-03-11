import { Column, DeleteDateColumn, Entity } from 'typeorm'
import { Base } from './Base'

interface UploadEntity {
  id?: string
  keyFile: string
  filename: string
  mimetype: string
  size: number
  signedUrl: string
  expiryDateUrl: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
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
  signedUrl: string

  @Column()
  expiryDateUrl: Date
}
