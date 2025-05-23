import { Column, DeleteDateColumn, Entity, Index } from 'typeorm'
import { Base } from './base'

@Entity({ name: 'upload' })
export class Upload extends Base {
  @Index()
  @DeleteDateColumn({ nullable: true })
  deleted_at!: Date

  @Index()
  @Column({ type: 'text' })
  keyfile: string

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
