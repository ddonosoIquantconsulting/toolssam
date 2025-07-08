import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('csv_data')
export class CSVData {
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

  @Column()
  paramName: string;

  @Column('text')
  paramValue: string;

  @Column()
  paramGroup: string;

  @Column()
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

  @Column()
  createdBy: string;

  @Column({ nullable: true })
  createdTs: string;

  @Column({ nullable: true })
  changedBy: string;

  @Column({ nullable: true })
  changedTs: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}