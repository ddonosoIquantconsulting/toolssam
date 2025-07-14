// src/files/entities/syclo-ca000s.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from 'typeorm';

@Entity('syclo_ca000s')
@Index(['company', 'version', 'objectType', 'mobileStatus'])
@Index(['uploadId'])
export class SycloCA000S {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  company: string;

  @Column()
  product: string;

  @Column()
  version: string;

  @Column()
  table: string;

  @Column()
  mandt: string;

  @Column()
  recordNo: string;

  @Column({ nullable: true })
  objectType: string;

  @Column({ nullable: true })
  mobileStatus: string;

  @Column({ nullable: true })
  mblstatusLabel: string;

  @Column({ nullable: true })
  istat: string;

  @Column({ nullable: true })
  stsma: string;

  @Column({ nullable: true })
  estat: string;

  @Column({ nullable: true })
  statusAttr1: string;

  @Column({ nullable: true })
  statusAttr2: string;

  @Column({ nullable: true })
  flagInitStatus: string;

  @Column({ nullable: true })
  flagNoUpdate: string;

  @Column({ nullable: true })
  flagDisabled: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  createdTs: string;

  @Column({ nullable: true })
  changedBy: string;

  @Column({ nullable: true })
  changedTs: string;

  // Referencia al upload
  @Column({ type: 'uuid' })
  uploadId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}