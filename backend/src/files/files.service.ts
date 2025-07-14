// src/files/files.service.ts
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UploadTracking } from './entities/upload-tracking.entity';

// Importar las nuevas entidades específicas
import { SycloCA000P } from './entities/syclo-ca000p.entity';
import { SycloCA000S } from './entities/syclo-ca000s.entity';
import { MfndCODO03 } from './entities/mfnd-c-odo03.entity';
import { MfndCODO03D } from './entities/mfnd-c-odo03d.entity';
import { SycloCA000G } from './entities/syclo-ca000g.entity';

import * as XLSX from 'xlsx';
import * as csv from 'csv-parser';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(UploadTracking)
    private uploadTrackingRepository: Repository<UploadTracking>,
    @InjectRepository(SycloCA000P)
    private sycloCA000PRepository: Repository<SycloCA000P>,
    @InjectRepository(SycloCA000S)
    private sycloCA000SRepository: Repository<SycloCA000S>,
    @InjectRepository(MfndCODO03)
    private mfndCODO03Repository: Repository<MfndCODO03>,
    @InjectRepository(MfndCODO03D)
    private mfndCODO03DRepository: Repository<MfndCODO03D>,
    @InjectRepository(SycloCA000G)
    private sycloCA000GRepository: Repository<SycloCA000G>,
  ) {}

  // Mapeo de repositorios por nombre de tabla
  private getRepositoryForTable(tableName: string): Repository<any> {
    const repositoryMap = {
      '/SYCLO/CA000P': this.sycloCA000PRepository,
      '/SYCLO/CA000S': this.sycloCA000SRepository,
      '/MFND/C_ODO03': this.mfndCODO03Repository,
      '/MFND/C_ODO03D': this.mfndCODO03DRepository,
      '/SYCLO/CA000G': this.sycloCA000GRepository,
    };

    const repository = repositoryMap[tableName];
    if (!repository) {
      throw new Error(`No repository found for table: ${tableName}`);
    }
    return repository;
  }

  // Lista de tablas soportadas
  private getSupportedTables(): string[] {
    return [
      '/SYCLO/CA000P',
      '/SYCLO/CA000S',
      '/MFND/C_ODO03',
      '/MFND/C_ODO03D',
      '/SYCLO/CA000G',
    ];
  }

  // Verificar si una tabla es soportada
  private isTableSupported(tableName: string): boolean {
    return this.getSupportedTables().includes(tableName);
  }

  // Mapear fila CSV a entidad específica
  private mapCsvRowToEntity(row: any, tableName: string, uploadId: string): any {
    const baseFields = {
      company: row.COMPANY || '',
      product: row.PRODUCT || '',
      version: row.VERSION || '',
      table: row.TABLE || '',
      mandt: row.MANDT || '',
      uploadId: uploadId,
      createdBy: row.CREATED_BY || '',
      createdTs: row.CREATED_TS || '',
      changedBy: row.CHANGED_BY || '',
      changedTs: row.CHANGED_TS || '',
    };

    switch (tableName) {
      case '/SYCLO/CA000P':
        return {
          ...baseFields,
          recordNo: row.RECORD_NO || '',
          paramName: row.PARAM_NAME || '',
          paramValue: row.PARAM_VALUE || '',
          paramGroup: row.PARAM_GROUP || '',
          depRecordNo: row.DEP_RECORD_NO || '',
          paramType: row.PARAM_TYPE || '',
          paramScope: row.PARAM_SCOPE || '',
          paramComment: row.PARAM_COMMENT || '',
          active: row.ACTIVE || '',
          flagNoChange: row.FLAG_NO_CHANGE || '',
          enableRule: row.ENABLE_RULE || '',
          enableLanguVal: row.ENABLE_LANGU_VAL || '',
          ruleCat: row.RULE_CAT || '',
          ruleId: row.RULE_ID || '',
          ruleInput: row.RULE_INPUT || '',
        };

      case '/SYCLO/CA000S':
        return {
          ...baseFields,
          recordNo: row.RECORD_NO || '',
          objectType: row.OBJECT_TYPE || '',
          mobileStatus: row.MOBILE_STATUS || '',
          mblstatusLabel: row.MBLSTATUS_LABEL || '',
          istat: row.ISTAT || '',
          stsma: row.STSMA || '',
          estat: row.ESTAT || '',
          statusAttr1: row.STATUS_ATTR_1 || '',
          statusAttr2: row.STATUS_ATTR_2 || '',
          flagInitStatus: row.FLAG_INIT_STATUS || '',
          flagNoUpdate: row.FLAG_NO_UPDATE || '',
          flagDisabled: row.FLAG_DISABLED || '',
        };

      case '/MFND/C_ODO03':
        return {
          ...baseFields,
          ruleKey: row.RULE_KEY || '',
          ruleNo: row.RULE_NO || '',
          ruleType: row.RULE_TYPE || '',
          rangeSign: row.RANGE_SIGN || '',
          rangeOption: row.RANGE_OPTION || '',
          ruleValue: row.RULE_VALUE || '',
          ruleValue1: row.RULE_VALUE_1 || '',
          active: row.ACTIVE || '',
          ownerObject: row.OWNER_OBJECT || '',
        };

      case '/MFND/C_ODO03D':
        return {
          ...baseFields,
          ruleKey: row.RULE_KEY || '',
          active: row.ACTIVE || '',
          mobileApp: row.MOBILE_APP || '',
          ownerObject: row.OWNER_OBJECT || '',
          ruleType: row.RULE_TYPE || '',
          ruleValue: row.RULE_VALUE || '',
          ruleValue1: row.RULE_VALUE1 || '',
          ruleValue2: row.RULE_VALUE2 || '',
          ruleValue3: row.RULE_VALUE3 || '',
        };

      case '/SYCLO/CA000G':
        return {
          ...baseFields,
          mobileApp: row.MOBILE_APP || '',
          assignmentNo: row.ASSIGNMENT_NO || '',
          rootObjtyp: row.ROOT_OBJTYP || '',
          rootObjkey: row.ROOT_OBJKEY || '',
          childObjtyp: row.CHILD_OBJTYP || '',
          childObjkey: row.CHILD_OBJKEY || '',
          active: row.ACTIVE || '',
          inScope: row.IN_SCOPE || '',
          ruleValue3: row.RULE_VALUE3 || '',
        };

      default:
        throw new Error(`Unknown table mapping for: ${tableName}`);
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    userId?: string // ID del usuario que sube el archivo
  ): Promise<{ message: string; recordsProcessed: number }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let data: any[] = [];
    let uploadTracking: UploadTracking;

    try {
      console.log(`Processing file: ${file.originalname}`);

      // 1. Parsear el archivo según su tipo
      if (file.mimetype === 'text/csv') {
        data = await this.parseCSV(file.buffer);
      } else if (
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel'
      ) {
        data = await this.parseExcel(file.buffer);
      } else {
        throw new BadRequestException('Unsupported file format. Please upload CSV or Excel files.');
      }

      console.log(`Parsed ${data.length} rows from file`);

      // 2. Validar que tengamos datos
      if (data.length === 0) {
        throw new BadRequestException('No data found in file');
      }

      // 3. Obtener información del primer registro válido para el tracking
      let company = '';
      let product = '';
      let version = '';

      // Buscar el primer registro válido para extraer company/product/version
      for (const record of data) {
        if (record && record.COMPANY && record.PRODUCT && record.VERSION) {
          company = record.COMPANY;
          product = record.PRODUCT;  
          version = record.VERSION;
          break;
        }
      }

      // Validar que encontramos información válida
      if (!company || !product || !version) {
        console.log('Sample records:', data.slice(0, 3));
        throw new BadRequestException('Invalid file format: Could not find valid COMPANY, PRODUCT, or VERSION in any record');
      }

      console.log(`Upload info: ${company}/${product}/${version}`);

      // 4. Crear registro de tracking
      uploadTracking = this.uploadTrackingRepository.create({
        company,
        product,
        version,
        fileName: file.originalname,
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date(),
        totalRecords: data.length,
        status: 'processing',
        tablesProcessed: [],
      });

      await this.uploadTrackingRepository.save(uploadTracking);
      console.log(`Created upload tracking with ID: ${uploadTracking.id}`);

      // 5. Agrupar datos por tabla (columna 4 = TABLE)
      const dataByTable = this.groupDataByTable(data);
      console.log(`Found ${Object.keys(dataByTable).length} different tables:`, Object.keys(dataByTable));

      const tablesProcessed: string[] = [];
      let totalRecordsProcessed = 0;

      // 6. Procesar cada tabla
      for (const [tableName, tableData] of Object.entries(dataByTable)) {
        console.log(`\nProcessing table: ${tableName} with ${tableData.length} records`);

        // Verificar si la tabla es soportada
        if (!this.isTableSupported(tableName)) {
          console.warn(`⚠️  Table ${tableName} is not supported, skipping...`);
          continue;
        }

        try {
          // Convertir datos del CSV a entidades usando el mapeo manual
          const entities = tableData.map(row => {
            try {
              return this.mapCsvRowToEntity(row, tableName, uploadTracking.id);
            } catch (error) {
              console.error(`Error mapping row for table ${tableName}:`, error);
              console.log('Problem row:', row);
              throw error;
            }
          });

          console.log(`✓ Mapped ${entities.length} entities for table ${tableName}`);

          // Obtener el repositorio específico para esta tabla
          const repository = this.getRepositoryForTable(tableName);

          // Guardar las entidades en lotes para mejor performance
          const batchSize = 100;
          let savedCount = 0;

          for (let i = 0; i < entities.length; i += batchSize) {
            const batch = entities.slice(i, i + batchSize);
            await repository.save(batch);
            savedCount += batch.length;
            console.log(`  Saved batch: ${savedCount}/${entities.length}`);
          }

          tablesProcessed.push(tableName);
          totalRecordsProcessed += entities.length;

          console.log(`✅ Successfully processed ${entities.length} records for table ${tableName}`);

        } catch (error) {
          console.error(`❌ Error processing table ${tableName}:`, error);
          throw new BadRequestException(`Error processing table ${tableName}: ${error.message}`);
        }
      }

      // 7. Actualizar el tracking con la información final
      uploadTracking.tablesProcessed = tablesProcessed;
      uploadTracking.totalRecords = totalRecordsProcessed;
      uploadTracking.status = 'completed';
      await this.uploadTrackingRepository.save(uploadTracking);

      console.log(`\n🎉 Upload completed successfully!`);
      console.log(`Total records processed: ${totalRecordsProcessed}`);
      console.log(`Tables processed: ${tablesProcessed.length} (${tablesProcessed.join(', ')})`);

      return {
        message: `File processed successfully. ${totalRecordsProcessed} records processed across ${tablesProcessed.length} tables: ${tablesProcessed.join(', ')}`,
        recordsProcessed: totalRecordsProcessed,
      };

    } catch (error) {
      console.error('💥 Error during file upload:', error);

      // Actualizar tracking en caso de error
      if (uploadTracking) {
        uploadTracking.status = 'error';
        uploadTracking.errorMessage = error.message;
        await this.uploadTrackingRepository.save(uploadTracking);
      }
      
      throw new BadRequestException(`Error processing file: ${error.message}`);
    }
  }

  // Agrupar datos por tabla usando la columna TABLE (índice 3 o propiedad TABLE)
  private groupDataByTable(data: any[]): Record<string, any[]> {
    const grouped: Record<string, any[]> = {};
    
    data.forEach((row, index) => {
      let tableName: string;

      // Determinar el nombre de la tabla de la columna 4
      if (Array.isArray(row)) {
        // Si el row es un array (índices), la columna TABLE está en índice 3
        tableName = row[3];
      } else {
        // Si el row es un objeto (propiedades), usar la propiedad TABLE
        tableName = row.TABLE;
      }

      // Validar que tengamos un nombre de tabla válido
      if (!tableName || tableName === 'TABLE' || tableName.trim() === '') {
        console.warn(`Row ${index + 1}: No valid table name found, skipping...`);
        return;
      }

      // Inicializar el grupo si no existe
      if (!grouped[tableName]) {
        grouped[tableName] = [];
      }

      // Agregar el row al grupo correspondiente
      grouped[tableName].push(row);
    });

    // Log de resumen de agrupación
    Object.entries(grouped).forEach(([tableName, rows]) => {
      console.log(`Table "${tableName}": ${rows.length} records`);
    });

    return grouped;
  }

  // Parser para archivos CSV
  private async parseCSV(buffer: Buffer): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const results: any[] = [];
      const csvContent = buffer.toString();
      
      console.log('First 200 chars of CSV:', csvContent.substring(0, 200));
      
      // Detectar el separador correcto
      const firstLine = csvContent.split('\n')[0];
      let separator = ',';
      
      if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
        separator = ';';
      }
      
      console.log(`Detected separator: "${separator}"`);
      
      const stream = Readable.from(csvContent);
      
      stream
        .pipe(csv({
          separator: separator
        }))
        .on('data', (data: any) => {
          // Filtrar filas que son headers o vacías
          if (data.COMPANY && data.COMPANY !== 'COMPANY' && data.COMPANY.trim() !== '') {
            results.push(data);
          }
        })
        .on('end', () => {
          console.log(`CSV parsing completed: ${results.length} valid rows`);
          if (results.length > 0) {
            console.log('Sample parsed record:', results[0]);
          }
          resolve(results);
        })
        .on('error', (error) => {
          console.error('CSV parsing error:', error);
          reject(error);
        });
    });
  }

  // Parser para archivos Excel
  private async parseExcel(buffer: Buffer): Promise<any[]> {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convertir a JSON sin headers fijos - usar los del archivo
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Filtrar filas válidas
      const validData = data.filter((row: any) => 
        row.COMPANY && 
        row.COMPANY !== 'COMPANY' && 
        row.TABLE && 
        row.TABLE !== 'TABLE'
      );

      console.log(`Excel parsing completed: ${validData.length} valid rows`);
      return validData;

    } catch (error) {
      console.error('Excel parsing error:', error);
      throw new BadRequestException(`Error parsing Excel file: ${error.message}`);
    }
  }

   async getUploadHistory(): Promise<any[]> {
    const uploads = await this.uploadTrackingRepository.find({
      order: { uploadedAt: 'DESC' }
    });

     console.log({uploads});
     return uploads;

    // return uploads.map(upload => ({
    //   id: upload.id,
    //   filename: upload.fileName,
    //   uploadedat: upload.uploadedAt,
    //   recordCount: upload.totalRecords,
    //   company: upload.company,
    //   version: upload.version,
    //   status: upload.status,
    //   tablesProcessed: upload.tablesProcessed,
    //   errorMessage: upload.errorMessage
    // }));
  }

   async deleteByFileNameAndDate(fileName: string, uploadDate: string): Promise<{ message: string; deletedRecords: number }> {
    try {
      console.log(`🗑️ Attempting to delete file: ${fileName} uploaded at: ${uploadDate}`);
      
      // Parsear y validar la fecha
      const uploadDateTime = new Date(uploadDate);
      if (isNaN(uploadDateTime.getTime())) {
        throw new BadRequestException('Invalid upload date format');
      }

      // Buscar el upload específico por fileName y fecha exacta
      // Usar un rango de tiempo pequeño para manejar diferencias de milisegundos
      const startTime = new Date(uploadDateTime.getTime() - 5000); // 5 segundos antes
      const endTime = new Date(uploadDateTime.getTime() + 5000);   // 5 segundos después

      const upload = await this.uploadTrackingRepository
        .createQueryBuilder('upload')
        .where('upload.fileName = :fileName', { fileName })
        .andWhere('upload.uploadedAt BETWEEN :startTime AND :endTime', { 
          startTime, 
          endTime 
        })
        .getOne();

      if (!upload) {
        // Buscar uploads con el mismo fileName para debugging
        const allUploadsWithSameName = await this.uploadTrackingRepository.find({
          where: { fileName },
          order: { uploadedAt: 'DESC' }
        });

        // console.log(`❌ Upload not found for: ${fileName} at ${uploadDate}`);
        // console.log('📁 Available uploads with same fileName:', allUploadsWithSameName.map(u => ({
        //   id: u.id,
        //   fileName: u.fileName,
        //   uploadedAt: u.uploadedAt,
        //   company: u.company,
        //   version: u.version
        // })));

        throw new BadRequestException(
          `Upload not found: ${fileName} at ${uploadDate}. Found ${allUploadsWithSameName.length} uploads with the same filename.`
        );
      }

      // console.log(`✅ Found upload to delete:`, {
      //   id: upload.id,
      //   fileName: upload.fileName,
      //   uploadedAt: upload.uploadedAt,
      //   company: upload.company,
      //   version: upload.version,
      //   totalRecords: upload.totalRecords,
      //   tablesProcessed: upload.tablesProcessed
      // });

      let totalDeletedRecords = 0;

      // Eliminar datos de cada tabla procesada
      for (const tableName of upload.tablesProcessed || []) {
        // console.log(`🔄 Processing table: ${tableName}`);
        
        if (!this.isTableSupported(tableName)) {
          // console.warn(`⚠️ Table ${tableName} is not supported, skipping...`);
          continue;
        }

        try {
          const repository = this.getRepositoryForTable(tableName);
          
          // Primero, contar cuántos registros vamos a eliminar
          const recordCount = await repository.count({ where: { uploadId: upload.id } });
          // console.log(`📊 Found ${recordCount} records to delete in table ${tableName}`);

          if (recordCount > 0) {
            // Eliminar los registros
            const deleteResult = await repository.delete({ uploadId: upload.id });
            const deletedCount = deleteResult.affected || 0;
            totalDeletedRecords += deletedCount;
            
            console.log(`✅ Deleted ${deletedCount} records from table ${tableName}`);
          } else {
            console.log(`ℹ️ No records found in table ${tableName} for uploadId: ${upload.id}`);
          }

        } catch (error) {
          console.error(`❌ Error deleting from table ${tableName}:`, error);
          // Continuar con las otras tablas aunque una falle
        }
      }

      // Eliminar el registro de tracking
      console.log(`🗑️ Deleting upload tracking record: ${upload.id}`);
      const trackingDeleteResult = await this.uploadTrackingRepository.delete({ id: upload.id });
      console.log(`✅ Upload tracking deleted, affected rows: ${trackingDeleteResult.affected}`);

      const successMessage = `File "${fileName}" deleted successfully. Removed ${totalDeletedRecords} data records from ${upload.tablesProcessed?.length || 0} tables.`;
      console.log(`🎉 ${successMessage}`);

      return {
        message: successMessage,
        deletedRecords: totalDeletedRecords,
      };

    } catch (error) {
      console.error('💥 Error in deleteByFileNameAndDate:', error);
      
      // Si es un BadRequestException, relanzarlo
      if (error instanceof BadRequestException) {
        throw error;
      }
      
      // Para otros errores, envolverlos en BadRequestException
      throw new BadRequestException(`Error deleting file: ${error.message}`);
    }
  };

  //   const repository = repositoryMap[tableName];
  //   if (!repository) {
  //     throw new Error(`No repository found for table: ${tableName}`);
  //   }
  //   return repository;
  // }

async compareUploads(
  fileName1: string,
  uploadDate1: string,
  fileName2: string,
  uploadDate2: string,
  tableFilter: string = 'all'
): Promise<any[]> {
  try {
    console.log(`🔄 Starting comparison between uploads:`);
    console.log(`  Selection 1: ${fileName1} at ${uploadDate1}`);
    console.log(`  Selection 2: ${fileName2} at ${uploadDate2}`);
    console.log(`  Table filter: ${tableFilter}`);

    // 1. Buscar los uploads específicos
    const upload1 = await this.findUploadByFileNameAndDate(fileName1, uploadDate1);
    const upload2 = await this.findUploadByFileNameAndDate(fileName2, uploadDate2);

    if (!upload1 || !upload2) {
      throw new BadRequestException('One or both uploads not found');
    }

    // 2. Determinar qué tablas comparar
    let tablesToCompare: string[] = [];
    
    if (tableFilter === 'all') {
      // Comparar solo las tablas que existen en ambos uploads
      const tables1 = upload1.tablesProcessed || [];
      const tables2 = upload2.tablesProcessed || [];
      tablesToCompare = tables1.filter(table => tables2.includes(table));
    } else {
      // Comparar solo la tabla específica si existe en ambos
      if ((upload1.tablesProcessed || []).includes(tableFilter) && 
          (upload2.tablesProcessed || []).includes(tableFilter)) {
        tablesToCompare = [tableFilter];
      }
    }

    console.log(`📊 Tables to compare: ${tablesToCompare.join(', ')}`);

    if (tablesToCompare.length === 0) {
      return [];
    }

    // 3. Comparar cada tabla
    const results: any[] = [];
    
    for (const tableName of tablesToCompare) {
      if (!this.isTableSupported(tableName)) {
        console.warn(`⚠️ Table ${tableName} is not supported, skipping...`);
        continue;
      }

      try {
        const comparisonResult = await this.compareTableData(
          tableName, 
          upload1.id, 
          upload2.id
        );
        
        if (comparisonResult.totalRecords > 0) {
          results.push(comparisonResult);
        }
      } catch (error) {
        console.error(`❌ Error comparing table ${tableName}:`, error);
      }
    }

    console.log(`✅ Comparison completed. ${results.length} tables with differences found.`);
    return results;

  } catch (error) {
    console.error('💥 Error in compareUploads:', error);
    throw new BadRequestException(`Error comparing uploads: ${error.message}`);
  }
}

private async findUploadByFileNameAndDate(fileName: string, uploadDate: string): Promise<any> {
  const uploadDateTime = new Date(uploadDate);
  if (isNaN(uploadDateTime.getTime())) {
    throw new BadRequestException(`Invalid upload date format: ${uploadDate}`);
  }

  // Buscar con rango de tiempo para manejar diferencias de milisegundos
  const startTime = new Date(uploadDateTime.getTime() - 5000);
  const endTime = new Date(uploadDateTime.getTime() + 5000);

  return await this.uploadTrackingRepository
    .createQueryBuilder('upload')
    .where('upload.fileName = :fileName', { fileName })
    .andWhere('upload.uploadedAt BETWEEN :startTime AND :endTime', { 
      startTime, 
      endTime 
    })
    .getOne();
}

private async compareTableData(
  tableName: string, 
  uploadId1: string, 
  uploadId2: string
): Promise<any> {
  console.log(`🔍 Comparing table ${tableName} between uploads ${uploadId1} and ${uploadId2}`);
  
  // Obtener el repositorio para esta tabla
  const repository = this.getRepositoryForTable(tableName);
  
  // Obtener datos de ambos uploads
  const data1 = await repository.find({ where: { uploadId: uploadId1 } });
  const data2 = await repository.find({ where: { uploadId: uploadId2 } });
  
  console.log(`📊 Data counts - Upload 1: ${data1.length}, Upload 2: ${data2.length}`);

  // Configuración de campos y claves por tabla
  const tableConfig = this.getTableComparisonConfig(tableName);
  
  // Crear mapas usando el campo clave específico de cada tabla
  const data1Map = new Map<string, any>();
  const data2Map = new Map<string, any>();

  data1.forEach(item => {
    const key = item[tableConfig.keyField] || '';
    if (key) {
      data1Map.set(key, item);
    }
  });

  data2.forEach(item => {
    const key = item[tableConfig.keyField] || '';
    if (key) {
      data2Map.set(key, item);
    }
  });

  // Realizar comparación
  const comparisonRecords: any[] = [];
  let differences = 0;
  let newInSelection1 = 0;
  let newInSelection2 = 0;

  // Comparar registros de data1 vs data2
  for (const [key, item1] of data1Map) {
    const item2 = data2Map.get(key);

    if (!item2) {
      // Registro existe solo en upload 1
      const recordData: any = { 
        table: tableName, 
        type: 'new_in_selection1',
        [tableConfig.keyField]: key
      };
      
      tableConfig.compareFields.forEach(field => {
        recordData[field] = item1[field] || '';
      });

      comparisonRecords.push(recordData);
      newInSelection1++;
    } else {
      // Verificar si hay diferencias en los campos de comparación
      let hasDifferences = false;
      const diffFields: string[] = [];
      
      for (const field of tableConfig.compareFields) {
        const value1 = (item1[field] || '').toString();
        const value2 = (item2[field] || '').toString();
        if (value1 !== value2) {
          hasDifferences = true;
          diffFields.push(field);
        }
      }
      
      if (hasDifferences) {
        const recordData: any = { 
          table: tableName, 
          type: 'different', 
          diffFields,
          [tableConfig.keyField]: key
        };
        
        tableConfig.compareFields.forEach(field => {
          recordData[`${field}_sel1`] = item1[field] || '';
          recordData[`${field}_sel2`] = item2[field] || '';
        });

        comparisonRecords.push(recordData);
        differences++;
      }
    }
  }

  // Buscar registros que existen solo en data2
  for (const [key, item2] of data2Map) {
    if (!data1Map.has(key)) {
      const recordData: any = { 
        table: tableName, 
        type: 'new_in_selection2',
        [tableConfig.keyField]: key
      };
      
      tableConfig.compareFields.forEach(field => {
        recordData[field] = item2[field] || '';
      });

      comparisonRecords.push(recordData);
      newInSelection2++;
    }
  }

  console.log(`📈 Comparison results for ${tableName}:`, {
    totalRecords: comparisonRecords.length,
    differences,
    newInSelection1,
    newInSelection2
  });

  return {
    table: tableName,
    totalRecords: comparisonRecords.length,
    differences,
    newInSelection1,
    newInSelection2,
    records: comparisonRecords,
    fields: tableConfig.compareFields,
    keyField: tableConfig.keyField
  };
}

private getTableComparisonConfig(tableName: string): { keyField: string; compareFields: string[] } {
  const configs = {
    '/SYCLO/CA000P': {
      keyField: 'paramName',
      compareFields: [
        'paramName', 'paramValue', 'paramGroup', 'depRecordNo', 
        'paramType', 'paramScope', 'paramComment', 'active', 'flagNoChange',
        'enableRule', 'enableLanguVal', 'ruleCat', 'ruleId', 'ruleInput'
      ]
    },
    '/SYCLO/CA000S': {
      keyField: 'objectType',
      compareFields: [
        'objectType', 'mobileStatus', 'mblstatusLabel', 'istat', 'stsma', 
        'estat', 'statusAttr1', 'statusAttr2', 'flagInitStatus', 
        'flagNoUpdate', 'flagDisabled'
      ]
    },
    '/MFND/C_ODO03': {
      keyField: 'ruleKey',
      compareFields: [
        'ruleKey', 'ruleNo', 'ruleType', 'rangeSign', 'rangeOption', 
        'ruleValue', 'ruleValue1', 'active', 'ownerObject'
      ]
    },
    '/MFND/C_ODO03D': {
      keyField: 'ruleKey',
      compareFields: [
        'ruleKey', 'active', 'mobileApp', 'ownerObject', 'ruleType', 
        'ruleValue', 'ruleValue1', 'ruleValue2', 'ruleValue3'
      ]
    },
    '/SYCLO/CA000G': {
      keyField: 'rootObjkey',
      compareFields: [
        'mobileApp', 'assignmentNo', 'rootObjtyp', 'rootObjkey', 
        'childObjtyp', 'childObjkey', 'active', 'inScope', 'ruleValue3'
      ]
    }
  };

  const config = configs[tableName];
  if (!config) {
    throw new Error(`No comparison configuration found for table: ${tableName}`);
  }

  return config;
}

}
