// src/files/entities/syclo-ca000g.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn, 
  Index 
} from 'typeorm';

@Entity('syclo_ca000g')
@Index(['company', 'version', 'rootObjtyp', 'childObjtyp'])
@Index(['uploadId'])
export class SycloCA000G {
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
  mobileApp: string;

  @Column({ nullable: true })
  assignmentNo: string;

  @Column({ nullable: true })
  rootObjtyp: string;

  @Column({ nullable: true })
  rootObjkey: string;

  @Column({ nullable: true })
  childObjtyp: string;

  @Column({ nullable: true })
  childObjkey: string;

  @Column({ nullable: true })
  active: string;

  @Column({ nullable: true })
  inScope: string;

  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  createdTs: string;

  @Column({ nullable: true })
  changedBy: string;

  @Column({ nullable: true })
  changedTs: string;

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