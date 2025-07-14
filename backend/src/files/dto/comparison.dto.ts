// src/files/dto/comparison.dto.ts

export interface ComparisonSelectionDto {
  fileName: string;
  uploadDate: string;
}

export interface CompareUploadsDto {
  selection1: ComparisonSelectionDto;
  selection2: ComparisonSelectionDto;
  table: string; // 'all' o nombre específico de tabla
}

export interface ComparisonRecord {
  table: string;
  type: 'different' | 'new_in_selection1' | 'new_in_selection2';
  diffFields?: string[];
  [key: string]: any; // Para campos dinámicos según la tabla
}

export interface ComparisonResult {
  table: string;
  totalRecords: number;
  differences: number;
  newInSelection1: number;
  newInSelection2: number;
  records: ComparisonRecord[];
  fields: string[];
  keyField: string;
}