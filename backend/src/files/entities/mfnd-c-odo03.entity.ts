// src/files/entities/mfnd-c-odo03.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from 'typeorm';

@Entity('mfnd_c_odo03')
@Index(['company', 'version', 'ruleNo', 'ruleType'])
@Index(['uploadId'])
export class MfndCODO03 {
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

  @Column({ nullable: true })
  ruleKey: string;

  @Column({ nullable: true })
  ruleNo: string;

  @Column({ nullable: true })
  ruleType: string;

  @Column({ nullable: true })
  rangeSign: string;

  @Column({ nullable: true })
  rangeOption: string;

  @Column({ nullable: true })
  ruleValue: string;

  @Column({ nullable: true })
  ruleValue1: string;

  @Column({ nullable: true })
  active: string;

  @Column({ nullable: true })
  ownerObject: string;

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