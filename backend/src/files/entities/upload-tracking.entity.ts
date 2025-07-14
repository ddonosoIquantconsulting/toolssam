// src/files/entities/upload-tracking.entity.ts
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  Index 
} from 'typeorm';

@Entity('upload_tracking')
@Index(['company', 'product', 'version', 'uploadedAt'])
export class UploadTracking {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  company: string;

  @Column({ length: 100 })
  product: string;

  @Column({ length: 50 })
  version: string;

  @Column({ length: 255 })
  fileName: string;

  @Column({ length: 100 })
  uploadedBy: string;

  @Column({ type: 'timestamp' })
  uploadedAt: Date;

  @Column({ type: 'int', default: 0 })
  totalRecords: number;

  @Column({ type: 'json', nullable: true })
  tablesProcessed: string[]; // Array con las tablas que se procesaron

  @Column({ type: 'varchar', length: 20, default: 'completed' })
  status: string; // 'processing', 'completed', 'error'

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}