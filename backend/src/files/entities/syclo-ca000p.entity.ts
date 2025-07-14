// src/files/entities/syclo-ca000p.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from 'typeorm';

@Entity('syclo_ca000p')
@Index(['company', 'version', 'paramName', 'recordNo'])
@Index(['uploadId'])
export class SycloCA000P {
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
  paramName: string;

  @Column({ nullable: true })
  paramValue: string;

  @Column({ nullable: true })
  paramGroup: string;

  @Column({ nullable: true })
  depRecordNo: string;

  @Column({ nullable: true })
  paramType: string;

  @Column({ nullable: true })
  paramScope: string;

  @Column({ nullable: true })
  paramComment: string;

  @Column({ nullable: true })
  active: string;

  @Column({ nullable: true })
  flagNoChange: string;

  @Column({ nullable: true })
  enableRule: string;

  @Column({ nullable: true })
  enableLanguVal: string;

  @Column({ nullable: true })
  ruleCat: string;

  @Column({ nullable: true })
  ruleId: string;

  @Column({ nullable: true })
  ruleInput: string;

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