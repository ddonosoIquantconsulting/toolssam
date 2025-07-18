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
import { IntermediateRow } from './entities/intermediate-row.entity';



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
    @InjectRepository(IntermediateRow)
    private intermediateRowRepository: Repository<IntermediateRow>,
  ) {}

 // 🔧 Parser CSV manual - SIN usar csv-parser
private async parseCSV(buffer: Buffer): Promise<{ data: any[], originalLines: string[], separator: string }> {
  try {
    const csvContent = buffer.toString();
    const originalLines = csvContent.split('\n').filter(line => line.trim() !== '');

    if (originalLines.length === 0) {
      throw new Error('No lines found in CSV');
    }
    
    // Detectar separador
    const firstLine = originalLines[0];
    let separator = ',';
    
    if (firstLine.includes(';') && firstLine.split(';').length > firstLine.split(',').length) {
      separator = ';';
    }
    // Obtener headers de la primera línea
    const headers = firstLine.split(separator).map(h => h.trim().replace(/^"(.*)"$/, '$1'));
    // Procesar líneas de datos (desde línea 1 en adelante)
    const data: any[] = [];
    
    for (let i = 0; i < originalLines.length; i++) {
      const line = originalLines[i].trim();
      if (!line) continue; // Skip empty lines
      // Dividir línea por separador
      const values = line.split(separator).map(v => v.trim().replace(/^"(.*)"$/, '$1'));
      // Crear objeto con headers como keys
      const rowObject: any = {};
      headers.forEach((header, index) => {
        rowObject[header] = values[index] || '';
      });
      
        data.push(rowObject);
  
    }
    return { data, originalLines, separator };
    
  } catch (error) {
    console.error('❌ Manual CSV parsing error:', error);
    throw new BadRequestException(`Error parsing CSV: ${error.message}`);
  }
}

 // 🔍 Función para parsear content_linea de MfndCODO03D
  private parseMfndCODO03DLine(contentLinea: string, uploadId: string): MfndCODO03D {
    // Formato esperado para MFND/C_ODO03D
    const fields = contentLinea.split(',');
    
    if (fields.length < 4) {
      throw new Error(`Invalid MfndCODO03D line format: ${contentLinea}`);
    }

    const mfndEntity = new MfndCODO03D();
    
    // Mapear campos según el orden en el CSV
    mfndEntity.company = fields[0] || '';
    mfndEntity.product = fields[1] || '';
    mfndEntity.version = fields[2] || '';
    mfndEntity.table = fields[3] || '';
    mfndEntity.mandt = fields[4] || '';
    mfndEntity.ruleKey = fields[5] || null;
    mfndEntity.active = fields[6] || null;
    mfndEntity.mobileApp = fields[7] || null;
    mfndEntity.ownerObject = fields[8] || null;
    mfndEntity.createdBy = fields[9] || null;
    mfndEntity.createdTs = fields[10] || null;
    mfndEntity.changedBy = fields[11] || null;
    mfndEntity.changedTs = fields[12] || null;
    mfndEntity.ruleType = fields[13] || null;
    mfndEntity.ruleValue = fields[14] || null;
    mfndEntity.ruleValue1 = fields[15] || null;
    mfndEntity.ruleValue2 = fields[16] || null;
    mfndEntity.ruleValue3 = fields[17] || null;
    mfndEntity.uploadId = uploadId;

    return mfndEntity;
  }

// 🔍 Función para parsear content_linea de MfndCODO03
  private parseMfndCODO03Line(contentLinea: string, uploadId: string): MfndCODO03 {
    // Formato esperado para MFND/C_ODO03
    const fields = contentLinea.split(',');
    
    if (fields.length < 4) {
      throw new Error(`Invalid MfndCODO03 line format: ${contentLinea}`);
    }

    const mfndEntity = new MfndCODO03();
    
    // Mapear campos según el orden en el CSV
    mfndEntity.company = fields[0] || '';
    mfndEntity.product = fields[1] || '';
    mfndEntity.version = fields[2] || '';
    mfndEntity.table = fields[3] || '';
    mfndEntity.mandt = fields[4] || '';
    mfndEntity.ruleKey = fields[5] || null;
    mfndEntity.ruleNo = fields[6] || null;
    mfndEntity.ruleType = fields[7] || null;
    mfndEntity.rangeSign = fields[8] || null;
    mfndEntity.rangeOption = fields[9] || null;
    mfndEntity.ruleValue = fields[10] || null;
    mfndEntity.ruleValue1 = fields[11] || null;
    mfndEntity.active = fields[12] || null;
    mfndEntity.ownerObject = fields[13] || null;
    mfndEntity.createdBy = fields[14] || null;
    mfndEntity.createdTs = fields[15] || null;
    mfndEntity.changedBy = fields[16] || null;
    mfndEntity.changedTs = fields[17] || null;
    mfndEntity.uploadId = uploadId;

    return mfndEntity;
  }


 // 🔍 Función para parsear content_linea de SycloCA000G
  private parseSycloCA000GLine(contentLinea: string, uploadId: string): SycloCA000G {
    // Formato esperado similar a otras tablas Syclo pero con campos específicos de CA000G
    const fields = contentLinea.split(',');
    
    if (fields.length < 4) {
      throw new Error(`Invalid SycloCA000G line format: ${contentLinea}`);
    }

    const sycloEntity = new SycloCA000G();
    
    // Mapear campos según el orden en el CSV
    sycloEntity.company = fields[0] || '';
    sycloEntity.product = fields[1] || '';
    sycloEntity.version = fields[2] || '';
    sycloEntity.table = fields[3] || '';
    sycloEntity.mandt = fields[4] || '';
    sycloEntity.mobileApp = fields[5] || null;
    sycloEntity.assignmentNo = fields[6] || null;
    sycloEntity.rootObjtyp = fields[7] || null;
    sycloEntity.rootObjkey = fields[8] || null;
    sycloEntity.childObjtyp = fields[9] || null;
    sycloEntity.childObjkey = fields[10] || null;
    sycloEntity.active = fields[11] || null;
    sycloEntity.inScope = fields[12] || null;
    sycloEntity.createdBy = fields[13] || null;
    sycloEntity.createdTs = fields[14] || null;
    sycloEntity.changedBy = fields[15] || null;
    sycloEntity.changedTs = fields[16] || null;
    sycloEntity.ruleValue3 = fields[17] || null;
    sycloEntity.uploadId = uploadId;

    return sycloEntity;
  }

 // 🔍 Función para parsear content_linea de SycloCA000S
  private parseSycloCA000SLine(contentLinea: string, uploadId: string): SycloCA000S {
    // Formato esperado similar a CA000P pero con campos específicos de CA000S
    const fields = contentLinea.split(',');
    
    if (fields.length < 4) {
      throw new Error(`Invalid SycloCA000S line format: ${contentLinea}`);
    }

    const sycloEntity = new SycloCA000S();
    
    // Mapear campos según el orden en el CSV
    sycloEntity.company = fields[0] || '';
    sycloEntity.product = fields[1] || '';
    sycloEntity.version = fields[2] || '';
    sycloEntity.table = fields[3] || '';
    sycloEntity.mandt = fields[4] || '';
    sycloEntity.recordNo = fields[5] || '';
    sycloEntity.objectType = fields[6] || null;
    sycloEntity.mobileStatus = fields[7] || null;
    sycloEntity.mblstatusLabel = fields[8] || null;
    sycloEntity.istat = fields[9] || null;
    sycloEntity.stsma = fields[10] || null;
    sycloEntity.estat = fields[11] || null;
    sycloEntity.statusAttr1 = fields[12] || null;
    sycloEntity.statusAttr2 = fields[13] || null;
    sycloEntity.flagInitStatus = fields[14] || null;
    sycloEntity.flagNoUpdate = fields[15] || null;
    sycloEntity.flagDisabled = fields[16] || null;
    sycloEntity.createdBy = fields[17] || null;
    sycloEntity.createdTs = fields[18] || null;
    sycloEntity.changedBy = fields[19] || null;
    sycloEntity.changedTs = fields[20] || null;
    sycloEntity.uploadId = uploadId;

    return sycloEntity;
  }

 // 🔍 Función para parsear content_linea de SycloCA000P
  private parseSycloCA000PLine(contentLinea: string, uploadId: string): SycloCA000P {
    // Formato esperado: CMP,SAP_SERVICE_ASSET_MANAGER,2410,/SYCLO/CA000P,100,0000000284,WCMCatalogProfileName,ZWCM,CATALOGTYPE,0000000000,,,,X,X,,,,,,SOLTESZI,,SOLTESZI,
    const fields = contentLinea.split(',');
    
    if (fields.length < 4) {
      throw new Error(`Invalid SycloCA000P line format: ${contentLinea}`);
    }

    const sycloEntity = new SycloCA000P();
    
    // Mapear campos según el orden en el CSV
    sycloEntity.company = fields[0] || '';
    sycloEntity.product = fields[1] || '';
    sycloEntity.version = fields[2] || '';
    sycloEntity.table = fields[3] || '';
    sycloEntity.mandt = fields[4] || '';
    sycloEntity.recordNo = fields[5] || '';
    sycloEntity.paramName = fields[6] || null;
    sycloEntity.paramValue = fields[7] || null;
    sycloEntity.paramGroup = fields[8] || null;
    sycloEntity.depRecordNo = fields[9] || null;
    sycloEntity.paramType = fields[10] || null;
    sycloEntity.paramScope = fields[11] || null;
    sycloEntity.paramComment = fields[12] || null;
    sycloEntity.active = fields[13] || null;
    sycloEntity.flagNoChange = fields[14] || null;
    sycloEntity.enableRule = fields[15] || null;
    sycloEntity.enableLanguVal = fields[16] || null;
    sycloEntity.ruleCat = fields[17] || null;
    sycloEntity.ruleId = fields[18] || null;
    sycloEntity.ruleInput = fields[19] || null;
    sycloEntity.createdBy = fields[20] || null;
    sycloEntity.createdTs = fields[21] || null;
    sycloEntity.changedBy = fields[22] || null;
    sycloEntity.changedTs = fields[23] || null;
    sycloEntity.uploadId = uploadId;

    return sycloEntity;
  }

// 🎯 Función unificada para procesar IntermediateRows y crear registros en todas las tablas
  private async processIntermediateToAllTables(uploadId: string): Promise<number> {
    try {
      // // Obtener todos los IntermediateRow que corresponden a todas las tablas procesables
      // const intermediateRows = await this.intermediateRowRepository.find({
      //   where: [
      //     // Tablas Syclo
      //     { table: '/SYCLO/CA000P' },
      //     { table: '/SYCLO/YCA000P' },
      //     { table: '/SYCLO/CA000S' },
      //     { table: '/SYCLO/YCA000S' },
      //     { table: '/SYCLO/CA000G' },
      //     { table: '/SYCLO/YCA000G' },
      //     // Tablas MFND
      //     { table: '/MFND/C_ODO03' },
      //     { table: '/MFND/YC_ODO03' },
      //     { table: '/MFND/C_ODO03D' },
      //     { table: '/MFND/YC_ODO03D' },
      //     { uploadId: uploadId } , // referencia a la subida
      //   ]
      // });
      const intermediateRows = await this.intermediateRowRepository.find({
        where: [
          // Tablas Syclo
          { table: '/SYCLO/CA000P', uploadId: uploadId },
          { table: '/SYCLO/YCA000P', uploadId: uploadId },
          { table: '/SYCLO/CA000S', uploadId: uploadId },
          { table: '/SYCLO/YCA000S', uploadId: uploadId },
          { table: '/SYCLO/CA000G', uploadId: uploadId },
          { table: '/SYCLO/YCA000G', uploadId: uploadId },
          // Tablas MFND
          { table: '/MFND/C_ODO03', uploadId: uploadId },
          { table: '/MFND/YC_ODO03', uploadId: uploadId },
          { table: '/MFND/C_ODO03D', uploadId: uploadId },
          { table: '/MFND/YC_ODO03D', uploadId: uploadId },
        ]
      });
      console.log({uploadId});
      console.log( "largo intermedio: ", intermediateRows.length )
      if (intermediateRows.length === 0) {        
        return 0;
      }

      // Arrays para acumular registros por tipo
      const sycloCA000PRecords: SycloCA000P[] = [];
      const sycloCA000SRecords: SycloCA000S[] = [];
      const sycloCA000GRecords: SycloCA000G[] = [];
      const mfndCODO03Records: MfndCODO03[] = [];
      const mfndCODO03DRecords: MfndCODO03D[] = [];

      // Procesar cada registro según su tabla
      let contador = 0;
      for (const row of intermediateRows) {
        try {
          contador++;
          // console.log({contador});
          if (row.table === '/SYCLO/CA000P' || row.table === '/SYCLO/YCA000P') {
            // Procesar como CA000P
            const sycloEntity = this.parseSycloCA000PLine(row.content_linea, uploadId);
            sycloCA000PRecords.push(sycloEntity);
        
            
          } else if (row.table === '/SYCLO/CA000S' || row.table === '/SYCLO/YCA000S') {
            // Procesar como CA000S
            const sycloEntity = this.parseSycloCA000SLine(row.content_linea, uploadId);
            sycloCA000SRecords.push(sycloEntity);
        
            
          } else if (row.table === '/SYCLO/CA000G' || row.table === '/SYCLO/YCA000G') {
            // Procesar como CA000G
            const sycloEntity = this.parseSycloCA000GLine(row.content_linea, uploadId);
            sycloCA000GRecords.push(sycloEntity);
        
            
          } else if (row.table === '/MFND/C_ODO03' || row.table === '/MFND/YC_ODO03') {
            // Procesar como MfndCODO03
            const mfndEntity = this.parseMfndCODO03Line(row.content_linea, uploadId);
            mfndCODO03Records.push(mfndEntity);
        
            
          } else if (row.table === '/MFND/C_ODO03D' || row.table === '/MFND/YC_ODO03D') {
            // Procesar como MfndCODO03D
            const mfndEntity = this.parseMfndCODO03DLine(row.content_linea, uploadId);
            mfndCODO03DRecords.push(mfndEntity);
        
          }
        } catch (error) {
        
        }
      }

      let totalSaved = 0;

      // Guardar todos los tipos de registros
      if (sycloCA000PRecords.length > 0) {
        await this.sycloCA000PRepository.save(sycloCA000PRecords);
        totalSaved += sycloCA000PRecords.length;
        
      }

      if (sycloCA000SRecords.length > 0) {
        await this.sycloCA000SRepository.save(sycloCA000SRecords);
        totalSaved += sycloCA000SRecords.length;
        
      }

      if (sycloCA000GRecords.length > 0) {
        await this.sycloCA000GRepository.save(sycloCA000GRecords);
        totalSaved += sycloCA000GRecords.length;
        
      }

      if (mfndCODO03Records.length > 0) {
        await this.mfndCODO03Repository.save(mfndCODO03Records);
        totalSaved += mfndCODO03Records.length;
        
      }

      if (mfndCODO03DRecords.length > 0) {
        await this.mfndCODO03DRepository.save(mfndCODO03DRecords);
        totalSaved += mfndCODO03DRecords.length;
        
      }

      
      return totalSaved;
      
    } catch (error) {
      
      throw error;
    }
  }

// 🎯 FUNCIÓN PRINCIPAL - Actualizada para incluir tracking y procesamiento
  async uploadFile(
    file: Express.Multer.File,
    userId?: string
  ): Promise<{ message: string; recordsProcessed: number; specialTablesProcessed: number }> {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    let uploadTracking: UploadTracking;
    
    try {
      let data: any[] = [];
      let originalLines: string[] = [];
      let separator: string = ',';

      // 1. Parsear según tipo de archivo
      if (file.mimetype === 'text/csv') {
        const csvResult = await this.parseCSV(file.buffer);
        data = csvResult.data;
        originalLines = csvResult.originalLines;
        separator = csvResult.separator;
      } else {
        throw new BadRequestException('Unsupported file format. Please upload CSV files.');
      }

      if (data.length === 0) {
        throw new BadRequestException('No data found in file');
      }

      // 2. Crear registro de tracking
      // const tablesProcessed = [...new Set(data.map(row => row.TABLE || ''))].filter(Boolean);
      const tablesProcessed = [...new Set(data.map(row => row.TABLE || ''))]
      .filter(Boolean)
      .filter(table => table !== 'TABLE');
      const firstRow = data[1];
      
      uploadTracking = this.uploadTrackingRepository.create({
        company: firstRow.COMPANY || '',
        product: firstRow.PRODUCT || '',
        version: firstRow.VERSION || '',
        fileName: file.originalname,
        uploadedBy: userId || 'anonymous',
        uploadedAt: new Date(),
        totalRecords: data.length,
        tablesProcessed,
        status: 'processing'
      });

      await this.uploadTrackingRepository.save(uploadTracking);
   

      // 3. Convertir a estructura intermedia y guardar
      const intermediateRows: IntermediateRow[] = [];

      data.forEach((row, index) => {
        try {
          const company = row.COMPANY || '';
          const product = row.PRODUCT || '';
          const version = row.VERSION || '';
          const table = row.TABLE || '';
          const content_linea = originalLines[index] || '';
          
          if (!content_linea) {
            console.warn(`⚠️ Row ${index}: No CSV line found`);
            return;
          }

          const intermediateRow = this.intermediateRowRepository.create({
            company,
            product,
            version,
            table,
            content_linea,
            fileName: file.originalname,
            uploadedBy: userId || 'anonymous',
            uploadId:uploadTracking.id, // para referenciar con tabla
          });
          intermediateRows.push(intermediateRow);
        } catch (error) {
          console.error(`❌ Error processing row ${index}:`, error);
        }
      });

      // 4. Guardar intermediate rows
      if (intermediateRows.length > 0) {
        await this.intermediateRowRepository.save(intermediateRows);      
      }

      // 5. Procesar todas las tablas especiales (Syclo y MFND)
      const specialTablesProcessed = await this.processIntermediateToAllTables(uploadTracking.id);

      // 6. Actualizar estado del tracking
      uploadTracking.status = 'completed';
      await this.uploadTrackingRepository.save(uploadTracking);

      return {
        message: `File processed successfully. ${intermediateRows.length} intermediate rows and ${specialTablesProcessed} special table records saved.`,
        recordsProcessed: intermediateRows.length,
        specialTablesProcessed
      };

    } catch (error) {
      console.error('💥 Error during file upload:', error);
      
      // Actualizar tracking con error si existe
      if (uploadTracking) {
        uploadTracking.status = 'error';
        uploadTracking.errorMessage = error.message;
        await this.uploadTrackingRepository.save(uploadTracking);
      }
      
      throw new BadRequestException(`Error processing file: ${error.message}`);
    }
  }

  // === MÉTODOS DE CONSULTA ===

  async getUploadHistory(): Promise<any[]> {
    const uploads = await this.uploadTrackingRepository.find({
      order: { uploadedAt: 'DESC' }
    });

    return uploads.map(upload => ({
      id: upload.id,
      fileName: upload.fileName,
      uploadedAt: upload.uploadedAt,
      recordCount: upload.totalRecords,
      company: upload.company,
      version: upload.version,
      status: upload.status,
      tablesProcessed: upload.tablesProcessed,
      errorMessage: upload.errorMessage
    }));
  }

  // async deleteByFileNameAndDate(fileName: string, uploadDate: string): Promise<{ message: string; deletedRecords: number }> {
  //   return null;
  // }
  async deleteByFileNameAndDate(fileName: string, uploadDate: string): Promise<{ message: string; deletedRecords: number }> {
    try {
      // 1. Buscar el upload tracking por fileName y uploadDate
      const uploadTracking = await this.uploadTrackingRepository.findOne({
        where: {
          fileName: fileName,
          uploadedAt: new Date(uploadDate)
        }
      });

      if (!uploadTracking) {
        throw new BadRequestException(`Upload not found for file: ${fileName} on date: ${uploadDate}`);
      }

      console.log(`🗑️ Starting deletion for upload ID: ${uploadTracking.id}`);

      let totalDeletedRecords = 0;

      // 2. Eliminar de todas las tablas específicas usando el uploadId
      
      // Eliminar de SycloCA000P
      const deletedCA000P = await this.sycloCA000PRepository.delete({ uploadId: uploadTracking.id });
      totalDeletedRecords += deletedCA000P.affected || 0;
      console.log(`🗑️ Deleted ${deletedCA000P.affected || 0} records from SycloCA000P`);

      // Eliminar de SycloCA000S
      const deletedCA000S = await this.sycloCA000SRepository.delete({ uploadId: uploadTracking.id });
      totalDeletedRecords += deletedCA000S.affected || 0;
      console.log(`🗑️ Deleted ${deletedCA000S.affected || 0} records from SycloCA000S`);

      // Eliminar de SycloCA000G
      const deletedCA000G = await this.sycloCA000GRepository.delete({ uploadId: uploadTracking.id });
      totalDeletedRecords += deletedCA000G.affected || 0;
      console.log(`🗑️ Deleted ${deletedCA000G.affected || 0} records from SycloCA000G`);

      // Eliminar de MfndCODO03
      const deletedMfndCODO03 = await this.mfndCODO03Repository.delete({ uploadId: uploadTracking.id });
      totalDeletedRecords += deletedMfndCODO03.affected || 0;
      console.log(`🗑️ Deleted ${deletedMfndCODO03.affected || 0} records from MfndCODO03`);

      // Eliminar de MfndCODO03D
      const deletedMfndCODO03D = await this.mfndCODO03DRepository.delete({ uploadId: uploadTracking.id });
      totalDeletedRecords += deletedMfndCODO03D.affected || 0;
      console.log(`🗑️ Deleted ${deletedMfndCODO03D.affected || 0} records from MfndCODO03D`);

      // 3. Eliminar de IntermediateRow (tabla intermedia)
      // const deletedIntermediate = await this.intermediateRowRepository.delete({ fileName: fileName });
      // totalDeletedRecords += deletedIntermediate.affected || 0;
      // console.log(`🗑️ Deleted ${deletedIntermediate.affected || 0} records from IntermediateRow`);

      // 4. Finalmente eliminar el registro de UploadTracking
      const deletedTracking = await this.uploadTrackingRepository.delete({ id: uploadTracking.id });
      totalDeletedRecords += deletedTracking.affected || 0;
      console.log(`🗑️ Deleted ${deletedTracking.affected || 0} records from UploadTracking`);

      console.log(`🎯 Total deletion completed: ${totalDeletedRecords} records deleted`);

      return {
        message: `Successfully deleted all data for file '${fileName}' uploaded on ${uploadDate}. Total records deleted: ${totalDeletedRecords}`,
        deletedRecords: totalDeletedRecords
      };

    } catch (error) {
      console.error('💥 Error during file deletion:', error);
      throw new BadRequestException(`Error deleting file data: ${error.message}`);
    }
  }

  // === MÉTODOS DE COMPARACIÓN ===

// 🔍 Función privada para comparar registros SycloCA000P entre dos uploads
  private async compareSycloCA000P(uploadId1: string, uploadId2: string, tableToFilter: string): Promise<any> {
    try {
      // Obtener registros del archivo 1 filtrados por tabla específica
      const records1 = await this.sycloCA000PRepository.find({
        where: { 
          uploadId: uploadId1,
          table: tableToFilter 
        },
        order: { paramName: 'ASC', paramValue: 'ASC' }
      });

      // Obtener registros del archivo 2 filtrados por tabla específica
      const records2 = await this.sycloCA000PRepository.find({
        where: { 
          uploadId: uploadId2,
          table: tableToFilter 
        },
        order: { paramName: 'ASC', paramValue: 'ASC' }
      });

      const fieldChanges: any[] = [];
      let newInSelection1 = 0;
      let newInSelection2 = 0;
      let differences = 0;
      
      // Crear un Map para búsqueda rápida en archivo 2
      const records2Map = new Map<string, any>();
      records2.forEach(record => {
        const key = `${record.paramName}|${record.paramValue}`;
        records2Map.set(key, record);
      });

      // Recorrer registros del archivo 1
      for (const record1 of records1) {
        const key = `${record1.paramName}|${record1.paramValue}`;
        const record2 = records2Map.get(key);

        if (!record2) {
          // Registro existe en archivo 1 pero no en archivo 2 (ELIMINADO)
          newInSelection1++;
          fieldChanges.push({
            record1: {
              PARAM_NAME: record1.paramName,
              PARAM_VALUE: record1.paramValue,
              PARAM_GROUP: record1.paramGroup,
              DEP_RECORD_NO: record1.depRecordNo,
              PARAM_TYPE: record1.paramType,
              PARAM_SCOPE: record1.paramScope,
              PARAM_COMMENT: record1.paramComment,
              ACTIVE: record1.active,
              FLAG_NO_CHANGE: record1.flagNoChange
            },
            record2: null,
            fields: {} // No hay campos para marcar porque no existe record2
          });
        } else {
          // Comparar campos específicos
          const changedFields: any = {};
          let hasChanges = false;
          
          if (record1.paramGroup !== record2.paramGroup) {
            changedFields.PARAM_GROUP = true;
            hasChanges = true;
            differences++;
          }
          if (record1.depRecordNo !== record2.depRecordNo) {
            changedFields.DEP_RECORD_NO = true;
            hasChanges = true;
            differences++;
          }
          if (record1.paramType !== record2.paramType) {
            changedFields.PARAM_TYPE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.paramScope !== record2.paramScope) {
            changedFields.PARAM_SCOPE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.paramComment !== record2.paramComment) {
            changedFields.PARAM_COMMENT = true;
            hasChanges = true;
            differences++;
          }
          if (record1.active !== record2.active) {
            changedFields.ACTIVE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.flagNoChange !== record2.flagNoChange) {
            changedFields.FLAG_NO_CHANGE = true;
            hasChanges = true;
            differences++;
          }

          if (hasChanges) {
            // Hay diferencias entre los registros
            fieldChanges.push({
              record1: {
                PARAM_NAME: record1.paramName,
                PARAM_VALUE: record1.paramValue,
                PARAM_GROUP: record1.paramGroup,
                DEP_RECORD_NO: record1.depRecordNo,
                PARAM_TYPE: record1.paramType,
                PARAM_SCOPE: record1.paramScope,
                PARAM_COMMENT: record1.paramComment,
                ACTIVE: record1.active,
                FLAG_NO_CHANGE: record1.flagNoChange
              },
              record2: {
                PARAM_NAME: record2.paramName,
                PARAM_VALUE: record2.paramValue,
                PARAM_GROUP: record2.paramGroup,
                DEP_RECORD_NO: record2.depRecordNo,
                PARAM_TYPE: record2.paramType,
                PARAM_SCOPE: record2.paramScope,
                PARAM_COMMENT: record2.paramComment,
                ACTIVE: record2.active,
                FLAG_NO_CHANGE: record2.flagNoChange
              },
              fields: changedFields
            });
          }

          // Marcar como procesado en el Map
          records2Map.delete(key);
        }
      }

      // Los registros que quedaron en records2Map son nuevos en archivo 2
      for (const [key, record2] of records2Map) {
        newInSelection2++;
        fieldChanges.push({
          record1: null,
          record2: {
            PARAM_NAME: record2.paramName,
            PARAM_VALUE: record2.paramValue,
            PARAM_GROUP: record2.paramGroup,
            DEP_RECORD_NO: record2.depRecordNo,
            PARAM_TYPE: record2.paramType,
            PARAM_SCOPE: record2.paramScope,
            PARAM_COMMENT: record2.paramComment,
            ACTIVE: record2.active,
            FLAG_NO_CHANGE: record2.flagNoChange
          },
          fields: {} // No hay campos para marcar porque no existe record1
        });
      }

      return {
        table: tableToFilter, // Retorna la tabla específica que se filtró
        type: 'different',
        fieldChanges,
        stats: {
          differences,
          newInSelection1,
          newInSelection2,
          totalRecords: fieldChanges.length
        }
      };

    } catch (error) {
      console.error('💥 Error comparing SycloCA000P records:', error);
      throw error;
    }
  }
// 🔍 Función privada para comparar registros SycloCA000S entre dos uploads
  private async compareSycloCA000S(uploadId1: string, uploadId2: string, tableToFilter: string): Promise<any> {
    try {
      // Obtener registros del archivo 1 filtrados por tabla específica
      const records1 = await this.sycloCA000SRepository.find({
        where: { 
          uploadId: uploadId1,
          table: tableToFilter 
        },
        order: { objectType: 'ASC', mobileStatus: 'ASC' }
      });

      // Obtener registros del archivo 2 filtrados por tabla específica
      const records2 = await this.sycloCA000SRepository.find({
        where: { 
          uploadId: uploadId2,
          table: tableToFilter 
        },
        order: { objectType: 'ASC', mobileStatus: 'ASC' }
      });

      const fieldChanges: any[] = [];
      let newInSelection1 = 0;
      let newInSelection2 = 0;
      let differences = 0;
      
      // Crear un Map para búsqueda rápida en archivo 2
      const records2Map = new Map<string, any>();
      records2.forEach(record => {
        // Clave compuesta con todos los campos clave
        const key = `${record.objectType}|${record.mobileStatus}|${record.mblstatusLabel}|${record.istat}|${record.stsma}|${record.estat}|${record.statusAttr1}|${record.statusAttr2}`;
        records2Map.set(key, record);
      });

      // Recorrer registros del archivo 1
      for (const record1 of records1) {
        const key = `${record1.objectType}|${record1.mobileStatus}|${record1.mblstatusLabel}|${record1.istat}|${record1.stsma}|${record1.estat}|${record1.statusAttr1}|${record1.statusAttr2}`;
        const record2 = records2Map.get(key);

        if (!record2) {
          // Registro existe en archivo 1 pero no en archivo 2 (ELIMINADO)
          newInSelection1++;
          fieldChanges.push({
            record1: {
              OBJECT_TYPE: record1.objectType,
              MOBILE_STATUS: record1.mobileStatus,
              MBLSTATUS_LABEL: record1.mblstatusLabel,
              ISTAT: record1.istat,
              STSMA: record1.stsma,
              ESTAT: record1.estat,
              STATUS_ATTR_1: record1.statusAttr1,
              STATUS_ATTR_2: record1.statusAttr2,
              FLAG_INIT_STATUS: record1.flagInitStatus,
              FLAG_NO_UPDATE: record1.flagNoUpdate,
              FLAG_DISABLED: record1.flagDisabled
            },
            record2: null,
            fields: {} // No hay campos para marcar porque no existe record2
          });
        } else {
          // Comparar campos específicos que pueden cambiar
          const changedFields: any = {};
          let hasChanges = false;
          
          if (record1.flagInitStatus !== record2.flagInitStatus) {
            changedFields.FLAG_INIT_STATUS = true;
            hasChanges = true;
            differences++;
          }
          if (record1.flagNoUpdate !== record2.flagNoUpdate) {
            changedFields.FLAG_NO_UPDATE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.flagDisabled !== record2.flagDisabled) {
            changedFields.FLAG_DISABLED = true;
            hasChanges = true;
            differences++;
          }

          if (hasChanges) {
            // Hay diferencias entre los registros
            fieldChanges.push({
              record1: {
                OBJECT_TYPE: record1.objectType,
                MOBILE_STATUS: record1.mobileStatus,
                MBLSTATUS_LABEL: record1.mblstatusLabel,
                ISTAT: record1.istat,
                STSMA: record1.stsma,
                ESTAT: record1.estat,
                STATUS_ATTR_1: record1.statusAttr1,
                STATUS_ATTR_2: record1.statusAttr2,
                FLAG_INIT_STATUS: record1.flagInitStatus,
                FLAG_NO_UPDATE: record1.flagNoUpdate,
                FLAG_DISABLED: record1.flagDisabled
              },
              record2: {
                OBJECT_TYPE: record2.objectType,
                MOBILE_STATUS: record2.mobileStatus,
                MBLSTATUS_LABEL: record2.mblstatusLabel,
                ISTAT: record2.istat,
                STSMA: record2.stsma,
                ESTAT: record2.estat,
                STATUS_ATTR_1: record2.statusAttr1,
                STATUS_ATTR_2: record2.statusAttr2,
                FLAG_INIT_STATUS: record2.flagInitStatus,
                FLAG_NO_UPDATE: record2.flagNoUpdate,
                FLAG_DISABLED: record2.flagDisabled
              },
              fields: changedFields
            });
          }

          // Marcar como procesado en el Map
          records2Map.delete(key);
        }
      }

      // Los registros que quedaron en records2Map son nuevos en archivo 2
      for (const [key, record2] of records2Map) {
        newInSelection2++;
        fieldChanges.push({
          record1: null,
          record2: {
            OBJECT_TYPE: record2.objectType,
            MOBILE_STATUS: record2.mobileStatus,
            MBLSTATUS_LABEL: record2.mblstatusLabel,
            ISTAT: record2.istat,
            STSMA: record2.stsma,
            ESTAT: record2.estat,
            STATUS_ATTR_1: record2.statusAttr1,
            STATUS_ATTR_2: record2.statusAttr2,
            FLAG_INIT_STATUS: record2.flagInitStatus,
            FLAG_NO_UPDATE: record2.flagNoUpdate,
            FLAG_DISABLED: record2.flagDisabled
          },
          fields: {} // No hay campos para marcar porque no existe record1
        });
      }

      return {
        table: tableToFilter, // Retorna la tabla específica que se filtró
        type: 'different',
        fieldChanges,
        stats: {
          differences,
          newInSelection1,
          newInSelection2,
          totalRecords: fieldChanges.length
        }
      };

    } catch (error) {
      console.error('💥 Error comparing SycloCA000S records:', error);
      throw error;
    }
  }

  // 🔍 Función privada para comparar registros MfndCODO03 entre dos uploads
  private async compareMfndCODO03(uploadId1: string, uploadId2: string, tableToFilter: string): Promise<any> {
    try {
      // Obtener registros del archivo 1
      const records1 = await this.mfndCODO03Repository.find({
        where: { 
           uploadId: uploadId1,
           table: tableToFilter
           },  // ← NUEVO FILTRO 
        order: { ruleNo: 'ASC', ruleType: 'ASC' }
      });

      // Obtener registros del archivo 2
      const records2 = await this.mfndCODO03Repository.find({
        where: { uploadId: uploadId2, table: tableToFilter },
        order: { ruleNo: 'ASC', ruleType: 'ASC' }
      });

      const fieldChanges: any[] = [];
      let newInSelection1 = 0;
      let newInSelection2 = 0;
      let differences = 0;
      
      // Crear un Map para búsqueda rápida en archivo 2
      const records2Map = new Map<string, any>();
      records2.forEach(record => {
        // Clave compuesta con todos los campos clave
        const key = `${record.ruleKey}|${record.ruleNo}|${record.ruleType}|${record.rangeSign}|${record.rangeOption}|${record.ruleValue}`;
        records2Map.set(key, record);
      });

      // Recorrer registros del archivo 1
      for (const record1 of records1) {
        const key = `${record1.ruleNo}|${record1.ruleType}|${record1.rangeSign}|${record1.rangeOption}|${record1.ruleValue}`;
        const record2 = records2Map.get(key);

        if (!record2) {
          // Registro existe en archivo 1 pero no en archivo 2 (ELIMINADO)
          newInSelection1++;
          fieldChanges.push({
            record1: {
              RULE_KEY: record1.ruleKey,
              RULE_NO: record1.ruleNo,
              RULE_TYPE: record1.ruleType,
              RANGE_SIGN: record1.rangeSign,
              RANGE_OPTION: record1.rangeOption,
              RULE_VALUE: record1.ruleValue,
              RULE_VALUE_1: record1.ruleValue1,
              ACTIVE: record1.active,              
              OWNER_OBJECT: record1.ownerObject
            },
            record2: null,
            fields: {} // No hay campos para marcar porque no existe record2
          });
        } else {
          // Comparar campos específicos que pueden cambiar
          const changedFields: any = {};
          let hasChanges = false;
          
          if (record1.ruleValue1 !== record2.ruleValue1) {
            changedFields.RULE_VALUE_1 = true;
            hasChanges = true;
            differences++;
          }
          if (record1.active !== record2.active) {
            changedFields.ACTIVE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.ownerObject !== record2.ownerObject) {
            changedFields.OWNER_OBJECT = true;
            hasChanges = true;
            differences++;
          }

          if (hasChanges) {
            // Hay diferencias entre los registros
            fieldChanges.push({
              record1: {
                RULE_KEY: record1.ruleKey,
                RULE_NO: record1.ruleNo,
                RULE_TYPE: record1.ruleType,
                RANGE_SIGN: record1.rangeSign,
                RANGE_OPTION: record1.rangeOption,
                RULE_VALUE: record1.ruleValue,
                RULE_VALUE_1: record1.ruleValue1,
                ACTIVE: record1.active,                
                OWNER_OBJECT: record1.ownerObject
              },
              record2: {
                RULE_KEY: record2.ruleKey,
                RULE_NO: record2.ruleNo,
                RULE_TYPE: record2.ruleType,
                RANGE_SIGN: record2.rangeSign,
                RANGE_OPTION: record2.rangeOption,
                RULE_VALUE: record2.ruleValue,
                RULE_VALUE_1: record2.ruleValue1,
                ACTIVE: record2.active,
                MOBILE_APP: record2.mobileApp,
                OWNER_OBJECT: record2.ownerObject
              },
              fields: changedFields
            });
          }

          // Marcar como procesado en el Map
          records2Map.delete(key);
        }
      }

      // Los registros que quedaron en records2Map son nuevos en archivo 2
      for (const [key, record2] of records2Map) {
        newInSelection2++;
        fieldChanges.push({
          record1: null,
          record2: {
            RULE_KEY: record2.ruleKey,
            RULE_NO: record2.ruleNo,
            RULE_TYPE: record2.ruleType,
            RANGE_SIGN: record2.rangeSign,
            RANGE_OPTION: record2.rangeOption,
            RULE_VALUE: record2.ruleValue,
            RULE_VALUE_1: record2.ruleValue1,
            ACTIVE: record2.active,
            MOBILE_APP: record2.mobileApp,
            OWNER_OBJECT: record2.ownerObject
          },
          fields: {} // No hay campos para marcar porque no existe record1
        });
      }

      return {
        table: tableToFilter,
        type: 'different',
        fieldChanges,
        stats: {
          differences,
          newInSelection1,
          newInSelection2,
          totalRecords: fieldChanges.length
        }
      };

    } catch (error) {
      console.error('💥 Error comparing MfndCODO03 records:', error);
      throw error;
    }
  }

  // 🔍 Función privada para comparar registros MfndCODO03D entre dos uploads
  private async compareMfndCODO03D(uploadId1: string, uploadId2: string, tableToFilter: string): Promise<any> {
    try {
      // Obtener registros del archivo 1
      const records1 = await this.mfndCODO03DRepository.find({
         where: { 
          uploadId: uploadId1,
          table: tableToFilter  // ← NUEVO FILTRO
        },
        order: { ruleKey: 'ASC', active: 'ASC' }
      });

      // Obtener registros del archivo 2
      const records2 = await this.mfndCODO03DRepository.find({
        where: { uploadId: uploadId2, table: tableToFilter },
        order: { ruleKey: 'ASC', active: 'ASC' }
      });

      const fieldChanges: any[] = [];
      let newInSelection1 = 0;
      let newInSelection2 = 0;
      let differences = 0;
      
      // Crear un Map para búsqueda rápida en archivo 2
      const records2Map = new Map<string, any>();
      records2.forEach(record => {
        // Clave compuesta con todos los campos clave
        const key = `${record.ruleKey}|${record.active}|${record.mobileApp}|${record.ownerObject}`;
        records2Map.set(key, record);
      });

      // Recorrer registros del archivo 1
      for (const record1 of records1) {
        const key = `${record1.ruleKey}|${record1.active}|${record1.mobileApp}|${record1.ownerObject}`;
        const record2 = records2Map.get(key);

        if (!record2) {
          // Registro existe en archivo 1 pero no en archivo 2 (ELIMINADO)
          newInSelection1++;
          fieldChanges.push({
            record1: {
              RULE_KEY: record1.ruleKey,
              ACTIVE: record1.active,
              MOBILE_APP: record1.mobileApp,
              OWNER_OBJECT: record1.ownerObject,
              RULE_TYPE: record1.ruleType,
              RULE_VALUE: record1.ruleValue,
              RULE_VALUE1: record1.ruleValue1,
              RULE_VALUE2: record1.ruleValue2,
              RULE_VALUE3: record1.ruleValue3
            },
            record2: null,
            fields: {} // No hay campos para marcar porque no existe record2
          });
        } else {
          // Comparar campos específicos que pueden cambiar
          const changedFields: any = {};
          let hasChanges = false;
          
          if (record1.ruleType !== record2.ruleType) {
            changedFields.RULE_TYPE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.ruleValue !== record2.ruleValue) {
            changedFields.RULE_VALUE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.ruleValue1 !== record2.ruleValue1) {
            changedFields.RULE_VALUE1 = true;
            hasChanges = true;
            differences++;
          }
          if (record1.ruleValue2 !== record2.ruleValue2) {
            changedFields.RULE_VALUE2 = true;
            hasChanges = true;
            differences++;
          }
          if (record1.ruleValue3 !== record2.ruleValue3) {
            changedFields.RULE_VALUE3 = true;
            hasChanges = true;
            differences++;
          }

          if (hasChanges) {
            // Hay diferencias entre los registros
            fieldChanges.push({
              record1: {
                RULE_KEY: record1.ruleKey,
                ACTIVE: record1.active,
                MOBILE_APP: record1.mobileApp,
                OWNER_OBJECT: record1.ownerObject,
                RULE_TYPE: record1.ruleType,
                RULE_VALUE: record1.ruleValue,
                RULE_VALUE1: record1.ruleValue1,
                RULE_VALUE2: record1.ruleValue2,
                RULE_VALUE3: record1.ruleValue3
              },
              record2: {
                RULE_KEY: record2.ruleKey,
                ACTIVE: record2.active,
                MOBILE_APP: record2.mobileApp,
                OWNER_OBJECT: record2.ownerObject,
                RULE_TYPE: record2.ruleType,
                RULE_VALUE: record2.ruleValue,
                RULE_VALUE1: record2.ruleValue1,
                RULE_VALUE2: record2.ruleValue2,
                RULE_VALUE3: record2.ruleValue3
              },
              fields: changedFields
            });
          }

          // Marcar como procesado en el Map
          records2Map.delete(key);
        }
      }

      // Los registros que quedaron en records2Map son nuevos en archivo 2
      for (const [key, record2] of records2Map) {
        newInSelection2++;
        fieldChanges.push({
          record1: null,
          record2: {
            RULE_KEY: record2.ruleKey,
            ACTIVE: record2.active,
            MOBILE_APP: record2.mobileApp,
            OWNER_OBJECT: record2.ownerObject,
            RULE_TYPE: record2.ruleType,
            RULE_VALUE: record2.ruleValue,
            RULE_VALUE1: record2.ruleValue1,
            RULE_VALUE2: record2.ruleValue2,
            RULE_VALUE3: record2.ruleValue3
          },
          fields: {} // No hay campos para marcar porque no existe record1
        });
      }

      return {
        table: tableToFilter  , //'/MFND/C_ODO03D',
        type: 'different',
        fieldChanges,
        stats: {
          differences,
          newInSelection1,
          newInSelection2,
          totalRecords: fieldChanges.length
        }
      };

    } catch (error) {
      console.error('💥 Error comparing MfndCODO03D records:', error);
      throw error;
    }
  }

  // 🔍 Función privada para comparar registros SycloCA000G entre dos uploads
  private async compareSycloCA000G(uploadId1: string, uploadId2: string, tableToFilter: string): Promise<any> {
    try {
      // Obtener registros del archivo 1
      const records1 = await this.sycloCA000GRepository.find({
          where: { 
          uploadId: uploadId1,
          table: tableToFilter  // ← NUEVO FILTRO
        },
        order: { rootObjtyp: 'ASC', rootObjkey: 'ASC', childObjtyp: 'ASC' }
      });

      // Obtener registros del archivo 2
      const records2 = await this.sycloCA000GRepository.find({
        where: { uploadId: uploadId2,   table: tableToFilter  },
        order: { rootObjtyp: 'ASC', rootObjkey: 'ASC', childObjtyp: 'ASC' }
      });

      const fieldChanges: any[] = [];
      let newInSelection1 = 0;
      let newInSelection2 = 0;
      let differences = 0;
      
      // Crear un Map para búsqueda rápida en archivo 2
      const records2Map = new Map<string, any>();
      records2.forEach(record => {
        // Clave compuesta con todos los campos clave
        const key = `${record.rootObjtyp}|${record.rootObjkey}|${record.childObjtyp}|${record.childObjkey}`;
        records2Map.set(key, record);
      });

      // Recorrer registros del archivo 1
      for (const record1 of records1) {
        const key = `${record1.rootObjtyp}|${record1.rootObjkey}|${record1.childObjtyp}|${record1.childObjkey}`;
        const record2 = records2Map.get(key);

        if (!record2) {
          // Registro existe en archivo 1 pero no en archivo 2 (ELIMINADO)
          newInSelection1++;
          fieldChanges.push({
            record1: {
              ROOT_OBJTYP: record1.rootObjtyp,
              ROOT_OBJKEY: record1.rootObjkey,
              CHILD_OBJTYP: record1.childObjtyp,
              CHILD_OBJKEY: record1.childObjkey,
              ACTIVE: record1.active,
              IN_SCOPE: record1.inScope
            },
            record2: null,
            fields: {} // No hay campos para marcar porque no existe record2
          });
        } else {
          // Comparar campos específicos que pueden cambiar
          const changedFields: any = {};
          let hasChanges = false;
          
          if (record1.active !== record2.active) {
            changedFields.ACTIVE = true;
            hasChanges = true;
            differences++;
          }
          if (record1.inScope !== record2.inScope) {
            changedFields.IN_SCOPE = true;
            hasChanges = true;
            differences++;
          }

          if (hasChanges) {
            // Hay diferencias entre los registros
            fieldChanges.push({
              record1: {
                ROOT_OBJTYP: record1.rootObjtyp,
                ROOT_OBJKEY: record1.rootObjkey,
                CHILD_OBJTYP: record1.childObjtyp,
                CHILD_OBJKEY: record1.childObjkey,
                ACTIVE: record1.active,
                IN_SCOPE: record1.inScope
              },
              record2: {
                ROOT_OBJTYP: record2.rootObjtyp,
                ROOT_OBJKEY: record2.rootObjkey,
                CHILD_OBJTYP: record2.childObjtyp,
                CHILD_OBJKEY: record2.childObjkey,
                ACTIVE: record2.active,
                IN_SCOPE: record2.inScope
              },
              fields: changedFields
            });
          }

          // Marcar como procesado en el Map
          records2Map.delete(key);
        }
      }

      // Los registros que quedaron en records2Map son nuevos en archivo 2
      for (const [key, record2] of records2Map) {
        newInSelection2++;
        fieldChanges.push({
          record1: null,
          record2: {
            ROOT_OBJTYP: record2.rootObjtyp,
            ROOT_OBJKEY: record2.rootObjkey,
            CHILD_OBJTYP: record2.childObjtyp,
            CHILD_OBJKEY: record2.childObjkey,
            ACTIVE: record2.active,
            IN_SCOPE: record2.inScope
          },
          fields: {} // No hay campos para marcar porque no existe record1
        });
      }

      return {
        table: tableToFilter,
        type: 'different',
        fieldChanges,
        stats: {
          differences,
          newInSelection1,
          newInSelection2,
          totalRecords: fieldChanges.length
        }
      };

    } catch (error) {
      console.error('💥 Error comparing SycloCA000G records:', error);
      throw error;
    }
  }


  // 🎯 Función principal para comparar uploads
  async compareUploads(
    fileName1: string,
    uploadDate1: string,
    fileName2: string,
    uploadDate2: string,
    tableFilter: string = 'all'
  ): Promise<any[]> {
    try {
      // 1. Obtener los IDs de upload desde upload_tracking
      const upload1 = await this.uploadTrackingRepository.findOne({
        where: {
          fileName: fileName1,
          uploadedAt: new Date(uploadDate1)
        }
      });

      const upload2 = await this.uploadTrackingRepository.findOne({
        where: {
          fileName: fileName2,
          uploadedAt: new Date(uploadDate2)
        }
      });

      if (!upload1) {
        throw new BadRequestException(`Upload not found for file: ${fileName1} on date: ${uploadDate1}`);
      }

      if (!upload2) {
        throw new BadRequestException(`Upload not found for file: ${fileName2} on date: ${uploadDate2}`);
      }

      console.log(`📊 Comparing uploads: ${upload1.id} vs ${upload2.id} for table: ${tableFilter}`);

      const tableResults: any[] = [];
      let totalRecords = 0;
      let totalDifferences = 0;
      let totalNewInSelection1 = 0;
      let totalNewInSelection2 = 0;

      // 2. Comparar según el filtro de tabla      
      if (tableFilter === '/SYCLO/CA000P' || tableFilter === '/SYCLO/YCA000P') {
        const result = await this.compareSycloCA000P(upload1.id, upload2.id, tableFilter);
        if (result.fieldChanges.length > 0) {
          tableResults.push(result);
          totalRecords += result.stats.totalRecords;
          totalDifferences += result.stats.differences;
          totalNewInSelection1 += result.stats.newInSelection1;
          totalNewInSelection2 += result.stats.newInSelection2;
        }
      } else if (tableFilter === '/SYCLO/CA000S' || tableFilter === '/SYCLO/YCA000S') {
        const result = await this.compareSycloCA000S(upload1.id, upload2.id, tableFilter);
        if (result.fieldChanges.length > 0) {
          tableResults.push(result);
          totalRecords += result.stats.totalRecords;
          totalDifferences += result.stats.differences;
          totalNewInSelection1 += result.stats.newInSelection1;
          totalNewInSelection2 += result.stats.newInSelection2;
        }
      } else if (tableFilter === '/SYCLO/CA000G' || tableFilter === '/SYCLO/YCA000G') {
        const result = await this.compareSycloCA000G(upload1.id, upload2.id, tableFilter);
        if (result.fieldChanges.length > 0) {
          tableResults.push(result);
          totalRecords += result.stats.totalRecords;
          totalDifferences += result.stats.differences;
          totalNewInSelection1 += result.stats.newInSelection1;
          totalNewInSelection2 += result.stats.newInSelection2;
        }
      } else if (tableFilter === '/MFND/C_ODO03' || tableFilter === '/MFND/YC_ODO03') {
        const result = await this.compareMfndCODO03(upload1.id, upload2.id, tableFilter);
        if (result.fieldChanges.length > 0) {
          tableResults.push(result);
          totalRecords += result.stats.totalRecords;
          totalDifferences += result.stats.differences;
          totalNewInSelection1 += result.stats.newInSelection1;
          totalNewInSelection2 += result.stats.newInSelection2;
        }
      } else if (tableFilter === '/MFND/C_ODO03D' || tableFilter === '/MFND/YC_ODO03D') {
        const result = await this.compareMfndCODO03D(upload1.id, upload2.id, tableFilter);
        if (result.fieldChanges.length > 0) {
          tableResults.push(result);
          totalRecords += result.stats.totalRecords;
          totalDifferences += result.stats.differences;
          totalNewInSelection1 += result.stats.newInSelection1;
          totalNewInSelection2 += result.stats.newInSelection2;
        }
      } else if (tableFilter === 'all') {
        // Comparar todas las tablas implementadas - CADA UNA CON SUS VARIANTES
        
        // SycloCA000P - Comparar ambas variantes
        const ca000pResult = await this.compareSycloCA000P(upload1.id, upload2.id, '/SYCLO/CA000P');
        if (ca000pResult.fieldChanges.length > 0) {
          tableResults.push(ca000pResult);
          totalRecords += ca000pResult.stats.totalRecords;
          totalDifferences += ca000pResult.stats.differences;
          totalNewInSelection1 += ca000pResult.stats.newInSelection1;
          totalNewInSelection2 += ca000pResult.stats.newInSelection2;
        }

        const yca000pResult = await this.compareSycloCA000P(upload1.id, upload2.id, '/SYCLO/YCA000P');
        if (yca000pResult.fieldChanges.length > 0) {
          tableResults.push(yca000pResult);
          totalRecords += yca000pResult.stats.totalRecords;
          totalDifferences += yca000pResult.stats.differences;
          totalNewInSelection1 += yca000pResult.stats.newInSelection1;
          totalNewInSelection2 += yca000pResult.stats.newInSelection2;
        }

        // SycloCA000S - Comparar ambas variantes
        const ca000sResult = await this.compareSycloCA000S(upload1.id, upload2.id, '/SYCLO/CA000S');
        if (ca000sResult.fieldChanges.length > 0) {
          tableResults.push(ca000sResult);
          totalRecords += ca000sResult.stats.totalRecords;
          totalDifferences += ca000sResult.stats.differences;
          totalNewInSelection1 += ca000sResult.stats.newInSelection1;
          totalNewInSelection2 += ca000sResult.stats.newInSelection2;
        }

        const yca000sResult = await this.compareSycloCA000S(upload1.id, upload2.id, '/SYCLO/YCA000S');
        if (yca000sResult.fieldChanges.length > 0) {
          tableResults.push(yca000sResult);
          totalRecords += yca000sResult.stats.totalRecords;
          totalDifferences += yca000sResult.stats.differences;
          totalNewInSelection1 += yca000sResult.stats.newInSelection1;
          totalNewInSelection2 += yca000sResult.stats.newInSelection2;
        }

        // SycloCA000G - Comparar ambas variantes
        const ca000gResult = await this.compareSycloCA000G(upload1.id, upload2.id, '/SYCLO/CA000G');
        if (ca000gResult.fieldChanges.length > 0) {
          tableResults.push(ca000gResult);
          totalRecords += ca000gResult.stats.totalRecords;
          totalDifferences += ca000gResult.stats.differences;
          totalNewInSelection1 += ca000gResult.stats.newInSelection1;
          totalNewInSelection2 += ca000gResult.stats.newInSelection2;
        }

        const yca000gResult = await this.compareSycloCA000G(upload1.id, upload2.id, '/SYCLO/YCA000G');
        if (yca000gResult.fieldChanges.length > 0) {
          tableResults.push(yca000gResult);
          totalRecords += yca000gResult.stats.totalRecords;
          totalDifferences += yca000gResult.stats.differences;
          totalNewInSelection1 += yca000gResult.stats.newInSelection1;
          totalNewInSelection2 += yca000gResult.stats.newInSelection2;
        }

        // MfndCODO03 - Comparar ambas variantes
        const mfndCODO03Result = await this.compareMfndCODO03(upload1.id, upload2.id, '/MFND/C_ODO03');
        if (mfndCODO03Result.fieldChanges.length > 0) {
          tableResults.push(mfndCODO03Result);
          totalRecords += mfndCODO03Result.stats.totalRecords;
          totalDifferences += mfndCODO03Result.stats.differences;
          totalNewInSelection1 += mfndCODO03Result.stats.newInSelection1;
          totalNewInSelection2 += mfndCODO03Result.stats.newInSelection2;
        }

        const ymfndCODO03Result = await this.compareMfndCODO03(upload1.id, upload2.id, '/MFND/YC_ODO03');
        if (ymfndCODO03Result.fieldChanges.length > 0) {
          tableResults.push(ymfndCODO03Result);
          totalRecords += ymfndCODO03Result.stats.totalRecords;
          totalDifferences += ymfndCODO03Result.stats.differences;
          totalNewInSelection1 += ymfndCODO03Result.stats.newInSelection1;
          totalNewInSelection2 += ymfndCODO03Result.stats.newInSelection2;
        }

        // MfndCODO03D - Comparar ambas variantes
        const mfndCODO03DResult = await this.compareMfndCODO03D(upload1.id, upload2.id, '/MFND/C_ODO03D');
        if (mfndCODO03DResult.fieldChanges.length > 0) {
          tableResults.push(mfndCODO03DResult);
          totalRecords += mfndCODO03DResult.stats.totalRecords;
          totalDifferences += mfndCODO03DResult.stats.differences;
          totalNewInSelection1 += mfndCODO03DResult.stats.newInSelection1;
          totalNewInSelection2 += mfndCODO03DResult.stats.newInSelection2;
        }

        const ymfndCODO03DResult = await this.compareMfndCODO03D(upload1.id, upload2.id, '/MFND/YC_ODO03D');
        if (ymfndCODO03DResult.fieldChanges.length > 0) {
          tableResults.push(ymfndCODO03DResult);
          totalRecords += ymfndCODO03DResult.stats.totalRecords;
          totalDifferences += ymfndCODO03DResult.stats.differences;
          totalNewInSelection1 += ymfndCODO03DResult.stats.newInSelection1;
          totalNewInSelection2 += ymfndCODO03DResult.stats.newInSelection2;
        }
      } else {
        throw new BadRequestException(`Table filter '${tableFilter}' not supported yet`);
      }

      // 3. Construir respuesta final
      const finalResult = [{
        table: tableFilter,
        totalRecords,
        differences: totalDifferences,
        newInSelection1: totalNewInSelection1,
        newInSelection2: totalNewInSelection2,
        records: tableResults
      }];

      console.log(`🎯 Comparison completed: ${totalDifferences} total differences found across ${tableResults.length} tables`);
      
      return finalResult;

    } catch (error) {
      console.error('💥 Error during upload comparison:', error);
      throw new BadRequestException(`Error comparing uploads: ${error.message}`);
    }
  }
}