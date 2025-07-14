// src/files/entities/mfnd-c-odo03d.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from 'typeorm';

@Entity('mfnd_c_odo03d')
@Index(['company', 'version', 'ruleKey', 'ruleType'])
@Index(['uploadId'])
export class MfndCODO03D {
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
  active: string;

  @Column({ nullable: true })
  mobileApp: string;

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

  @Column({ nullable: true })
  ruleType: string;

  @Column({ nullable: true })
  ruleValue: string;

  @Column({ nullable: true })
  ruleValue1: string;

  @Column({ nullable: true })
  ruleValue2: string;

  @Column({ nullable: true })
  ruleValue3: string;

  // Referencia al upload
  @Column({ type: 'uuid' })
  uploadId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}