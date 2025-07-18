// src/files/entities/intermediate-row.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('intermediate_rows')
export class IntermediateRow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  company: string;

  @Column({ type: 'varchar', length: 100 })
  product: string;

  @Column({ type: 'varchar', length: 50 })
  version: string;

  @Column({ type: 'varchar', length: 100 })
  table: string;

  @Column({ type: 'text' })
  content_linea: string; // Toda la línea CSV como string

  @Column({ type: 'varchar', length: 100 })
  fileName: string;

  @Column({ type: 'varchar', length: 100, default: 'anonymous' })
  uploadedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'uuid' })
  uploadId: string;
}